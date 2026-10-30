import { useState } from 'react';
import { ArrowRight, Bell, CheckCheck, ChevronRight } from 'lucide-react';
import { companies, disclosures, percent } from '../lib/data';
import { useRadar } from '../lib/store';
import { Avatar, Badge } from '../components/ui';

export default function Notifications() {
  const { seen, readAll, open, go } = useRadar();
  const [unreadOnly, setUnreadOnly] = useState(false);
  const list = disclosures.filter(item => !unreadOnly || !seen.includes(item.id));
  const today = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', timeZone: 'Asia/Seoul' }).format(new Date());
  return <>
    <div className="page-heading"><div><span className="eyebrow">NOTIFICATION CENTER</span><h1>알림 센터 <span className="count-pill">{disclosures.filter(item => !seen.includes(item.id)).length}</span></h1><p>관심 있는 변화, 차곡차곡 모아두었어요.</p></div><button className="btn secondary" onClick={readAll} disabled={seen.length >= disclosures.length}><CheckCheck size={17}/>모두 읽기</button></div>
    <section className="notification-banner"><span><Bell size={25}/></span><div className="grow"><h2>내가 원하는 알림만 골라 받아요</h2><p>알림 유형과 방해금지 시간을 설정해보세요.</p></div><button className="icon-button" onClick={() => go('settings')} aria-label="알림 설정 열기"><ArrowRight size={20}/></button></section>
    <div className="flex justify-between items-center mb-5"><h2 className="text-base font-bold">{today}</h2><label className="inline-check"><input type="checkbox" checked={unreadOnly} onChange={event => setUnreadOnly(event.target.checked)}/>안 읽은 알림만</label></div>
    <div className="notification-list">{list.map(item => <button key={item.id} className={`notification-item ${seen.includes(item.id) ? 'read' : 'unread'}`} onClick={() => open(item.id)}><Avatar id={item.companyId}/><div className="grow min-w-0"><div className="flex items-center gap-2 flex-wrap"><b>{companies[item.companyId].name}</b><Badge tone={item.kind === '정정' ? 'yellow' : 'green'}>{item.kind === '정정' ? '기재정정' : '신규 접수'}</Badge>{!seen.includes(item.id) && <span className="notification-dot"/>}</div><p>{item.title}</p><span className="muted text-xs">{item.time} · {percent(item)}</span></div><ChevronRight size={18}/></button>)}{!list.length && <div className="empty-state"><CheckCheck size={34}/><h2>모두 확인했어요</h2><p>읽지 않은 알림이 없습니다.</p><button className="btn secondary" onClick={() => setUnreadOnly(false)}>전체 알림 보기</button></div>}</div>
  </>;
}
