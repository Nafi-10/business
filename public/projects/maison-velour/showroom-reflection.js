import * as THREE from './vendor/three/three.module.js';

// A low-resolution, softly filtered floor reflection. Updated only when the view changes.
export function createFloorReflection(scene,renderer,floor) {
  const target=new THREE.WebGLRenderTarget(640,640,{type:THREE.HalfFloatType,depthBuffer:true});
  const reflected=new THREE.PerspectiveCamera(),matrix=new THREE.Matrix4();
  const bias=new THREE.Matrix4().set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1);
  const direction=new THREE.Vector3(),look=new THREE.Vector3();
  const mat=new THREE.ShaderMaterial({
    uniforms:{reflectionMap:{value:target.texture},reflectionMatrix:{value:matrix}},
    vertexShader:`uniform mat4 reflectionMatrix;varying vec4 reflectionUV;varying vec3 eyeDirection;
      void main(){vec4 world=modelMatrix*vec4(position,1.0);reflectionUV=reflectionMatrix*world;eyeDirection=cameraPosition-world.xyz;gl_Position=projectionMatrix*viewMatrix*world;}`,
    fragmentShader:`uniform sampler2D reflectionMap;varying vec4 reflectionUV;varying vec3 eyeDirection;
      void main(){vec2 uv=reflectionUV.xy/reflectionUV.w;vec3 color=texture2D(reflectionMap,uv).rgb*.2;
        color+=texture2D(reflectionMap,uv+vec2(.004,.003)).rgb*.2;color+=texture2D(reflectionMap,uv-vec2(.004,.003)).rgb*.2;
        color+=texture2D(reflectionMap,uv+vec2(-.003,.004)).rgb*.2;color+=texture2D(reflectionMap,uv+vec2(.003,-.004)).rgb*.2;
        float fresnel=pow(1.0-abs(normalize(eyeDirection).y),3.0);gl_FragColor=vec4(color,.045+fresnel*.12);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`,
    transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1
  });
  const plane=new THREE.Mesh(new THREE.PlaneGeometry(12,21),mat);plane.rotation.x=-Math.PI/2;plane.position.y=.018;plane.userData.ignorePick=true;scene.add(plane);
  let width=0,height=0;
  return {
    update(camera){
      const size=renderer.getSize(new THREE.Vector2()),scale=Math.min(1,640/size.x,640/size.y);
      const w=Math.max(1,Math.round(size.x*scale)),h=Math.max(1,Math.round(size.y*scale));
      if(w!==width||h!==height){target.setSize(w,h);width=w;height=h;}
      camera.getWorldDirection(direction);look.copy(camera.position).add(direction);look.y=-look.y;
      reflected.position.copy(camera.position);reflected.position.y=-camera.position.y;
      reflected.up.set(0,-1,0);reflected.lookAt(look);reflected.projectionMatrix.copy(camera.projectionMatrix);reflected.updateMatrixWorld();
      matrix.copy(bias).multiply(reflected.projectionMatrix).multiply(reflected.matrixWorldInverse);
      const current=renderer.getRenderTarget(),shadowUpdate=renderer.shadowMap.autoUpdate;
      plane.visible=false;floor.visible=false;renderer.shadowMap.autoUpdate=false;
      renderer.setRenderTarget(target);renderer.render(scene,reflected);renderer.setRenderTarget(current);
      plane.visible=true;floor.visible=true;renderer.shadowMap.autoUpdate=shadowUpdate;
    },
    dispose(){plane.geometry.dispose();mat.dispose();target.dispose();}
  };
}
