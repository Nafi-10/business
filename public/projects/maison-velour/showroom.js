import { houses, bestSellerIds } from './showroom-data.js';

export function initShowroom({ products, openProduct, isOverlayOpen, beforeOpen=()=>{}, onOpenChange=()=>{} }) {
  const section=document.querySelector('#maison');
  if(!section)return;
  const find=s=>section.querySelector(s),all=s=>[...section.querySelectorAll(s)];
  const host=find('.boutique-scene'),directory=find('.boutique-directory'),viewport=find('.boutique-viewport');
  const menu=find('.boutique-menu-toggle'),backdrop=find('.boutique-menu-backdrop');
  let scene=null,loading=null,failed=false,hintTimer,pointerControl=null,lastPointerControl=null,pointerStarted=0;
  let letter='all',opener=null,returnScroll=0;
  const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const arrow='<svg class="icon" aria-hidden="true"><use href="#i-arrow"/></svg>';
  const productName=id=>products.find(p=>p.id===id);
  function setDirectory(open,restoreFocus=true) {
    releaseControl();directory.hidden=!open;backdrop.hidden=!open;viewport.inert=open;
    menu.setAttribute('aria-expanded',String(open));
    if(open){directory.scrollTop=0;find('#boutique-brand-search').focus({preventScroll:true});}
    else if(restoreFocus)menu.focus({preventScroll:true});
  }
  function focusRoom(){if(section.open&&directory.hidden&&!isOverlayOpen())host.querySelector('canvas')?.focus({preventScroll:true});}
  function inspect(id){setDirectory(false,false);openProduct(id);}
  function showSelection(house=null) {
    find('#boutique-selection-title').textContent=house?house.name:'The best-seller edit';
    find('#boutique-selection-note').textContent=house?house.headline:'The fragrances at the heart of our maison.';
    const ids=house?house.products:bestSellerIds;
    find('.boutique-product-list').innerHTML=ids.map(id=>{const p=productName(id);return '<button class="boutique-product" data-boutique-product="'+id+'"><img src="./assets/'+id+(['chanel','dior','tom-ford'].includes(id)?'':'-bottle')+'.webp" alt="" loading="lazy"><span><small>'+esc(p.brand)+'</small><strong>'+esc(p.name)+'</strong><em>'+esc(p.type)+'</em></span>'+arrow+'</button>';}).join('');
    all('[data-house]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.house===house?.id)));
    find('.boutique-best-link').setAttribute('aria-pressed',String(!house));
    find('.boutique-current-house').textContent=house?house.name:'The entrance';
    find('.boutique-current-detail').textContent=house?house.location:'A world of scent awaits';
  }
  function hint(message) {
    find('.boutique-hint').textContent=message;clearTimeout(hintTimer);
    hintTimer=setTimeout(()=>{find('.boutique-hint').textContent='Drag to look around · Select a bottle to discover';},4500);
  }
  async function load() {
    if(scene)return scene;if(failed)return null;if(loading)return loading;
    find('.boutique-loading').hidden=false;
    loading=import('./showroom-scene.js').then(({createShowroom})=>{
      scene=createShowroom(host,{
        onProduct:inspect,
        onLocation:label=>{
          find('.boutique-location').textContent=label;
          if(find('#boutique-status').textContent!==label)find('#boutique-status').textContent=label;
          if(label.startsWith('Exploring')){find('.boutique-current-house').textContent='The boutique';find('.boutique-current-detail').textContent='Explore at your own pace';}
          if(label.startsWith('The central')){find('.boutique-current-house').textContent='Best sellers';find('.boutique-current-detail').textContent='At the heart of the maison';}
        },
        onMove:pos=>find('.boutique-map-position').setAttribute('transform','translate('+(50+pos.x*6)+','+(10+(pos.z+10)*6)+') rotate('+(-pos.yaw*180/Math.PI)+')'),
        onHint:hint,isBlocked:()=>!section.open||isOverlayOpen()
      });
      host.dataset.ready='true';find('.boutique-loading').hidden=true;
      return scene;
    }).catch(error=>{
      console.error('Boutique viewer unavailable:',error);failed=true;
      find('.boutique-loading').hidden=true;find('.boutique-fallback').hidden=false;host.dataset.ready='fallback';
      find('#boutique-status').textContent='The 3D view is unavailable. Use How to explore to browse every house and fragrance.';
      loading=null;return null;
    });
    return loading;
  }
  async function visit(id) {
    const house=houses.find(h=>h.id===id);if(!house)return;
    showSelection(house);setDirectory(false,false);
    const view=await load();if(section.open){view?.visitHouse(id);focusRoom();}
  }
  async function visitBestsellers() {
    showSelection();setDirectory(false,false);
    const view=await load();if(section.open){view?.bestSellers();focusRoom();}
  }
  async function openStore(mode='entrance',trigger=null) {
    if(!section.open){
      opener=trigger||document.activeElement;returnScroll=window.scrollY;beforeOpen();
      section.showModal();document.body.classList.add('maison-open');setDirectory(false,false);
      menu.focus({preventScroll:true});onOpenChange();
    }
    const view=await load();
    if(!section.open)return;
    view?.resize();
    if(mode==='best')visitBestsellers();
  }
  function closeStore(){if(section.open)section.close();}
  menu.addEventListener('click',()=>setDirectory(directory.hidden));
  all('[data-close-directory]').forEach(b=>b.addEventListener('click',()=>setDirectory(false)));
  find('.boutique-exit').addEventListener('click',closeStore);
  section.addEventListener('cancel',event=>{
    if(!directory.hidden){event.preventDefault();setDirectory(false);}
  });
  section.addEventListener('close',()=>{
    releaseControl();setDirectory(false,false);document.body.classList.remove('maison-open');
    if(location.hash==='#maison')history.replaceState(null,'',location.pathname+location.search);
    onOpenChange();
    const target=opener?.getClientRects().length?opener:document.querySelector('.mobile-menu');
    target?.focus({preventScroll:true});window.scrollTo({top:returnScroll,behavior:'instant'});
  });
  document.querySelector('#boutique-dialog').addEventListener('close',focusRoom);
  document.querySelectorAll('[data-open-maison]').forEach(b=>b.addEventListener('click',()=>openStore(b.dataset.openMaison,b)));
  window.addEventListener('hashchange',()=>{if(location.hash==='#maison')openStore();});
  if(location.hash==='#maison')openStore();

  find('.boutique-alphabet').innerHTML='<button data-letter="all" aria-pressed="true">All</button>'+Array.from({length:26},(_,i)=>String.fromCharCode(65+i)).map(l=>'<button data-letter="'+l+'" aria-label="Brands beginning with '+l+'" aria-pressed="false" '+(houses.some(h=>h.letter===l)?'':'disabled')+'>'+l+'</button>').join('');
  find('.boutique-house-list').innerHTML=houses.map(h=>'<button data-house="'+h.id+'" aria-pressed="false"><span class="house-monogram">'+h.letter+'</span><span><strong>'+h.name+'</strong><small>'+h.location+'</small></span>'+arrow+'</button>').join('');
  function filterHouses(nextLetter=letter) {
    letter=nextLetter;
    const query=find('#boutique-brand-search').value.toLowerCase().trim();let count=0;
    all('[data-house]').forEach(b=>{
      const h=houses.find(h=>h.id===b.dataset.house);
      b.hidden=!((letter==='all'||h.letter===letter)&&h.name.toLowerCase().includes(query));if(!b.hidden)count++;
    });
    find('.boutique-no-brands').hidden=!!count;
    all('[data-letter]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.letter===letter)));
    find('.boutique-brand-count').textContent=count+' '+(count===1?'house':'houses');
    find('.boutique-clear-filters').hidden=!query&&letter==='all';
  }
  find('#boutique-brand-search').addEventListener('input',()=>filterHouses());
  section.addEventListener('click',async event=>{
    const b=event.target.closest('button');if(!b)return;
    if(b.dataset.house){visit(b.dataset.house);return;}
    if(b.dataset.letter){filterHouses(b.dataset.letter);return;}
    if(b.hasAttribute('data-clear-house-filters')){find('#boutique-brand-search').value='';filterHouses('all');find('#boutique-brand-search').focus();return;}
    if(b.dataset.boutiqueProduct){inspect(b.dataset.boutiqueProduct);return;}
    if(b.hasAttribute('data-boutique-best')){visitBestsellers();return;}
    if(b.hasAttribute('data-boutique-reset')){showSelection();(await load())?.reset();return;}
    if((b.dataset.walk||b.dataset.look)&&event.detail>0&&lastPointerControl===b){lastPointerControl=null;return;}
    if(b.dataset.walk){const view=await load();if(view){const dir=b.dataset.walk;view.move(dir==='forward'?.65:dir==='back'?-.65:0,dir==='left'?-.65:dir==='right'?.65:0);}return;}
    if(b.dataset.look){const view=await load();if(view){const dir=b.dataset.look;view.rotate(dir==='left'?.24:dir==='right'?-.24:0,dir==='up'?.16:dir==='down'?-.16:0);}return;}
  });
  section.addEventListener('pointerdown',async event=>{
    const b=event.target.closest('[data-walk],[data-look]');if(!b||event.button!==0)return;
    pointerControl=b;pointerStarted=performance.now();lastPointerControl=b;b.setPointerCapture(event.pointerId);b.classList.add('is-held');
    const view=await load();if(pointerControl===b)view?.setControl(b.dataset.walk?'walk':'look',b.dataset.walk||b.dataset.look);
  });
  function releaseControl(){
    if(pointerControl&&performance.now()-pointerStarted<180)lastPointerControl=null;
    pointerControl?.classList.remove('is-held');pointerControl=null;scene?.setControl(null);
  }
  section.addEventListener('pointerup',releaseControl);section.addEventListener('pointercancel',releaseControl);
  section.addEventListener('lostpointercapture',releaseControl);window.addEventListener('blur',releaseControl);
  // Loading is intentionally click-driven: the hidden store does not initialize WebGL on the landing page.
  showSelection();
  return {open:openStore,close:closeStore,visit,visitBestsellers};
}

