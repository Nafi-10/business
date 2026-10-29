import * as T from './vendor/three.module.js';

export const IMAGE_CREDIT='CanveliqSoft · 3D Building Studio · Concept visualisation';

export class MotionClock {
 constructor(paused=false){this.paused=paused;this.time=0;this.last=null;}
 tick(now){if(this.last!==null&&!this.paused)this.time+=Math.min(.1,Math.max(0,(now-this.last)/1000));this.last=now;return this.time;}
}

export function flightPosition(time){const a=3.9+time*Math.PI*2/180;return [170*Math.sin(a),34+2*Math.sin(a*2),170*Math.cos(a)];}

export function brandingLayout(c,logoRatio=205/530){
 return {boards:[
  {kind:'logo',x:-c.width/2-9,z:c.length/2+6,width:7,height:4.6,angle:.3},
  {kind:'brand',x:c.width/2+15,z:-c.length*.22,width:13,height:5.2,angle:.65}
 ],floor:[-.26,.26].map(part=>({x:0,z:c.length*part,width:Math.min(c.width*.55,12,c.length*.36/logoRatio)}))};
}

function mesh(parent,geometry,mat,position,scale){const m=new T.Mesh(geometry,mat);if(position)m.position.set(...position);if(scale)m.scale.set(...scale);parent.add(m);return m;}
function shape(parent,points,mat){const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));if(points.length===4)g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();return mesh(parent,g,mat);}

export function createAtmosphere(){
 const root=new T.Group();root.name='Animated daylight sky';
 const sky=new T.Mesh(new T.SphereGeometry(480,48,24),new T.ShaderMaterial({
  side:T.BackSide,depthWrite:false,uniforms:{time:{value:0}},
  vertexShader:'varying vec3 direction; void main(){direction=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`
   varying vec3 direction; uniform float time;
   float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
   float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
   float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<5;i++){n+=a*noise(p);p=mat2(1.6,1.2,-1.2,1.6)*p;a*=.5;}return n;}
   void main(){
    vec3 d=normalize(direction);float elevation=max(d.y,0.);
    vec3 color=mix(vec3(.63,.78,.88),vec3(.045,.27,.58),1.-exp(-elevation*12.));
    vec3 sun=normalize(vec3(-.5,.6,.2));float glow=pow(max(dot(d,sun),0.),90.);
    color+=vec3(1.,.85,.62)*glow*.25;
    vec2 p=d.xz*6.+vec2(d.y*10.,d.y*13.)+vec2(time*.016,time*.003);
    float n=fbm(p),detail=fbm(p*2.7+9.);
    float density=smoothstep(.48,.7,n+detail*.12)*smoothstep(.005,.04,d.y);
    vec3 cloud=mix(vec3(.66,.74,.79),vec3(1.,.99,.97),smoothstep(.34,.69,n));
    color=mix(color,cloud,density*.96);
    gl_FragColor=vec4(color,1.);
    #include <colorspace_fragment>
   }`
 }));sky.frustumCulled=false;sky.renderOrder=-10;root.add(sky);

 const white=new T.MeshStandardMaterial({color:'#f2f5f7',roughness:.5}),blue=new T.MeshStandardMaterial({color:'#006598'}),red=new T.MeshStandardMaterial({color:'#bb2028'}),glass=new T.MeshStandardMaterial({color:'#163e57',metalness:.4,roughness:.3});
 const plane=new T.Group();plane.name='Aircraft';
 mesh(plane,new T.SphereGeometry(1,20,12),white,[0,0,0],[.38,.4,3.2]);
 mesh(plane,new T.SphereGeometry(1,12,8),glass,[0,.19,2.25],[.3,.24,.54]);
 for(const side of [-1,1]){
  const mat=white.clone();mat.side=T.DoubleSide;
  shape(plane,[[0,0,1],[side*4.4,0,-1.3],[side*4.4,0,-1.9],[0,0,-.6]],mat).geometry.setIndex([0,1,2,0,2,3]);
  shape(plane,[[0,.1,-2],[side*1.65,.1,-2.85],[side*1.65,.1,-3.15],[0,.1,-2.9]],mat).geometry.setIndex([0,1,2,0,2,3]);
  const engine=mesh(plane,new T.CylinderGeometry(.21,.25,1.25,12),blue,[side*1.35,-.31,-.3]);engine.rotation.x=Math.PI/2;
 }
 const tailMat=red.clone();tailMat.side=T.DoubleSide;shape(plane,[[0,.1,-1.8],[0,1.6,-2.7],[0,1.6,-3.1],[0,.1,-3.05]],tailMat).geometry.setIndex([0,1,2,0,2,3]);
 plane.scale.setScalar(1.25);root.add(plane);

 const flock=new T.Group();flock.name='Birds';root.add(flock);const birds=[];
 const feather=new T.MeshStandardMaterial({color:'#33444b',side:T.DoubleSide,roughness:1});
 for(let i=0;i<7;i++){
  const bird=new T.Group(),wings=[];mesh(bird,new T.SphereGeometry(1,8,6),feather,[0,0,0],[.12,.11,.42]);
  for(const side of [-1,1]){const wing=new T.Group();shape(wing,[[0,0,.1],[side*.78,.03,-.15],[side*1.4,0,-.48],[side*.4,0,-.4]],feather).geometry.setIndex([0,1,2,0,2,3]);bird.add(wing);wings.push(wing);}
  flock.add(bird);birds.push({bird,wings});
 }
 function update(time,camera,ridge=12){
  sky.position.copy(camera.position);sky.material.uniforms.time.value=time;
  const p=flightPosition(time),next=flightPosition(time+.1);plane.position.set(...p);plane.rotation.set(0,Math.atan2(next[0]-p[0],next[2]-p[2]),-.08);
  const angle=time*.075;flock.position.set(-38+Math.cos(angle)*30,Math.max(18,ridge+6)+Math.sin(angle*.7)*2,-40+Math.sin(angle)*25);flock.rotation.y=-angle;
  birds.forEach(({bird,wings},i)=>{bird.position.set((i%2?1:-1)*Math.ceil(i/2)*2.1,Math.sin(time*1.4+i)*.35,-i*1.35);wings.forEach((wing,j)=>wing.rotation.z=(j?1:-1)*Math.sin(time*7.5+i*.8)*.48);});
 }
 return {root,update};
}

function canvasTexture(width,height,paint){const c=document.createElement('canvas');c.width=width;c.height=height;paint(c.getContext('2d'),width,height);const texture=new T.CanvasTexture(c);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=8;texture.userData.persistent=true;return texture;}

export async function loadBrandAssets(){
 const logo=new Image();logo.src=new URL('../../assets/canveliqsoft-mark.svg',import.meta.url).href;await logo.decode();
 const logoTexture=new T.Texture(logo);logoTexture.colorSpace=T.SRGBColorSpace;logoTexture.needsUpdate=true;logoTexture.userData.persistent=true;
 const paintBoard=(ctx,w,h)=>{
  const background=ctx.createLinearGradient(0,0,w,h);background.addColorStop(0,'#151c38');background.addColorStop(1,'#080f1e');ctx.fillStyle=background;ctx.fillRect(0,0,w,h);
  const accent=ctx.createLinearGradient(0,0,w,0);accent.addColorStop(0,'#9e77ff');accent.addColorStop(1,'#00dceb');ctx.strokeStyle=accent;ctx.lineWidth=5;ctx.strokeRect(14,14,w-28,h-28);
  const scale=Math.min(w*.86/logo.width,h*.76/logo.height),width=logo.width*scale,height=logo.height*scale;
  ctx.drawImage(logo,(w-width)/2,(h-height)/2,width,height);
 };
 return {logo:logoTexture,logoBoard:canvasTexture(1024,672,paintBoard),brandBoard:canvasTexture(1664,666,paintBoard)};
}

export function createBranding(c,assets){
 const g=new T.Group();g.name='CanveliqSoft campus branding';const {boards,floor}=brandingLayout(c,logoAspect(assets.logo));
 const steel=new T.MeshStandardMaterial({color:'#405764',metalness:.65,roughness:.42});
 for(const spec of boards){
  const board=new T.Group();board.position.set(spec.x,0,spec.z);board.rotation.y=spec.angle;g.add(board);
  for(const x of [-spec.width*.31,spec.width*.31]){const post=mesh(board,new T.BoxGeometry(.2,5.4,.25),steel,[x,2.5,0]);post.castShadow=true;mesh(board,new T.BoxGeometry(.8,.3,.8),steel,[x,-.04,0]);}
  const center=3+spec.height/2;
  const frame=mesh(board,new T.BoxGeometry(spec.width+.24,spec.height+.24,.24),steel,[0,center,0]);frame.castShadow=true;
  for(const side of [-1,1]){const face=mesh(board,new T.PlaneGeometry(spec.width,spec.height),new T.MeshBasicMaterial({map:spec.kind==='logo'?assets.logoBoard:assets.brandBoard,toneMapped:false}),[0,center,side*.131]);face.rotation.y=side===1?0:Math.PI;}
 }
 const markings=[...floor.map(p=>({...p,y:.064})),{x:c.width/2+4.8,z:c.length/2-4,width:4.1,y:-.168}];
 for(const p of markings){const decal=mesh(g,new T.PlaneGeometry(p.width,p.width*logoAspect(assets.logo)),new T.MeshBasicMaterial({map:assets.logo,transparent:true,opacity:.26,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,toneMapped:false}),[p.x,p.y,p.z]);decal.rotation.x=-Math.PI/2;decal.name='CanveliqSoft floor watermark';}
 return g;
}
function logoAspect(texture){return texture.image.height/texture.image.width;}

export function composeExport(rendered,c,logo){
 const canvas=document.createElement('canvas'),unit=rendered.width/1000,footer=64*unit;
 canvas.width=rendered.width;canvas.height=rendered.height+footer;const ctx=canvas.getContext('2d');ctx.drawImage(rendered,0,0);
 ctx.fillStyle='#080f1eee';ctx.fillRect(18*unit,18*unit,340*unit,86*unit);
 if(logo){
  ctx.drawImage(logo,30*unit,30*unit,160*unit,160*unit*logo.height/logo.width);
  ctx.save();ctx.globalAlpha=.36;ctx.drawImage(logo,canvas.width-205*unit,rendered.height-90*unit,180*unit,180*unit*logo.height/logo.width);ctx.restore();
 }
 ctx.font=`${13*unit}px Arial`;ctx.fillStyle='#c8d4e6';ctx.fillText(`${c.width} × ${c.length} m`,210*unit,51*unit);ctx.fillText('Concept design',210*unit,75*unit);
 ctx.fillStyle='#080f1e';ctx.fillRect(0,rendered.height,canvas.width,footer);const accent=ctx.createLinearGradient(0,0,canvas.width,0);accent.addColorStop(0,'#9874ff');accent.addColorStop(1,'#00dceb');ctx.fillStyle=accent;ctx.fillRect(0,rendered.height,canvas.width,3*unit);
 ctx.fillStyle='#fff';ctx.font=`500 ${16*unit}px Arial`;ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(IMAGE_CREDIT,canvas.width/2,rendered.height+footer/2,canvas.width-48*unit);
 return canvas;
}
