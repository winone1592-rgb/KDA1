import {ArrowUpRight,ArrowDownRight,ChevronRight,ScanLine} from 'lucide-react';
import {disclosures,companies,delta,percent} from '../lib/data';
import {useRadar} from '../lib/store';
export function DailyBrief(){
 const {open}=useRadar();
 const changes=disclosures.filter(d=>d.comparable);
 const highlight=[...changes].sort((a,b)=>Math.abs(delta(b)??0)-Math.abs(delta(a)??0))[0];
 const decrease=changes.filter(d=>(delta(d)??0)<0).length;
 return <section className="daily-brief" aria-label="오늘의 공시 요약"><div className="brief-overview"><div className="brief-label"><ScanLine size={17}/>TODAY’S BRIEF<span>DEMO</span></div><h2>복잡한 공시 속,<br/><em>오늘의 핵심 신호.</em></h2><p>표시된 가상 시나리오 · 실제 공시 아님 {disclosures.length}건을 요약했어요.</p><div className="brief-breakdown"><span><ArrowDownRight size={14}/>감소 {decrease}</span><span><ArrowUpRight size={14}/>증가 {changes.length-decrease}</span><span>신규 {disclosures.length-changes.length}</span></div></div><button className="brief-feature" onClick={()=>open(highlight.id)}><div className="brief-feature-top"><span>가장 큰 수치 변화</span><ChevronRight size={18}/></div><div className="brief-value">{percent(highlight)}<span>{highlight.metric}</span></div><div className="brief-feature-bottom"><div><b>{companies[highlight.companyId].name}</b><p>{highlight.before} → {highlight.after}{highlight.unit}</p></div><span className="brief-open"><ArrowUpRight size={20}/></span></div></button></section>;
}
