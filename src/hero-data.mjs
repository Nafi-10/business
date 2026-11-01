export const modules=[
 {id:'software',name:'Software',detail:'Tools for the work your team does every day.'},
 {id:'design',name:'UI/UX',detail:'Clear interfaces shaped around real workflows.'},
 {id:'erp',name:'ERP',detail:'People, processes and information in sync.'},
 {id:'ai',name:'AI',detail:'Helpful automation for repetitive work.'}
];

const preview=(name,accent,headline,description,primary,board,metrics,flow,resources,resourcesPct,qualityNames,quality,side)=>({name,accent,headline,description,primary,...board,metrics,flow,resources,resourcesPct,quality:{total:quality[0],label:quality[1],names:qualityNames,values:quality[2].map(item=>item[1])},side,software:{title:board.boardTitle,detail:description},erp:{title:board.flowTitle,detail:flow.map(([step])=>step).join(' → ')},ai:{title:side[2],detail:side[3]}});
export const industryPreviews={
 retail:preview('Retail & commerce','#54e5ef',['Every order and inventory','in sync.'],'Bring products, orders and customer service into one clearer retail workflow.','Explore retail solutions',{snapshotTitle:'Store operations',snapshotCopy:'Orders and stock, together in view.',boardContext:'Retail workspace',boardTitle:'Store overview',flowTitle:'Order fulfillment'},[
  ['Open orders','128',76],['To fulfill','34',58],['Ready to ship','62',72],['Low stock','8',22]
 ],[['Order placed','38'],['Picking','24'],['Packing','18'],['In transit','32'],['Delivered','46']],['Apparel','Homeware','Beauty','Accessories'],[86,74,63,91],['Stock health','Order accuracy','Returns','Reorder'],['42','checks',[['On track','26'],['Review','11'],['Follow-up','5']]],['Inventory','A live view of your products and stock.','Assist AI','Help customers find the right item.']),
 manufacturing:preview('Manufacturing','#aa8eff',['Production, people and progress —','connected.'],'Connect work orders, materials and quality checks across your entire operation. Software designed for modern manufacturing teams.','Explore manufacturing solutions',{snapshotTitle:'Production',snapshotCopy:'Manage work orders, routings and shop floor activity.',boardContext:'Manufacturing workspace',boardTitle:'Production overview',flowTitle:'Work order flow'},[
  ['Work orders','48',76],['In progress','26',58],['Completed','16',67],['On hold','6',23]
 ],[['Planned','12 orders'],['Materials','10 orders'],['In production','20 orders'],['Quality check','8 orders'],['Completed','16 orders']],['Aluminum','Electronics','Fasteners','Plastics'],[92,78,64,88],['Pass','In inspection','Rework'],['24','in inspection',[['Pass','18'],['In inspection','24'],['Rework','4']]],['Materials','Track inventory, components and material availability.','Quality','Manage inspections, checkpoints and compliance.']),
 healthcare:preview('Healthcare','#57dce9',['Care teams and schedules','connected.'],'Bring appointments, teams and everyday workflows into one clear workspace for your care organization.','Explore healthcare solutions',{snapshotTitle:'Care operations',snapshotCopy:'Appointments and teams in one view.',boardContext:'Healthcare workspace',boardTitle:'Care team overview',flowTitle:'Appointment coordination'},[
  ['Appointments','48',76],['To confirm','12',43],['Team handoffs','9',68],['Open requests','6',26]
 ],[['Requested','12 visits'],['Scheduled','18 visits'],['Team assigned','10 visits'],['In progress','6 visits'],['Complete','14 visits']],['Care teams','Departments','Supplies','Schedules'],[84,91,68,76],['Confirmed','In progress','Needs follow-up'],['36','items',[['Confirmed','24'],['In progress','8'],['Follow-up','4']]],['Team handoffs','Keep schedules and teams connected.','Care requests','Help visitors find the right next step.']),
 education:preview('Education','#a991ff',['Campus life, clearly','connected.'],'Coordinate courses, campus services and everyday administration in one helpful workspace.','Explore education solutions',{snapshotTitle:'Campus services',snapshotCopy:'A clearer day across campus.',boardContext:'Education workspace',boardTitle:'Campus overview',flowTitle:'Student service flow'},[
  ['Open requests','64',76],['In progress','21',54],['Resolved','38',72],['Needs review','5',19]
 ],[['Submitted','18 cases'],['Assigned','14 cases'],['In progress','21 cases'],['Review','7 cases'],['Resolved','38 cases']],['Admissions','Classrooms','Resources','Accounts'],[88,81,72,94],['Resolved','In progress','Needs review'],['64','requests',[['Resolved','38'],['In progress','21'],['Review','5']]],['Campus services','Help teams coordinate student requests.','Campus guide','Help students find useful information.']),
 hospitality:preview('Hospitality','#51d6ef',['Every stay, thoughtfully','connected.'],'Keep reservations, guest requests and property teams moving together through every stay.','Explore hospitality solutions',{snapshotTitle:'Guest operations',snapshotCopy:'Every request has a clear next step.',boardContext:'Hospitality workspace',boardTitle:'Property overview',flowTitle:'Guest service flow'},[
  ['Reservations','86',76],['Arrivals today','24',58],['Requests open','9',34],['Rooms ready','72',89]
 ],[['Booked','28 stays'],['Arrival prep','16 stays'],['Checked in','24 stays'],['In service','9 stays'],['Departed','31 stays']],['Guest requests','Housekeeping','Reservations','Supplies'],[82,91,76,69],['Ready','In progress','Needs attention'],['86','stays',[['Ready','58'],['In progress','21'],['Follow-up','7']]],['Guest services','Route requests to the right team.','Guest guide','Help guests find answers and amenities.'])
};

export const previewFor=id=>Object.hasOwn(industryPreviews,id)?industryPreviews[id]:industryPreviews.retail;
export function motionPolicy({reduced=false,compact=false,saveData=false}={}){const light=reduced||compact||saveData;return {webgl:!light,ambient:!light,intro:!light};}
export function assemblyPose(index,progress){
 const t=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0,eased=1-(1-t)**3;
 const destination=[index&1?.5:-.5,index&2?.5:-.5,index&4?.5:-.5];
 const direction=[index&1?1:-1,index&2?-1:1,index&4?1:-1];
 const position=destination.map((value,axis)=>value+direction[axis]*(1-eased)*(1.2+axis*.15));
 const rotation=eased===1?[0,0,0]:[.8,-.65,.55].map((value,axis)=>value*direction[axis]*(1-eased));
 return {position,rotation};
}
export function scrollPose(progress){
 const t=Number.isFinite(progress)?Math.max(0,Math.min(1,progress)):0;
 return {scale:1-t*.24,rotation:t*.16};
}
