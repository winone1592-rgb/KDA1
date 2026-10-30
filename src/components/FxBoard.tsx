import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Clock3, RefreshCw, TrendingUp } from 'lucide-react';

type SpotResponse = {
  fetched_at: string;
  rates?: { KRW?: { value: string; display?: string; source?: string; stale?: boolean; as_of?: string | null } };
  attribution?: { text?: string; url?: string };
};
type HistoryResponse = { points?: Array<{ date: string; close: string }> };
type Point = { date: string; value: number };
type BoardData = { spot: number; display: string; fetchedAt: string; stale: boolean; asOf: string | null; source: string; points: Point[] };
const CACHE_KEY = 'radar.fx.usdkrw.v1';
const PERIODS = [7, 30, 90] as const;
type Period = typeof PERIODS[number];

function number(value: string | undefined) { const parsed = Number(value); return Number.isFinite(parsed) ? parsed : null; }
function dateLabel(value: string) { return new Intl.DateTimeFormat('ko-KR', { month: 'numeric', day: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date(`${value}T12:00:00Z`)); }
function timeLabel(value: string) { return new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Seoul' }).format(new Date(value)); }

export function FxBoard() {
  const [period, setPeriod] = useState<Period>(30);
  const [data, setData] = useState<BoardData | null>(() => {
    try { const saved = localStorage.getItem(CACHE_KEY); return saved ? JSON.parse(saved) as BoardData : null; } catch { return null; }
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const load = useCallback(async (days: Period, quiet = false) => {
    if (!quiet) setBusy(true);
    setError('');
    try {
      const [spotResponse, historyResponse] = await Promise.all([
        fetch('https://cxrates.com/api/v1/rates?base=USD&quote=KRW', { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) }),
        fetch(`https://cxrates.com/api/v1/history?pair=usd-to-krw&days=${days}`, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(12000) }),
      ]);
      if (!spotResponse.ok || !historyResponse.ok) throw new Error('환율 정보를 불러오지 못했어요.');
      const [spotJson, historyJson] = await Promise.all([spotResponse.json() as Promise<SpotResponse>, historyResponse.json() as Promise<HistoryResponse>]);
      const rate = spotJson.rates?.KRW;
      const spot = number(rate?.value);
      if (!spot || !spotJson.fetched_at) throw new Error('환율 응답 형식이 올바르지 않아요.');
      const points = (historyJson.points ?? []).flatMap(item => { const value = number(item.close); return value ? [{ date: item.date, value }] : []; });
      const next: BoardData = { spot, display: rate?.display || new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 2 }).format(spot), fetchedAt: spotJson.fetched_at, stale: !!rate?.stale, asOf: rate?.as_of ?? null, source: rate?.source || '공개 환율 피드', points };
      setData(next);
      localStorage.setItem(CACHE_KEY, JSON.stringify(next));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '환율 정보를 불러오지 못했어요.');
    } finally { if (!quiet) setBusy(false); }
  }, []);

  useEffect(() => { void load(period); }, [period, load]);
  useEffect(() => {
    const refresh = () => { if (document.visibilityState === 'visible') void load(period, true); };
    const timer = window.setInterval(refresh, 60_000);
    window.addEventListener('focus', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); };
  }, [period, load]);

  const chart = useMemo(() => {
    if (!data?.points.length) return null;
    const values = [...data.points.map(point => point.value), data.spot];
    const min = Math.min(...values), max = Math.max(...values), spread = max - min || 1;
    const coords = values.map((value, index) => ({ x: values.length === 1 ? 0 : index / (values.length - 1) * 100, y: 50 - (value - min) / spread * 42 }));
    return { path: coords.map((point, index) => `${index ? 'L' : 'M'}${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(' '), min, max, start: values[0], end: data.spot };
  }, [data]);
  const prior = data?.points.at(-1)?.value;
  const change = data && prior ? data.spot - prior : null;
  const percent = change !== null && prior ? change / prior * 100 : null;
  const rising = (change ?? 0) >= 0;

  return <section className="fx-board" aria-label="실시간 원달러 환율">
    <div className="fx-main">
      <div className="fx-heading"><span className="fx-icon"><TrendingUp size={19}/></span><div><span className="eyebrow">CURRENCY RADAR</span><h2>원·달러 환율</h2></div><span className={`fx-live ${data?.stale ? 'is-stale' : ''}`}><i/>{data?.stale ? '최근 종가' : '최신 공개 시세'}</span></div>
      <div className="fx-quote"><strong>{data ? data.display : '—'}</strong><span>KRW <small>/ 1 USD</small></span></div>
      <div className={`fx-move ${rising ? 'up' : 'down'}`}>{change !== null ? <>{rising ? <ArrowUpRight size={15}/> : <ArrowDownRight size={15}/>}<b>{rising ? '+' : ''}{change.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}원</b><span>({rising ? '+' : ''}{percent?.toFixed(2)}%) · 직전 종가 대비</span></> : <span>동향 데이터를 불러오는 중</span>}</div>
      <div className="fx-meta"><Clock3 size={13}/>{data ? data.stale && data.asOf ? `${data.asOf} 기준 종가` : `${timeLabel(data.fetchedAt)} 업데이트` : busy ? '환율 정보 확인 중' : '시세 정보를 준비 중'}<span className="fx-meta-source">출처 {data?.source ?? 'CxRates'}</span></div>
    </div>
    <div className="fx-chart-panel">
      <div className="fx-chart-head"><div><b>환율 동향</b><span>일별 종가 기준</span></div><div className="fx-periods" aria-label="환율 그래프 기간">{PERIODS.map(days => <button key={days} aria-pressed={period === days} onClick={() => setPeriod(days)}>{days}일</button>)}</div><button className={`fx-refresh ${busy ? 'spinning' : ''}`} onClick={() => void load(period)} disabled={busy} aria-label="환율 새로고침"><RefreshCw size={15}/></button></div>
      {chart ? <div className="fx-chart-wrap"><svg className="fx-chart" viewBox="0 0 100 52" preserveAspectRatio="none" role="img" aria-label={`${period}일 원달러 환율 그래프`}><defs><linearGradient id="fx-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="#e7bd41" stopOpacity=".26"/><stop offset="100%" stopColor="#e7bd41" stopOpacity="0"/></linearGradient></defs><path d={`${chart.path} L100,52 L0,52 Z`} fill="url(#fx-fill)"/><path d={chart.path} fill="none" stroke="#9b7921" strokeWidth="1.4" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round"/></svg><div className="fx-chart-values"><span>₩{chart.min.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</span><span>₩{chart.max.toLocaleString('ko-KR', { maximumFractionDigits: 0 })}</span></div><div className="fx-chart-dates"><span>{data?.points[0] ? dateLabel(data.points[0].date) : '—'}</span><span>{data?.points.at(-1) ? dateLabel(data.points.at(-1)!.date) : '—'}</span></div></div> : <div className="fx-chart-empty">{busy ? '환율 동향을 불러오고 있어요.' : '동향 그래프를 표시할 데이터가 없어요.'}</div>}
      {error && <p className="fx-error" role="status">{error} <button onClick={() => void load(period)}>다시 시도</button></p>}
      <a className="fx-credit" href="https://cxrates.com/api" target="_blank" rel="noreferrer">Exchange rates by CxRates</a>
    </div>
  </section>;
}
