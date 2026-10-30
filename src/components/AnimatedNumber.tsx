import { useEffect, useRef } from 'react';

/** Animate only the visual number; assistive technology always gets the final value. */
export function AnimatedNumber({ value, decimals = 0, signed = false }: {
  value: number;
  decimals?: number;
  signed?: boolean;
}) {
  const node = useRef<HTMLSpanElement>(null);
  const previous = useRef(0);
  const format = (n: number) => `${signed && n > 0 ? '+' : ''}${n.toLocaleString('ko-KR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;
  const final = format(value);
  useEffect(() => {
    const element = node.current;
    if (!element) return;
    const media = window.matchMedia?.('(prefers-reduced-motion: reduce)');
    const start = previous.current;
    if (media?.matches || typeof window.requestAnimationFrame !== 'function' || start === value) {
      previous.current = value;
      element.textContent = final;
      return;
    }
    let frame = 0;
    let began: number | undefined;
    let stopped = false;
    const finish = () => { stopped = true; cancelAnimationFrame(frame); previous.current = value; element.textContent = final; };
    const onPreference = () => { if (media?.matches) finish(); };
    media?.addEventListener('change', onPreference);
    const tick = (time: number) => {
      if (stopped) return;
      began ??= time;
      const progress = Math.min((time - began) / 1100, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      previous.current = start + (value - start) * eased;
      element.textContent = format(previous.current);
      if (progress < 1) frame = requestAnimationFrame(tick);
      else element.textContent = final;
    };
    element.textContent = format(start);
    frame = requestAnimationFrame(tick);
    return () => { stopped = true; cancelAnimationFrame(frame); media?.removeEventListener('change', onPreference); };
  }, [value, decimals, signed, final]);
  return <span className="animated-number"><span className="sr-only">{final}</span><span aria-hidden="true" ref={node}>{final}</span></span>;
}
