import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import { advanceStage, createWheelGate, STAGE_COUNT } from '../src/showcase-state.mjs';

// Exercise the actual controller against a deterministic clock and viewport.
function setup() {
  const source = fs.readFileSync(new URL('../src/showcase.js', import.meta.url), 'utf8').replace(/^import .*;\r?\n/, '');
  let now = 0, id = 0;
  const tasks = new Map(), listeners = {}, sectionListeners = {}, rootListeners = {};
  const modal = {open:false};
  const node = { textContent:'', innerHTML:'', setAttribute(){}, removeAttribute(){}, getAnimations:()=>[], animate(){}, classList:{toggle(){}} };
  const screen = {offsetHeight:800};
  const geometry = {top:800};
  const section = {dataset:{}, offsetHeight:800, style:{setProperty(){}}, querySelector:s=>s==='.cs-showcase-screen'?screen:node, querySelectorAll:()=>[], addEventListener(type,fn){sectionListeners[type]=fn;}, getBoundingClientRect:()=>({top:geometry.top-context.scrollY})};
  const root = {querySelector:()=>({hidden:true}), dispatchEvent(){}, addEventListener(type,fn){rootListeners[type]=fn;}};
  const context = vm.createContext({console, advanceStage, createWheelGate, STAGE_COUNT, innerHeight:800, scrollY:0,
    document:{querySelector:s=>s==='.cs-showcase'?section:s==='#cs-motion'?root:s==='dialog[open]'&&modal.open?modal:null},
    matchMedia:()=>({matches:false}), performance:{now:()=>now}, CustomEvent:class{},
    setTimeout(fn,delay){tasks.set(++id,{fn,at:now+delay});return id;}, clearTimeout(id){tasks.delete(id);},
    requestAnimationFrame(fn){return 0;},
    window:{addEventListener(type,fn){listeners[type]=fn;},scrollTo({top}){context.scrollY=top;}}
  });
  vm.runInContext(source, context);
  return { context, section, screen, geometry, listeners, sectionListeners, rootListeners, modal, run:s=>vm.runInContext(s,context), advance(to){while(true){const due=[...tasks].filter(([,t])=>t.at<=to).sort((a,b)=>a[1].at-b[1].at)[0];if(!due)break;tasks.delete(due[0]);now=due[1].at;due[1].fn();}now=to;} };
}

test('upward scrolling does not jump an entire viewport before the pin boundary',()=>{
  const s=setup();s.context.scrollY=1600;
  assert.equal(s.run('crossing(-30)'),0);
  s.context.scrollY=830;
  assert.equal(s.run('crossing(-40)'),-1);
});

test('catalog height changes refresh pin boundaries without moving the reader',()=>{
  const s=setup();s.context.scrollY=800;
  s.geometry.top=1600;
  assert.equal(typeof s.rootListeners['cs:layout-change'],'function','dynamic sections must be able to refresh showcase bounds');
  s.rootListeners['cs:layout-change']();
  assert.equal(s.context.scrollY,800,'a catalog render must not jump into the showcase');
  let prevented=false;
  s.listeners.wheel({deltaY:120,deltaX:0,deltaMode:0,preventDefault(){prevented=true;}});
  assert.equal(prevented,false,'catalog scrolling stays native');
  assert.equal(s.section.dataset.stage,'0');
  s.context.scrollY=1590;s.advance(1000);
  s.listeners.wheel({deltaY:30,deltaX:0,deltaMode:0,preventDefault(){prevented=true;}});
  assert.equal(s.context.scrollY,1600,'pin at the actual new showcase boundary');
});

test('a late layout shift is measured before the next wheel gesture',()=>{
  const s=setup();s.context.scrollY=750;s.geometry.top=1300;
  let prevented=false;
  s.listeners.wheel({deltaY:100,deltaX:0,deltaMode:0,preventDefault(){prevented=true;}});
  assert.equal(prevented,false,'never pin against an old boundary while preceding content is still visible');
  s.context.scrollY=1290;s.advance(1000);
  s.listeners.wheel({deltaY:30,deltaX:0,deltaMode:0,preventDefault(){prevented=true;}});
  assert.equal(s.context.scrollY,1300);
});
test('opening the industry explorer cancels pending scrolling and preserves the current chapter',()=>{
  const s=setup();s.context.scrollY=800;
  s.run('navigate(1)');s.advance(250);s.run('navigate(1)');
  s.rootListeners['cs:explorer-open']();s.modal.open=true;
  s.listeners.wheel({deltaY:400,deltaX:0,deltaMode:0,preventDefault(){assert.fail('dialog scrolling must not be intercepted');}});
  s.run('navigate(1)');s.advance(3000);
  assert.equal(s.section.dataset.stage,'1');assert.equal(s.context.scrollY,800);
  s.modal.open=false;s.advance(4000);
  assert.equal(s.section.dataset.stage,'1','closing cannot replay stale gestures');
  s.run('navigate(1)');assert.equal(s.section.dataset.stage,'2','normal progression resumes on fresh input');
});
test('a reverse gesture replaces stale forward input during a chapter transition',()=>{
  const s=setup();s.context.scrollY=800;
  s.run('navigate(1)');s.advance(250);s.run('navigate(1)');s.advance(500);s.run('navigate(-1)');s.advance(900);
  assert.equal(s.section.dataset.stage,'0');
  s.advance(3000);assert.equal(s.section.dataset.stage,'0','no delayed chapter changes after input stops');
});
test('a handled Explore industries click cannot also bubble into the booking handler',()=>{
  const s=setup();s.context.scrollY=800;let stopped=false;
  s.sectionListeners.click({target:{closest:selector=>selector==='[data-showcase-next]'?{}:null},stopPropagation(){stopped=true;}});
  assert.equal(s.section.dataset.stage,'1');
  assert.equal(stopped,true);
});
test('short viewports allow reading overflow, then advance all chapters before exiting',()=>{
  const s=setup();s.context.innerHeight=568;s.screen.offsetHeight=700;s.section.offsetHeight=700;s.run('measure()');s.context.scrollY=800;
  function wheel(delta){let prevented=false;s.listeners.wheel({deltaY:delta,deltaX:0,deltaMode:0,preventDefault(){prevented=true;}});return prevented;}
  assert.equal(wheel(60),false,'native scroll remains available inside taller content');
  s.context.scrollY=900;s.advance(1000);assert.equal(wheel(60),true);assert.equal(s.context.scrollY,932,'stop at content end without skipping a chapter');
  for(let i=1;i<=5;i++){s.advance(1000+i*1000);assert.equal(wheel(100),true);assert.equal(s.section.dataset.stage,String(i));assert.equal(s.context.scrollY,932);}
  s.advance(8000);wheel(100);assert.equal(s.context.scrollY,1500,'sixth gesture exits after final chapter');
});
test('reading back up a tall chapter cancels a queued forward transition',()=>{
  const s=setup();s.context.innerHeight=568;s.screen.offsetHeight=700;s.section.offsetHeight=700;s.run('measure()');s.context.scrollY=932;
  const wheel=delta=>s.listeners.wheel({deltaY:delta,deltaX:0,deltaMode:0,preventDefault(){}});
  wheel(100);s.advance(250);wheel(100);s.advance(500);wheel(-100);s.context.scrollY=832;s.advance(1000);
  assert.equal(s.section.dataset.stage,'1');
});
test('reversing a touch drag in tall content scrolls back instead of double-counting travel',()=>{
  const s=setup();s.context.innerHeight=568;s.screen.offsetHeight=700;s.section.offsetHeight=700;s.run('measure()');s.context.scrollY=800;
  s.listeners.touchstart({touches:[{clientX:0,clientY:400}]});
  let previousY=400;
  function move(y){let prevented=false;s.listeners.touchmove({touches:[{clientX:0,clientY:y}],preventDefault(){prevented=true;}});if(!prevented)s.context.scrollY+=previousY-y;previousY=y;}
  move(290);assert.equal(s.context.scrollY,910);
  move(360);assert.equal(s.context.scrollY,840);
  assert.equal(s.section.dataset.stage,'0');
});
