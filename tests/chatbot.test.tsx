import { beforeEach, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../src/App';
beforeEach(() => { localStorage.clear(); sessionStorage.clear(); history.replaceState(null, '', '/'); });
it('answers questions, retains conversation across pages, and restores focus on Escape', async () => {
  const user = userEvent.setup(); render(<App />);
  await user.click(screen.getByRole('button', { name: '폼폼 챗봇 열기' }));
  const panel = screen.getByRole('dialog', { name: '폼폼이와 이야기해요' });
  expect(screen.getByRole('textbox', { name: '폼폼에게 질문하기' })).toHaveFocus();
  expect(within(panel).getByRole('button', { name: '질문 보내기' })).toBeDisabled();
  await user.click(within(panel).getByRole('button', { name: '실제 데이터야?' }));
  expect(within(panel).getByRole('log')).toHaveTextContent('실시간 데이터나 AI 서비스는 연결되어 있지 않아');
  await user.click(within(panel).getByRole('button', { name: '관심종목 ↗' }));
  expect(location.hash).toBe('#stocks');
  await user.click(screen.getByRole('button', { name: '폼폼 챗봇 열기' }));
  expect(screen.getByRole('log')).toHaveTextContent('실제 데이터야?');
  await user.keyboard('{Escape}');
  expect(screen.queryByRole('dialog', { name: '폼폼이와 이야기해요' })).not.toBeInTheDocument();
  expect(screen.getByRole('button', { name: '폼폼 챗봇 열기' })).toHaveFocus();
});
it('accepts typed questions and resets the conversation', async () => {
  const user = userEvent.setup(); render(<App />);
  await user.click(screen.getByRole('button', { name: '폼폼 챗봇 열기' }));
  await user.type(screen.getByRole('textbox', { name: '폼폼에게 질문하기' }), '안녕{Enter}');
  expect(screen.getByRole('log')).toHaveTextContent('반가워!');
  await user.click(screen.getByRole('button', { name: '대화 초기화' }));
  expect(screen.getByRole('log')).not.toHaveTextContent('반가워!');
});
