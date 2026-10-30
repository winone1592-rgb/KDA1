import { createClient } from '@supabase/supabase-js';
const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;
export const supabase = url && key && import.meta.env.MODE !== 'test' ? createClient(url, key, {auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}}) : null;
export function authError(error: {message: string}) {
 if (/invalid login credentials/i.test(error.message)) return '이메일 또는 비밀번호를 확인해 주세요.';
 if (/email not confirmed/i.test(error.message)) return '가입 이메일의 인증 링크를 먼저 눌러 주세요.';
 if (/rate limit|too many/i.test(error.message)) return '요청이 많아요. 잠시 후 다시 시도해 주세요.';
 if (/already registered/i.test(error.message)) return '이미 가입된 이메일입니다. 로그인해 주세요.';
 return error.message;
}
