import * as THREE from './vendor/three/three.module.js';
import { bottleStyles } from './showroom-data.js';

// All sides are modeled: labels sit on glass, never on a full-bottle photo plane.
export function roundedBox(w,h,d,r=.035) {
  r=Math.min(r,w/4,h/4,d/4);
  const x=-w/2+r,y=-h/2+r,s=new THREE.Shape();
  s.moveTo(x+r,y);s.lineTo(x+w-3*r,y);s.quadraticCurveTo(x+w-2*r,y,x+w-2*r,y+r);
  s.lineTo(x+w-2*r,y+h-3*r);s.quadraticCurveTo(x+w-2*r,y+h-2*r,x+w-3*r,y+h-2*r);
  s.lineTo(x+r,y+h-2*r);s.quadraticCurveTo(x,y+h-2*r,x,y+h-3*r);
  s.lineTo(x,y+r);s.quadraticCurveTo(x,y,x+r,y);
  const geometry=new THREE.ExtrudeGeometry(s,{depth:d-2*r,bevelEnabled:true,bevelSegments:3,steps:1,bevelSize:r,bevelThickness:r,curveSegments:6});
  geometry.center();return geometry;
}

export function createBottleFactory(contactTexture) {
  const cache=new Map();
  const physical=(color,options={})=>new THREE.MeshPhysicalMaterial({color,roughness:.24,clearcoat:1,clearcoatRoughness:.12,...options});
  const gold=physical('#be995b',{metalness:1,roughness:.23});
  const chrome=physical('#e4e0d8',{metalness:1,roughness:.14});
  const black=physical('#111213',{roughness:.24,metalness:.18});
  const glass=physical('#f5f3ec',{transmission:.9,thickness:.12,ior:1.5,roughness:.075,envMapIntensity:1.25});
  function add(g,geometry,mat,x,y,z=0,shadow=true) {
    const o=new THREE.Mesh(geometry,mat);o.position.set(x,y,z);o.castShadow=shadow&&!mat.transmission;o.receiveShadow=true;g.add(o);return o;
  }
  function cylinder(g,r,h,y,mat,rt=r){return add(g,new THREE.CylinderGeometry(rt,r,h,32),mat,0,y);}
  function profile(g,points,mat) {return add(g,new THREE.LatheGeometry(points.map(p=>new THREE.Vector2(...p)),40),mat,0,0);}
  function print(id,w,h) {
    const c=document.createElement('canvas');c.width=768;c.height=768;
    const ctx=c.getContext('2d');ctx.textAlign='center';ctx.textBaseline='middle';
    const s=bottleStyles[id];
    const text=(value,y,size,font='Georgia',color=s.ink)=>{ctx.fillStyle=color;ctx.font=`${size}px ${font}`;ctx.fillText(value,384,y,690);};
    if(id==='chanel'){
      ctx.fillStyle='#f9f5e9';ctx.fillRect(0,0,768,768);ctx.strokeStyle='#252420';ctx.lineWidth=3;ctx.strokeRect(25,25,718,718);
      text('COCO',208,111,'Arial');text('MADEMOISELLE',319,44,'Arial');text('CHANEL',475,75,'Arial');text('PARIS',560,33,'Arial');text('EAU DE PARFUM',654,28,'Arial');
    }else if(id==='sauvage'){
      text('SAUVAGE',230,86,'Georgia','#f3f0e7');text('PARFUM',345,33,'Arial','#dedfdc');text('Dior',627,108,'Georgia','#f3f0e7');
    }else if(id==='tom-ford'){
      ctx.fillStyle='#a7a998';ctx.fillRect(0,0,768,768);ctx.strokeStyle='#414c46';ctx.lineWidth=8;ctx.strokeRect(20,20,728,728);
      text('TOM FORD',168,73,'Arial');text('OUD WOOD',324,72,'Arial');text('EAU DE PARFUM',490,34,'Arial');text('50 ML',631,31,'Arial');
    }else if(id==='baccarat-rouge'){
      ctx.fillStyle='#751e21';ctx.fillRect(0,0,768,768);ctx.strokeStyle='#d7b575';ctx.lineWidth=6;ctx.strokeRect(20,20,728,728);
      text('Baccarat',191,80,'Georgia','#ead5a0');text('Rouge 540',293,76,'Georgia','#ead5a0');text('Maison Francis Kurkdjian',535,42,'Georgia','#ead5a0');text('Paris',628,37,'Georgia','#ead5a0');
    }else if(id==='aventus'){
      ctx.fillStyle='#191b1a';ctx.fillRect(0,0,768,768);text('CREED',155,125,'Georgia','#e9e6dc');text('1760',263,30,'Georgia','#ded8c2');text('AVENTUS',455,72,'Georgia','#e9e6dc');text('EAU DE PARFUM',612,30,'Arial','#ded8c2');
      ctx.strokeStyle='#cac6b6';ctx.lineWidth=2;ctx.strokeRect(20,20,728,728);
    }else if(id==='libre'){
      text('Y',240,320,'Georgia','#ac8949');text('S',372,320,'Georgia','#bca064');text('L',523,320,'Georgia','#bca064');text('LIBRE',687,42,'Arial','#28231b');
    }else if(id==='delina'){
      text('PARFUMS',150,49,'Georgia','#aa8287');text('de MARLY',234,61,'Georgia','#aa8287');text('PARIS',310,30,'Georgia','#aa8287');text('DELINA',585,64,'Georgia','#8b676e');
    }else {text('J’adore',375,95,'Georgia','#a17f3d');text('Dior',580,58,'Georgia','#a17f3d');}
    const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;map.anisotropy=8;
    return new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshPhysicalMaterial({map,transparent:true,alphaTest:.02,roughness:.36,metalness:['libre','delina'].includes(id)?.65:.08,clearcoat:.35,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
  }
  return function makeBottle(id) {
    if(cache.has(id))return cache.get(id).clone();
    const g=new THREE.Group(),s=bottleStyles[id],w=s.width,h=s.height,d=w*.56;
    // An opaque inner volume remains visible through Three's transmission pass.
    const tinted=physical(s.body,{roughness:.16,metalness:.08,clearcoat:1,clearcoatRoughness:.07});
    let labelW=w*.69,labelH=h*.45,labelY=h*.39,labelZ=d/2+.007;
    if(id==='sauvage'){
      const c=document.createElement('canvas');c.width=16;c.height=256;const cx=c.getContext('2d'),gr=cx.createLinearGradient(0,0,0,256);
      gr.addColorStop(0,'#090e12');gr.addColorStop(.65,'#102535');gr.addColorStop(1,'#466675');cx.fillStyle=gr;cx.fillRect(0,0,16,256);
      const map=new THREE.CanvasTexture(c);map.colorSpace=THREE.SRGBColorSpace;
      const body=physical('#ffffff',{map,roughness:.13,metalness:.15,clearcoat:1});
      profile(g,[[0,0],[w*.42,0],[w*.49,.045],[w*.5,h*.62],[w*.48,h*.7],[w*.31,h*.74],[0,h*.74]],body);
      cylinder(g,w*.46,.047,.028,glass);cylinder(g,w*.25,.07,h*.76,black);
      cylinder(g,w*.37,h*.23,h*.88,black);
      for(let i=0;i<4;i++){const ring=add(g,new THREE.TorusGeometry(w*.372,.004,5,32),black,0,h*(.79+i*.05));ring.rotation.x=Math.PI/2;}
      labelZ=w*.505;labelW=w*.77;labelH=h*.57;labelY=h*.4;
    }else if(id==='dior'){
      profile(g,[[0,0],[.1,.009],[.145,.04],[.173,.16],[.155,.26],[.1,.39],[.054,.53],[.037,.66]],tinted);
      profile(g,[[.1,.008],[.148,.035],[.17,.1],[.173,.16],[.155,.27],[.103,.39],[.056,.52],[.04,.66]],glass);
      cylinder(g,.044,.22,.64,gold,.055);
      for(let i=0;i<12;i++)cylinder(g,.049-i*.0003,.007,.545+i*.016,gold);
      const cap=add(g,new THREE.SphereGeometry(.06,24,20),gold,0,.79);cap.scale.y=1.3;
      labelZ=.169;labelW=.18;labelH=.23;labelY=.2;
    }else{
      const height=h*.72;
      const opaque=id==='delina'||id==='tom-ford';
      const body=opaque?physical(id==='delina'?'#d9aeb4':'#283735',{roughness:id==='delina'?.28:.13,metalness:id==='delina'?.05:.15}):glass;
      add(g,roundedBox(w,height,d,id==='delina'?.048:.028),body,0,height/2+.028,0,!body.transmission);
      if(!opaque)add(g,roundedBox(w-.055,height-.09,d-.046,.021),tinted,0,height/2+.019,0,false);
      add(g,roundedBox(w-.015,.055,d-.005,.013),opaque?body:glass,0,.031,0,false);
      cylinder(g,w*.14,.065,h*.77,id==='tom-ford'?black:gold);
      if(id==='chanel'){
        const cap=add(g,roundedBox(w*.53,h*.19,d*.84,.026),glass,0,h*.905,0,false);cap.rotation.y=Math.PI*.08;
        cylinder(g,.056,.08,h*.85,gold);
      }else if(id==='delina'){
        const cap=add(g,new THREE.SphereGeometry(w*.27,24,16),body,0,h*.91);cap.scale.set(1,.94,1);
        cylinder(g,w*.2,.034,h*.8,chrome);
        const cordMat=physical('#b98794',{roughness:.8,clearcoat:0});
        const cord=new THREE.CatmullRomCurve3([new THREE.Vector3(-.1,h*.77,.03),new THREE.Vector3(-.24,h*.68,.06),new THREE.Vector3(-.23,h*.41,.055)]);
        add(g,new THREE.TubeGeometry(cord,18,.009,5,false),cordMat,0,0);
        for(let j=0;j<4;j++)add(g,new THREE.CylinderGeometry(.009,.007,.11,5),cordMat,-.245+j*.012,h*.35,.055);
        const frame=add(g,new THREE.TorusGeometry(w*.3,.008,6,32),physical('#c695a0',{roughness:.35}),0,h*.38,d/2+.003);frame.scale.y=1.32;
        labelH=h*.53;labelW=w*.69;labelY=h*.41;
      }else if(id==='aventus'){
        cylinder(g,w*.25,h*.2,h*.88,black);cylinder(g,w*.251,.014,h*.794,chrome);
        labelW=w*.94;labelH=h*.41;labelY=h*.405;
      }else{
        const cap=add(g,roundedBox(id==='libre'?w*.62:w*.73,h*.23,d*.86,.016),id==='baccarat-rouge'?gold:black,0,h*.89);
        if(id==='libre'){cap.rotation.z=.09;labelW=w*.7;labelH=h*.67;labelY=h*.39;}
        if(id==='tom-ford'){
          labelW=w*.71;labelH=h*.48;labelY=h*.4;
          for(let i=0;i<9;i++)add(g,new THREE.BoxGeometry(.003,h*.65,.004),physical('#5b6d65',{metalness:.4,roughness:.3}),-w*.45+i*w*.112,h*.38,d/2);
        }
      }
      if(!opaque){const dip=add(g,new THREE.CylinderGeometry(.004,.004,height-.09,6),glass,0,height*.48,0,false);dip.rotation.z=-.04;}
    }
    const label=print(id,labelW,labelH);label.position.set(0,labelY,labelZ);g.add(label);
    const contact=new THREE.Mesh(new THREE.PlaneGeometry(w*1.8,w*1.3),new THREE.MeshBasicMaterial({map:contactTexture,transparent:true,opacity:.55,depthWrite:false,color:'#40352c'}));
    contact.rotation.x=-Math.PI/2;contact.position.y=.002;contact.userData.ignorePick=true;g.add(contact);
    g.traverse(o=>{if(o.isMesh&&!o.userData.ignorePick)o.userData.product=id;});cache.set(id,g);return g.clone();
  };
}
