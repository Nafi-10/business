import * as THREE from './vendor/three/three.module.js';
import { RoomEnvironment } from './vendor/three/RoomEnvironment.js';
import { createBottleFactory, roundedBox } from './showroom-bottles.js';
import { damp, stepWalk } from './showroom-motion.js';
import { createFloorReflection } from './showroom-reflection.js';
import { houses, bottleStyles, bestSellerIds, constrainPosition, houseView } from './showroom-data.js';

export function createShowroom(host, { onProduct, onLocation, onMove, onHint, isBlocked }) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#cfc6b8');
  scene.fog = new THREE.Fog('#d5cfc5',31,58);
  const camera = new THREE.PerspectiveCamera(60,1,.08,65);
  camera.rotation.order = 'YXZ';
  const renderer = new THREE.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = .93;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const canvas = renderer.domElement;
  canvas.tabIndex = 0;
  canvas.setAttribute('aria-label','Interactive perfume boutique. Drag to look around. Use W A S D to walk and arrow keys to look. Click a perfume to discover it.');
  host.prepend(canvas);
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = new RoomEnvironment();
  const envMap = pmrem.fromScene(environment,.04);
  scene.environment = envMap.texture;
  scene.environmentIntensity = .85;
  environment.dispose(); pmrem.dispose();
  const material = (color,options={}) => new THREE.MeshStandardMaterial({color,roughness:.7,...options});
  const ivory = material('#c9c1b5',{roughness:.52});
  const plaster = material('#d1cabe',{roughness:.94});
  const cream = material('#e0dbd0',{roughness:.45});
  const cocoa = material('#644b3e');
  const gold = material('#b49b74',{metalness:.88,roughness:.26});
  const darkMetal = material('#302b25',{metalness:.55,roughness:.4});
  const glow = material('#f3efe4',{emissive:'#fff1d7',emissiveIntensity:1.5});
  const contactCanvas=document.createElement('canvas');contactCanvas.width=contactCanvas.height=128;
  const contactContext=contactCanvas.getContext('2d'),contactGradient=contactContext.createRadialGradient(64,64,6,64,64,64);
  contactGradient.addColorStop(0,'rgba(255,255,255,1)');contactGradient.addColorStop(.35,'rgba(255,255,255,.65)');contactGradient.addColorStop(1,'rgba(255,255,255,0)');
  contactContext.fillStyle=contactGradient;contactContext.fillRect(0,0,128,128);
  const contactTexture=new THREE.CanvasTexture(contactCanvas);
  function contact(parent,x,y,z,w,d,opacity=.28){const p=new THREE.Mesh(new THREE.PlaneGeometry(w,d),new THREE.MeshBasicMaterial({map:contactTexture,color:'#332d27',transparent:true,opacity,depthWrite:false}));p.rotation.x=-Math.PI/2;p.position.set(x,y,z);p.userData.ignorePick=true;parent.add(p);return p;}
  function bevel(parent,x,y,z,w,h,d,mat,r=.03){const m=new THREE.Mesh(roundedBox(w,h,d,r),mat);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m;}
  const boxGeometry = new THREE.BoxGeometry(1,1,1);
  function box(parent,x,y,z,w,h,d,mat,shadow=true) {
    const mesh=new THREE.Mesh(boxGeometry,mat); mesh.position.set(x,y,z);mesh.scale.set(w,h,d);
    mesh.castShadow=shadow;mesh.receiveShadow=true;parent.add(mesh);return mesh;
  }
  const textureLoader=new THREE.TextureLoader();
  const stoneMap=textureLoader.load('./assets/boutique-limestone.webp',()=>{dirty=true;});
  stoneMap.colorSpace=THREE.SRGBColorSpace;stoneMap.wrapS=stoneMap.wrapT=THREE.RepeatWrapping;stoneMap.repeat.set(4,7);stoneMap.anisotropy=8;
  const slabMap=stoneMap.clone();slabMap.repeat.set(1,1);slabMap.needsUpdate=true;
  const floorMat=new THREE.MeshPhysicalMaterial({color:'#d6d0c6',map:stoneMap,bumpMap:stoneMap,bumpScale:.022,roughness:.3,metalness:.03,clearcoat:.25,clearcoatRoughness:.38});
  const stone=material('#ded8cd',{map:slabMap,bumpMap:slabMap,bumpScale:.014,roughness:.48});
  const plasterCanvas=document.createElement('canvas');plasterCanvas.width=plasterCanvas.height=256;const pc=plasterCanvas.getContext('2d'),noise=pc.createImageData(256,256);
  let seed=9;for(let i=0;i<noise.data.length;i+=4){seed=(seed*16807)%2147483647;const v=128+(seed%24)-12;noise.data.set([v,v,v,255],i);}pc.putImageData(noise,0,0);
  const plasterMap=new THREE.CanvasTexture(plasterCanvas);plasterMap.wrapS=plasterMap.wrapT=THREE.RepeatWrapping;plasterMap.repeat.set(10,6);plaster.bumpMap=plasterMap;plaster.bumpScale=.017;
  const floor=box(scene,0,-.12,0,12.3,.24,21,floorMat,false);
  box(scene,-6.15,3,0,.3,6.2,21,plaster,false);
  box(scene,6.15,3,0,.3,6.2,21,plaster,false);
  box(scene,0,3,-10.5,12.5,6.2,.3,plaster,false);
  box(scene,0,6.12,0,12.5,.25,21,cream,false);
  // Entry wall gives the visitor a real room to turn back toward.
  box(scene,-4.7,3,10.4,3,6.1,.2,plaster,false);box(scene,4.7,3,10.4,3,6.1,.2,plaster,false);
  box(scene,0,5.25,10.4,6.4,1.6,.2,plaster,false);
  const entrance=box(scene,0,2.4,10.6,6.3,4.8,.12,material('#dfddd5',{emissive:'#eae7df',emissiveIntensity:.3}),false);
  for(const x of [-3.15,0,3.15])box(scene,x,2.35,10.45,.06,4.7,.08,gold,false);
  for(const x of [-6,6]) {box(scene,x,0.16,0,.06,.15,20.8,ivory,false);box(scene,x,5.86,0,.05,.08,20.8,gold,false);}
  box(scene,0,.075,-10.31,12,.15,.07,ivory,false);
  for(let x=-6;x<=6;x+=2)box(scene,x,.009,0,.008,.008,21,material('#bdb7ae'),false);
  for(let z=-10;z<11;z+=2)box(scene,0,.008,z,12,.008,.008,material('#bdb7ae'),false);
  // Recessed ceiling tracks and spotlights echo the supplied boutique photograph.
  for(const x of [-4.1,0,4.1]) {
    box(scene,x,5.96,0,.11,.06,19.4,darkMetal,false);
    for(let z=-8.6;z<10;z+=2.55) {
      const rim=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.09,12),darkMetal);rim.position.set(x,5.9,z);scene.add(rim);
      const lamp=new THREE.Mesh(new THREE.CircleGeometry(.075,16),glow);lamp.rotation.x=Math.PI/2;lamp.position.set(x,5.845,z);scene.add(lamp);
    }
  }
  const hemi=new THREE.HemisphereLight('#f4f5f4','#a9a198',.72);scene.add(hemi);
  const sun=new THREE.DirectionalLight('#fff7e9',1.65);sun.position.set(-3,6.5,11);sun.castShadow=true;
  sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-10,right:10,top:14,bottom:-14,near:.5,far:35});sun.shadow.bias=-.0002;sun.shadow.normalBias=.025;sun.shadow.radius=3;scene.add(sun);
  for(const z of [-7,0,7]) {const light=new THREE.PointLight('#fff6e9',17,14,2);light.position.set(0,5.4,z);scene.add(light);}

  function textPanel(text,width,height,color='#66513c',bg=null,size=62) {
    const c=document.createElement('canvas');c.width=1024;c.height=Math.round(1024*height/width);const ctx=c.getContext('2d');
    if(bg){ctx.fillStyle=bg;ctx.fillRect(0,0,c.width,c.height);}
    ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`${size}px Georgia`;
    const max=930,measured=ctx.measureText(text).width;if(measured>max)ctx.font=`${Math.floor(size*max/measured)}px Georgia`;
    ctx.fillText(text,512,c.height/2);
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
    return new THREE.Mesh(new THREE.PlaneGeometry(width,height),new THREE.MeshBasicMaterial({map,transparent:true,depthWrite:false,side:THREE.DoubleSide}));
  }
  function archShape(width,bottom,spring) {
    const s=new THREE.Shape();s.moveTo(-width/2,bottom);s.lineTo(width/2,bottom);s.lineTo(width/2,spring);s.absarc(0,spring,width/2,0,Math.PI,false);s.lineTo(-width/2,bottom);return s;
  }
  const makeBottle=createBottleFactory(contactTexture);
  function placeBottle(parent,id,x,y,z,scale=1,rotation=0) {
    const g=makeBottle(id);g.position.set(x,y,z);g.scale.setScalar(scale);g.rotation.y=rotation;parent.add(g);return g;
  }
  function packageBox(parent,id,x,y,z,scale=1){
    const s=bottleStyles[id],g=new THREE.Group();g.position.set(x,y,z);g.scale.setScalar(scale);parent.add(g);
    const mat=material(id==='delina'?'#d5bac0':id==='chanel'?'#eeeae1':id==='sauvage'?'#22272b':id==='tom-ford'?'#3c4540':'#b5a38d',{roughness:.7});
    bevel(g,0,s.height*.5,0,s.width*.95,s.height,s.width*.6,mat,.009);
    const sign=textPanel(s.text[0],s.width*.79,.12,id==='chanel'?'#39312b':'#d8cdb9',null,90);sign.position.set(0,s.height*.57,s.width*.303);g.add(sign);
    contact(g,0,.003,0,s.width*1.4,s.width,.25);
  }
  function shelfBay(house) {
    const g=new THREE.Group();
    if(house.side==='left'){g.position.set(-5.96,0,house.bay);g.rotation.y=Math.PI/2;}
    else if(house.side==='right'){g.position.set(5.96,0,house.bay);g.rotation.y=-Math.PI/2;}
    else g.position.set(0,0,-10.28);
    scene.add(g);
    const arch=new THREE.Mesh(new THREE.ShapeGeometry(archShape(3.25,.85,3.63)),material('#e0dace',{roughness:.85,emissive:'#e9e2d3',emissiveIntensity:.12}));arch.position.z=.025;g.add(arch);
    const surround=archShape(3.51,.79,3.63);surround.holes.push(archShape(3.3,.88,3.63));
    const archFrame=new THREE.Mesh(new THREE.ExtrudeGeometry(surround,{depth:.13,bevelEnabled:true,bevelSegments:2,bevelSize:.014,bevelThickness:.014,curveSegments:36}),plaster);archFrame.position.z=.035;archFrame.castShadow=true;archFrame.receiveShadow=true;g.add(archFrame);
    // Soft wall bounce and contact gradients provide depth behind each ledge.
    for(const y of [1.05,1.98,2.91]){const shadow=new THREE.Mesh(new THREE.PlaneGeometry(3.45,.46),new THREE.MeshBasicMaterial({map:contactTexture,color:'#584c3c',transparent:true,opacity:.3,depthWrite:false}));shadow.position.set(0,y-.16,.043);g.add(shadow);}
    contact(g,0,.012,.56,4.1,2.35,.35);
    const path=new THREE.CurvePath();path.add(new THREE.LineCurve3(new THREE.Vector3(-1.64,.84,.07),new THREE.Vector3(-1.64,3.63,.07)));
    const arc=[];for(let i=0;i<=40;i++){const a=Math.PI-i/40*Math.PI;arc.push(new THREE.Vector3(Math.cos(a)*1.64,3.63+Math.sin(a)*1.64,.07));}
    path.add(new THREE.CatmullRomCurve3(arc));path.add(new THREE.LineCurve3(new THREE.Vector3(1.64,3.63,.07),new THREE.Vector3(1.64,.84,.07)));
    g.add(new THREE.Mesh(new THREE.TubeGeometry(path,80,.011,5,false),glow));
    const sign=textPanel(house.label,2.85,.3,'#775f43',null,54);sign.position.set(0,4.14,.09);g.add(sign);
    bevel(g,0,.47,.42,3.54,.86,.86,ivory);bevel(g,0,.92,.44,3.7,.1,1.0,stone,.015);
    for(const x of [-.86,.86]) {bevel(g,x,.46,.858,1.7,.73,.024,cream,.005);box(g,x,.73,.89,.19,.017,.025,gold,false);}
    for(const [row,y] of [1.08,2.01,2.94].entries()) {
      bevel(g,0,y,.36,3.55,.07,.73,stone,.011);box(g,0,y-.048,.63,3.43,.009,.016,glow,false);
      for(let col=0;col<3;col++){const id=house.products[(row+col)%house.products.length];placeBottle(g,id,-1.03+col*.93,y+.04,.43,row===2?.74:.88,(col-1)*-.045);}
      packageBox(g,house.products[row%house.products.length],1.37,y+.039,.29,row===1?.72:.8);
    }
    const light=new THREE.SpotLight('#fff0d9',24,7,.67,.9,1.5);light.position.set(0,5.55,1.25);light.target.position.set(0,2.15,.2);g.add(light,light.target);
    const marker=textPanel('DISCOVER THE HOUSE',2,.15,'#9a805f',null,35);marker.position.set(0,.17,.902);g.add(marker);
  }
  houses.forEach(shelfBay);
  // The central islands are always reserved for the curated best-seller edit.
  [2,-2.5,-7].forEach((z,i)=>{
    const id=bestSellerIds[i],g=new THREE.Group();g.position.z=z;scene.add(g);
    contact(g,0,.012,0,4.6,4.6,.5);contact(g,0,.015,0,3.1,3.1,.35);
    box(g,0,.08,0,2.25,.16,2.25,material('#766957'),false);bevel(g,0,.61,0,2.4,1.04,2.4,stone,.04);bevel(g,0,1.16,0,2.53,.09,2.53,stone,.014);
    bevel(g,0,1.24,0,1.33,.07,1.05,material('#a69a84',{metalness:.62,roughness:.32}),.012);
    placeBottle(g,id,0,1.3,0,1.26);
    placeBottle(g,id,-.75,1.21,.32,.83,.15);placeBottle(g,id,.75,1.21,.32,.83,-.15);
    const sign=textPanel(i===0?'THE BEST SELLERS':'THE MAISON SELECTION',1.8,.2,'#6b5238',null,61);sign.position.set(0,.81,1.207);g.add(sign);
    const name=textPanel(bottleStyles[id].text[id==='chanel'?2:0],1.5,.14,'#8d7252',null,49);name.position.set(0,.51,1.209);g.add(name);
    box(g,0,.17,1.17,2.16,.009,.014,glow,false);
  });
  const title=textPanel('MAISON VELOUR',7,.55,'#644b3e',null,70);title.position.set(0,5.62,-10.29);scene.add(title);
  const subtitle=textPanel('LA GALERIE DES PARFUMS',5,.22,'#917452',null,42);subtitle.position.set(0,5.16,-10.28);scene.add(subtitle);
  for(const x of [-4,4]) {
    const g=new THREE.Group();g.position.set(x,0,-10.25);scene.add(g);
    const inset=new THREE.Mesh(new THREE.ShapeGeometry(archShape(2.05,.94,3.83)),material('#a39179',{metalness:.62,roughness:.24}));inset.position.z=.03;g.add(inset);
    box(g,0,.57,.35,2.1,1.1,.8,ivory);box(g,0,1.14,.35,2.22,.08,.9,stone);
    const vase=new THREE.Mesh(new THREE.SphereGeometry(.35,24,16),material('#9f8466',{roughness:.55}));vase.scale.set(.8,1.4,.8);vase.position.set(0,1.6,.4);g.add(vase);
    const branchMat=material('#6e6550');
    for(let j=0;j<7;j++){const stem=new THREE.Mesh(new THREE.CylinderGeometry(.012,.02,.95,5),branchMat);stem.position.set((j-3)*.065,2.38,.4);stem.rotation.z=(j-3)*.16;g.add(stem);for(let k=0;k<3;k++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.08,6,4),branchMat);leaf.scale.set(.65,2,.2);leaf.position.set((j-3)*(.09+k*.018),2.2+k*.2,.4);leaf.rotation.z=(j-3)*.25;g.add(leaf);}}
  }
  // Street-view-style floor points jump between clear positions in the aisles.
  for(const [x,z] of [[-2.7,5], [2.7,5],[-2.7,0],[2.7,0],[-2.7,-5],[2.7,-5],[0,7.3]]) {
    const ring=new THREE.Mesh(new THREE.RingGeometry(.2,.27,40),new THREE.MeshBasicMaterial({color:'#fff5dd',transparent:true,opacity:.55,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2;ring.position.set(x,.022,z);ring.userData.waypoint={x,z};scene.add(ring);
  }
  let state={x:0,z:8.9,yaw:0,pitch:-.07},target={...state};
  let travel=[],leg=null,active=true,visible=false,drag=null,raf,previous=0,dirty=true,lastNotify=0,viewFov=60;
  const reflection=createFloorReflection(scene,renderer,floor);
  let shadowsReady=false,lastReflection=0;
  const velocity={x:0,z:0};
  let heldControl=null,hoverTime=0,blockedHintAt=0,wasWalking=false;
  const keys=new Set(),motion=matchMedia('(prefers-reduced-motion: reduce)');
  const raycaster=new THREE.Raycaster(),pointer=new THREE.Vector2();
  const notify=()=>{host.dataset.position=`${state.x.toFixed(2)},${state.z.toFixed(2)}`;host.dataset.view=`${state.yaw.toFixed(2)},${state.pitch.toFixed(2)}`;onMove({...state});};
  function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();dirty=true;}
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  function interruptTravel(){if(travel.length)target={...state};travel=[];leg=null;}
  function rotate(dx,dy){interruptTravel();target.yaw+=dx;target.pitch=THREE.MathUtils.clamp(target.pitch+dy,-1.03,.9);dirty=true;}
  function move(forward,side=0){
    interruptTravel();velocity.x=velocity.z=0;
    const x=target.x-Math.sin(target.yaw)*forward+Math.cos(target.yaw)*side,z=target.z-Math.cos(target.yaw)*forward-Math.sin(target.yaw)*side;
    let next=constrainPosition(x,z);
    if(!next)next=constrainPosition(x,target.z)||constrainPosition(target.x,z);
    if(next&&Math.hypot(next.x-target.x,next.z-target.z)>.0001){target.x=next.x;target.z=next.z;onLocation('Exploring the boutique');dirty=true;}
    else onHint('Take the aisle on either side of the central display.');
  }
  function goTo(view,label){
    heldControl=null;keys.clear();velocity.x=velocity.z=0;leg=null;
    view={...view};
    while(view.yaw-state.yaw>Math.PI)view.yaw-=Math.PI*2;
    while(view.yaw-state.yaw<-Math.PI)view.yaw+=Math.PI*2;
    const aisle=view.x<0?-2.7:2.7;
    const corridor=[5.5,-.25,-4.75].sort((a,b)=>Math.abs(a-state.z)-Math.abs(b-state.z))[0];
    const crossing=state.x*aisle<0&&[2,-2.5,-7].some(z=>Math.abs(state.z-z)<1.7);
    travel=[...(crossing?[{...state,z:corridor}]:[]),{...state,x:aisle,z:crossing?corridor:state.z},{...view,x:aisle},{...view}];
    travel=travel.filter((p,i,points)=>Math.hypot(p.x-(i?points[i-1].x:state.x),p.z-(i?points[i-1].z:state.z))>.03||i===points.length-1);
    if(motion.matches){target={...view};state={...view};travel=[];}
    onLocation(label);dirty=true;
  }
  function visitHouse(id){const h=houses.find(h=>h.id===id);if(h){viewFov=67;resize();goTo(houseView(h),h.name+' · '+h.location);}}
  function bestSellers(){viewFov=60;resize();goTo({x:0,z:5.4,yaw:0,pitch:-.15},'The central island · Best sellers');}
  function reset(){viewFov=60;resize();goTo({x:0,z:8.9,yaw:0,pitch:-.07},'The entrance · Maison Velour');}
  function hitTest(event){const r=canvas.getBoundingClientRect();pointer.set((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1);raycaster.setFromCamera(pointer,camera);const hit=raycaster.intersectObjects(scene.children,true).find(h=>!h.object.userData.ignorePick);return hit&&(hit.object.userData.product||hit.object.userData.waypoint)?hit:null;}
  canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;canvas.focus({preventScroll:true});canvas.setPointerCapture(e.pointerId);drag={x:e.clientX,y:e.clientY,startX:e.clientX,startY:e.clientY,moved:false};canvas.classList.add('is-dragging');});
  canvas.addEventListener('pointermove',e=>{
    if(drag){const dx=e.clientX-drag.x,dy=e.clientY-drag.y;if(Math.hypot(e.clientX-drag.startX,e.clientY-drag.startY)>5)drag.moved=true;rotate(-dx*.0028,-dy*.0025);drag.x=e.clientX;drag.y=e.clientY;}
    else if(performance.now()-hoverTime>85){hoverTime=performance.now();const hit=hitTest(e);canvas.style.cursor=hit?'pointer':'grab';}
  });
  canvas.addEventListener('pointerup',e=>{if(drag&&!drag.moved){const hit=hitTest(e);if(hit?.object.userData.product)onProduct(hit.object.userData.product);else if(hit?.object.userData.waypoint)goTo({...target,...hit.object.userData.waypoint},'Exploring the boutique');}drag=null;canvas.classList.remove('is-dragging');});
  canvas.addEventListener('pointercancel',()=>{drag=null;canvas.classList.remove('is-dragging');});
  const supported=['w','a','s','d','arrowleft','arrowright','arrowup','arrowdown'];
  canvas.addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(supported.includes(key)){e.preventDefault();keys.add(key);}if(key==='home'){e.preventDefault();reset();}});
  canvas.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));canvas.addEventListener('blur',()=>keys.clear());
  function stopControls(){keys.clear();heldControl=null;velocity.x=velocity.z=0;}
  window.addEventListener('blur',stopControls);
  document.addEventListener('visibilitychange',()=>{stopControls();previous=0;dirty=true;});
  const intersection=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;previous=0;dirty=true;},{threshold:.05});intersection.observe(host);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();active=false;onHint('The 3D view paused. Reload the page, or use the brand directory to browse.');host.classList.add('context-lost');});
  function tick(now){
    raf=requestAnimationFrame(tick);const dt=Math.min((now-(previous||now))/1000,.04);previous=now;
    if(!active||!visible||document.hidden||isBlocked()){stopControls();return;}
    const old={...state};
    const down=key=>keys.has(key);
    const walking=heldControl?.kind==='walk'?heldControl.direction:null;
    const looking=heldControl?.kind==='look'?heldControl.direction:null;
    const input={forward:Number(down('w')||walking==='forward')-Number(down('s')||walking==='back'),side:Number(down('d')||walking==='right')-Number(down('a')||walking==='left')};
    const lookX=Number(down('arrowleft')||looking==='left')-Number(down('arrowright')||looking==='right');
    const lookY=Number(down('arrowup')||looking==='up')-Number(down('arrowdown')||looking==='down');
    if(lookX||lookY)rotate(lookX*dt*.65,lookY*dt*.5);
    if(input.forward||input.side||Math.hypot(velocity.x,velocity.z)>.004){
      interruptTravel();const p=stepWalk(state,velocity,input,state.yaw,dt);
      if(input.forward||input.side){if(!wasWalking)onLocation('Exploring the boutique');if(Math.hypot(p.x-state.x,p.z-state.z)<.00001&&now-blockedHintAt>3500){onHint('Take the aisle on either side of the central display.');blockedHintAt=now;}}
      state.x=target.x=p.x;state.z=target.z=p.z;
    }else if(travel.length){
      if(!leg){const end=travel[0];leg={start:{...state},end,elapsed:0,duration:Math.max(.65,Math.hypot(end.x-state.x,end.z-state.z)/4.1)};}
      leg.elapsed+=dt;const t=Math.min(1,leg.elapsed/leg.duration),ease=t*t*(3-2*t);
      for(const key of ['x','z'])state[key]=leg.start[key]+(leg.end[key]-leg.start[key])*ease;
      target={...leg.end};
      if(t===1){travel.shift();leg=null;}
    }else{state.x=motion.matches?target.x:damp(state.x,target.x,5.6,dt);state.z=motion.matches?target.z:damp(state.z,target.z,5.6,dt);}
    wasWalking=!!(input.forward||input.side);
    for(const key of ['yaw','pitch'])state[key]=motion.matches?target[key]:damp(state[key],target[key],drag?11:6.5,dt);
    const desiredFov=Math.max(host.clientWidth<550?72:60,viewFov);
    if(Math.abs(camera.fov-desiredFov)>.01){camera.fov=motion.matches?desiredFov:damp(camera.fov,desiredFov,4,dt);camera.updateProjectionMatrix();dirty=true;}
    if(Object.keys(state).some(k=>Math.abs(state[k]-old[k])>.00001))dirty=true;
    camera.position.set(state.x,2.35,state.z);camera.rotation.set(state.pitch,state.yaw,0,'YXZ');
    if(dirty){
      camera.updateMatrixWorld();
      if(!shadowsReady){renderer.render(scene,camera);renderer.shadowMap.autoUpdate=false;shadowsReady=true;}
      if(now-lastReflection>80){reflection.update(camera);lastReflection=now;}
      renderer.render(scene,camera);
      if(now-lastNotify>100){notify();lastNotify=now;}dirty=false;
    }
  }
  raf=requestAnimationFrame(tick);notify();
  return {move,rotate,visitHouse,bestSellers,reset,resize,setControl(kind,direction){heldControl=kind?{kind,direction}:null;},destroy(){cancelAnimationFrame(raf);window.removeEventListener('blur',stopControls);observer.disconnect();intersection.disconnect();reflection.dispose();renderer.dispose();envMap.dispose();scene.traverse(o=>{o.geometry?.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){m.map?.dispose();m.dispose();}}});}};
}
