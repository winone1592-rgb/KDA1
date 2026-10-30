import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { ArrowUp, RotateCcw, Sparkles, X } from 'lucide-react';
import { titles, type Page } from '../lib/data';
import { useRadar } from '../lib/store';
import { api } from '../lib/api';

type Message = { role: 'bot' | 'user'; text: string };
const welcome: Message = { role: 'bot', text: '안녕! 나는 폼폼이야 🐾\n작은 변화도 같이 찾아볼까? 앱 사용법이 궁금하면 물어봐 줘.' };
const questions = ['관심종목 추가 방법', '정정공시가 뭐야?', '알림 설정 방법', '실제 데이터야?'];
function answer(value: string) {
  if (/실제|데이터|실시간|AI|인공지능/i.test(value)) return '이곳의 기업명과 로고는 실제지만, 공시 내용과 수치는 가상 시나리오야. 나는 준비된 도움말을 안내하는 데모 챗봇이고, 실시간 데이터나 AI 서비스는 연결되어 있지 않아.';
  if (/관심|종목|기업|추가/.test(value)) return '「내 관심종목」에서 기업을 검색하고 추가해 봐! 등록한 기업의 변화를 피드에서 살펴볼 수 있어. 아래 바로가기로 이동할 수 있어 🐾';
  if (/알림|설정/.test(value)) return '「알림 설정」에서 원하는 조건을 바꾸고 저장하면 돼. 「알림 센터」에서는 데모 알림을 확인할 수 있어. 실제 푸시 발송은 아직 연결되지 않았어.';
  if (/정정|공시/.test(value)) return '정정공시는 이미 제출한 공시 내용을 고친 문서야. 변화 카드를 누르면 이전·이후 수치를 비교하고, 정정 이력도 살펴볼 수 있어. 이 앱에 표시되는 사례는 모두 가상이야.';
  if (/홈|피드|변화/.test(value)) return '「오늘의 변화」에서 기업별 변화 카드를 눌러 봐. 상세 화면에서 수치 비교와 근거를 확인할 수 있어. 왼쪽 위 RADAR 로고를 눌러도 홈으로 돌아갈 수 있어!';
  if (/안녕|고마워|폼폼/.test(value)) return '반가워! 오늘도 너의 작은 발견을 응원해 💛 궁금한 앱 사용법을 아래 질문에서 골라 봐.';
  return '아직 자유로운 AI 대화는 할 수 없지만, 앱 사용법은 도와줄 수 있어! 관심종목 추가, 알림 설정, 정정공시, 데모 데이터 중 궁금한 것을 물어봐 줘 🐾';
}
function Portrait({ back = false, kicking = false }: { back?: boolean; kicking?: boolean }) { return <span className="pompom-portrait" aria-hidden="true"><img src={`${import.meta.env.BASE_URL}chatbot/${back ? 'pompom-back.png' : 'pompom-cutout.png'}`} alt="" />{kicking && <span className="pompom-legs"><i/><i/></span>}</span>; }

export default function PompomChat() {
  const { page, go, user, aiAvailable } = useRadar();
  const [opened, setOpened] = useState(false);
  const greeting: Message = { ...welcome, text: user ? `${user.name}님, 반가워! 나는 폼폼이야 🐾\n오늘은 어떤 기업이 궁금해?` : welcome.text };
  const [messages, setMessages] = useState<Message[]>([greeting]);
  const [aiMode, setAiMode] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState('');
  const sending = useRef(false);
  const [draft, setDraft] = useState('');
  const [reaction, setReaction] = useState<'idle'|'wonder'|'walking'|'angry'>('idle');
  const [backPose, setBackPose] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [clickLevel, setClickLevel] = useState(0);
  const reactionTimers = useRef<number[]>([]);
  const angerTimer = useRef<number | undefined>(undefined);
  const widget = useRef<HTMLDivElement>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; startOffsetX: number; startOffsetY: number; rect: DOMRect; moved: boolean } | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const suppressClick = useRef(false);
  const input = useRef<HTMLInputElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const history = useRef<HTMLDivElement>(null);
  useEffect(() => { if (opened) input.current?.focus(); }, [opened]);
  useEffect(() => { if (history.current) history.current.scrollTop = history.current.scrollHeight; }, [messages, opened]);
  const close = () => { setOpened(false); launcher.current?.focus(); };
  const reactAndOpen = () => {
    if (suppressClick.current) { suppressClick.current = false; return; }
    const nextLevel = Math.min(clickLevel + 1, 5);
    setClickLevel(nextLevel);
    if (angerTimer.current) window.clearTimeout(angerTimer.current);
    if (opened && nextLevel < 5) close();
    else setOpened(true);
    reactionTimers.current.forEach(window.clearTimeout);
    setBackPose(false);
    if (nextLevel >= 5) {
      setReaction('angry');
      angerTimer.current = window.setTimeout(() => {
        setReaction('idle');
        setClickLevel(0);
      }, 4500);
      return;
    }
    setReaction('wonder');
    reactionTimers.current = [
      window.setTimeout(() => setReaction('walking'), 650),
      window.setTimeout(() => setBackPose(true), 1250),
      window.setTimeout(() => setBackPose(false), 1900),
      window.setTimeout(() => setReaction('idle'), 2600),
    ];
  };
  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { pointerId: event.pointerId, startX: event.clientX, startY: event.clientY, startOffsetX: dragOffset.current.x, startOffsetY: dragOffset.current.y, rect: event.currentTarget.getBoundingClientRect(), moved: false };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    const dx = event.clientX - active.startX, dy = event.clientY - active.startY;
    if (!active.moved && Math.hypot(dx, dy) < 6) return;
    if (!active.moved) {
      active.moved = true;
      setDragging(true);
      setBackPose(true);
      setReaction('walking');
    }
    const baseLeft = active.rect.left - active.startOffsetX, baseRight = active.rect.right - active.startOffsetX;
    const baseTop = active.rect.top - active.startOffsetY, baseBottom = active.rect.bottom - active.startOffsetY;
    const x = Math.max(8 - baseLeft, Math.min(window.innerWidth - 8 - baseRight, active.startOffsetX + dx));
    const y = Math.max(8 - baseTop, Math.min(window.innerHeight - 12 - baseBottom, active.startOffsetY + dy));
    dragOffset.current = { x, y };
    if (widget.current) widget.current.style.translate = `${x}px ${y}px`;
  };
  const onPointerUp = (event: React.PointerEvent<HTMLButtonElement>) => {
    const active = drag.current;
    if (!active || active.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
    drag.current = null;
    if (!active.moved) return;
    suppressClick.current = true;
    window.setTimeout(() => { suppressClick.current = false; }, 80);
    setDragging(false);
    setBackPose(false);
    setReaction('idle');
  };
  useEffect(() => () => {
    reactionTimers.current.forEach(window.clearTimeout);
    if (angerTimer.current) window.clearTimeout(angerTimer.current);
  }, []);
  const send = async (text: string) => {
    const clean = text.trim().slice(0, 300);
    if (!clean || sending.current) return;
    const next: Message[] = [...messages, {role: 'user', text: clean}];
    setMessages(next.slice(-40)); setError('');
    setDraft('');
    input.current?.focus();
    if (!aiMode) { setMessages([...next, {role: 'bot' as const, text: answer(clean)}].slice(-40)); return; }
    sending.current = true; setBusy(true);
    try {
      const conversation = next.slice(1).slice(-9).map(message => ({...message, text: message.text.slice(0, 2000)}));
      const result = await api<{text: string}>('chat', {consent: true, messages: conversation});
      setMessages(previous => [...previous, {role: 'bot', text: result.text}].slice(-40) as Message[]);
    } catch (err) { setError(err instanceof Error ? err.message : 'AI 연결에 실패했어요.'); }
    finally { sending.current = false; setBusy(false); }
  };
  const visit = (target: Page) => { setOpened(false); go(target); };
  return <div ref={widget} className={`pompom-widget ${page === 'settings' ? 'pompom-settings' : ''}`}>
    {opened && <section className="pompom-panel" role="dialog" aria-modal="false" aria-labelledby="pompom-title" id="pompom-chat" onKeyDown={event => { if (event.key === 'Escape') { event.stopPropagation(); close(); } }}>
      <header className="pompom-header"><Portrait /><div><span className="pompom-eyebrow">YOUR LITTLE COMPANION</span><h2 id="pompom-title">폼폼이와 이야기해요</h2><p><span />{aiMode ? 'Google Gemini · AI 대화' : '앱 사용 도우미 · 데모'}</p></div><button type="button" onClick={close} aria-label="챗봇 닫기"><X size={19}/></button></header>
      <div className="pompom-context"><Sparkles size={13}/>{titles[page]}에서 함께하고 있어요</div>
      <div className="pompom-ai-choice"><label><input type="checkbox" checked={aiMode} disabled={busy || !aiAvailable || !user} onChange={e => { setAiMode(e.target.checked); setError(''); setMessages([greeting]); }}/>Google AI 사용</label><p>{!aiAvailable ? 'API 키 연결 전 · 도움말 모드 이용 가능' : !user ? '상단에서 로그인하면 AI를 사용할 수 있어요.' : '켜면 대화가 Google로 전송돼요. 무료 서비스에서는 제품 개선에 사용될 수 있어요. 민감한 정보는 입력하지 마세요.'}</p></div>
      <div className="pompom-history" ref={history} role="log" aria-label="폼폼 대화 내역" aria-live="polite" aria-relevant="additions">{messages.map((message, index) => <div key={index} className={`pompom-message ${message.role}`}><span className="pompom-speaker">{message.role === 'bot' ? '폼폼' : '나'}</span><p>{message.text}</p></div>)}</div>
      {busy && <p className="pompom-typing" role="status">폼폼이가 생각하고 있어요 <span>•••</span></p>}
      {error && <p className="pompom-error" role="alert">{error}</p>}
      <div className="pompom-questions" aria-label="추천 질문">{questions.map(question => <button disabled={busy} key={question} onClick={() => send(question)}>{question}</button>)}</div>
      <nav className="pompom-links" aria-label="챗봇 바로가기"><button onClick={() => visit('feed')}>홈</button><button onClick={() => visit('stocks')}>관심종목 ↗</button><button onClick={() => visit('settings')}>알림 설정 ↗</button><button disabled={busy} aria-label="대화 초기화" onClick={() => { setMessages([greeting]); setDraft(''); setError(''); input.current?.focus(); }}><RotateCcw size={13}/></button></nav>
      <form className="pompom-form" onSubmit={event => { event.preventDefault(); send(draft); }}><input ref={input} aria-label="폼폼에게 질문하기" value={draft} onChange={event => setDraft(event.target.value)} maxLength={300} placeholder={user ? `${user.name}님, 무엇이 궁금해요?` : '궁금한 앱 사용법을 물어봐'} autoComplete="off"/><button type="submit" aria-label="질문 보내기" disabled={busy || !draft.trim()}><ArrowUp size={19}/></button></form>
      <p className="pompom-disclaimer">{aiMode ? 'AI 답변은 틀릴 수 있어요 · 실시간 시세 미연결' : '준비된 도움말로 답해요 · 대화는 서버에 전송하지 않아요'}</p>
    </section>}
    <button ref={launcher} className={`pompom-launcher ${opened ? 'is-open' : ''} ${reaction==='idle'?'':`is-${reaction}`} ${dragging?'is-dragging':''}`} style={{'--pompom-scale': 1 + clickLevel * .28} as CSSProperties} aria-label={reaction==='angry'?'폼폼이 화났어요':opened ? '폼폼 챗봇 닫기' : '폼폼 챗봇 열기'} aria-expanded={opened} aria-controls={opened ? 'pompom-chat' : undefined} onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp} onPointerCancel={onPointerUp} onClick={reactAndOpen}><span className="pompom-label">{reaction==='angry'?'그만 눌러!':opened ? '잠깐 쉬기' : '무엇이 궁금해?'}</span><span className="pompom-question" aria-hidden="true">{reaction==='angry'?'!!':'?'}</span><Portrait back={backPose} kicking={dragging} /><span className="pompom-spark">✦</span></button>
  </div>;
}
