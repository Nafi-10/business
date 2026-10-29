// CSS pins the header. These measurements keep its menus and anchor offsets aligned.
export function initNavigation(){
  const header=document.querySelector('.site-header');
  if(!header)return;
  const root=document.documentElement,brand=header.querySelector('.brand-row'),nav=header.querySelector('.main-nav');
  const desktop=matchMedia('(min-width:851px)');
  let pending=false;
  function measure(){
    pending=false;
    const brandHeight=brand.getBoundingClientRect().height;
    root.style.setProperty('--brand-row-height',`${brandHeight}px`);
    root.style.setProperty('--nav-clearance',`${(desktop.matches?nav.getBoundingClientRect().height:brandHeight)+18}px`);
    const bounds=header.getBoundingClientRect();
    root.style.setProperty('--header-bottom',`${Math.max(0,bounds.bottom)}px`);
    header.classList.toggle('is-pinned',scrollY>0&&bounds.top<=(desktop.matches?-brandHeight:0)+1);
  }
  function scheduleMeasure(){if(!pending){pending=true;requestAnimationFrame(measure);}}
  new ResizeObserver(scheduleMeasure).observe(header);
  window.addEventListener('scroll',scheduleMeasure,{passive:true});
  window.addEventListener('resize',scheduleMeasure,{passive:true});
  window.addEventListener('pageshow',scheduleMeasure);
  desktop.addEventListener('change',scheduleMeasure);
  measure();
}
