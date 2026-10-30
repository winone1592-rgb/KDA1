import { supabase } from './supabase';
export async function api<T>(path: string, body?: unknown): Promise<T> {
  const session = body !== undefined ? (await supabase?.auth.getSession())?.data.session : null;
  const headers: Record<string,string> = body === undefined ? {} : { 'Content-Type': 'application/json' };
  if (session) headers.Authorization = `Bearer ${session.access_token}`;
  const response = await fetch(`/api/${path}`, { method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin', headers, body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(30000) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || '요청을 처리하지 못했어요.');
  return data;
}
export type User = { id: string; name: string; email: string };
