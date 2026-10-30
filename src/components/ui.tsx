import { AnimatedNumber } from './AnimatedNumber';
import { useEffect, useRef, useId, useState, type ReactNode } from 'react';
import { ArrowDownRight, ArrowUpRight, ArrowRight, ArrowLeftRight, Bookmark, Check, ChevronRight, FileText, Plus, Radar, RefreshCw, Search, ShieldCheck, Sparkles, Star, TriangleAlert, X } from 'lucide-react';
import { companies, percent, delta, type Disclosure } from '../lib/data';
import { useRadar } from '../lib/store';
export function Logo({ small = false }: {
    small?: boolean;
}) { return <span className={`logo ${small ? 'small' : ''}`}><span className="logo-mark"><Radar size={small ? 24 : 29} strokeWidth={2.1}/></span><span className="wordmark">radar<span className="logo-period">.</span><small>공시의 작은 변화까지</small></span></span>; }
export function Badge({ children, tone = 'neutral' }: {
    children: ReactNode;
    tone?: string;
}) { return <span className={`badge ${tone}`}>{children}</span>; }
export function Avatar({ id }: {
    id: number;
}) { const c = companies[id]; const [failed, setFailed] = useState(false); return <span aria-hidden="true" className={`avatar ${c.color}`}>{c.logo && !failed ? <img src={`${import.meta.env.BASE_URL}companies/${c.logo}.svg`} alt="" onError={() => setFailed(true)}/> : <b>{c.initials || c.name.slice(0, 2)}</b>}</span>; }
export function Compare({ item, large = false }: {
    item: Disclosure;
    large?: boolean;
}) { const v = delta(item); if (v === null)
    return <div className="new-document"><FileText size={21}/><div><b>처음 만나는 공시예요</b><p>신규 접수 · 비교할 이전 문서 없음</p></div><strong><AnimatedNumber value={item.after}/><small> {item.unit}</small></strong></div>; return <div className={`compare ${large ? 'large' : ''}`}><div className="flex items-center justify-between gap-2"><span className="eyebrow">{item.metric} 변화</span><Badge tone={v < 0 ? 'red' : 'green'}>{v < 0 ? <ArrowDownRight size={13}/> : <ArrowUpRight size={13}/>} <AnimatedNumber value={v} decimals={1} signed/>%</Badge></div><div className="compare-values"><div><span>정정 전</span><del><AnimatedNumber value={item.before}/><small> {item.unit}</small></del></div><ArrowRight size={18} className="compare-arrow"/><div><span>정정 후</span><strong className={v < 0 ? 'negative' : 'positive'}><AnimatedNumber value={item.after}/><small> {item.unit}</small></strong></div></div><div className="compare-bars" aria-hidden="true"><i style={{ width: `${item.before / Math.max(item.before, item.after) * 100}%` }}/><i className={v < 0 ? 'decrease' : 'increase'} style={{ width: `${item.after / Math.max(item.before, item.after) * 100}%` }}/></div></div>; }
export function DisclosureCard({ item }: {
    item: Disclosure;
}) { const { open, saved, toggleSaved, stocks, toggleStock, seen } = useRadar(); const [comparing, setComparing] = useState(false); const c = companies[item.companyId]; return <article className={`disclosure-card brand-${c.logo}`}><div className="flex items-center gap-3"><Avatar id={c.id}/><div className="min-w-0 flex-1"><button className="company-title" onClick={() => open(item.id)}>{c.name}<ChevronRight size={14}/></button><p className="muted text-xs mt-1">{c.code} <span className="middot">·</span> {c.sector}</p></div><button className={`icon-button ${stocks.includes(c.id) ? 'starred' : ''}`} onClick={() => toggleStock(c.id)} aria-label={`${c.name} 관심종목 ${stocks.includes(c.id) ? '해제' : '추가'}`} aria-pressed={stocks.includes(c.id)}><Star size={19} fill={stocks.includes(c.id) ? 'currentColor' : 'none'}/></button></div><div className="flex flex-wrap gap-1.5 mt-5"><Badge tone={item.kind === '정정' ? 'yellow' : 'green'}>{item.kind === '정정' ? '기재정정' : '신규 접수'}</Badge><Badge>{item.report}보고서</Badge>{!seen.includes(item.id) && <Badge tone="dot">미확인</Badge>}</div><button className="card-headline" onClick={() => open(item.id)}>{item.title}</button><Compare item={item}/><div className="card-foot"><span className="muted text-xs">{item.time}</span><div className="flex items-center gap-2"><button className="compare-open-button" disabled={!item.comparable} onClick={() => setComparing(true)} aria-label={item.comparable ? `${c.name} 이전·정정 공시 비교 열기` : '비교할 이전 공시 없음'}><ArrowLeftRight size={15}/><span>{item.comparable ? '공시 비교' : '이전본 없음'}</span></button><button className={`icon-button ${saved.includes(item.id) ? 'bookmarked' : ''}`} aria-label={`${c.name} 공시 ${saved.includes(item.id) ? '저장 해제' : '저장'}`} aria-pressed={saved.includes(item.id)} onClick={() => toggleSaved(item.id)}><Bookmark size={18} fill={saved.includes(item.id) ? 'currentColor' : 'none'}/></button><button className="text-button" onClick={() => open(item.id)}>상세 <ArrowRight size={15}/></button></div></div><CompareDisclosureModal item={item} open={comparing} onClose={() => setComparing(false)}/></article>; }

function HighlightedText({ text, value, unit }: { text: string; value: number; unit: string }) {
    const token = `${value}${unit}`;
    const index = text.indexOf(token);
    return index < 0 ? <>{text}</> : <>{text.slice(0, index)}<mark>{token}</mark>{text.slice(index + token.length)}</>;
}

export function CompareDisclosureModal({ item, open, onClose }: { item: Disclosure; open: boolean; onClose: () => void }) {
    const company = companies[item.companyId];
    const [focus, setFocus] = useState(50);
    useEffect(() => { if (open) setFocus(50); }, [open, item.id]);
    const beforeText = item.previousText ?? [];
    const afterText = item.correctedText ?? [];
    return <Modal open={open} onClose={onClose} title="공시 변화 비교" className="compare-modal">
      <div className="compare-modal-company"><Avatar id={company.id}/><div><b>{company.name}</b><span>{company.code} · {company.sector} · {item.report}보고서</span></div><Badge tone="yellow">기재정정</Badge></div>
      <div className="compare-sample-note"><ShieldCheck size={15}/><p>아래 문안과 수치는 비교 화면을 위한 예시입니다. 실제 공시 원문은 연동되지 않았습니다.</p></div>
      <div className="compare-documents">
        <article className="compare-document previous" style={{ opacity: .74 + (100 - focus) / 385 }}>
          <header><span className="compare-version">01</span><div><b>이전 공시</b><small>최초 제출 문안</small></div><Badge>정정 전</Badge></header>
          <div className="compare-document-body"><h3>{item.title}</h3><span className="document-subtitle">{item.report}보고서 · {item.metric}</span>{(beforeText.length ? beforeText : [`최초 제출본에는 ${item.metric} ${item.before}${item.unit}으로 기재되어 있습니다.`]).map((text, index) => <p className="compare-sentence" key={index}><HighlightedText text={text} value={item.before} unit={item.unit}/></p>)}</div>
          <footer><FileText size={14}/>최초 제출본</footer>
        </article>
        <article className="compare-document corrected" style={{ opacity: .74 + focus / 385 }}>
          <header><span className="compare-version">02</span><div><b>정정 공시</b><small>변경 반영 문안</small></div><Badge tone="yellow">정정 후</Badge></header>
          <div className="compare-document-body"><h3>{item.title}</h3><span className="document-subtitle">{item.report}보고서 · {item.metric}</span>{(afterText.length ? afterText : [`정정 제출본에는 ${item.metric} ${item.after}${item.unit}으로 기재되어 있습니다.`]).map((text, index) => <p className="compare-sentence" key={index}><HighlightedText text={text} value={item.after} unit={item.unit}/></p>)}</div>
          <footer><FileText size={14}/>정정 제출본</footer>
        </article>
      </div>
      <label className="compare-slider-control"><span>이전 공시</span><input type="range" min="0" max="100" value={focus} aria-label="비교 강조 초점 이동" aria-valuetext={focus < 50 ? '이전 공시 강조' : focus > 50 ? '정정 공시 강조' : '양쪽 공시 동일 강조'} onChange={event => setFocus(Number(event.target.value))}/><span>정정 공시</span><output>{focus < 50 ? '이전본' : focus > 50 ? '정정본' : '균형'} 강조</output></label>
      <div className="compare-reason"><span>변경 이유</span><p>{item.correctionReason ?? item.note}</p><strong>{item.metric} <del>{item.before}{item.unit}</del><ArrowRight size={15}/><b>{item.after}{item.unit}</b><Badge tone={item.after < item.before ? 'red' : 'green'}>{percent(item)}</Badge></strong></div>
    </Modal>;
}
const emptyCopy = { nostocks: { icon: Star, title: '아직 관심종목이 없어요', body: '궁금한 기업을 등록하면 공시 변화를\n한곳에서 모아볼 수 있어요.', button: '첫 관심종목 등록하기' }, nochanges: { icon: ShieldCheck, title: '새로운 변화가 없어요', body: '지금은 모든 변화를 확인했어요.\n필터를 바꾸거나 새로운 공시를 확인해 보세요.', button: '전체 변화 보기' }, error: { icon: RefreshCw, title: '공시를 불러오지 못했어요', body: '잠시 후 다시 시도해 주세요.\n네트워크 상태를 함께 확인해 주세요.', button: '다시 시도하기' }, nodoc: { icon: FileText, title: '비교할 이전 문서가 없어요', body: '처음 제출된 공시는 증감률을 계산하지 않아요.\n공시 요약과 원문을 먼저 확인해 주세요.', button: 'DART 검색 열기' }, noai: { icon: Sparkles, title: 'AI 설명을 잠시 보류했어요', body: '설명에 필요한 수치 근거가 충분하지 않아요.\n확인된 공시 사실부터 살펴보세요.', button: '공시 사실 확인하기' } };
export function EmptyState({ kind, onAction }: {
    kind: keyof typeof emptyCopy;
    onAction: () => void;
}) { const c = emptyCopy[kind]; return <section className="empty-state"><span className="empty-orbit"><c.icon size={32} strokeWidth={1.5}/><i /></span><h2>{c.title}</h2><p>{c.body}</p><button className="btn primary" onClick={onAction}>{c.button}<ArrowRight size={16}/></button></section>; }
export function Modal({ open, onClose, title, children, className = '' }: {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    className?: string;
}) { const headingId = useId(); const ref = useRef<HTMLDialogElement>(null); useEffect(() => { if (open && !ref.current?.open)
    ref.current?.showModal();
else if (!open && ref.current?.open)
    ref.current?.close(); }, [open]); return <dialog ref={ref} className={`modal ${className}`} aria-labelledby={headingId} onCancel={onClose} onClick={e => { if (e.target === e.currentTarget)
    onClose(); }}><div className="flex items-center justify-between mb-5"><h2 id={headingId}>{title}</h2><button className="icon-button" onClick={onClose} aria-label="닫기"><X size={21}/></button></div>{children}</dialog>; }
export function StockSearch({ onDone }: {
    onDone?: () => void;
}) { const { stocks, toggleStock } = useRadar(); const [query, setQuery] = useSearch(); const [market, setMarket] = useState<'전체'|'KOSPI'|'US'>('전체'); const list = companies.filter(c => (market === '전체' || (c.market === market && !!c.marketRank)) && `${c.name} ${c.code} ${c.sector}`.toLowerCase().includes(query.toLowerCase())).sort((a,b)=>(a.marketRank||99)-(b.marketRank||99)); return <><div className="stock-market-tabs" aria-label="시장별 종목">{(['전체','KOSPI','US'] as const).map(item=><button key={item} aria-pressed={market===item} onClick={()=>setMarket(item)}>{item==='KOSPI'?'코스피 TOP 20':item==='US'?'미국 TOP 20':item}</button>)}</div><label className="search-field"><Search size={18}/><input autoFocus placeholder="기업명, 코드, 업종 검색" value={query} onChange={e => setQuery(e.target.value)} aria-label="종목 검색"/>{query && <button onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={16}/></button>}</label><p className="eyebrow mt-6 mb-2">검색 결과 {list.length}개</p><div>{list.map(c => <div className="stock-row" key={c.id}><Avatar id={c.id}/><div className="flex-1"><b>{c.name}</b><p className="muted text-xs mt-1">{c.code} · {c.sector}{c.marketRank ? ` · TOP ${c.marketRank}` : ''}</p></div><button aria-label={`${c.name} ${stocks.includes(c.id) ? '선택 해제' : '추가'}`} aria-pressed={stocks.includes(c.id)} className={`add-button ${stocks.includes(c.id) ? 'selected' : ''}`} onClick={() => toggleStock(c.id)}>{stocks.includes(c.id) ? <Check size={18}/> : <Plus size={18}/>}</button></div>)}{!list.length && <p className="empty-search">검색 결과가 없어요. 기업명이나 업종을 바꿔보세요.</p>}</div>{onDone && <button className="btn primary w-full mt-6" onClick={onDone} disabled={!stocks.length}>{stocks.length}개 종목으로 시작하기 <ArrowRight size={17}/></button>}</>; }
function useSearch() { return useState(''); }
export function Notice({ children, tone = 'yellow' }: {
    children: ReactNode;
    tone?: string;
}) { return <div className={`notice ${tone}`}><TriangleAlert size={18}/><div>{children}</div></div>; }
