export const defaults = Object.freeze({width:24,length:45,height:6,bay:7.5,slope:10,system:'clear',units:'m',view:'roof',endFrame:'rigid',frameColor:'#176184',roofColor:'#d7dfe3',wallColor:'#9aafb9',doors:0,windows:0,leanTo:false,canopy:false,crane:false,mezzanine:false,exploded:false,dimensions:true});
export const systems = {clear:'Clear span',multi:'Multi-span',gable:'Multi-gable',mono:'Single slope'};
export const presets = [
 {name:'Workshop',width:18,length:30,height:6,system:'clear'},
 {name:'Warehouse',width:24,length:45,height:6,system:'clear'},
 {name:'Factory with crane',width:30,length:60,height:9,system:'clear',crane:true},
 {name:'Multi-span store',width:48,length:90,height:8,system:'multi'},
 {name:'Multi-gable shed',width:40,length:60,height:7,system:'gable'},
 {name:'Single-slope shed',width:12,length:30,height:4.5,system:'mono'}
];
const numeric=(value,fallback,min,max)=> value==='' || !Number.isFinite(Number(value)) ? fallback : Math.min(max,Math.max(min,Number(value)));
export function normalize(input={}) {
 const c={...defaults};
 for(const [key,min,max] of [['width',6,60],['length',10,120],['height',3,15],['doors',0,3],['windows',0,8]]) c[key]=numeric(input[key]??defaults[key],defaults[key],min,max);
 c.doors=Math.round(c.doors); c.windows=Math.round(c.windows);
 for(const key of ['system','units','view','endFrame']) { const values={system:Object.keys(systems),units:['m','ft'],view:['frame','roof','complete'],endFrame:['rigid','post']}[key]; c[key]=values.includes(input[key])?input[key]:defaults[key]; }
 for(const key of ['bay','slope']) c[key]=({bay:[5,6,7.5,10],slope:[5,10,15,20]}[key]).includes(Number(input[key]))?Number(input[key]):defaults[key];
 for(const key of ['frameColor','roofColor','wallColor']) c[key]=/^#[0-9a-f]{6}$/i.test(input[key]??'')?input[key]:defaults[key];
 for(const key of ['leanTo','canopy','crane','mezzanine','exploded','dimensions']) c[key]=typeof input[key]==='boolean'?input[key]:defaults[key];
 c.doors=openingLayout(c).doors.length;
 return c;
}
export function metrics(c) {
 const bays=Math.ceil(c.length/c.bay),spacing=c.length/bays;
 const rise=c.width/(c.system==='mono'?1:c.system==='gable'?4:2)/c.slope;
 return {area:c.width*c.length,bays,frames:bays+1,spacing,ridge:c.height+rise,positions:Array.from({length:bays+1},(_,i)=>-c.length/2+i*spacing)};
}
export function roofPoints(c) {
 const w=c.width/2,h=c.height,r=metrics(c).ridge;
 return c.system==='mono'?[[-w,h],[w,r]]:c.system==='gable'?[[-w,h],[-w/2,r],[0,h],[w/2,r],[w,h]]:[[-w,h],[0,r],[w,h]];
}
export const toDisplay=(v,u)=>u==='ft'?v/0.3048:v;
export const fromDisplay=(v,u)=>u==='ft'?v*0.3048:v;
export const fmt=(v,d=1)=>new Intl.NumberFormat('en',{maximumFractionDigits:d}).format(v);
export function openingLayout(c){
 const w=c.width/2,l=c.length/2,columns=[-w,w];
 if(c.system==='multi'||c.system==='gable')columns.push(0);
 if(c.endFrame==='post')columns.push(-w/2,w/2);
 columns.sort((a,b)=>a-b);
 const gaps=columns.slice(1).map((x,i)=>({start:columns[i]+.45,end:x-.45,count:0}));
 for(let i=0;i<c.doors;i++){const gap=gaps.filter(g=>(g.end-g.start-.4*g.count)/(g.count+1)>=1.2).sort((a,b)=>(b.end-b.start)/(b.count+1)-(a.end-a.start)/(a.count+1))[0];if(!gap)break;gap.count++;}
 const doors=gaps.flatMap(g=>Array.from({length:g.count},(_,i)=>({center:g.start+(g.end-g.start)*(i+.5)/g.count,width:Math.min(4,(g.end-g.start)/g.count-.4),height:Math.min(4.3,c.height-.65)})));
 const m=metrics(c),windows=[];
 for(const side of [1,-1]){
  const count=side===1?Math.ceil(c.windows/2):Math.floor(c.windows/2),bays=Array.from({length:m.bays},(_,i)=>i),available=bays.length>2?bays.slice(1,-1):bays,allocation=new Map();
  for(let i=0;i<count;i++){const bay=available[Math.min(available.length-1,Math.floor((i+.5)*available.length/count))];allocation.set(bay,(allocation.get(bay)||0)+1);}
  for(const [bay,n]of allocation){const start=m.positions[bay]+.45,end=m.positions[bay+1]-.45,width=Math.min(2.6,(end-start)/n-.3),bottom=Math.min(2.7,c.height*.45),height=Math.min(1.3,c.height-bottom-.4);for(let i=0;i<n;i++){const center=start+(end-start)*(i+.5)/n;windows.push({side,bay,start:center-width/2,end:center+width/2,center,width,bottom,height});}}
 }
 return {doors,windows};
}
export function quoteText(c,customer={}) {
 const m=metrics(c);
 const extras=[c.leanTo?'Lean-to (4 m wide)':'',c.canopy?'Front canopy (3 m projection)':'',c.crane?'Overhead crane (indicative; capacity to be confirmed)':'',c.mezzanine?'Mezzanine (rear 35% of building)':''].filter(Boolean);
 return ['CANVELIQSOFT — BUILDING DESIGN BRIEF','',`Customer: ${customer.name||'Not supplied'}`,`Project location: ${customer.site||'Not supplied'}`,'',`Framing: ${systems[c.system]}`,`Width: ${fmt(c.width,3)} m`, `Length: ${fmt(c.length,3)} m`,`Eave height: ${fmt(c.height,3)} m`,`Ridge height: ${fmt(m.ridge,2)} m`,`Roof slope: 1:${c.slope}`,`Floor area: ${fmt(m.area)} m²`,`Bays: ${m.bays} at ${fmt(m.spacing,3)} m (requested maximum ${c.bay} m)`,`Frames: ${m.frames}`,`End frames: ${c.endFrame==='rigid'?'Rigid frame':'Post and beam'}`,`Frame colour: ${c.frameColor}`,`Roof colour: ${c.roofColor}`,`Wall colour: ${c.wallColor}`,`Display: ${c.view}`,`Doors: ${c.doors} front roller door(s)`,`Windows: ${c.windows} side window(s)`,`Extras: ${extras.join('; ')||'None'}`,'',`Notes: ${customer.notes||'None'}`,'','Concept only. Member sizes, foundations, loads, crane capacity and final quotation require engineering review.','This brief is prepared for sharing. It has not been sent to CanveliqSoft.'].join('\n');
}
