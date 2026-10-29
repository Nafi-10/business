// A page menu is a convenience, not screenshot or developer-tools protection.
export function installContextMenu(menu){
 let focusBefore=null,gesture=null,lastDrag=0,pending=null;
 const items=()=>[...menu.querySelectorAll('[role="menuitem"]:not(:disabled)')];
 function close(restore=false){menu.hidden=true;pending=null;if(restore&&focusBefore?.isConnected)focusBefore.focus({preventScroll:true});}
 function open(x,y){
  focusBefore=document.activeElement;
  const host=document.querySelector('dialog[open]')||document.fullscreenElement||document.body;
  host.append(menu);menu.hidden=false;menu.style.left='0px';menu.style.top='0px';
  const r=menu.getBoundingClientRect();menu.style.left=`${Math.max(8,Math.min(x,innerWidth-r.width-8))}px`;menu.style.top=`${Math.max(8,Math.min(y,innerHeight-r.height-8))}px`;items()[0]?.focus({preventScroll:true});
 }
 document.addEventListener('pointerdown',e=>{
  if(!menu.contains(e.target))close();
  if(e.button===2)gesture={x:e.clientX,y:e.clientY,moved:false};
 },true);
 document.addEventListener('pointermove',e=>{if(gesture&&Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y)>6)gesture.moved=true;},true);
 document.addEventListener('pointerup',e=>{
  if(e.button!==2||!gesture)return;
  const moved=gesture.moved;gesture=null;if(moved){lastDrag=performance.now();pending=null;return;}
  if(pending){const p=pending;pending=null;open(p.x,p.y);}
 },true);
 document.addEventListener('pointercancel',()=>{gesture=null;pending=null;},true);
 window.addEventListener('blur',()=>{gesture=null;close();});
 document.addEventListener('contextmenu',e=>{
  e.preventDefault();if(gesture){pending={x:e.clientX,y:e.clientY};return;}
  if(performance.now()-lastDrag<500)return;
  const r=e.target.getBoundingClientRect?.();open(e.clientX||r?.left||16,e.clientY||r?.bottom||16);
 },true);
 // Keyboard invocation works even when the browser omits a contextmenu event.
 document.addEventListener('keydown',e=>{
  if(e.key==='ContextMenu'||(e.shiftKey&&e.key==='F10')){e.preventDefault();const r=document.activeElement.getBoundingClientRect();open(r.left,r.bottom);return;}
  if(menu.hidden)return;
  if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true);return;}
  if(e.key==='Tab'){close();return;}
  if(['ArrowDown','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();const all=items(),index=all.indexOf(document.activeElement);const next=e.key==='Home'?0:e.key==='End'?all.length-1:(index+(e.key==='ArrowDown'?1:-1)+all.length)%all.length;all[next]?.focus();}
 },true);
 menu.addEventListener('click',e=>{if(e.target.closest('[role="menuitem"]'))close(true);});
 document.addEventListener('scroll',()=>close(),true);window.addEventListener('resize',()=>close());
 return {close};
}
