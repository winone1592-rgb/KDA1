import { ArrowUpRight, ArrowDownRight, ChevronRight, ScanLine } from 'lucide-react';
import { disclosures, companies, delta, percent } from '../lib/data';
import { useRadar } from '../lib/store';

export function DailyBrief() {
  const { open } = useRadar();
  const changes = disclosures.filter(item => item.comparable);
  const highlight = [...changes].sort((a, b) => Math.abs(delta(b) ?? 0) - Math.abs(delta(a) ?? 0))[0];
  const decrease = changes.filter(item => (delta(item) ?? 0) < 0).length;
  return <section className="daily-brief" aria-label="오늘의 공시 요약">
    <div className="brief-overview">
      <div className="brief-label"><ScanLine size={17}/>TODAY’S KEY CHANGES</div>
      <h2>복잡한 공시 속,<br/><em>오늘의 핵심 신호.</em></h2>
      <p>정정 전후 수치와 문안을 나란히 비교해 변화의 맥락을 살펴보세요.</p>
      <div className="brief-breakdown"><span><ArrowDownRight size={14}/>감소 {decrease}</span><span><ArrowUpRight size={14}/>증가 {changes.length - decrease}</span><span>신규 {disclosures.length - changes.length}</span></div>
    </div>
    <button className="brief-feature" onClick={() => open(highlight.id)}>
      <div className="brief-feature-top"><span>가장 큰 수치 변화</span><ChevronRight size={18}/></div>
      <div className="brief-value">{percent(highlight)}<span>{highlight.metric}</span></div>
      <div className="brief-feature-bottom"><div><b>{companies[highlight.companyId].name}</b><p>{highlight.before}{highlight.unit} → {highlight.after}{highlight.unit}</p></div><span className="brief-open"><ArrowUpRight size={20}/></span></div>
    </button>
  </section>;
}
