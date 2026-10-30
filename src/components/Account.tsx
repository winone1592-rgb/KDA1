import { useState } from 'react';
import { LogIn, LogOut, UserRound } from 'lucide-react';
import { Modal } from './ui';
import { useRadar } from '../lib/store';
import { supabase, authError } from '../lib/supabase';
import AssetLedger from './AssetLedger';

export default function Account() {
  const { user, setUser, notify } = useRadar();
  const [opened, setOpened] = useState(false), [register, setRegister] = useState(false);
  const [name, setName] = useState(''), [email, setEmail] = useState(''), [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false), [error, setError] = useState('');
  const [profileTab, setProfileTab] = useState<'profile'|'assets'>('profile');
  const close = () => { if (!busy) { setOpened(false); setPassword(''); setError(''); } };
  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError('');
    try {
      if (!supabase) throw new Error('Supabase 주소와 키를 확인해 주세요.');
      if (register) {
        const {data,error} = await supabase.auth.signUp({email:email.trim(),password,options:{data:{name:name.trim()}}});
        if (error) throw error;
        if (!data.session) { setOpened(false); setPassword(''); notify('인증 메일을 확인한 뒤 로그인해 주세요.'); return; }
      } else {
        const {error} = await supabase.auth.signInWithPassword({email:email.trim(),password}); if(error) throw error;
      }
      const {data,error} = await supabase.auth.getUser(); if(error||!data.user) throw error || new Error('로그인 정보를 확인할 수 없어요.');
      const next={id:data.user.id,email:data.user.email||email.trim(),name:String(data.user.user_metadata?.name||name.trim()||email.split('@')[0]).slice(0,20)};
      setUser(next); setOpened(false); setPassword(''); notify(`${next.name}님, 반가워요!`);
    }
    catch (err) { setError(err && typeof err==='object'&&'message' in err ? authError(err as {message:string}) : '로그인에 실패했어요.'); }
    finally { setBusy(false); }
  }
  async function logout() {
    setBusy(true); setError('');
    try { const {error}=await supabase?.auth.signOut()||{}; if(error) throw error; setUser(null); setOpened(false); notify('로그아웃했습니다.'); }
    catch { setError('로그아웃에 실패했어요. 다시 시도해 주세요.'); }
    finally { setBusy(false); }
  }
  return <><button className="account-trigger" onClick={() => { setProfileTab('profile'); setOpened(true); }} aria-label={user ? `${user.name}님 계정` : '로그인'}><span>{user ? user.name.slice(0, 1) : <UserRound size={17}/>}</span><b>{user ? `${user.name}님` : '로그인'}</b></button><Modal open={opened} onClose={close} title={user ? '나의 프로필' : register ? '나만의 레이더 시작하기' : '다시 만나 반가워요'}>
    <div className="account-art"><img src={`${import.meta.env.BASE_URL}chatbot/pompom-cutout.png`} alt="반겨주는 폼폼"/><div><span className="eyebrow">A LITTLE MORE PERSONAL</span><p>{user ? `${user.name}님의 작은 발견을 응원해요.` : '폼폼이와 함께, 나만의 이름으로.'}</p></div></div>
    {user ? <><div className="account-tabs profile-tabs"><button aria-pressed={profileTab==='profile'} onClick={()=>setProfileTab('profile')}>프로필</button><button aria-pressed={profileTab==='assets'} onClick={()=>setProfileTab('assets')}>나의 자산</button></div>{profileTab==='assets' ? <AssetLedger user={user}/> : <div className="account-profile"><h3>{user.name}님</h3><p>{user.email}</p><p className="muted">Supabase 계정으로 로그인 중이에요.<br/>관심종목과 설정은 계정에 동기화됩니다.</p><button className="btn secondary" disabled={busy} onClick={logout}><LogOut size={16}/>로그아웃</button></div>}</> : <><div className="account-tabs"><button aria-pressed={!register} onClick={() => { setRegister(false); setError(''); }}>로그인</button><button aria-pressed={register} onClick={() => { setRegister(true); setError(''); }}>회원가입</button></div><form className="account-form" onSubmit={submit}>
      {register && <label htmlFor="account-name">어떻게 불러드릴까요?<input id="account-name" name="name" autoComplete="nickname" placeholder="이름 또는 닉네임" required maxLength={20} value={name} onChange={e => setName(e.target.value)}/><small>입력한 이름이 프로필과 챗봇에 표시돼요.</small></label>}
      <label htmlFor="account-email">이메일<input id="account-email" name="email" autoComplete="email" type="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} placeholder="hello@example.com"/></label>
      <label htmlFor="account-password">비밀번호<input id="account-password" name="password" type="password" autoComplete={register ? 'new-password' : 'current-password'} minLength={8} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} placeholder="8자 이상 입력"/></label>
      <button className="btn primary" disabled={busy || (register && !name.trim())} type="submit"><LogIn size={16}/>{busy ? '확인 중…' : register ? '가입하고 시작하기' : '로그인하기'}</button>
      <p className="muted text-xs">Supabase 계정으로 로그인해요. 가입 후 이메일 인증이 필요할 수 있어요.</p>
    </form></>}{error && <p className="account-error" role="alert">{error}</p>}
  </Modal></>;
}

