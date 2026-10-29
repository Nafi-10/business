// A branded shortcut menu discourages casual copying; it does not hide browser source.
const menu=document.createElement('div');
menu.className='maison-context-menu';
menu.hidden=true;
menu.setAttribute('role','menu');
menu.setAttribute('aria-label','Maison Velour shortcuts');
menu.innerHTML=`<div class="context-brand" role="presentation"><span class="context-monogram" aria-hidden="true">MV</span><div><strong>MAISON VELOUR</strong><small>THE ART OF FRAGRANCE</small></div></div>
  <a href="./collection.html" role="menuitem" tabindex="-1">Explore the collection <span aria-hidden="true">↗</span></a>
  <a href="./gifts.html" role="menuitem" tabindex="-1">The gifting atelier <span aria-hidden="true">↗</span></a>
  <a href="./offers.html" role="menuitem" tabindex="-1">The Privilege Collection <span aria-hidden="true">↗</span></a>
  <button type="button" role="menuitem" tabindex="-1" data-context-top>Back to top <span aria-hidden="true">↑</span></button>
  <p class="context-credit" role="presentation">Design and Developed by<strong>Kazi Jawad</strong></p>`;
document.body.append(menu);
const items=[...menu.querySelectorAll('[role=menuitem]')];
let previousFocus;
function closeMenu(restoreFocus=false){
  if(menu.hidden)return;
  menu.hidden=true;
  if(restoreFocus&&previousFocus?.isConnected)previousFocus.focus({preventScroll:true});
}
document.addEventListener('contextmenu',event=>{
  // Keep native editing controls available for form fields and editable content.
  if(event.target.closest('input,textarea,select,[contenteditable]:not([contenteditable=false])')){closeMenu();return;}
  event.preventDefault();
  if(!menu.hidden&&menu.contains(event.target))return;
  previousFocus=document.activeElement;
  const parent=event.target.closest('dialog[open]')||document.body;
  parent.append(menu);
  menu.hidden=false;
  const targetBounds=event.target.getBoundingClientRect();
  const keyboard=event.clientX===0&&event.clientY===0;
  const x=keyboard?targetBounds.left+16:event.clientX;
  const y=keyboard?targetBounds.top+24:event.clientY;
  menu.style.left=`${Math.max(12,Math.min(x,document.documentElement.clientWidth-menu.offsetWidth-12))}px`;
  menu.style.top=`${Math.max(12,Math.min(y,innerHeight-menu.offsetHeight-12))}px`;
  items[0].focus({preventScroll:true});
});
menu.addEventListener('keydown',event=>{
  const index=items.indexOf(document.activeElement);
  let next;
  if(event.key==='ArrowDown')next=(index+1)%items.length;
  if(event.key==='ArrowUp')next=(index+items.length-1)%items.length;
  if(event.key==='Home')next=0;
  if(event.key==='End')next=items.length-1;
  if(next!==undefined){event.preventDefault();items[next].focus({preventScroll:true});}
  if(event.key==='Escape'){event.preventDefault();event.stopPropagation();closeMenu(true);}
  if(event.key==='Tab')closeMenu(true);
});
menu.addEventListener('click',event=>{
  if(event.target.closest('[data-context-top]')){
    closeMenu(true);
    window.scrollTo({top:0,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});
  }else if(event.target.closest('a'))closeMenu();
});
document.addEventListener('pointerdown',event=>{if(!menu.contains(event.target))closeMenu();},true);
document.addEventListener('close',()=>closeMenu(),true);
window.addEventListener('scroll',()=>closeMenu(),{passive:true});
window.addEventListener('resize',()=>closeMenu());
