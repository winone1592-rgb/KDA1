import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const source=readFileSync(new URL('../src/app.js',import.meta.url),'utf8');
const listeners={}, saved=new Map(), elements=new Map();
const element=()=>({innerHTML:'',textContent:'',value:'',classList:{add(){},remove(){}},setAttribute(){},focus(){}});
for(const id of ['#app','#toast','#search','#stock-results'])elements.set(id,element());
const context=vm.createContext({document:{querySelector:s=>elements.get(s),addEventListener:(name,fn)=>listeners[name]=fn},window:{addEventListener(){},scrollTo(){},open(){}},location:{hash:''},localStorage:{getItem:k=>saved.get(k)||null,setItem:(k,v)=>saved.set(k,v)},setTimeout:()=>1,clearTimeout(){}});
vm.runInContext(source,context);
const run=code=>vm.runInContext(code,context);
for(const page of ['feed','stocks','onboarding','notifications','settings','detail','ai','timeline']){run(`page='${page}';render()`);assert.ok(elements.get('#app').innerHTML.includes('<main>'),page);assert.ok(!elements.get('#app').innerHTML.includes('undefined'),page);}
for(const [state,page,text]of [['nostocks','feed','추적 중인'],['nochanges','feed','최근 새로운'],['error','feed','불러오지'],['nodoc','detail','직전 제출본'],['noai','ai','설명을 보류']]){run(`scenario='${state}';page='${page}';render()`);assert.ok(elements.get('#app').innerHTML.includes(text),state);}
const click=dataset=>listeners.click({target:{closest:()=>({dataset,setAttribute(){}})}});
run("scenario='';page='stocks';render()");click({stock:'0'});assert.ok(!JSON.parse(saved.get('radar-stocks')).includes(0));click({stock:'0'});assert.ok(JSON.parse(saved.get('radar-stocks')).includes(0));
click({setting:'push'});click({action:'save'});assert.equal(JSON.parse(saved.get('radar-settings')).push,false);
listeners.input({target:{id:'search',value:'<img src=x onerror=alert(1)>'}});assert.ok(elements.get('#stock-results').innerHTML.includes('검색 결과가 없습니다'));assert.ok(!elements.get('#stock-results').innerHTML.includes('<img'));
click({action:'readall'});assert.equal(JSON.parse(saved.get('radar-seen')).length,3);
console.log('PASS: 8 screens, 5 exception states, stock persistence, settings, search safety, notification read state.');
