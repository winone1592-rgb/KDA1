import {StrictMode} from 'react';
import {act,render} from '@testing-library/react';
import {afterEach,beforeEach,expect,it,vi} from 'vitest';
import {AnimatedNumber} from '../src/components/AnimatedNumber';
let frames:Map<number,FrameRequestCallback>,counter:number;
let media:{matches:boolean;addEventListener:ReturnType<typeof vi.fn>;removeEventListener:ReturnType<typeof vi.fn>};
beforeEach(()=>{frames=new Map();counter=0;media={matches:false,addEventListener:vi.fn(),removeEventListener:vi.fn()};vi.stubGlobal('matchMedia',vi.fn(()=>media));vi.stubGlobal('requestAnimationFrame',vi.fn((cb:FrameRequestCallback)=>{frames.set(++counter,cb);return counter;}));vi.stubGlobal('cancelAnimationFrame',vi.fn((id:number)=>frames.delete(id)));});
afterEach(()=>vi.unstubAllGlobals());
function tick(time:number){act(()=>{const pending=[...frames.values()];frames.clear();for(const fn of pending)fn(time);});}
it('counts to the exact target under StrictMode and cleans up pending frames',()=>{const {container,rerender,unmount}=render(<StrictMode><AnimatedNumber value={90}/></StrictMode>);const visual=()=>container.querySelector('[aria-hidden]')!.textContent;expect(visual()).toBe('0');expect(container.querySelector('.sr-only')).toHaveTextContent('90');tick(0);tick(550);expect(Number(visual())).toBeGreaterThan(0);expect(Number(visual())).toBeLessThan(90);tick(1100);expect(visual()).toBe('90');rerender(<StrictMode><AnimatedNumber value={50}/></StrictMode>);tick(1500);tick(2600);expect(visual()).toBe('50');rerender(<StrictMode><AnimatedNumber value={100}/></StrictMode>);expect(frames.size).toBeGreaterThan(0);unmount();expect(frames.size).toBe(0);});
it('renders signed decimals exactly and respects reduced motion immediately',()=>{media.matches=true;const {container}=render(<AnimatedNumber value={-10} decimals={1} signed/>);expect(container.querySelector('[aria-hidden]')).toHaveTextContent('-10.0');expect(requestAnimationFrame).not.toHaveBeenCalled();});
it('stops an active animation when reduced motion is enabled',()=>{const {container}=render(<AnimatedNumber value={44}/>);tick(0);media.matches=true;act(()=>media.addEventListener.mock.calls[0][1]());expect(container.querySelector('[aria-hidden]')).toHaveTextContent('44');expect(frames.size).toBe(0);});
