import Discover from '../components/Discover';
import { CompanyRail } from '../components/CompanyRail';
import { DailyBrief } from '../components/DailyBrief';
import { FxBoard } from '../components/FxBoard';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { useMemo, useState } from 'react';
import { ArrowRight, Bookmark, ChevronDown, Search, SlidersHorizontal, Sparkles, Star, X } from 'lucide-react';
import { disclosures, companies, delta } from '../lib/data';
import { useRadar } from '../lib/store';
import { DisclosureCard, EmptyState, Badge } from '../components/ui';

export default function Feed() {
  const { stocks, saved, go } = useRadar();
  const [companyFilter, setCompanyFilter] = useState<number | null>(null);
  const [tab, setTab] = useState('all');
  const [report, setReport] = useState('전체');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [kind, setKind] = useState('전체');
  const [filters, setFilters] = useState(false);
  const list = useMemo(() => disclosures
    .filter(item => (companyFilter === null || item.companyId === companyFilter)
      && (tab === 'all' || (tab === 'mine' ? stocks.includes(item.companyId) : saved.includes(item.id)))
      && (report === '전체' || item.report === report)
      && (kind === '전체' || item.kind === kind)
      && `${companies[item.companyId].name} ${item.title} ${companies[item.companyId].code}`.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => sort === 'magnitude' ? Math.abs(delta(b) ?? 0) - Math.abs(delta(a) ?? 0) : a.id - b.id),
  [tab, stocks, saved, report, kind, query, sort, companyFilter]);
  const reset = () => { setCompanyFilter(null); setTab('all'); setReport('전체'); setQuery(''); setKind('전체'); };

  return <>
    <section className="hero"><div className="hero-copy"><span className="eyebrow">MY DISCLOSURE RADAR</span><h1>놓치기 쉬운 변화,<br/><span>먼저 발견하세요.</span></h1><p>관심 기업의 공시, 중요한 변화를 나란히 비교해 보세요.</p><button className="hero-link" onClick={() => go('stocks')}>내 관심종목 관리 <ArrowRight size={16}/></button></div><div className="radar-art" aria-hidden="true"><div className="radar-ring r1"/><div className="radar-ring r2"/><div className="radar-ring r3"/><div className="radar-axis"/><div className="radar-sweep"/><i className="blip b1"/><i className="blip b2"/><i className="blip b3"/><span className="radar-center"/></div><span className="hero-caption">작은 신호가, 큰 이해로.</span></section>
    <div className="stats-grid"><div><span className="stat-icon"><Sparkles size={18}/></span><div><p>새로운 변화</p><strong><AnimatedNumber value={disclosures.length}/><small>건</small></strong></div><Badge tone="yellow">TODAY</Badge></div><div><span className="stat-icon"><Star size={18}/></span><div><p>추적 중인 종목</p><strong><AnimatedNumber value={stocks.length}/><small>개</small></strong></div><button className="icon-button" onClick={() => go('stocks')} aria-label="관심종목 관리"><ArrowRight size={17}/></button></div><div className="desktop-stat"><span className="stat-icon"><Bookmark size={18}/></span><div><p>저장한 공시</p><strong><AnimatedNumber value={saved.length}/><small>건</small></strong></div></div></div>
    <DailyBrief/><FxBoard/><CompanyRail selected={companyFilter} onSelect={setCompanyFilter}/>
    <div className="section-heading"><div><span className="eyebrow">DISCLOSURE FEED</span><h2>오늘의 변화 <span className="muted">{list.length}</span></h2></div></div>
    <div className="feed-toolbar"><div className="segmented">{[['all', '전체'], ['mine', '내 종목'], ['saved', '저장함']].map(([value, label]) => <button key={value} aria-pressed={tab === value} className={tab === value ? 'active' : ''} onClick={() => setTab(value)}>{value === 'mine' ? <Star size={14}/> : value === 'saved' ? <Bookmark size={14}/> : null}{label}{value === 'saved' && <small>{saved.length}</small>}</button>)}</div><button className={`filter-button ${filters ? 'active' : ''}`} onClick={() => setFilters(!filters)} aria-expanded={filters} aria-controls="feed-filters"><SlidersHorizontal size={17}/><span>필터</span>{(report !== '전체' || kind !== '전체') && <i/>}</button></div>
    {filters && <div className="filter-panel" id="feed-filters"><label>보고서 유형<select value={report} onChange={event => setReport(event.target.value)}>{['전체', '분기', '반기', '사업'].map(option => <option key={option}>{option}</option>)}</select></label><label>공시 유형<select value={kind} onChange={event => setKind(event.target.value)}>{['전체', '정정', '신규'].map(option => <option key={option}>{option}</option>)}</select></label><button className="text-button" onClick={() => { setReport('전체'); setKind('전체'); }}>초기화</button></div>}
    <div className="feed-search-row"><label className="search-field compact"><Search size={17}/><input placeholder="공시 또는 기업 검색" aria-label="공시 검색" value={query} onChange={event => setQuery(event.target.value)}/>{query && <button onClick={() => setQuery('')} aria-label="검색어 지우기"><X size={15}/></button>}</label><label className="sort-label"><span className="sr-only">공시 정렬</span><select value={sort} onChange={event => setSort(event.target.value)}><option value="recent">최신순</option><option value="magnitude">변동률순</option></select><ChevronDown size={13}/></label></div>
    <div className="sync-status"><span className="status-dot"/>정정·신규 공시 변화 <span className="middot">·</span> {list.length}건</div>
    {tab === 'mine' && !stocks.length ? <EmptyState kind="nostocks" onAction={() => go('onboarding')}/> : list.length ? <div className="disclosure-grid">{list.map(item => <DisclosureCard key={item.id} item={item}/>)}</div> : <div className="empty-state"><Search size={30}/><h2>{tab === 'saved' && !saved.length ? '저장한 공시가 없어요' : '조건에 맞는 공시가 없어요'}</h2><p>{tab === 'saved' ? '공시 카드의 북마크를 눌러 모아보세요.' : '검색어나 필터를 바꿔보세요.'}</p><button className="btn secondary" onClick={reset}>전체 변화 보기</button></div>}
    <Discover/>
  </>;
}
