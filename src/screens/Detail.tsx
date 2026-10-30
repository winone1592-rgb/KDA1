import { useState } from 'react';
import { ArrowLeft, ArrowRight, ArrowLeftRight, Bookmark, Check, ChevronRight, Copy, ExternalLink, FileText, History, ShieldCheck, Sparkles } from 'lucide-react';
import { companies, disclosures, percent, delta } from '../lib/data';
import { useRadar } from '../lib/store';
import { Avatar, Badge, Compare, CompareDisclosureModal, EmptyState, Notice } from '../components/ui';

export default function Detail() {
  const { page, go, selected, saved, toggleSaved, checks, toggleCheck, notify } = useRadar();
  const item = disclosures.find(disclosure => disclosure.id === selected) || disclosures[0];
  const company = companies[item.companyId];
  const change = delta(item);
  const [expanded, setExpanded] = useState(true);
  const [compareOpen, setCompareOpen] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(`${company.name} · ${item.title}\n${item.metric}: ${item.comparable ? `${item.before} → ` : ''}${item.after}${item.unit}`);
      notify('공시 요약을 복사했습니다.');
    } catch {
      notify('복사 권한이 없습니다. 브라우저 권한을 확인해 주세요.');
    }
  };

  return <>
    <button className="back-button" onClick={() => go('feed')}><ArrowLeft size={17}/>변화 피드로 돌아가기</button>
    <div className="detail-heading">
      <div className="flex gap-3 items-center"><Avatar id={company.id}/><div><p className="muted text-xs">{company.code} · {company.sector}</p><h1>{company.name}</h1></div></div>
      <div className="flex gap-2"><button className={`icon-button outlined ${saved.includes(item.id) ? 'bookmarked' : ''}`} aria-label={saved.includes(item.id) ? '공시 저장 해제' : '공시 저장'} aria-pressed={saved.includes(item.id)} onClick={() => toggleSaved(item.id)}><Bookmark size={19} fill={saved.includes(item.id) ? 'currentColor' : 'none'}/></button><button className="icon-button outlined" onClick={share} aria-label="공시 요약 복사"><Copy size={19}/></button></div>
    </div>
    <div className="detail-meta-row"><div className="flex flex-wrap gap-2 items-center"><Badge tone="yellow">{item.kind === '정정' ? '기재정정' : '신규 접수'}</Badge><Badge>{item.report}보고서</Badge><span className="muted text-xs">{item.date}</span></div>{item.comparable && <button className="compare-open-button" onClick={() => setCompareOpen(true)}><ArrowLeftRight size={15}/>공시 비교</button>}</div>
    <div className="detail-tabs" role="tablist" aria-label="공시 상세 화면">{[['detail', '수치 비교', FileText], ['ai', 'AI 설명·근거', Sparkles], ['timeline', '정정 이력', History]].map(([target, label, Icon]) => { const TabIcon = Icon as typeof FileText; return <button key={target as string} role="tab" aria-selected={page === target} onClick={() => go(target as 'detail' | 'ai' | 'timeline')} className={page === target ? 'active' : ''}><TabIcon size={16}/>{label as string}</button>; })}</div>

    {page === 'detail' ? <div className="detail-grid">
      <div>
        <section className="panel metric-panel"><div className="panel-heading"><span className="eyebrow">DISCLOSURE CHANGE</span><Badge tone={change !== null && change < 0 ? 'red' : 'green'}>{percent(item)}</Badge></div><h2>{item.title}</h2><p className="muted mt-2 mb-6 text-sm">{item.report}보고서 · {item.metric}</p>{item.comparable ? <Compare item={item} large/> : <EmptyState kind="nodoc" onAction={() => window.open('https://dart.fss.or.kr/', '_blank', 'noopener,noreferrer')}/>}<div className="metric-summary"><ShieldCheck size={18}/><span>{item.comparable ? `${item.metric} ${Math.abs(item.after - item.before)}${item.unit} ${item.after < item.before ? '감소' : '증가'} · ${percent(item)}` : `신규 접수 ${item.metric} ${item.after}${item.unit}`}</span></div></section>
        <section className="panel"><h2>주요 항목 비교</h2><div className="table-scroll"><table><thead><tr><th>항목</th><th>정정 전</th><th>{item.comparable ? '정정 후' : '제출 수치'}</th><th>변동</th></tr></thead><tbody><tr><td>{item.metric}</td><td>{item.comparable ? item.before : '—'}</td><td className={change !== null && change < 0 ? 'negative' : 'positive'}>{item.after}</td><td>{item.comparable ? percent(item) : '—'}</td></tr><tr><td>보고서</td><td colSpan={3}>{company.name} · {item.report}보고서</td></tr></tbody></table></div><p className="muted text-xs mt-3">단위: {item.unit} · 변경 요약: {item.correctionReason ?? item.note}</p></section>
        <section className="panel"><div className="panel-heading"><h2>변경 내용 상세</h2><Badge tone="yellow">{item.kind}</Badge></div><p className="body-copy">{item.note}</p>{item.comparable && <button className="btn secondary" onClick={() => setCompareOpen(true)}><ArrowLeftRight size={16}/>이전·정정 문장 비교하기</button>}</section>
      </div>
      <aside><section className="panel"><span className="section-icon"><FileText size={21}/></span><h2>기업 · 보고서 정보</h2><a className="company-official" href={company.website} target="_blank" rel="noopener noreferrer">공식 홈페이지<ExternalLink size={13}/></a><dl className="info-list"><div><dt>기업명</dt><dd>{company.name}</dd></div><div><dt>종목 코드</dt><dd>{company.code}</dd></div><div><dt>보고서</dt><dd>{item.report}보고서</dd></div><div><dt>접수 유형</dt><dd>{item.kind === '정정' ? '기재정정' : '신규 접수'}</dd></div><div><dt>제출일</dt><dd>{item.date}</dd></div></dl><a className="btn secondary w-full" href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer">DART에서 공시 찾기<ExternalLink size={15}/></a><p className="muted text-xs mt-3 leading-relaxed">공시 원문을 보려면 DART에서 기업명과 보고서명을 검색하세요.</p></section><button className="ai-cta" onClick={() => go('ai')}><Sparkles size={23}/><div><strong>이 변화, 어떤 의미일까요?</strong><p>공시 내용과 근거를 살펴보기</p></div><ChevronRight size={20}/></button></aside>
    </div> : page === 'ai' ? <div className="detail-grid">
      <div><section className="ai-intro"><span className="section-icon"><Sparkles size={25}/></span><span className="eyebrow">UNDERSTAND THE CHANGE</span><h2>숫자 너머의 맥락을<br/>쉽게 이해하세요.</h2><p>공시 사실과 해석을 구분해 살펴봅니다.</p><Badge tone="yellow">AI 설명 기능 연결 중</Badge></section>
        {item.comparable ? <><section className="panel"><div className="flex gap-2 items-center mb-4"><Badge tone="green">FACT</Badge><h2>확인할 변경 수치</h2></div><p className="body-copy">{company.name}의 {item.metric}이 <b>{item.before}{item.unit}에서 {item.after}{item.unit}</b>으로 변경되었어요. 수치 차이는 <b className={change !== null && change < 0 ? 'negative' : 'positive'}>{percent(item)}</b>입니다.</p><Compare item={item}/></section><section className="panel"><div className="flex gap-2 items-center mb-4"><Badge tone="yellow">CONTEXT</Badge><h2>함께 살펴볼 내용</h2></div><p className="body-copy">{item.correctionReason ?? item.note} 수치 변경의 의미는 정정 사유와 다른 재무 항목을 함께 확인해야 판단할 수 있습니다.</p><Notice><b>투자 판단은 원문과 여러 재무 지표를 확인한 뒤 신중히 내려주세요.</b><p>AI 설명 기능은 연결 중이며 이 화면에서 자동 해석을 생성하지 않습니다.</p></Notice></section></> : <EmptyState kind="noai" onAction={() => go('detail')}/>}
        <section className="panel"><button className="expand-heading" onClick={() => setExpanded(!expanded)} aria-expanded={expanded} aria-controls="source-paragraph"><h2>공시 원문 확인</h2><span>{expanded ? '접기 −' : '펼치기 +'}</span></button>{expanded && <div id="source-paragraph"><p className="muted text-sm mb-4">DART에서 기업명과 보고서명으로 원문을 확인할 수 있어요.</p><a className="text-button mt-4" href="https://dart.fss.or.kr/" target="_blank" rel="noopener noreferrer">DART 열기<ExternalLink size={14}/></a></div>}</section>
      </div><aside><section className="panel checklist"><h2>추가 확인 체크리스트</h2><p className="muted text-sm mt-2 mb-5">확인한 내용을 기록해보세요.</p>{['정정 사유와 회계 기준 확인', '다른 재무 항목의 영향 확인', '다음 보고서의 수치 추이 확인'].map((text, index) => <label key={index} className="check-row"><input type="checkbox" checked={checks.includes(`${selected}-${index}`)} onChange={() => toggleCheck(`${selected}-${index}`)}/><span>{text}</span></label>)}<div className="check-progress"><span style={{ width: `${[0, 1, 2].filter(index => checks.includes(`${selected}-${index}`)).length / 3 * 100}%` }}/></div><p className="muted text-xs mt-3">{[0, 1, 2].filter(index => checks.includes(`${selected}-${index}`)).length} / 3 확인 완료</p></section><button className="btn secondary w-full" onClick={() => go('timeline')}><History size={17}/>정정 이력 살펴보기</button></aside>
    </div> : <div className="detail-grid">
      <section className="panel"><div className="panel-heading"><h2>공시 접수 타임라인</h2><Badge>{item.comparable ? '2개 버전' : '1개 버전'}</Badge></div><p className="muted text-sm mb-8">제출본에서 정정본까지 변경 순서를 확인하세요.</p><div className="timeline"><article><span className="timeline-dot current"><Check size={12}/></span><div className="flex gap-2 items-center"><Badge tone="yellow">{item.comparable ? '정정 제출본' : '최초 제출본'}</Badge><span className="muted text-xs">{item.date}</span></div><h3>{item.metric} <strong>{item.after}{item.unit}</strong></h3><p>{item.note}</p><button className="text-button" onClick={() => go('detail')}>이 버전 상세 보기<ArrowRight size={14}/></button></article>{item.comparable && <article><span className="timeline-dot"/><span className="muted text-xs">이전 제출본</span><h3>{item.metric} <del>{item.before}{item.unit}</del></h3><p>정정 전 수치와 정정 사유를 함께 비교해 보세요.</p><button className="text-button" onClick={() => setCompareOpen(true)}>두 문서 비교하기<ArrowLeftRight size={14}/></button></article>}</div><Notice>접수번호와 원문을 확인한 뒤 변경 내용을 검토하세요.</Notice></section><aside><section className="panel"><h2>변화 한눈에 보기</h2><Compare item={item}/><button className="btn secondary w-full mt-5" onClick={() => go('detail')}>수치 비교로 돌아가기<ArrowRight size={16}/></button></section></aside>
    </div>}
    <CompareDisclosureModal item={item} open={compareOpen} onClose={() => setCompareOpen(false)}/>
  </>;
}
