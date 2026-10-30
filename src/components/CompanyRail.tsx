import { Check, ArrowUpRight } from 'lucide-react';
import { companies, disclosures } from '../lib/data';
import { Avatar } from './ui';

export function CompanyRail({ selected, onSelect }: { selected: number | null; onSelect: (id: number | null) => void }) {
  return <section className="company-discovery" aria-label="기업별 공시 탐색">
    <div className="company-discovery-heading"><div><span className="eyebrow">COMPANY UNIVERSE</span><h2>익숙한 기업, 새로운 발견.</h2></div><button onClick={() => onSelect(null)} className={selected === null ? 'rail-all selected' : 'rail-all'} aria-pressed={selected === null}>전체 보기</button></div>
    <div className="company-rail">{companies.map(company => <button key={company.id} aria-pressed={selected === company.id} aria-label={`${company.name} 공시 필터`} onClick={() => onSelect(selected === company.id ? null : company.id)} className={`company-tile brand-${company.logo} ${selected === company.id ? 'selected' : ''}`}><span className="company-tile-check">{selected === company.id ? <Check size={13}/> : <ArrowUpRight size={13}/>}</span><Avatar id={company.id}/><b>{company.name}</b><span className="company-code">{company.code}</span><span className="company-tag">변화 {disclosures.filter(item => item.companyId === company.id).length}건</span></button>)}</div>
  </section>;
}
