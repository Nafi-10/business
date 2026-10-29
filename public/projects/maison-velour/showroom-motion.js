import { constrainPosition } from './showroom-data.js';

export const damp=(current,target,rate,dt)=>current+(target-current)*(1-Math.exp(-rate*dt));
export function stepWalk(position,velocity,input,yaw,dt) {
  const length=Math.hypot(input.forward,input.side)||1;
  const speed=2.1;
  const forward=input.forward/Math.max(1,length)*speed,side=input.side/Math.max(1,length)*speed;
  const moving=!!(input.forward||input.side),rate=moving?5.5:8;
  velocity.x=damp(velocity.x,-Math.sin(yaw)*forward+Math.cos(yaw)*side,rate,dt);
  velocity.z=damp(velocity.z,-Math.cos(yaw)*forward-Math.sin(yaw)*side,rate,dt);
  const steps=Math.max(1,Math.ceil(Math.hypot(velocity.x,velocity.z)*dt/.08));
  let next={x:position.x,z:position.z};
  for(let i=0;i<steps;i++){
    const dx=velocity.x*dt/steps,dz=velocity.z*dt/steps;
    const full=constrainPosition(next.x+dx,next.z+dz);
    if(full)next=full;
    else{
      const slideX=constrainPosition(next.x+dx,next.z),slideZ=constrainPosition(next.x,next.z+dz);
      if(slideX&&Math.abs(dx)>.000001)next=slideX;
      else if(slideZ&&Math.abs(dz)>.000001)next=slideZ;
    }
  }
  return next;
}
