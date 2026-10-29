const section=document.querySelector('#cs-vision');
const gallery=section.querySelector('.cs-founder-gallery');
const cards=[...section.querySelectorAll('[data-team-card]')];
const pages=[...section.querySelectorAll('[data-team-go]')];
const reduced=matchMedia('(prefers-reduced-motion: reduce)');
const status=section.querySelector('[data-founder-status]');
let selected=0;

function nameOf(card){return card.querySelector('h3').innerText.replace(/\s+/g,' ').trim();}
function markSelected(index){
  selected=(index+cards.length)%cards.length;
  pages.forEach((page,i)=>page.setAttribute('aria-pressed',String(i===selected)));
}
function bringIntoView(card){
  if(gallery.scrollWidth<=gallery.clientWidth+2)return;
  const bounds=gallery.getBoundingClientRect(),cardBounds=card.getBoundingClientRect();
  gallery.scrollTo({left:gallery.scrollLeft+cardBounds.left-bounds.left-(gallery.clientWidth-cardBounds.width)/2,behavior:reduced.matches?'instant':'smooth'});
}
function choose(index,{focus=false}={}){
  markSelected(index);
  const card=cards[selected];
  if(focus)card.querySelector('[data-team-flip]').focus({preventScroll:true});
  bringIntoView(card);
}
function turnCard(index){
  const card=cards[index];
  const flipped=card.classList.toggle('is-flipped');
  card.querySelector('[data-team-front]').setAttribute('aria-hidden',String(flipped));
  card.querySelector('[data-team-back]').setAttribute('aria-hidden',String(!flipped));
  const button=card.querySelector('[data-team-flip]');
  button.setAttribute('aria-pressed',String(flipped));
  button.setAttribute('aria-label',flipped?`Show ${nameOf(card)}’s portrait`:`Rotate ${nameOf(card)}’s card`);
  markSelected(index);
  const statement=card.querySelector('.cs-team-back-statement');
  const role=card.querySelector('.cs-team-back-person > span');
  status.lang='en';
  status.textContent=flipped?`${nameOf(card)}, ${role.textContent}. ${statement.innerText.replace(/\s+/g,' ').trim()}`:`${nameOf(card)}. Portrait shown.`;
}
section.addEventListener('click',event=>{
  const button=event.target.closest('button');if(!button)return;
  if(button.hasAttribute('data-team-flip'))turnCard(Number(button.dataset.teamFlip));
  else if(button.hasAttribute('data-team-go'))choose(Number(button.dataset.teamGo));
  else if(button.hasAttribute('data-team-step'))choose(selected+Number(button.dataset.teamStep));
});
section.addEventListener('keydown',event=>{
  if(!event.target.closest('.cs-founder-controls,.cs-founder-gallery'))return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight'){
    event.preventDefault();choose(selected+(event.key==='ArrowRight'?1:-1),{focus:true});
  }else if(event.key==='Home'||event.key==='End'){
    event.preventDefault();choose(event.key==='Home'?0:cards.length-1,{focus:true});
  }
});
gallery.addEventListener('focusin',event=>{
  const card=event.target.closest('[data-team-card]');
  if(card){markSelected(Number(card.dataset.teamCard));bringIntoView(card);}
});
// Each card keeps its own side until clicked again. No timers or automatic turns.
markSelected(0);
if(location.hash==='#cs-vision'){
  const reveal=()=>requestAnimationFrame(()=>section.scrollIntoView({behavior:'instant',block:'start'}));
  if(document.readyState==='complete')reveal();else window.addEventListener('load',reveal,{once:true});
}
