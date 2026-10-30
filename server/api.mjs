export function createApi({ apiKey = '', model = 'gemini-2.5-flash-lite', supabaseUrl = '', publishableKey = '', fetcher = fetch } = {}) {
  const limits = new Map();
  async function account(req) {
    const token = req.headers.authorization;
    if (!supabaseUrl || !publishableKey || !token?.startsWith('Bearer ')) return null;
    const result = await fetcher(supabaseUrl + '/auth/v1/user', {headers: {apikey: publishableKey, Authorization: token}, signal: AbortSignal.timeout(10000)});
    if (!result.ok) return null;
    const user = await result.json(); return user?.id ? user : null;
  }
  const respond = (res, code, body) => { res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }); res.end(JSON.stringify(body)); };
  async function middleware(req, res, next) {
    const path = (req.url || '').split('?')[0];
    if (!path.startsWith('/api/')) return next();
    try {
      if (req.method === 'GET' && path === '/api/session') return respond(res, 200, { aiAvailable: !!apiKey });
      if (req.method !== 'POST') return respond(res, 404, { error: '찾을 수 없는 요청입니다.' });
      if (!['127.0.0.1:5173', 'localhost:5173'].includes(req.headers.host) || req.headers.origin !== `http://${req.headers.host}`) return respond(res, 403, { error: '허용되지 않은 요청입니다.' });
      if (!req.headers['content-type']?.startsWith('application/json')) return respond(res, 415, { error: 'JSON 요청이 필요합니다.' });
      const now = Date.now();
      for (const [key, entry] of limits) if (entry.until < now) limits.delete(key);
      const bucket = `${req.socket.remoteAddress}:${path}`;
      const entry = limits.get(bucket) || { count: 0, until: now + 60000 };
      entry.count++; limits.set(bucket, entry);
      if (entry.count > (path === '/api/chat' ? 10 : 20)) return respond(res, 429, { error: '요청이 많아요. 1분 후 다시 시도해 주세요.' });
      let raw = '';
      for await (const chunk of req) { raw += chunk; if (Buffer.byteLength(raw) > 16384) return respond(res, 413, { error: '입력 내용이 너무 길어요.' }); }
      let body; try { body = JSON.parse(raw); } catch { return respond(res, 400, { error: '입력 형식을 확인해 주세요.' }); }
      if (!body || typeof body !== 'object') return respond(res, 400, { error: '입력 형식을 확인해 주세요.' });
      if (path === '/api/chat') {
        if (!(await account(req))) return respond(res, 401, { error: 'AI 대화는 로그인 후 이용해 주세요.' });
        if (!apiKey) return respond(res, 503, { error: 'Gemini API 키가 아직 설정되지 않았어요. 도움말 모드를 이용해 주세요.' });
        if (body.consent !== true) return respond(res, 400, { error: 'Google 전송 안내를 확인해 주세요.' });
        if (!Array.isArray(body.messages) || !body.messages.length || body.messages.length > 10 || body.messages.some(m => !['user', 'bot'].includes(m.role) || typeof m.text !== 'string' || !m.text.trim() || m.text.length > 2000) || body.messages.at(-1).role !== 'user') return respond(res, 400, { error: '대화 내용을 확인해 주세요.' });
        const response = await fetcher(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': apiKey }, signal: AbortSignal.timeout(25000),
          body: JSON.stringify({ systemInstruction: { parts: [{ text: '너는 RADAR 앱의 귀여운 한국어 도우미 폼폼이다. 짧고 친절하게 대답한다. 앱은 관심종목, 공시 변화 피드, 알림 설정을 제공한다. 모든 공시 수치는 가상 데이터이며 실제 시세/DART/푸시와 연결되지 않았다. 실시간 정보나 투자 수익을 꾸며내지 말고 개인화된 매수 매도 권유를 하지 않는다. 계정 비밀번호나 개인정보를 요구하지 않는다. 앱을 직접 변경하는 기능은 없으며 사용법을 안내한다.' }] }, contents: body.messages.map(m => ({ role: m.role === 'bot' ? 'model' : 'user', parts: [{ text: m.text }] })), generationConfig: { maxOutputTokens: 700 } })
        });
        if (!response.ok) return respond(res, response.status === 429 ? 429 : 502, { error: response.status === 429 ? 'Gemini 사용 한도에 도달했어요. 잠시 후 다시 시도하거나 도움말 모드를 사용해 주세요.' : 'Gemini 연결에 실패했어요. 서버의 키와 모델 설정을 확인해 주세요.' });
        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.filter(p => !p.thought && typeof p.text === 'string').map(p => p.text).join('\n');
        return text ? respond(res, 200, { text: text.slice(0, 6000) }) : respond(res, 502, { error: '답변이 생성되지 않았어요. 질문을 바꿔 주세요.' });
      }
      return respond(res, 404, { error: '찾을 수 없는 요청입니다.' });
    } catch { return respond(res, 500, { error: '요청을 처리하지 못했어요. 잠시 후 다시 시도해 주세요.' }); }
  }
  return { middleware, close: () => limits.clear() };
}
