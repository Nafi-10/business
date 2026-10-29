import {defaults,normalize,metrics,systems,presets,toDisplay,fromDisplay,fmt,quoteText} from './config.js';
import {BuildingScene} from './scene.js';
import {installContextMenu} from './context-menu.js';
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const paths={
 'shield':'M12 3 4 6v6c0 5 8 9 8 9s8-4 8-9V6l-8-3Z M8 12l3 3 5-6',
 'check-circle':'M20 11v1a8 8 0 1 1-4-7 M8 11l4 4 9-10',
 'reset':'M3 10a9 9 0 1 1 1 7 M3 4v6h6',
 'frame':'M3 21V9l9-6 9 6v12 M3 10h18 M8 10v11 M16 10v11 M3 21h18',
 'chevron':'m7 10 5 5 5-5',
 'layers':'m3 8 9-5 9 5-9 5-9-5Z M3 12l9 5 9-5 M3 16l9 5 9-5',
 'door':'M5 21V3h14v18 M3 21h18 M8 6h8 M8 9h8 M8 12h8 M8 15h8 M8 18h8',
 'canopy':'M3 21V9l10-5 8 4 M13 4v17 M13 12h8v9 M3 21h18',
 'crane':'M4 21V4h16v17 M4 7h16 M12 7v7c4 0 4 5 0 5-2 0-3-1-3-2',
 'info':'M12 16v-5 M12 7h.01 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0',
 'cube':'m12 3 9 5v9l-9 5-9-5V8l9-5Z M3 8l9 5 9-5 M12 13v9 M7 5.8l9 5',
 'download':'M12 3v12 m-5-5 5 5 5-5 M4 16v5h16v-5',
 'expand':'M8 3H3v5 M16 3h5v5 M3 16v5h5 M21 16v5h-5',
 'ruler':'m3 16 13-13 5 5-13 13-5-5Z M7 12l2 2 M10 9l2 2 M13 6l2 2',
 'mouse':'M12 3c-4 0-7 3-7 7v4c0 4 3 7 7 7s7-3 7-7v-4c0-4-3-7-7-7Z M12 3v6',
 'file':'M14 3H5v18h14V8l-5-5Z M14 3v5h5 M8 12h8 M8 16h6',
 'close':'m6 6 12 12 M18 6 6 18',
 'check':'m5 12 4 4 10-10'
};
const icon=name=>`<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name]||paths.frame}"/></svg>`;
$$('[data-icon]').forEach(el=>el.outerHTML=icon(el.dataset.icon));
const initialModes={frame:{view:'frame'},complete:{view:'complete',doors:2,windows:4},exploded:{view:'complete',exploded:true}};
const initialMode=new URLSearchParams(window.location.search).get('mode');
let state=normalize({...defaults,...(Object.hasOwn(initialModes,initialMode)?initialModes[initialMode]:{})}),scene=null,toastTimer;
function toast(message){$('#toast').textContent=message;$('#toast').classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3800);}
function download(url,name){const a=document.createElement('a');a.href=url;a.download=name;a.click();}
function update(patch={},refit=false){state=normalize({...state,...patch});renderControls();if(scene){scene.update(state);if(refit)scene.cameraView('3d');}}
function renderControls(){
 const m=metrics(state),u=state.units;
 for(const key of ['width','length','height']){const ranges={width:[6,60],length:[10,120],height:[3,15]}[key],display=toDisplay(state[key],u);$('#'+key).value=Number(display.toFixed(2));$('#'+key).min=toDisplay(ranges[0],u).toFixed(2);$('#'+key).max=toDisplay(ranges[1],u).toFixed(2);$('#'+key+'-label').textContent=`${fmt(display)} ${u}`;const range=$('#'+key+'-range');range.value=state[key];range.style.setProperty('--progress',`${100*(state[key]-ranges[0])/(ranges[1]-ranges[0])}%`);}
 $$('[data-unit-label]').forEach(el=>el.textContent=u);$$('[data-unit]').forEach(el=>{const selected=el.dataset.unit===u;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});
 for(const key of ['system','bay','slope','endFrame','doors','windows'])$('#'+key).value=state[key];
 for(const option of $('#bay').options)option.textContent=`${fmt(toDisplay(Number(option.value),u))} ${u}`;
 for(const key of ['leanTo','canopy','crane','mezzanine','dimensions','exploded'])$('#'+key).checked=state[key];
 $$('[data-view]').forEach(el=>{const selected=el.dataset.view===state.view;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});
 $$('[data-color] button').forEach(el=>{const selected=state[el.parentElement.dataset.color]===el.dataset.value;el.classList.toggle('selected',selected);el.setAttribute('aria-pressed',selected);});
 $('#system-hint').textContent={clear:'An open interior. No internal columns.',multi:'A wider building with a central column line.',gable:'Two roof peaks with a central column line.',mono:'A single roof plane, sloping to one side.'}[state.system];
 $('#model-name').textContent=systems[state.system]+' building';$('#model-size').textContent=`${fmt(toDisplay(state.width,u))} × ${fmt(toDisplay(state.length,u))} ${u} · ${fmt(toDisplay(state.height,u))} ${u} eave`;
 $('#stat-area').innerHTML=`${fmt(u==='ft'?m.area/(.3048*.3048):m.area,0)} <small>${u}²</small>`;$('#stat-frames').innerHTML=`${m.frames} <small>frames</small>`;$('#stat-bay').innerHTML=`${fmt(toDisplay(m.spacing,u),2)} <small>${u}</small>`;$('#stat-ridge').innerHTML=`${fmt(toDisplay(m.ridge,u),2)} <small>${u}</small>`;
 $$('[data-preset]').forEach(el=>{const p=presets[Number(el.dataset.preset)];const active=state.width===p.width&&state.length===p.length&&state.height===p.height&&state.system===p.system&&state.crane===!!p.crane;el.classList.toggle('active',active);el.setAttribute('aria-pressed',active);});
}
const colours=[['Ocean blue','#176184'],['Steel grey','#9caab1'],['Silver white','#d7dfe3'],['Roof red','#b62932'],['Graphite','#47545b'],['Sage green','#72887a'],['Blue grey','#9aafb9']];
$$('[data-color]').forEach(group=>{group.innerHTML=colours.map(([name,hex])=>`<button aria-label="${group.dataset.color.replace('Color','')} ${name}" aria-pressed="false" title="${name}" style="--swatch:${hex};${hex==='#d7dfe3'?'--check-color:#496879':''}" data-value="${hex}"></button>`).join('');group.addEventListener('click',e=>{const b=e.target.closest('button');if(b)update({[group.dataset.color]:b.dataset.value});});});
$('#preset-grid').innerHTML=presets.map((p,i)=>`<button class="preset-card" data-preset="${i}" aria-pressed="false"><svg class="icon" viewBox="0 0 40 28" aria-hidden="true"><path d="${p.system==='mono'?'M4 24V11l22-7 10 5v15 M4 11l11 5 21-7 M15 16v10 M4 24l11 2 21-7 M26 4v15':p.system==='gable'?'M3 25V12l7-7 7 5 7-5 13 7v13 M3 12l7 5 7-7 7 7 13-5 M10 17v8 M24 17v8 M17 10v15':'M4 24V12l10-8 22 7v13 M4 12l21 7 11-8 M14 4l11 8 11-1 M25 12v14 M4 24l21 2 11-2 M25 19v7'}"/></svg>${icon('check').replace('class="icon"','class="icon preset-check"')}<strong>${p.name}</strong><small>${p.width} × ${p.length} m <span>·</span> ${p.height} m eave</small></button>`).join('');
$$('[data-preset]').forEach(b=>b.addEventListener('click',()=>{state=normalize({...defaults,...presets[Number(b.dataset.preset)],units:state.units});update({},true);setCameraSelection('3d');toast(`${presets[Number(b.dataset.preset)].name} starting size applied`);$('#studio').scrollIntoView({behavior:'smooth'});}));
for(const key of ['width','length','height']){$('#'+key).addEventListener('change',e=>update({[key]:e.target.value===''?defaults[key]:fromDisplay(Number(e.target.value),state.units)}));$('#'+key+'-range').addEventListener('input',e=>update({[key]:Number(e.target.value)}));}
$$('[data-step]').forEach(b=>b.addEventListener('click',()=>{const [key,sign]=b.dataset.step.split(':');const increment=state.units==='ft'?.3048:key==='height'?.5:1;update({[key]:state[key]+Number(sign)*increment});}));
$$('[data-unit]').forEach(b=>b.addEventListener('click',()=>update({units:b.dataset.unit})));
for(const key of ['system','bay','slope','endFrame','doors','windows'])$('#'+key).addEventListener('change',e=>update({[key]:e.target.value}));
for(const key of ['leanTo','canopy','crane','mezzanine','dimensions','exploded'])$('#'+key).addEventListener('change',e=>update({[key]:e.target.checked}));
$$('[data-view]').forEach(b=>b.addEventListener('click',()=>update({view:b.dataset.view})));
function setCameraSelection(view){$$('[data-camera]').forEach(b=>{b.classList.toggle('selected',b.dataset.camera===view);b.setAttribute('aria-pressed',b.dataset.camera===view);});}
$$('[data-camera]').forEach(b=>b.addEventListener('click',()=>{scene?.cameraView(b.dataset.camera);setCameraSelection(b.dataset.camera);}));
$('#reset').addEventListener('click',()=>{state=normalize({...defaults,units:state.units});update({},true);setCameraSelection('3d');toast('Building reset to the warehouse starting size');});
$('#zoom-in').addEventListener('click',()=>scene?.zoom(.86));$('#zoom-out').addEventListener('click',()=>scene?.zoom(1.16));$('#camera-reset').addEventListener('click',()=>{scene?.cameraView('3d');setCameraSelection('3d');});
$('#fullscreen').addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('#viewer').requestFullscreen();}catch{toast('Fullscreen is unavailable in this browser.');}});
async function saveImage(){if(!scene||$('#download').disabled)return;$('#download').disabled=true;toast('Preparing your CanveliqSoft image…');try{download(await scene.exportImage(),`CanveliqSoft-${state.width}x${state.length}m-design.png`);toast('Your CanveliqSoft building image is ready.');}catch{toast('The image could not be saved. Please reload and try again.');}finally{$('#download').disabled=false;}}
$('#download').addEventListener('click',saveImage);
$('#quote-open').addEventListener('click',()=>{const m=metrics(state);$('#quote-summary').replaceChildren();const title=document.createElement('strong');title.textContent=`${systems[state.system]} · ${fmt(state.width)} × ${fmt(state.length)} m`;const detail=document.createElement('span');detail.textContent=`${fmt(m.area)} m² floor area · ${fmt(state.height)} m eave · ${m.frames} portal frames`;$('#quote-summary').append(title,detail);$('#quote-dialog').showModal();});
$('#quote-close').addEventListener('click',()=>$('#quote-dialog').close());$('#quote-dialog').addEventListener('click',e=>{if(e.target===$('#quote-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close();}});
$('#quote-form').addEventListener('submit',e=>{e.preventDefault();const customer=Object.fromEntries(new FormData(e.target)),url=URL.createObjectURL(new Blob([quoteText(state,customer)],{type:'text/plain;charset=utf-8'}));download(url,`CanveliqSoft-building-brief-${state.width}x${state.length}m.txt`);setTimeout(()=>URL.revokeObjectURL(url),10000);toast('Design brief downloaded. It has not been sent.');});
renderControls();
try{scene=new BuildingScene($('#canvas-container'),state);$('#viewer-loading').remove();}catch(error){console.error(error);$('#viewer-loading').textContent='The 3D viewer requires WebGL. Please enable hardware acceleration or try another browser. You can still configure your building and download its brief.';$('#download').disabled=true;}

function syncMotion(){const paused=scene?.motion.paused??true;$('#motion-toggle').textContent=paused?'Play sky':'Pause sky';$('#motion-toggle').setAttribute('aria-label',paused?'Play sky animation':'Pause sky animation');$('#motion-toggle').setAttribute('aria-pressed',String(!paused));$('#menu-motion').textContent=paused?'Play sky animation':'Pause sky animation';}
function toggleMotion(){if(scene){scene.motion.paused=!scene.motion.paused;syncMotion();}}
$('#motion-toggle').addEventListener('click',toggleMotion);$('#menu-motion').addEventListener('click',toggleMotion);syncMotion();
matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change',e=>{if(scene){scene.motion.paused=e.matches;syncMotion();}});
installContextMenu($('#page-menu'));
$('#menu-save').addEventListener('click',saveImage);$('#menu-reset').addEventListener('click',()=>$('#camera-reset').click());$('#menu-quote').addEventListener('click',()=>$('#quote-open').click());
if(!scene)for(const id of ['motion-toggle','menu-save','menu-reset','menu-motion'])$('#'+id).disabled=true;

// Optional agent interface: uses the same state and validation as the visible controls.
const context=document.modelContext;
if(context?.registerTool){const lifecycle=new AbortController();const register=tool=>{try{Promise.resolve(context.registerTool(tool,{signal:lifecycle.signal})).catch(()=>{});}catch{}};
register({name:'read_building_configuration',title:'Read building configuration',description:'Read the current building dimensions, finishes, accessories and derived quantities.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true,untrustedContentHint:false},execute:()=>({configuration:{...state},metrics:metrics(state)})});
register({name:'configure_building',title:'Configure steel building',description:'Update building dimensions and framing in the visible 3D model. Does not send a quote.',inputSchema:{type:'object',properties:{width:{type:'number',minimum:6,maximum:60},length:{type:'number',minimum:10,maximum:120},height:{type:'number',minimum:3,maximum:15},system:{type:'string',enum:Object.keys(systems)}},additionalProperties:false},annotations:{readOnlyHint:false,untrustedContentHint:false},execute(input){if(!input||typeof input!=='object'||Array.isArray(input))throw new Error('Expected a configuration object');for(const [k,v]of Object.entries(input)){if(!['width','length','height','system'].includes(k))throw new Error('Unknown field');if(k==='system'){if(!Object.hasOwn(systems,v))throw new Error('Invalid frame system');}else{const bounds={width:[6,60],length:[10,120],height:[3,15]}[k];if(typeof v!=='number'||!Number.isFinite(v)||v<bounds[0]||v>bounds[1])throw new Error('Dimension out of range');}}update(input,true);return {configuration:{...state},metrics:metrics(state)};}});
window.addEventListener('pagehide',()=>lifecycle.abort(),{once:true});}
