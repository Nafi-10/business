import * as T from './vendor/three.module.js';
import {OrbitControls} from './vendor/OrbitControls.js';
import {metrics,roofPoints,toDisplay,fmt,openingLayout} from './config.js';
import {MotionClock,createAtmosphere,loadBrandAssets,createBranding,brandingLayout,composeExport} from './environment.js';

const material=(color,metalness=0)=>new T.MeshStandardMaterial({color,roughness:metalness?.52:.9,metalness});
const boxGeo=new T.BoxGeometry(1,1,1);
function box(g,x,y,z,w,h,d,mat){const mesh=new T.Mesh(boxGeo,mat);mesh.position.set(x,y,z);mesh.scale.set(w,h,d);mesh.castShadow=true;mesh.receiveShadow=true;g.add(mesh);return mesh;}
function bar(g,a,b,w,d,mat){const start=new T.Vector3(...a),end=new T.Vector3(...b),len=start.distanceTo(end);const mesh=box(g,...start.clone().add(end).multiplyScalar(.5).toArray(),w,len,d,mat);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());return mesh;}
function beam(g,a,b,depth,width,mat){const local=new T.Group(),start=new T.Vector3(...a),end=new T.Vector3(...b),len=start.distanceTo(end);box(local,0,0,0,.07,len,depth,mat);box(local,0,0,-depth/2,width,len,.065,mat);box(local,0,0,depth/2,width,len,.065,mat);local.position.copy(start.clone().add(end).multiplyScalar(.5));local.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),end.sub(start).normalize());g.add(local);return local;}
function line(g,points,color='#3b7188'){const geometry=new T.BufferGeometry().setFromPoints(points.map(p=>new T.Vector3(...p)));const l=new T.Line(geometry,new T.LineBasicMaterial({color}));g.add(l);return l;}
function label(g,text,x,y,z){const canvas=document.createElement('canvas');canvas.width=512;canvas.height=96;const ctx=canvas.getContext('2d');ctx.fillStyle='#ffffffee';ctx.beginPath();ctx.roundRect(4,4,504,88,16);ctx.fill();ctx.font='600 52px Arial';ctx.fillStyle='#153649';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,256,49);const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(new T.SpriteMaterial({map:tex,depthTest:false,transparent:true}));s.position.set(x,y,z);s.scale.set(7.4,1.39,1);s.renderOrder=10;s.userData.dimensionLabel=true;g.add(s);}
function surface(g,points,z1,z2,mat){const verts=[],idx=[];points.forEach(([x,y])=>{verts.push(x,y,z1,x,y,z2);});for(let i=0;i<points.length-1;i++){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(verts,3));geo.setIndex(idx);geo.computeVertexNormals();const m=new T.Mesh(geo,mat);m.castShadow=true;m.receiveShadow=true;g.add(m);return m;}
function clear(g){g.traverse(o=>{if(o.geometry&&o.geometry!==boxGeo)o.geometry.dispose();if(o.material){for(const m of Array.isArray(o.material)?o.material:[o.material]){if(m.map&&!m.map.userData.persistent)m.map.dispose();m.dispose();}}});g.clear();}

export function createBuilding(c){
 const g=new T.Group(),m=metrics(c),w=c.width/2,l=c.length/2,h=c.height,points=roofPoints(c),explode=c.exploded?3.5:0,openings=openingLayout(c);
 const steel=material(c.frameColor,.55),silver=material('#9caab1',.5),concrete=material('#c6cacc'),roof=material(c.roofColor,.22),wall=material(c.wallColor,.12),trim=material(c.frameColor,.4),glass=material('#658e9f',.4),doorMat=material('#dbe0e1',.2);roof.side=T.DoubleSide;wall.side=T.DoubleSide;
 box(g,0,-.12,0,c.width+1,.35,c.length+1,concrete);
 const heightAt=x=>{for(let i=0;i<points.length-1;i++){if(x>=points[i][0]-.001&&x<=points[i+1][0]+.001){const a=points[i],b=points[i+1];return a[1]+(b[1]-a[1])*(x-a[0])/(b[0]-a[0]);}}return h;};
 m.positions.forEach((z,index)=>{
  const isEnd=index===0||index===m.positions.length-1;
  for(const x of [-w,w]) {beam(g,[x,0,z],[x,heightAt(x),z],.35,.4,steel);box(g,x,.12,z,.75,.14,.7,silver);}
  for(let j=0;j<points.length-1;j++)beam(g,[points[j][0],points[j][1],z],[points[j+1][0],points[j+1][1],z],.32,.38,steel);
  if(c.system==='multi'||c.system==='gable')beam(g,[0,0,z],[0,heightAt(0),z],.3,.32,steel);
  if(isEnd&&c.endFrame==='post')for(const x of [-w/2,w/2])beam(g,[x,0,z],[x,heightAt(x),z],.22,.22,steel);
 });
 for(let x=-w;x<=w+.01;x+=Math.max(1.5,c.width/14))bar(g,[x,heightAt(x)-.08,-l],[x,heightAt(x)-.08,l],.13,.13,silver);
 for(const x of [-w,w])for(let y=1.5;y<h-.4;y+=1.8){const cuts=openings.windows.filter(o=>o.side===Math.sign(x)&&y>o.bottom-.1&&y<o.bottom+o.height+.1).sort((a,b)=>a.start-b.start);let cursor=-l;for(const o of [...cuts,{start:l,end:l}]){if(o.start>cursor)bar(g,[x,y,cursor],[x,y,o.start],.12,.12,silver);cursor=o.end;}}
 for(const x of [-w,w])for(const i of [0,m.bays-1]) {if(openings.windows.some(o=>o.side===Math.sign(x)&&o.bay===i))continue;const z1=m.positions[i],z2=m.positions[i+1];bar(g,[x,.4,z1],[x,h-.2,z2],.045,.045,silver);bar(g,[x,h-.2,z1],[x,.4,z2],.045,.045,silver);}
 if(c.view!=='frame'){
  const rp=points.map(([x,y])=>[x,y+.13+explode]);surface(g,rp,-l-.5,l+.5,roof);
  for(let z=-l-.4;z<=l+.5;z+=1.15)for(let j=0;j<rp.length-1;j++)bar(g,[rp[j][0],rp[j][1]+.045,z],[rp[j+1][0],rp[j+1][1]+.045,z],.045,.045,silver);
  for(const x of [-w,w])bar(g,[x,heightAt(x)+.1+explode,-l-.55],[x,heightAt(x)+.1+explode,l+.55],.2,.18,trim);
 }
 // Openings are placed inside structural bays, leaving primary columns intact.
 if(c.view==='complete'){
  for(const side of [-1,1]){
   const x=side*(w+.06+explode),sideH=heightAt(side*w);
   // Split each side wall around real window apertures.
   const sideOpenings=openings.windows.filter(o=>o.side===side).sort((a,b)=>a.start-b.start);
   let cursor=-l;for(const o of [...sideOpenings,{start:l,end:l}]){if(o.start>cursor)box(g,x,sideH/2,(cursor+o.start)/2,.1,sideH,o.start-cursor,wall);if(o.end>o.start){box(g,x,o.bottom/2,o.center,.1,o.bottom,o.width,wall);box(g,x,(sideH+o.bottom+o.height)/2,o.center,.1,sideH-o.bottom-o.height,o.width,wall);}cursor=o.end;}
   for(let z=-l;z<=l;z+=1.4)if(!sideOpenings.some(o=>z>o.start&&z<o.end))box(g,x+side*.07,sideH/2,z,.045,sideH,.04,trim);
  }
  box(g,0,h/2,-l-.04-explode,c.width,h,.1,wall);
  let cursor=-w;for(const o of [...openings.doors,{center:w,width:0,height:0}]){const start=o.center-o.width/2;if(start>cursor)box(g,(cursor+start)/2,h/2,l+.04+explode,start-cursor,h,.1,wall);if(o.width)box(g,o.center,(h+o.height)/2,l+.04+explode,o.width,h-o.height,.1,wall);cursor=o.center+o.width/2;}
  for(const z of [-l-.045-explode,l+.045+explode]){const shape=new T.Shape();shape.moveTo(-w,h);for(const [x,y]of points)shape.lineTo(x,y);shape.lineTo(w,h);shape.closePath();const mesh=new T.Mesh(new T.ShapeGeometry(shape),wall);mesh.position.z=z;mesh.castShadow=true;g.add(mesh);}
 }
 openings.doors.forEach(({center,width:doorW,height:doorH})=>{const z=l+.16+explode;box(g,center,doorH/2,z,doorW,doorH,.14,doorMat);for(let y=.15;y<doorH;y+=.28)box(g,center,y,z+.081,doorW,.022,.02,silver);for(const x of [center-doorW/2,center+doorW/2])box(g,x,doorH/2,z+.04,.14,doorH,.2,trim);box(g,center,doorH,z,doorW+.2,.18,.22,trim);});
 for(const o of openings.windows){const {side,center:z,width:ww,bottom,height:wh}=o,x=side*(w+.14+explode);box(g,x,bottom+wh/2,z,.12,wh,ww,glass);for(const yy of [bottom,bottom+wh])box(g,x,yy,z,.18,.1,ww+.2,trim);for(const zz of [z-ww/2,z,z+ww/2])box(g,x,bottom+wh/2,zz,.18,wh,.09,trim);}
 if(c.leanTo){const outer=w+4,low=Math.max(2.4,h-1.3),high=h-.5;if(c.view!=='frame')surface(g,[[w,high],[outer,low]],-l,l,roof);m.positions.forEach(z=>{beam(g,[outer,0,z],[outer,low,z],.22,.25,steel);beam(g,[w,high,z],[outer,low,z],.2,.22,steel);});bar(g,[outer,low,-l],[outer,low,l],.15,.15,steel);box(g,w+2,-.08,0,4,.2,c.length,concrete);}
 if(c.canopy){const cw=Math.min(12,c.width-1),cy=Math.min(h-.6,4.8);if(c.view!=='frame')surface(g,[[-cw/2,cy],[cw/2,cy]],l,l+3,roof);for(const x of [-cw/2,cw/2]){beam(g,[x,0,l+3],[x,cy,l+3],.18,.2,steel);bar(g,[x,cy,l],[x,cy,l+3],.16,.2,steel);}bar(g,[-cw/2,cy,l+3],[cw/2,cy,l+3],.16,.2,steel);}
 if(c.crane){const yellow=material('#e8b73a',.25),cy=h*.72;for(const x of [-w+.8,w-.8])beam(g,[x,cy,-l],[x,cy,l],.2,.35,steel);box(g,0,cy+.3,0,c.width-1.4,.55,.8,yellow);box(g,0,cy+.1,0,1.5,.7,1.4,steel);bar(g,[0,cy,0],[0,cy-1.5,0],.065,.065,silver);const hook=new T.Mesh(new T.TorusGeometry(.22,.07,8,16,Math.PI*1.5),yellow);hook.position.set(0,cy-1.65,0);g.add(hook);}
 if(c.mezzanine){const mh=Math.min(3.2,h*.48),depth=c.length*.35,front=-l+depth;box(g,0,mh,-l+depth/2,c.width-.8,.25,depth,silver);for(const x of [-w+.6,0,w-.6])for(const z of [-l+.6,front-.3])beam(g,[x,0,z],[x,mh,z],.25,.25,steel);for(let x=-w+.5;x<=w-.5;x+=2)bar(g,[x,mh,front],[x,mh+1.1,front],.06,.06,trim);bar(g,[-w+.5,mh+1.1,front],[w-.5,mh+1.1,front],.065,.065,trim);for(let s=0;s<12;s++)box(g,-w+1.3,(s+1)*mh/12,front+(12-s)*.27,1.3,.13,.3,silver);}
 if(c.dimensions){const dimension=new T.Group();g.add(dimension);const zz=l+3.8,xx=w+(c.leanTo?7:3.8),dy=.22;line(dimension,[[-w,dy,zz],[w,dy,zz]]);for(const x of [-w,w])line(dimension,[[x,dy,l+1],[x,dy,zz+1]]);label(dimension,`WIDTH  ${fmt(toDisplay(c.width,c.units))} ${c.units}`,0,.5,zz+1);line(dimension,[[xx,dy,-l],[xx,dy,l]]);for(const z of [-l,l])line(dimension,[[w+1,dy,z],[xx+1,dy,z]]);label(dimension,`LENGTH  ${fmt(toDisplay(c.length,c.units))} ${c.units}`,xx+1,.6,0);line(dimension,[[-w-2,.15,l],[-w-2,h,l]]);label(dimension,`EAVE  ${fmt(toDisplay(h,c.units))} ${c.units}`,-w-3,h/2,l);}
 g.userData={frames:m.frames,area:m.area,ridge:m.ridge};return g;
}

function createCampus(c){const g=new T.Group(),w=c.width/2,l=c.length/2;const grass=material('#9aaa89'),paving=material('#d6d9d4'),asphalt=material('#838c8c'),white=material('#e8e9df'),soil=material('#b4bfa3'),trunk=material('#7a705c');
 box(g,0,-.55,0,3000,.45,3000,grass);box(g,0,-.28,0,c.width+15,.2,c.length+15,paving);
 const roadZ=l+17,roadX=-w-17;box(g,0,-.32,roadZ,500,.15,10,asphalt);box(g,roadX,-.31,0,10,.15,500,asphalt);
 for(let i=-200;i<220;i+=8){box(g,i,-.23,roadZ,3,.014,.14,white);box(g,roadX,-.22,i,.14,.014,3,white);}
 for(const z of [roadZ-5.2,roadZ+5.2])box(g,0,-.22,z,500,.18,.3,paving);
 for(const x of [roadX-5.2,roadX+5.2])box(g,x,-.22,0,.3,.18,500,paving);
 const foliage=[material('#647d52'),material('#70895b'),material('#577447')],leafGeo=new T.IcosahedronGeometry(1,1);
 function tree(x,z,scale=1){if(brandingLayout(c).boards.some(b=>Math.abs(x-b.x)<b.width/2+3&&Math.abs(z-b.z)<6))return;const height=4.5*scale;const t=new T.Mesh(new T.CylinderGeometry(.14,.22,height,6),trunk);t.position.set(x,height/2-.4,z);t.castShadow=true;g.add(t);for(const [dx,dy,dz,s]of [[0,1,0,1.8],[-.75,0,.2,1.4],[.65,.1,-.4,1.5]]){const mesh=new T.Mesh(leafGeo,foliage[Math.abs(Math.round(x+z))%3]);mesh.position.set(x+dx*scale,height+dy*scale,z+dz*scale);mesh.scale.set(s*scale,s*1.1*scale,s*scale);mesh.castShadow=true;g.add(mesh);}box(g,x,-.23,z,3.5*scale,.14,3.5*scale,soil);}
 for(let z=-l-10;z<l+2;z+=11){tree(w+12,z,.85+(Math.sin(z)*.1));tree(roadX-11,z,1.05);}
 for(let x=-w+3;x<w+20;x+=11){tree(x,-l-12,1);tree(x,roadZ+11,.9);}
 // Parking spaces and simple scale vehicles beside the access road.
 for(let i=0;i<5;i++){const x=-w+3+i*3;line(g,[[x,-.16,l+6],[x,-.16,l+10]],'#f6f6eb');}
 const carpaint=material('#f2f3ef',.25),dark=material('#334752',.3),tyre=material('#384044');for(let i=0;i<2;i++){const x=-w+4.5+i*6,z=l+8;box(g,x,.4,z,1.7,.7,3.4,i?dark:carpaint);box(g,x,.97,z-.1,1.5,.55,1.8,dark);for(const xx of [-.85,.85])for(const zz of [-1,1])box(g,x+xx,.12,z+zz,.2,.45,.55,tyre);}
 return g;}

export class BuildingScene {
 constructor(container,c){
  this.container=container;this.scene=new T.Scene();this.scene.background=new T.Color('#cadde5');this.scene.fog=new T.Fog('#cadde5',180,420);
  this.renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});this.renderer.setPixelRatio(Math.min(devicePixelRatio,2));this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=T.PCFSoftShadowMap;this.renderer.outputColorSpace=T.SRGBColorSpace;this.renderer.toneMapping=T.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.15;
  container.append(this.renderer.domElement);this.renderer.domElement.setAttribute('aria-label','Interactive 3D steel building with clouds, birds, an aircraft and CanveliqSoft billboards. Drag to orbit, scroll to zoom.');this.renderer.domElement.setAttribute('role','img');
  this.camera=new T.PerspectiveCamera(38,1,.1,1500);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.dampingFactor=.07;this.controls.minDistance=12;this.controls.maxDistance=280;this.controls.maxPolarAngle=Math.PI/2-.06;this.controls.target.set(0,2,0);
  this.scene.add(new T.HemisphereLight('#f0f8ff','#a6aa8d',2.5));this.sun=new T.DirectionalLight('#fff1d8',3.2);this.sun.position.set(-40,65,35);this.sun.castShadow=true;this.sun.shadow.mapSize.set(2048,2048);Object.assign(this.sun.shadow.camera,{left:-100,right:100,top:100,bottom:-100,near:1,far:220});this.sun.shadow.bias=-.0003;this.sun.shadow.normalBias=.06;this.scene.add(this.sun);
  this.model=new T.Group();this.campus=new T.Group();this.branding=new T.Group();this.atmosphere=createAtmosphere();this.motion=new MotionClock(matchMedia('(prefers-reduced-motion: reduce)').matches);this.scene.add(this.model,this.campus,this.branding,this.atmosphere.root);
  this.update(c);this.cameraView('3d');this.resizeObserver=new ResizeObserver(()=>this.resize());this.resizeObserver.observe(container);this.resize();
  this.ready=loadBrandAssets().then(assets=>{this.brandAssets=assets;this.updateBranding();});
  this.ready.catch(error=>console.warn('Campus branding could not load.',error));
  this.renderer.setAnimationLoop(now=>{this.controls.update();this.atmosphere.update(this.motion.tick(now),this.camera,metrics(this.config).ridge+(this.config.exploded?3.5:0));this.resizeLabels();this.renderer.render(this.scene,this.camera);});
 }
 resizeLabels(){const pixelHeight=this.container.clientHeight||500;this.model.traverse(o=>{if(o.userData.dimensionLabel){const scale=2*Math.tan(this.camera.fov*Math.PI/360)*this.camera.position.distanceTo(o.position)/pixelHeight;o.scale.set(125*scale,24*scale,1);}});}
 updateBranding(){clear(this.branding);if(this.brandAssets)this.branding.add(createBranding(this.config,this.brandAssets));}
 update(c){const campusChanged=!this.config||c.width!==this.config.width||c.length!==this.config.length,refit=this.config&&['width','length','height','system','slope','leanTo','canopy','exploded'].some(k=>c[k]!==this.config[k]);clear(this.model);this.model.add(createBuilding(c));if(campusChanged){clear(this.campus);this.campus.add(createCampus(c));}this.config={...c};if(campusChanged)this.updateBranding();if(refit)this.cameraView(this.currentView||'3d');}
 resize(){const {width,height}=this.container.getBoundingClientRect();if(!width||!height)return;this.camera.aspect=width/height;this.camera.updateProjectionMatrix();this.renderer.setSize(width,height);this.cameraView(this.currentView||'3d');}
 cameraView(view){
  this.currentView=view;
  const c=this.config,ridge=metrics(c).ridge+(c.exploded?3.5:0),target=new T.Vector3(c.leanTo?2:0,ridge*.42,c.canopy?1.5:0);
  const direction=new T.Vector3(...({front:[0,.015,1],side:[1,.015,0],top:[0,1,.0001]}[view]||[.87,.30,1.02])).normalize();
  this.camera.up.set(0,1,0);
  const right=new T.Vector3().crossVectors(this.camera.up,direction).normalize(),up=new T.Vector3().crossVectors(direction,right).normalize(),tan=Math.tan(this.camera.fov*Math.PI/360);
  let distance=12;
  for(const x of [-c.width/2-4,c.width/2+(c.leanTo?8:4)])for(const y of [-.5,ridge+1])for(const z of [-c.length/2-3,c.length/2+(c.canopy?7:4)]){
   const p=new T.Vector3(x,y,z).sub(target);distance=Math.max(distance,p.dot(direction)+Math.max(Math.abs(p.dot(right))/(tan*this.camera.aspect),Math.abs(p.dot(up))/tan));
  }
  if(view==='3d')for(const board of brandingLayout(c).boards)for(const sign of [-1,1]){const p=new T.Vector3(board.x+sign*board.width/2,3+board.height,board.z).sub(target);distance=Math.max(distance,p.dot(direction)+Math.abs(p.dot(right))/(tan*this.camera.aspect));}
  distance*=1.12;this.controls.maxDistance=Math.max(280,distance*3);this.controls.target.copy(target);this.camera.position.copy(target).addScaledVector(direction,distance);this.camera.lookAt(target);this.controls.update();
 }
 zoom(factor){this.camera.position.sub(this.controls.target).multiplyScalar(factor).add(this.controls.target);this.controls.update();}
 async exportImage(){await this.ready;const size=this.renderer.getSize(new T.Vector2()),ratio=this.renderer.getPixelRatio();try{this.renderer.setPixelRatio(1);this.renderer.setSize(2560,Math.round(2560/this.camera.aspect),false);this.atmosphere.update(this.motion.time,this.camera,metrics(this.config).ridge+(this.config.exploded?3.5:0));this.renderer.render(this.scene,this.camera);return composeExport(this.renderer.domElement,this.config,this.brandAssets?.logo.image).toDataURL('image/png');}finally{this.renderer.setPixelRatio(ratio);this.renderer.setSize(size.x,size.y,false);this.renderer.render(this.scene,this.camera);}}
}
