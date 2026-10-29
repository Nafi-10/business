import {products} from './catalog.js';
import {giftSets,occasions,fragrances,boxStyles,minis,ribbons,money,matchesGift,builderTotal,giftCardAmount,localDate} from './gifting-data.js';

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const arrow='<svg class="icon" aria-hidden="true"><use href="#g-arrow"/></svg>';
const productBy=id=>products.find(p=>p.id===id);
const params=new URLSearchParams(location.search);
const allowed={recipient:['all','her','him','couples','family'],budget:['all','under','thoughtful','special','luxury'],mood:['all','fresh','floral','woody','oud','sweet'],occasion:['all',...occasions.map(o=>o.id)]};
const filters=Object.fromEntries(Object.entries(allowed).map(([key,values])=>[key,values.includes(params.get(key))?params.get(key):'all']));
const storageKey='velour-gift-bag-v1';
let bag=[],toastTimer,returnFocus;
const dialog=$('#gift-dialog'),dialogContent=$('#gift-dialog-content');
function toast(message){const el=$('.toast');clearTimeout(toastTimer);el.textContent=message;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),3800);}
function details(item){
  if(item.type==='set'){const g=giftSets.find(g=>g.id===item.setId);if(g)return {title:g.name,description:g.contents+' · '+g.extra,price:g.price,image:g.product};}
  if(item.type==='builder'){
    try{
      const p=fragrances.find(p=>p.id===item.config.fragrance),price=builderTotal(item.config);
      if(!Object.hasOwn(ribbons,item.config.ribbon))return null;
      return {title:'Your personal gift · '+p.name,description:p.size+' · '+minis[item.config.mini].name+' · '+boxStyles[item.config.box].name+' · '+item.config.ribbon+' ribbon',message:String(item.config.message||'').slice(0,160),price,image:p.id};
    }catch{return null;}
  }
  if(item.type==='card'&&giftCardAmount(item.amount)&&['digital','physical'].includes(item.delivery)){
    return {title:'The Maison gift card',description:(item.delivery==='digital'?'Digital':'Physical')+' · For '+String(item.recipient||'someone extraordinary').slice(0,50)+(item.date?' · Preferred date '+String(item.date).slice(0,10):''),message:String(item.message||'').slice(0,200),price:giftCardAmount(item.amount),image:null};
  }
  return null;
}
function readBag(){try{const data=JSON.parse(localStorage.getItem(storageKey));return Array.isArray(data)?data.filter(i=>i&&typeof i.key==='string'&&details(i)).slice(0,100):[];}catch{return [];}}
function syncBag(){bag=readBag();$('[data-gift-count]').textContent=bag.length;$('[data-open-bag]').setAttribute('aria-label','Open gift bag, '+bag.length+' items');}
function saveBag(next){try{localStorage.setItem(storageKey,JSON.stringify(next));syncBag();return true;}catch{toast('Your browser could not save this gift. Please allow local storage and try again.');return false;}}
function addGift(item){const next=readBag();if(next.length>=100){toast('Your gift bag is full. Remove a gift before adding another.');return;}if(saveBag([...next,{...item,key:crypto.randomUUID()}]))toast('Added to your gift bag. Your selection is saved on this device.');}
function openDialog(markup){returnFocus=document.activeElement;dialogContent.innerHTML=markup;dialog.showModal();document.body.style.overflow='hidden';}
function closeDialog(){dialog.close();}
dialog.querySelector('.g-dialog-close').addEventListener('click',closeDialog);
dialog.addEventListener('close',()=>{document.body.style.overflow='';returnFocus?.focus();});
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeDialog();}});
function bagMarkup(){
  const rows=bag.map(item=>{const d=details(item);return '<article class="g-bag-item">'+(d.image?'<img src="./assets/'+d.image+'-bottle.webp" alt="">':'<svg class="icon" aria-hidden="true"><use href="#g-gift"/></svg>')+'<div><strong>'+esc(d.title)+'</strong><p>'+esc(d.description)+'</p>'+(d.message?'<p>“'+esc(d.message)+'”</p>':'')+'</div><div><small>'+money(d.price)+'</small><br><button class="g-remove" data-remove-gift="'+esc(item.key)+'" aria-label="Remove '+esc(d.title)+'">Remove</button></div></article>';}).join('');
  return '<p class="g-kicker">THE GIFT COUNTER</p><h2 id="gift-dialog-title">Your thoughtful choices.</h2>'+(rows||'<p>Your gift bag is waiting for something wonderful.</p>')+'<div class="g-bag-total"><span>Preview total</span><span>'+money(bag.reduce((n,i)=>n+details(i).price,0))+'</span></div><p class="g-fineprint">Saved on this device only. This is a gifting preview; no purchase, email or scheduled delivery has been created. Gift selections are kept separately from the fragrance shopping bag.</p><button class="g-button" data-continue-gifting>Continue gifting '+arrow+'</button>';
}
$('[data-open-bag]').addEventListener('click',()=>{syncBag();openDialog(bagMarkup());});
dialogContent.addEventListener('click',e=>{
  const remove=e.target.closest('[data-remove-gift]');
  if(remove){if(saveBag(readBag().filter(i=>i.key!==remove.dataset.removeGift))){dialogContent.innerHTML=bagMarkup();dialog.querySelector('.g-dialog-close').focus();}return;}
  if(e.target.closest('[data-continue-gifting]'))closeDialog();
  const mood=e.target.closest('[data-quiz-mood]');if(mood){filters.mood=mood.dataset.quizMood;filters.recipient='all';filters.budget='all';filters.occasion='all';renderShop();closeDialog();$('#gift-sets').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
});
window.addEventListener('storage',e=>{if(e.key===storageKey){syncBag();if(dialog.open&&$('[data-continue-gifting]'))dialogContent.innerHTML=bagMarkup();}});
syncBag();

const filterDefinitions=[
  ['recipient','FOR SOMEONE',[['all','Everyone'],['her','For Her'],['him','For Him'],['couples','For Couples'],['family','For Family']]],
  ['budget','A LITTLE OR MORE',[['all','Any budget'],['under','Under ৳3,000'],['thoughtful','৳3,000–৳7,000'],['special','৳7,000–৳15,000'],['luxury','Luxury ৳15,000+']]],
  ['mood','THEIR SCENT',[['all','Every mood'],['fresh','Fresh'],['floral','Floral'],['woody','Woody'],['oud','Oud'],['sweet','Sweet']]]
];
$('#gift-filters').innerHTML=filterDefinitions.map(([key,label,values])=>'<div class="g-filter-row"><span class="g-filter-label">'+label+'</span><div class="g-pills" role="group" aria-label="Filter by '+key+'">'+values.map(([value,name])=>'<button type="button" data-filter="'+key+'" data-value="'+value+'" aria-pressed="'+(filters[key]===value)+'">'+name+'</button>').join('')+'</div></div>').join('');
function cardMarkup(g){
 const p=productBy(g.product);
 const art=g.samples?'<div class="g-sample-trio" aria-hidden="true"><i>MV</i><i>MV</i><i>MV</i></div>':'<img class="g-set-bottle" src="./assets/'+g.product+'-bottle.webp" alt="" loading="lazy">';
 return '<article class="g-set-card'+(g.hero?' g-set-featured':'')+'"><div class="g-set-art"><span class="g-set-label">'+g.label+'</span><div class="g-packshot" role="img" aria-label="'+esc(g.name)+' fragrance gift presentation"><img class="g-set-box" src="./assets/gift-box.webp" alt="" loading="lazy">'+art+'</div><button class="g-add-set" data-add-set="'+g.id+'" aria-label="Add '+esc(g.name)+' to gift bag">Add to gift '+arrow+'</button></div><h3>'+g.name+'</h3><p>'+g.contents+'</p><p>'+g.extra+'</p><strong class="g-set-price">'+money(g.price)+'</strong><a class="g-product-source" href="'+esc(p.source)+'" target="_blank" rel="noopener">Fragrance details from '+esc(p.brand)+' ↗</a></article>';
}
function renderShop(){
  const result=giftSets.filter(g=>matchesGift(g,filters));
  $('#gift-set-grid').innerHTML=result.map(cardMarkup).join('');
  $('#gift-result-count').textContent=result.length+' thoughtful '+(result.length===1?'gift':'gifts')+' to discover';
  $('.g-empty').hidden=result.length>0;
  $$('[data-filter]').forEach(b=>b.setAttribute('aria-pressed',String(filters[b.dataset.filter]===b.dataset.value)));
  const occasion=occasions.find(o=>o.id===filters.occasion),active=$('.g-active-occasion');
  active.hidden=!occasion;active.innerHTML=occasion?'<span>For '+occasion.name+'</span><button data-reset-filters>View all occasions ×</button>':'';
  if($('[data-gift-collection]')){
    $('#occasion-collection-title').textContent=occasion?occasion.name:'Gifts with meaning.';
    $('#occasion-collection-line').textContent=occasion?occasion.line:'Thoughtfully curated, for every kind of moment.';
    document.title=(occasion?occasion.name:'The Gift Collection')+' — Maison Velour';
    $$('#occasion-links a').forEach(a=>{const value=new URL(a.href).searchParams.get('occasion')||'all';if(value===filters.occasion)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
  }
  const query=new URLSearchParams();Object.entries(filters).forEach(([k,v])=>{if(v!=='all')query.set(k,v);});
  history.replaceState(null,'',location.pathname+(query.size?'?'+query:'')+location.hash);
}
document.addEventListener('click',e=>{
  const filter=e.target.closest('[data-filter]');if(filter){filters[filter.dataset.filter]=filter.dataset.value;renderShop();}
  if(e.target.closest('[data-reset-filters]')){Object.keys(filters).forEach(k=>filters[k]='all');renderShop();}
  const add=e.target.closest('[data-add-set]');if(add)addGift({type:'set',setId:add.dataset.addSet});
});
renderShop();
if($('#occasion-grid'))$('#occasion-grid').innerHTML=occasions.map(o=>'<a class="g-occasion" href="./gift-collection.html?occasion='+o.id+'"><div class="g-occasion-art"><img src="./assets/'+o.image+'" alt="'+esc(o.name)+' fragrance inspiration" loading="lazy"></div><h3>'+o.name+arrow+'</h3><p>'+o.line+'</p></a>').join('');
if($('#occasion-links'))$('#occasion-links').innerHTML=[{id:'all',name:'All occasions'},...occasions].map(o=>'<a href="./gift-collection.html'+(o.id==='all'?'':'?occasion='+o.id)+'"'+(filters.occasion===o.id?' aria-current="page"':'')+'>'+o.name+'</a>').join('');

const builder=$('#gift-builder-form');
if(builder){
  const radio=(name,value,label,checked)=>'<label><input type="radio" name="'+name+'" value="'+value+'"'+(checked?' checked':'')+'><span>'+label+'</span></label>';
  $('#builder-fragrances').innerHTML=fragrances.map((p,i)=>radio('fragrance',p.id,'<b>'+p.name+'</b><small>'+p.brand+'<br>'+p.size+'</small>',i===0)).join('');
  $('#builder-minis').innerHTML=Object.entries(minis).map(([id,p],i)=>radio('mini',id,p.name,i===0)).join('');
  $('#builder-boxes').innerHTML=Object.entries(boxStyles).map(([id,p],i)=>radio('box',id,p.name,i===0)).join('');
  $('#builder-ribbons').innerHTML=Object.entries(ribbons).map(([id,color],i)=>radio('ribbon',id,'<i class="g-color-dot" style="--dot:'+color+'"></i>'+id.charAt(0).toUpperCase()+id.slice(1),i===0)).join('');
  const values=()=>({fragrance:builder.elements.fragrance.value,mini:builder.elements.mini.value,box:builder.elements.box.value,ribbon:builder.elements.ribbon.value,message:$('#builder-message').value});
  function updateBuilder(){
    const v=values(),p=fragrances.find(p=>p.id===v.fragrance),scene=$('.g-builder-scene');
    scene.dataset.box=v.box;scene.style.setProperty('--ribbon',ribbons[v.ribbon]);scene.setAttribute('aria-label',p.name+' in '+boxStyles[v.box].name+' with '+v.ribbon+' ribbon');
    $('.g-builder-bottle').src='./assets/'+p.id+'-bottle.webp';$('.g-preview-mini').hidden=v.mini==='none';
    $('.g-preview-note p').textContent=v.message||'For all the moments still to come.';
    $('#builder-preview-name').textContent=p.name;$('#builder-preview-details').textContent=boxStyles[v.box].name+' · '+v.ribbon.charAt(0).toUpperCase()+v.ribbon.slice(1)+' ribbon';
    $('#builder-total').textContent=money(builderTotal(v));$('#builder-char-count').textContent=v.message.length+' / 160';
  }
  builder.addEventListener('input',updateBuilder);builder.addEventListener('change',updateBuilder);
  builder.addEventListener('submit',e=>{e.preventDefault();addGift({type:'builder',config:values()});});updateBuilder();
}

const cardForm=$('#gift-card-form');
if(cardForm){
  const amount=()=>giftCardAmount(cardForm.elements.amount.value==='custom'?$('#custom-amount').value:cardForm.elements.amount.value);
  function updateCard(){
    const digital=cardForm.elements.delivery.value==='digital',custom=cardForm.elements.amount.value==='custom';
    $('#custom-amount-field').hidden=!custom;$('#custom-amount').disabled=!custom;$('#custom-amount').required=custom;
    $('#card-email-field').hidden=!digital;$('#card-email').disabled=!digital;$('#card-email').required=digital;
    $('#card-date').min=localDate();
    $('#card-preview-name').textContent=$('#card-name').value?'For '+$('#card-name').value:'For someone extraordinary';
    $('#card-preview-message').textContent=$('#card-message').value||'A little something, just for you.';
    $('#card-preview-amount').textContent=amount()?money(amount()):'Choose amount';
    $('#card-preview-delivery').textContent=(digital?'Digital':'Physical gift box')+' · '+($('#card-date').value?'Preferred delivery '+new Date($('#card-date').value+'T12:00:00').toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'}):'Ready to give after purchase');
    $('#card-delivery-help').textContent=digital?'Design preview only. No email is sent or scheduled. Delivery would begin after purchase.':'Physical gift-card preview. A delivery address would be collected at checkout; no shipment is scheduled.';
    $('#card-preview').style.transform=digital?'rotate(-5deg)':'rotate(3deg)';
  }
  cardForm.addEventListener('input',updateCard);cardForm.addEventListener('change',updateCard);
  cardForm.addEventListener('submit',e=>{
    e.preventDefault();updateCard();
    if(!amount()){toast('Choose a whole amount between ৳1,000 and ৳100,000.');return;}
    if($('#card-date').value&&$('#card-date').value<localDate()){$('#card-date').setCustomValidity('Choose today or a future date.');$('#card-date').reportValidity();return;}
    $('#card-date').setCustomValidity('');if(!cardForm.reportValidity())return;
    addGift({type:'card',amount:amount(),delivery:cardForm.elements.delivery.value,recipient:$('#card-name').value.trim(),email:$('#card-email').disabled?'':$('#card-email').value.trim(),message:$('#card-message').value,date:$('#card-date').value});
  });
  $('#card-date').addEventListener('input',()=>$('#card-date').setCustomValidity(''));updateCard();
}
$('[data-open-quiz]')?.addEventListener('click',()=>openDialog('<p class="g-kicker">A LITTLE SCENT GUIDANCE</p><h2 id="gift-dialog-title">What feels most like them?</h2><p>Start with the mood they would love. We will bring the relevant gifts to you.</p><div class="g-quiz-options">'+[['fresh','Fresh & effortless','Bright mornings, open air'],['floral','Soft & romantic','Flowers, graceful gestures'],['woody','Warm & grounded','Quiet evenings, textured woods'],['oud','Deep & distinctive','Rich wood, a little mystery'],['sweet','Comforting & indulgent','Soft warmth, golden moments']].map(([id,name,sub])=>'<button data-quiz-mood="'+id+'"><span>'+name+'</span><small>'+sub+'</small></button>').join('')+'</div>'));

