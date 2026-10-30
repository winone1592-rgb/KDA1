import Account from './components/Account';
import AuthScreen from './components/AuthScreen';
import { lazy, Suspense, useEffect, useState } from 'react';
import { Bell, Check, LayoutDashboard, Menu, Search, Settings as SettingsIcon, Star, X } from 'lucide-react';
import { disclosures, titles, type Page } from './lib/data';
import { RadarProvider, useRadar } from './lib/store';
import { Logo, Modal, StockSearch } from './components/ui';

const PompomChat = lazy(() => import('./components/PompomChat'));
const Feed = lazy(() => import('./screens/Feed'));
const Stocks = lazy(() => import('./screens/Stocks'));
const Detail = lazy(() => import('./screens/Detail'));
const Notifications = lazy(() => import('./screens/Notifications'));
const Settings = lazy(() => import('./screens/Settings'));
const nav = [
  { page: 'feed' as Page, label: '오늘의 변화', icon: LayoutDashboard },
  { page: 'stocks' as Page, label: '내 관심종목', icon: Star },
  { page: 'notifications' as Page, label: '알림 센터', icon: Bell },
  { page: 'settings' as Page, label: '알림 설정', icon: SettingsIcon },
];

function Shell() {
  const { user, authReady, page, go, stocks, seen, message, setMessage, pendingPage, setPendingPage, discard } = useRadar();
  const [search, setSearch] = useState(false);
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    document.title = `${titles[page]} · RADAR`;
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [page]);
  const unread = disclosures.filter(item => !seen.includes(item.id)).length;
  const current = ['detail', 'ai', 'timeline'].includes(page) ? 'feed' : page === 'onboarding' ? 'stocks' : page;
  const navigate = (target: Page) => { setMenu(false); go(target); };
  if (!authReady) return <main className="auth-loading" aria-label="로그인 상태 확인 중"><span className="status-dot"/>안전하게 연결하고 있어요…</main>;
  if (!user) return <AuthScreen />;

  return <div className="app-shell">
    <aside className={`sidebar ${menu ? 'mobile-open' : ''}`} aria-label="사이드 메뉴">
      <div className="sidebar-logo">
        <button className="logo-home" aria-label="RADAR 홈으로 이동" onClick={() => navigate('feed')}><Logo /></button>
        <button className="icon-button mobile-only" aria-label="메뉴 닫기" onClick={() => setMenu(false)}><X size={21}/></button>
      </div>
      <p className="sidebar-caption">좋은 판단의 시작, 작은 발견.</p>
      <span className="sidebar-label">MY WORKSPACE</span>
      <nav aria-label="주 메뉴">{nav.map(item => <button key={item.page} className={`nav-item ${current === item.page ? 'active' : ''}`} onClick={() => navigate(item.page)} aria-current={current === item.page ? 'page' : undefined}><item.icon size={19}/>{item.label}{item.page === 'stocks' && <span className="nav-count">{stocks.length}</span>}{item.page === 'notifications' && unread > 0 && <span className="nav-count alert">{unread}</span>}</button>)}</nav>
      <div className="sidebar-summary"><span className="summary-icon"><LayoutDashboard size={21}/></span><p>오늘도 레이더는<br/><b>작은 변화를 살피고 있어요.</b></p><div><span className="status-dot"/>나만의 공시 모니터링</div></div>
      <div className="sidebar-bottom"><p>공시 변화의 핵심을<br/>한눈에 살펴보세요.</p></div>
    </aside>
    {menu && <button className="menu-backdrop" onClick={() => setMenu(false)} aria-label="메뉴 닫기"/>}
    <div className="workspace">
      <header className="topbar">
        <button className="mobile-only icon-button" onClick={() => setMenu(true)} aria-label="메뉴 열기"><Menu size={21}/></button>
        <div className="mobile-brand"><button className="logo-home" aria-label="RADAR 홈으로 이동" onClick={() => navigate('feed')}><Logo small/></button></div>
        <div className="breadcrumb"><span>나의 레이더</span><span>/</span><b>{titles[page]}</b></div>
        <div className="topbar-actions"><button className="icon-button" onClick={() => setSearch(true)} aria-label="전체 종목 검색"><Search size={20}/></button><button className="icon-button notification-button" onClick={() => go('notifications')} aria-label={`알림 ${unread}개`}><Bell size={20}/>{unread > 0 && <i/>}</button><Account/></div>
      </header>
      <main tabIndex={-1} key={page} id="main-content" className={`main-content page-${page}`}>
        <div className="date-label"><span className="status-dot"/>나만의 공시 모니터링<span className="grow"/><span>{new Intl.DateTimeFormat('ko-KR', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Asia/Seoul' }).format(new Date())}</span></div>
        <Suspense fallback={<div className="screen-loading" role="status"><span className="status-dot"/>화면을 불러오는 중…</div>}>{page === 'feed' ? <Feed/> : page === 'stocks' || page === 'onboarding' ? <Stocks/> : page === 'notifications' ? <Notifications/> : page === 'settings' ? <Settings/> : <Detail/>}</Suspense>
        <footer className="app-footer"><span>© 2026 RADAR</span></footer>
      </main>
      <nav className="bottom-nav" aria-label="모바일 메뉴">{nav.map(item => <button key={item.page} className={current === item.page ? 'active' : ''} aria-current={current === item.page ? 'page' : undefined} onClick={() => go(item.page)}><span><item.icon size={21}/>{item.page === 'notifications' && unread > 0 && <i/>}</span>{item.label === '내 관심종목' ? '내 종목' : item.label === '알림 센터' ? '알림' : item.label === '알림 설정' ? '설정' : item.label}</button>)}</nav>
    </div>
    <Suspense fallback={null}><PompomChat key={user.id}/></Suspense>
    <Modal open={search} onClose={() => setSearch(false)} title="내 레이더에 기업 추가"><StockSearch/><button className="btn primary w-full mt-6" onClick={() => setSearch(false)}>선택 완료 · {stocks.length}개</button></Modal>
    <Modal open={!!pendingPage} onClose={() => setPendingPage(null)} title="저장하지 않은 설정이 있어요"><p className="muted mb-6">이동하면 현재 변경사항이 사라집니다. 설정을 저장하려면 이 화면에 머물러 주세요.</p><div className="flex gap-3"><button className="btn secondary grow" onClick={() => setPendingPage(null)}>계속 수정하기</button><button className="btn primary grow" onClick={discard}>저장하지 않고 이동</button></div></Modal>
    {message && <div className="toast" role="status" aria-live="polite"><span className="toast-check"><Check size={16}/></span><span>{message.text}</span>{message.undo && <button className="undo" onClick={message.undo}>실행 취소</button>}<button aria-label="알림 닫기" onClick={() => setMessage(null)}><X size={16}/></button></div>}
  </div>;
}

export default function App() { return <RadarProvider><Shell/></RadarProvider>; }
