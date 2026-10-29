import * as THREE from './vendor/three/three.module.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { createBottleFactory } from './showroom-bottles.js';
import { bottleStyles } from './showroom-data.js';

export function createProductViewer(host,id) {
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(30,1,.01,20);
  const renderer=new THREE.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.setClearColor(0,0);
  renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=.78;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');canvas.setAttribute('aria-label',`${bottleStyles[id].text.join(' ')}. Drag to rotate the bottle. Arrow keys turn and tilt. Plus and minus zoom. Home resets the view.`);host.prepend(canvas);
  const env=new RoomEnvironment(),pmrem=new THREE.PMREMGenerator(renderer),envMap=pmrem.fromScene(env,.04);
  scene.environment=envMap.texture;scene.environmentIntensity=.8;env.dispose();pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff8ee','#64544a',.8));
  const key=new THREE.DirectionalLight('#fff1d7',2);key.position.set(-2,4,3);scene.add(key);
  const rim=new THREE.DirectionalLight('#ecf2ff',1);rim.position.set(2,2,-2);scene.add(rim);
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gr=ctx.createRadialGradient(64,64,0,64,64,64);
  gr.addColorStop(0,'#ffffff');gr.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);
  const contact=new THREE.CanvasTexture(c),pivot=new THREE.Group();scene.add(pivot);
  const bottle=createBottleFactory(contact)(id),height=bottleStyles[id].height;
  // A softer glass layer keeps the liquid and typography legible against a transparent stage.
  bottle.traverse(o=>{if(o.isMesh&&o.material?.transmission){o.material=o.material.clone();o.material.transmission=.25;o.material.transparent=true;o.material.opacity=.38;o.material.roughness=.12;o.material.thickness=.025;o.material.envMapIntensity=.7;}});
  bottle.position.y=-height/2;pivot.add(bottle);
  // Grounding shadow stays below the orbiting bottle, rather than rotating with its label.
  bottle.traverse(o=>{if(o.userData.ignorePick)o.visible=false;});
  const shadow=new THREE.Mesh(new THREE.PlaneGeometry(height*1.35,height*.7),new THREE.MeshBasicMaterial({map:contact,color:'#5a4432',transparent:true,opacity:.18,depthWrite:false}));
  shadow.rotation.x=-Math.PI/2;shadow.position.y=-height/2-.045;scene.add(shadow);
  let yaw=.12,pitch=-.025,roll=-.14,targetYaw=.12,targetPitch=-.025,targetRoll=-.14,zoom=1,targetZoom=1,drag=null,raf,previous=0,dirty=true,alive=true;
  let motion=true,phase=0,manual=false;
  const controller=new AbortController(),signal=controller.signal;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  let fittedDistance=height*2.4;
  function resize(){const r=host.getBoundingClientRect();if(!r.width||!r.height)return;renderer.setSize(r.width,r.height,false);camera.aspect=r.width/r.height;camera.updateProjectionMatrix();fittedDistance=Math.max(height*2.5,bottleStyles[id].width/(2*Math.tan(Math.PI/12)*camera.aspect)*1.5);dirty=true;}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  const clamp=(value,min,max)=>Math.max(min,Math.min(max,value));
  function setScene(scene){const poses={fragrance:[.12,-.025,-.14,1],notes:[-.32,.025,.11,1],bottle:[0,0,0,.92]};[targetYaw,targetPitch,targetRoll,targetZoom]=poses[scene]||poses.fragrance;manual=scene==='bottle';dirty=true;}
  function setMotion(enabled){motion=enabled;dirty=true;}
  function rotate(direction){manual=true;if(direction==='reset'){targetYaw=0;targetPitch=0;targetRoll=0;targetZoom=1;}else targetYaw+=direction==='left'?-.45:.45;dirty=true;}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;manual=true;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY};canvas.classList.add('is-dragging');},{signal});
  canvas.addEventListener('pointermove',e=>{if(!drag)return;targetYaw+=(e.clientX-drag.x)*.009;targetPitch=clamp(targetPitch+(e.clientY-drag.y)*.006,-.65,.65);drag={x:e.clientX,y:e.clientY};dirty=true;},{signal});
  const release=()=>{drag=null;canvas.classList.remove('is-dragging');};
  canvas.addEventListener('pointerup',release,{signal});canvas.addEventListener('pointercancel',release,{signal});canvas.addEventListener('lostpointercapture',release,{signal});
  canvas.addEventListener('wheel',e=>{e.preventDefault();targetZoom=clamp(targetZoom+e.deltaY*.001,.75,1.35);dirty=true;},{passive:false,signal});
  canvas.addEventListener('keydown',e=>{
    const actions={ArrowLeft:()=>rotate('left'),ArrowRight:()=>rotate('right'),ArrowUp:()=>{targetPitch=clamp(targetPitch-.12,-.65,.65);},ArrowDown:()=>{targetPitch=clamp(targetPitch+.12,-.65,.65);},Home:()=>rotate('reset'),'+':()=>{targetZoom=clamp(targetZoom-.1,.75,1.35);},'=':()=>{targetZoom=clamp(targetZoom-.1,.75,1.35);},'-':()=>{targetZoom=clamp(targetZoom+.1,.75,1.35);}};
    if(actions[e.key]){e.preventDefault();actions[e.key]();dirty=true;}
  },{signal});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();alive=false;canvas.hidden=true;host.querySelector('.inspector-fallback').hidden=false;host.dataset.ready='fallback';host.closest('.inspector-visual').querySelector('.inspector-gesture').textContent='Product photograph · 3D preview paused';},{signal});
  function tick(now){
    raf=requestAnimationFrame(tick);const dt=Math.min((now-(previous||now))/1000,.05);previous=now;
    if(!alive||document.hidden)return;
    const rate=reduced.matches?1:1-Math.exp(-dt*12);
    const floating=motion&&!reduced.matches&&!drag&&!manual;
    if(floating){phase+=dt;dirty=true;}
    if(Math.abs(targetYaw-yaw)+Math.abs(targetPitch-pitch)+Math.abs(targetRoll-roll)+Math.abs(targetZoom-zoom)>.0001)dirty=true;
    yaw+=(targetYaw-yaw)*rate;pitch+=(targetPitch-pitch)*rate;roll+=(targetRoll-roll)*rate;zoom+=(targetZoom-zoom)*rate;
    if(dirty){const sway=floating?Math.sin(phase*.65):0;pivot.rotation.set(pitch,yaw+sway*.085,roll+sway*.018,'YXZ');pivot.position.y=floating?Math.sin(phase*.9)*height*.012:0;camera.position.set(0,height*.035,fittedDistance*zoom);camera.lookAt(0,0,0);renderer.render(scene,camera);host.dataset.rotation=`${yaw.toFixed(2)},${pitch.toFixed(2)}`;host.dataset.zoom=zoom.toFixed(2);dirty=false;}
  }
  raf=requestAnimationFrame(tick);
  return {rotate,setScene,setMotion,destroy(){
    alive=false;cancelAnimationFrame(raf);controller.abort();observer.disconnect();
    const geometries=new Set(),materials=new Set(),textures=new Set([contact]);
    scene.traverse(o=>{if(o.geometry)geometries.add(o.geometry);for(const m of o.material?(Array.isArray(o.material)?o.material:[o.material]):[]){materials.add(m);if(m.map)textures.add(m.map);}});
    geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());envMap.dispose();renderer.dispose();renderer.forceContextLoss();canvas.remove();
  }};
}
