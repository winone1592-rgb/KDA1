import { useEffect, useMemo, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, Landmark, Plus, Wallet } from 'lucide-react';
import type { User } from '../lib/api';
import { supabase } from '../lib/supabase';

type Currency = 'KRW' | 'USD';
type Account = { id: string; name: string; currency: Currency; balance: number };
type Entry = { id: string; accountId: string; type: 'opening'|'deposit'|'withdrawal'; amount: number; note: string; createdAt: string };
type Ledger = { accounts: Account[]; entries: Entry[] };
const empty: Ledger = { accounts: [], entries: [] };
function parseLedger(value: unknown): Ledger {
  if (!value || typeof value !== 'object') return empty;
  const data = value as Partial<Ledger>;
  const accounts = Array.isArray(data.accounts) ? data.accounts.filter((a): a is Account => !!a && typeof a.id === 'string' && typeof a.name === 'string' && (a.currency === 'KRW' || a.currency === 'USD') && Number.isFinite(a.balance) && a.balance >= 0) : [];
  const ids = new Set(accounts.map(a => a.id));
  const entries = Array.isArray(data.entries) ? data.entries.filter((e): e is Entry => !!e && typeof e.id === 'string' && ids.has(e.accountId) && ['opening','deposit','withdrawal'].includes(e.type) && Number.isFinite(e.amount) && e.amount >= 0 && typeof e.createdAt === 'string') : [];
  return { accounts, entries };
}
function money(amount: number, currency: Currency) { return new Intl.NumberFormat(currency === 'KRW' ? 'ko-KR' : 'en-US', { style: 'currency', currency, maximumFractionDigits: currency === 'KRW' ? 0 : 2 }).format(amount); }

export default function AssetLedger({ user }: { user: User }) {
  const storageKey = `radar-assets-${user.id}`;
  const [ledger, setLedger] = useState<Ledger>(() => { try { return parseLedger(JSON.parse(localStorage.getItem(storageKey) || 'null')); } catch { return empty; } });
  const [loading, setLoading] = useState(true), [sync, setSync] = useState<'loading'|'cloud'|'local'|'needs-sql'>('loading');
  const [adding, setAdding] = useState(false), [accountName, setAccountName] = useState(''), [currency, setCurrency] = useState<Currency>('KRW'), [opening, setOpening] = useState('');
  const [kind, setKind] = useState<'deposit'|'withdrawal'>('deposit'), [accountId, setAccountId] = useState(''), [amount, setAmount] = useState(''), [note, setNote] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!supabase) { if (active) setSync('local'); return; }
        const { data, error } = await supabase.from('user_preferences').select('asset_ledger').eq('user_id', user.id).maybeSingle();
        if (error) throw error;
        if (active && data?.asset_ledger) {
          const next = parseLedger(data.asset_ledger);
          setLedger(next); localStorage.setItem(storageKey, JSON.stringify(next)); setSync('cloud');
        } else if (active) setSync('cloud');
      } catch (err) {
        const message = err instanceof Error ? err.message : '';
        if (active) setSync(message.toLowerCase().includes('asset_ledger') || message.includes('42703') ? 'needs-sql' : 'local');
      } finally { if (active) setLoading(false); }
    }
    void load(); return () => { active = false; };
  }, [storageKey, user.id]);

  const totals = useMemo(() => ({ KRW: ledger.accounts.filter(a => a.currency === 'KRW').reduce((sum, a) => sum + a.balance, 0), USD: ledger.accounts.filter(a => a.currency === 'USD').reduce((sum, a) => sum + a.balance, 0) }), [ledger]);
  async function save(next: Ledger) {
    setLedger(next); localStorage.setItem(storageKey, JSON.stringify(next)); setError('');
    if (!supabase) { setSync('local'); return; }
    const { error: saveError } = await supabase.from('user_preferences').upsert({ user_id: user.id, display_name: user.name, asset_ledger: next, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
    if (saveError) {
      const message = saveError.message || '';
      if (message.toLowerCase().includes('asset_ledger') || message.includes('42703')) setSync('needs-sql'); else setSync('local');
      setError(message.toLowerCase().includes('asset_ledger') || message.includes('42703') ? 'Supabase 칼럼을 추가해야 여러 기기에서 동기화할 수 있어요. 아래 SQL을 먼저 실행해 주세요.' : '클라우드 저장이 안 돼 이 브라우저에만 보관하고 있어요.');
    } else setSync('cloud');
  }
  function addAccount(event: React.FormEvent) {
    event.preventDefault(); const balance = Number(opening || 0);
    if (!accountName.trim() || !Number.isFinite(balance) || balance < 0) return;
    const id = crypto.randomUUID(); const account: Account = { id, name: accountName.trim(), currency, balance };
    void save({ accounts: [...ledger.accounts, account], entries: balance ? [{ id: crypto.randomUUID(), accountId: id, type: 'opening', amount: balance, note: '등록 시 잔액', createdAt: new Date().toISOString() }, ...ledger.entries] : ledger.entries });
    setAccountName(''); setOpening(''); setAdding(false); setAccountId(id);
  }
  function addEntry(event: React.FormEvent) {
    event.preventDefault(); const account = ledger.accounts.find(a => a.id === accountId); const value = Number(amount);
    if (!account || !Number.isFinite(value) || value <= 0) return;
    if (kind === 'withdrawal' && value > account.balance) { setError('현재 잔액보다 큰 금액은 출금 기록할 수 없어요.'); return; }
    const nextAccount = { ...account, balance: account.balance + (kind === 'deposit' ? value : -value) };
    const entry: Entry = { id: crypto.randomUUID(), accountId, type: kind, amount: value, note: note.trim(), createdAt: new Date().toISOString() };
    void save({ accounts: ledger.accounts.map(a => a.id === accountId ? nextAccount : a), entries: [entry, ...ledger.entries].slice(0, 100) });
    setAmount(''); setNote('');
  }

  return <section className="asset-ledger">
    <div className="asset-summary"><span className="asset-summary-icon"><Wallet size={21}/></span><div><small>등록한 자산</small><strong>{ledger.accounts.length}개</strong></div><span className="asset-sync">{sync === 'loading' || loading ? '불러오는 중' : sync === 'cloud' ? '계정 동기화' : sync === 'needs-sql' ? 'SQL 적용 필요' : '이 기기에 저장'}</span></div>
    <div className="asset-totals">{(['KRW','USD'] as Currency[]).map(code=><div key={code}><small>{code === 'KRW' ? '원화 합계' : '미국 달러 합계'}</small><b>{money(totals[code], code)}</b></div>)}</div>
    <div className="asset-section-head"><div><h3>내 자산 목록</h3><p>계좌나 지갑을 등록해 잔액을 관리해요.</p></div><button className="asset-add-btn" onClick={() => setAdding(!adding)}><Plus size={15}/>{adding ? '닫기' : '자산 등록'}</button></div>
    {adding && <form className="asset-form asset-account-form" onSubmit={addAccount}><label>자산 이름<input required maxLength={32} placeholder="예: 주거래 통장" value={accountName} onChange={e=>setAccountName(e.target.value)}/></label><div className="asset-form-row"><label>통화<select value={currency} onChange={e=>setCurrency(e.target.value as Currency)}><option value="KRW">KRW · 원</option><option value="USD">USD · 달러</option></select></label><label>현재 잔액<input type="number" min="0" step={currency==='KRW'?'1':'0.01'} inputMode="decimal" placeholder="0" value={opening} onChange={e=>setOpening(e.target.value)}/></label></div><button className="btn primary" type="submit">자산 등록하기</button></form>}
    {ledger.accounts.length ? <div className="asset-account-list">{ledger.accounts.map(account=><article className="asset-account-card" key={account.id}><span><Landmark size={17}/></span><div><b>{account.name}</b><small>{account.currency} 계좌 장부</small></div><strong>{money(account.balance, account.currency)}</strong></article>)}</div> : !adding && <div className="asset-empty"><Landmark size={23}/><b>아직 등록된 자산이 없어요</b><span>‘자산 등록’을 눌러 첫 잔액을 기록해 보세요.</span></div>}
    {!!ledger.accounts.length && <><div className="asset-section-head asset-entry-head"><div><h3>입금 · 출금 기록</h3><p>잔액은 입력한 기록을 기준으로 바뀌어요.</p></div></div><form className="asset-form asset-entry-form" onSubmit={addEntry}><div className="asset-entry-switch"><button type="button" aria-pressed={kind==='deposit'} onClick={()=>setKind('deposit')}><ArrowDownLeft size={15}/>입금</button><button type="button" aria-pressed={kind==='withdrawal'} onClick={()=>setKind('withdrawal')}><ArrowUpRight size={15}/>출금</button></div><label>자산<select value={accountId || ledger.accounts[0]?.id || ''} onChange={e=>setAccountId(e.target.value)}>{ledger.accounts.map(a=><option key={a.id} value={a.id}>{a.name} · {a.currency}</option>)}</select></label><div className="asset-form-row"><label>금액<input required type="number" min="0.01" step={ledger.accounts.find(a=>a.id===(accountId||ledger.accounts[0]?.id))?.currency==='KRW'?'1':'0.01'} inputMode="decimal" placeholder="금액 입력" value={amount} onChange={e=>setAmount(e.target.value)}/></label><label>메모<input maxLength={50} placeholder="선택 입력" value={note} onChange={e=>setNote(e.target.value)}/></label></div><button className="btn primary" type="submit">{kind==='deposit'?'입금 기록하기':'출금 기록하기'}</button></form></>}
    {ledger.entries.length > 0 && <div className="asset-history"><h3>최근 기록</h3>{ledger.entries.slice(0,6).map(entry=>{const account=ledger.accounts.find(a=>a.id===entry.accountId);return <div className="asset-history-row" key={entry.id}><span className={entry.type==='withdrawal'?'withdrawal':''}>{entry.type==='withdrawal'?<ArrowUpRight size={16}/>:<ArrowDownLeft size={16}/>}</span><div><b>{entry.type==='opening'?'등록 시 잔액':entry.type==='deposit'?'입금':'출금'}{entry.note?` · ${entry.note}`:''}</b><small>{account?.name} · {new Date(entry.createdAt).toLocaleDateString('ko-KR')}</small></div><strong className={entry.type==='withdrawal'?'withdrawal':''}>{entry.type==='withdrawal'?'−':'+'}{money(entry.amount,account?.currency||'KRW')}</strong></div>})}</div>}
    {error && <p className="asset-error" role="status">{error}</p>}
    {sync==='needs-sql' && <p className="asset-sql-note">자산 정보는 현재 이 기기에 저장됩니다. Supabase 동기화는 `supabase/migrations/202610300004_asset_ledger.sql`을 SQL Editor에서 실행한 뒤 사용할 수 있어요.</p>}
    <p className="asset-disclaimer">이 화면은 개인 기록용 장부예요. 실제 은행 계좌 조회나 송금은 하지 않습니다.</p>
  </section>;
}
