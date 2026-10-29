export function createQuoteRotation({count,interval=3000,onChange,schedule=setTimeout,cancel=clearTimeout}){
  let index=0,timer=null,running=false;
  const queue=()=>{timer=schedule(()=>{timer=null;if(!running)return;index=(index+1)%count;onChange(index);if(running)queue();},interval);};
  const stop=()=>{running=false;if(timer!==null){cancel(timer);timer=null;}};
  return {get index(){return index;},get running(){return running;},start(){if(running)return;running=true;queue();},stop,go(value){stop();index=((value%count)+count)%count;onChange(index);}};
}
