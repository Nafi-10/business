import * as THREE from './assets/three.module.min.js';
const {assemblyPose,scrollPose}=await import(new URL('./hero-data.mjs'+new URL(import.meta.url).search,import.meta.url));

export function createProductCube({canvas,stage,modules,onSelect,onFailure}){
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'low-power'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.35));renderer.setClearColor(0x080f1f,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.05;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(34,1,.1,40);camera.position.set(0,.05,6.8);
 const group=new THREE.Group(),reflection=new THREE.Group();scene.add(group,reflection);
 const studio=document.createElement('canvas');studio.width=1024;studio.height=512;const ctx=studio.getContext('2d');
 const backdrop=ctx.createLinearGradient(0,0,0,512);backdrop.addColorStop(0,'#a3b4ce');backdrop.addColorStop(.35,'#344761');backdrop.addColorStop(.65,'#091325');backdrop.addColorStop(1,'#293c5d');ctx.fillStyle=backdrop;ctx.fillRect(0,0,1024,512);
 ctx.fillStyle='#e5fcff';ctx.fillRect(40,30,170,200);ctx.fillStyle='#61e4ef';ctx.fillRect(265,80,65,330);ctx.fillStyle='#e2d2ff';ctx.fillRect(705,20,120,250);ctx.fillStyle='#b09afc';ctx.fillRect(895,60,65,360);ctx.fillStyle='#fff';ctx.fillRect(430,15,170,65);
 const texture=new THREE.CanvasTexture(studio);texture.mapping=THREE.EquirectangularReflectionMapping;texture.colorSpace=THREE.SRGBColorSpace;
 const pmrem=new THREE.PMREMGenerator(renderer),environment=pmrem.fromEquirectangular(texture);scene.environment=environment.texture;texture.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight(0xdce8ff,0x262142,.55));
 for(const [color,intensity,x,y,z] of [[0xefffff,1.7,1,4,5],[0x5ceaf3,2.2,4,.3,-1],[0xb38aff,1.8,-4,1,1]]){const light=new THREE.DirectionalLight(color,intensity);light.position.set(x,y,z);scene.add(light);}
 const geometry=new THREE.BoxGeometry(1,1,1,6,6,6),positions=geometry.attributes.position,normals=geometry.attributes.normal,vertex=new THREE.Vector3(),inner=new THREE.Vector3(),radius=.055;
 // Analytic rounded normals keep shared edges smooth instead of faceting the rim light.
 for(let i=0;i<positions.count;i++){vertex.fromBufferAttribute(positions,i);inner.copy(vertex).clampScalar(-.5+radius,.5-radius);vertex.sub(inner).normalize();normals.setXYZ(i,vertex.x,vertex.y,vertex.z);vertex.multiplyScalar(radius).add(inner);positions.setXYZ(i,vertex.x,vertex.y,vertex.z);}
 const edgeSource=new THREE.BoxGeometry(1.002,1.002,1.002),edges=new THREE.EdgesGeometry(edgeSource);edgeSource.dispose();
 const pieces=[],ghosts=[],materials=[];
 for(let i=0;i<8;i++){
  const base=new THREE.Color(i%2?'#9a8fdf':'#66c5d5');
  const material=new THREE.MeshPhysicalMaterial({color:base,transparent:true,opacity:.9,metalness:.04,roughness:i&1?.065:.04,transmission:.94,thickness:1.2,ior:1.46,clearcoat:1,clearcoatRoughness:.025,envMapIntensity:1.7,iridescence:.08,iridescenceIOR:1.3,iridescenceThicknessRange:[100,180],attenuationColor:new THREE.Color(i%2?'#785bcb':'#3bb3c4'),attenuationDistance:2.5});
  const mesh=new THREE.Mesh(geometry,material);mesh.userData.module=modules[i%4].id;group.add(mesh);
  const lineMaterial=new THREE.LineBasicMaterial({color:i%2?0xc5abff:0x8af4fa,transparent:true,opacity:.22});const line=new THREE.LineSegments(edges,lineMaterial);mesh.add(line);
  const ghostMaterial=new THREE.MeshBasicMaterial({color:base,transparent:true,opacity:.025,depthWrite:false});const ghost=new THREE.Mesh(geometry,ghostMaterial);reflection.add(ghost);
  pieces.push({mesh,material,lineMaterial,base});ghosts.push(ghost);materials.push(material,lineMaterial,ghostMaterial);
 }
 let disposed=false,paused=false,dragging=false,visible=true,frame=0,lastTime=0,lastPaint=0,elapsed=0,assembly=0,scroll=0,rotationX=.4,rotationY=-.52,module='erp',accent=new THREE.Color('#4fe6ef');
 const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2(),abort=new AbortController();
 function draw(now){
  frame=0;if(disposed||!visible||document.hidden)return;
  if(!paused&&now-lastPaint<32){frame=requestAnimationFrame(draw);return;}
  const delta=lastTime?Math.min((now-lastTime)/1000,.08):0;lastTime=now;lastPaint=now;
  if(!paused){elapsed+=delta;assembly=Math.min(1,assembly+delta/1.35);}
  const motion=scrollPose(scroll),idle=!paused&&!dragging;
  group.rotation.set(rotationX+(idle?Math.sin(elapsed*.33)*.035:0),rotationY+motion.rotation+(idle?Math.sin(elapsed*.27)*.065:0),-.07);group.scale.setScalar(motion.scale);
  group.position.y=.1+(idle?Math.sin(elapsed*.75)*.045:0);
  pieces.forEach(({mesh},i)=>{const pose=assemblyPose(i,assembly);mesh.position.fromArray(pose.position);mesh.rotation.fromArray([...pose.rotation,'XYZ']);ghosts[i].position.copy(mesh.position);ghosts[i].rotation.copy(mesh.rotation);});
  reflection.rotation.copy(group.rotation);reflection.scale.set(1,-.17,1);reflection.position.set(0,-1.45,0);
  renderer.render(scene,camera);stage.classList.add('cs-cube-ready');stage.dataset.phase=assembly<1?'assembling':'connected';
  if(!paused)frame=requestAnimationFrame(draw);
 }
 function wake(){if(!disposed&&!frame&&visible&&!document.hidden){lastTime=0;frame=requestAnimationFrame(draw);}}
 function resize(){if(disposed)return;const {width,height}=stage.getBoundingClientRect();if(!width||!height)return;renderer.setSize(width,height,false);camera.aspect=width/height;camera.position.z=Math.max(6.6,5.7/camera.aspect);camera.updateProjectionMatrix();wake();}
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(stage);
 const intersection=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(!visible){cancelAnimationFrame(frame);frame=0;}else wake();},{threshold:.01});intersection.observe(stage);
 document.addEventListener('visibilitychange',()=>{if(document.hidden){cancelAnimationFrame(frame);frame=0;}else wake();},{signal:abort.signal});
 canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();cancelAnimationFrame(frame);frame=0;stage.classList.remove('cs-cube-ready');queueMicrotask(onFailure);},{signal:abort.signal});
 function recolor(){pieces.forEach(({mesh,material,lineMaterial,base})=>{const selected=mesh.userData.module===module;material.color.copy(base).lerp(accent,selected?.2:.06);material.emissive.copy(selected?accent:new THREE.Color(0));material.emissiveIntensity=selected?.035:0;lineMaterial.opacity=selected?.65:.16;lineMaterial.color.copy(selected?accent:base);});wake();}
 resize();recolor();
 return {
  setIndustry(color){accent.set(color);recolor();},
  setModule(id){module=id;recolor();},
  setPaused(value){paused=value;if(value)assembly=1;cancelAnimationFrame(frame);frame=0;wake();},
  setDragging(value){dragging=value;wake();},
  setScroll(value){scroll=value;wake();},
  rotate(x,y){rotationX=x;rotationY=y;wake();},
  hit(x,y){if(disposed||assembly<1)return null;const r=canvas.getBoundingClientRect();mouse.set((x-r.left)/r.width*2-1,-(y-r.top)/r.height*2+1);raycaster.setFromCamera(mouse,camera);return raycaster.intersectObjects(pieces.map(p=>p.mesh),false)[0]?.object.userData.module||null;},
  destroy(){if(disposed)return;disposed=true;cancelAnimationFrame(frame);abort.abort();resizeObserver.disconnect();intersection.disconnect();geometry.dispose();edges.dispose();materials.forEach(m=>m.dispose());environment.dispose();renderer.dispose();stage.classList.remove('cs-cube-ready');}
 };
}
