import { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { companies, disclosures, defaultSettings, titles, type Page, type Scenario, type Settings } from './data';
import { api, type User } from './api';
import { supabase } from './supabase';
function read<T>(key: string, fallback: T, valid: (v: unknown) => boolean): T { try {
    const v: unknown = JSON.parse(localStorage.getItem(key) || 'null');
    return valid(v) ? v as T : fallback;
}
catch {
    return fallback;
} }
const stockIds = (v: unknown): v is number[] => Array.isArray(v) && v.every(i => companies.some(c => c.id === i));
const disclosureIds = (v: unknown): v is number[] => Array.isArray(v) && v.every(i => disclosures.some(d => d.id === i));
export function loadSettings(): Settings { const raw = read<Record<string, unknown>>('radar-settings', {}, v => !!v && typeof v === 'object' && !Array.isArray(v)); const next = { ...defaultSettings }; for (const key of Object.keys(next) as (keyof Settings)[]) {
    const v = raw[key];
    if (typeof v === typeof next[key])
        (next as Record<string, unknown>)[key] = v;
} if (!['instant', 'digest'].includes(next.mode))
    next.mode = 'instant'; for (const k of ['quietStart', 'quietEnd'] as const)
    if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(next[k]))
        next[k] = defaultSettings[k]; return next; }
function route(): Page { const p = location.hash.slice(1).split('?')[0]; return Object.hasOwn(titles, p) ? p as Page : 'feed'; }
function useStore() {
    const [user, setUser] = useState<User | null>(null);
    const [authReady,setAuthReady]=useState(false);
    const [aiAvailable, setAiAvailable] = useState(false);
    useEffect(() => { let active = true; api<{aiAvailable: boolean}>('session').then(data => { if (active) setAiAvailable(data.aiAvailable); }).catch(() => {});
        if (!supabase) { setAuthReady(true); return () => { active = false; }; }
        const client=supabase;
        const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,session)=>{
            setAuthReady(true);
            const account=session?.user;
            setUser(account ? {id:account.id,email:account.email||'',name:String(account.user_metadata?.name||account.email?.split('@')[0]||'사용자').slice(0,20)} : null);
            if(account)setTimeout(async()=>{try{const {data,error}=await client.from('user_preferences').select('*').eq('user_id',account.id).maybeSingle();if(error)throw error;if(data){if(stockIds(data.watchlist)){setStocks(data.watchlist);localStorage.setItem('radar-stocks',JSON.stringify(data.watchlist));}if(disclosureIds(data.saved_disclosures)){setSaved(data.saved_disclosures);localStorage.setItem('radar-saved',JSON.stringify(data.saved_disclosures));}if(disclosureIds(data.read_disclosures)){setSeen(data.read_disclosures);localStorage.setItem('radar-seen',JSON.stringify(data.read_disclosures));}if(data.notification_settings&&typeof data.notification_settings==='object'){const settings={...defaultSettings,...data.notification_settings};setSettings(settings);localStorage.setItem('radar-settings',JSON.stringify(settings));}if(Array.isArray(data.checklist)){setChecks(data.checklist);localStorage.setItem('radar-checks',JSON.stringify(data.checklist));}}}catch(error){console.error('Supabase preferences could not be loaded',error);}},0);
        });
        return () => {active=false;subscription.unsubscribe();};
    }, []);
    const [page, setPage] = useState<Page>(route), [scenario, setScenario] = useState<Scenario>('');
    const [selected, setSelected] = useState(() => { try {
        const n = Number(sessionStorage.getItem('radar-selected'));
        return disclosures.some(d => d.id === n) ? n : 0;
    }
    catch {
        return 0;
    } });
    const [stocks, setStocks] = useState<number[]>(() => read('radar-stocks', [0, 1, 2, 3], stockIds));
    const [saved, setSaved] = useState<number[]>(() => read('radar-saved', [], disclosureIds));
    const [seen, setSeen] = useState<number[]>(() => read('radar-seen', [], disclosureIds));
    const [settings, setSettings] = useState<Settings>(loadSettings);
    const [checks, setChecks] = useState<string[]>(() => read('radar-checks', [], v => Array.isArray(v) && v.every(i => typeof i === 'string')));
    const [message, setMessage] = useState<{
        text: string;
        undo?: () => void;
    } | null>(null);
    const [dirty, setDirty] = useState(false), [pendingPage, setPendingPage] = useState<Page | null>(null);
    const syncQueue = useRef(Promise.resolve());
    const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const notify = useCallback((text: string, undo?: () => void) => { clearTimeout(timer.current); setMessage({ text, undo }); timer.current = setTimeout(() => setMessage(null), 4500); }, []);
    useEffect(() => () => clearTimeout(timer.current), []);
    useEffect(() => { const onHash = () => { const next = route(); if (dirty && page === 'settings' && next !== 'settings') {
        setPendingPage(next);
        history.replaceState(null, '', '#settings');
        return;
    } setPage(next); setScenario(''); window.scrollTo({ top: 0, behavior: 'instant' }); }; window.addEventListener('hashchange', onHash); return () => window.removeEventListener('hashchange', onHash); }, [dirty, page]);
    const write = (key: string, value: unknown) => { try {
        localStorage.setItem(key, JSON.stringify(value));
        if(supabase&&user){const client=supabase;const field=key.replace(/^radar-/,'');const row:Record<string,unknown>={user_id:user.id,display_name:user.name,updated_at:new Date().toISOString()};const map:Record<string,string>={stocks:'watchlist',saved:'saved_disclosures',seen:'read_disclosures',settings:'notification_settings',checks:'checklist'};row[map[field]||field]=value;syncQueue.current=syncQueue.current.then(async()=>{const {error}=await client.from('user_preferences').upsert(row,{onConflict:'user_id'});if(error)throw error;}).catch((error)=>notify('Supabase 저장 실패: '+(error?.message||'SQL 테이블 또는 RLS 정책을 확인해 주세요.')));}
        return true;
    }
    catch {
        notify('저장 공간에 접근할 수 없어 이번 세션에만 반영됩니다.');
        return false;
    } };
    const navigate = (p: Page) => { setScenario(''); setPage(p); if (location.hash !== `#${p}`)
        location.hash = p; window.scrollTo({ top: 0, behavior: 'instant' }); };
    const go = (p: Page) => { if (dirty && page === 'settings' && p !== page) {
        setPendingPage(p);
        return;
    } navigate(p); };
    const discard = () => { setDirty(false); if (pendingPage)
        navigate(pendingPage); setPendingPage(null); };
    const markRead = (id: number) => { setSeen(prev => { const next = prev.includes(id) ? prev : [...prev, id]; write('radar-seen', next); return next; }); };
    const open = (id: number, p: Page = 'detail') => { setSelected(id); try {
        sessionStorage.setItem('radar-selected', String(id));
    }
    catch { /* session-only fallback */ } markRead(id); go(p); };
    const toggleStock = (id: number) => { if (!companies.some(c => c.id === id))
        return; const removing = stocks.includes(id); const next = removing ? stocks.filter(i => i !== id) : [...stocks, id]; setStocks(next); const ok = write('radar-stocks', next); if (ok)
        notify(removing ? '관심종목에서 삭제했습니다.' : '관심종목에 추가했습니다.', removing ? () => { setStocks(prev => { const restored = prev.includes(id) ? prev : [...prev, id]; write('radar-stocks', restored); return restored; }); notify('관심종목을 복원했습니다.'); } : undefined); };
    const toggleSaved = (id: number) => { const exists = saved.includes(id); const next = exists ? saved.filter(i => i !== id) : [...saved, id]; setSaved(next); if (write('radar-saved', next))
        notify(exists ? '저장한 공시에서 해제했습니다.' : '공시를 저장했습니다.'); };
    const readAll = () => { const next = disclosures.map(d => d.id); setSeen(next); if (write('radar-seen', next))
        notify('모든 알림을 읽음으로 표시했습니다.'); };
    const saveSettings = (value: Settings) => { setSettings(value); const ok = write('radar-settings', value); if (ok)
        notify('알림 설정을 저장했습니다.'); return ok; };
    const toggleCheck = (id: string) => { const next = checks.includes(id) ? checks.filter(x => x !== id) : [...checks, id]; setChecks(next); write('radar-checks', next); };
    const preview = (s: Scenario) => { const p = s === 'nodoc' ? 'detail' : s === 'noai' ? 'ai' : 'feed'; setPage(p); setScenario(s); window.scrollTo({ top: 0, behavior: 'instant' }); };
    return { user, setUser, authReady, aiAvailable, page, go, scenario, preview, selected, open, stocks, toggleStock, saved, toggleSaved, seen, readAll, settings, saveSettings, checks, toggleCheck, message, setMessage, notify, dirty, setDirty, pendingPage, setPendingPage, discard };
}
type Store = ReturnType<typeof useStore>;
const Context = createContext<Store | null>(null);
export function RadarProvider({ children }: {
    children: ReactNode;
}) { return <Context.Provider value={useStore()}>{children}</Context.Provider>; }
export function useRadar() { const c = useContext(Context); if (!c)
    throw new Error('RadarProvider required'); return c; }

