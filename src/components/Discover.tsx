import { useState } from 'react';
import { ArrowUpRight, Check, Plus, Sparkles } from 'lucide-react';
import { companies } from '../lib/data';
import { useRadar } from '../lib/store';
import { Avatar } from './ui';
const themes = ['추천', '코스피 TOP 20', '미국 TOP 20', '전체'] as const;
const reasons: Record<number,string> = {0:'반도체와 IT 사업을 함께 살펴봐요.',1:'인터넷 서비스와 AI 사업에 관심 있다면.',2:'일상 속 플랫폼 기업을 알아봐요.',3:'자동차 산업의 변화를 살펴봐요.',4:'현대자동차와 함께 비교해 볼 기업.',5:'가전과 전자 분야로 시야를 넓혀봐요.',6:'AI 반도체 분야를 알아보는 출발점.',7:'친숙한 기기와 서비스 사업을 살펴봐요.',8:'전기차와 에너지 분야를 함께 탐색해요.'};
export default function Discover() {
 const {stocks,toggleStock,user} = useRadar();
 const [theme,setTheme] = useState<typeof themes[number]>('추천');
 const list=companies.filter(c=>theme==='전체'||(theme==='추천'?c.id<9:theme==='코스피 TOP 20'?c.market==='KOSPI'&&!!c.marketRank:c.market==='US'&&!!c.marketRank)).sort((a,b)=>(a.marketRank||99)-(b.marketRank||99));
 return <section className="discover" aria-labelledby="discover-title"><div className="discover-heading"><div><span className="eyebrow"><Sparkles size={13}/> DISCOVER YOUR NEXT</span><h2 id="discover-title">{user ? `${user.name}님, 이런 기업은 어때요?` : '다음 관심기업을 발견해요'}</h2><p>코스피와 미국 시가총액 상위 종목을 살펴봐요.</p></div><span className="discover-count">{list.length} COMPANIES</span></div><div className="discover-themes" aria-label="기업 추천 주제">{themes.map(t=><button key={t} aria-pressed={theme===t} onClick={()=>setTheme(t)}>{t}</button>)}</div><div className="discover-grid">{list.map(c=><div className={`discover-card brand-${c.logo||'generic'}`} key={c.id}><div className="discover-card-top"><Avatar id={c.id}/><span>{c.market==='US'?'US':'KOSPI'}{c.marketRank?` · #${c.marketRank}`:''}</span><button className={stocks.includes(c.id)?'added':''} onClick={()=>toggleStock(c.id)} aria-label={`${c.name} 추천 ${stocks.includes(c.id)?'해제':'추가'}`} aria-pressed={stocks.includes(c.id)}>{stocks.includes(c.id)?<Check size={16}/>:<Plus size={16}/>}</button></div><h3>{c.name}<small>{c.code}</small></h3><p>{reasons[c.id]||`${c.market==='US'?'미국':'코스피'} 시가총액 상위 기업을 탐색해요.`}</p><div className="discover-card-foot"><span>{c.sector}</span><a href={c.website} target="_blank" rel="noreferrer" aria-label={`${c.name} 공식 사이트`}>기업 소개 <ArrowUpRight size={13}/></a></div></div>)}</div><p className="discover-note">상위 20 기준: 2026년 10월 29일 종가 시가총액 스냅샷 · 관심기업 탐색용이며 매수 추천이 아닙니다. 순위는 변동될 수 있고 실시간 시세·공시는 연결되지 않았습니다.</p></section>;
}
