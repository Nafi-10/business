// Illustrative catalogue. These are concepts, not live products or promises of availability.
export const sectors = [
  {id:'retail',name:'Retail & commerce',line:'Every sale. One connected experience.',icon:'store',image:'retail',modules:['Inventory','Orders','Customers'],names:['StockFlow','Commerce UI Kit','Retail ERP','Shop Assist AI','OrderDesk'],descriptions:['Inventory and stock, in one clear view.','A considered storefront, from browse to bag.','End-to-end retail operations. Together.','A helpful first conversation for your shoppers.','A clearer view of every customer order.']},
  {id:'manufacturing',name:'Manufacturing',line:'Production, people and progress. Connected.',icon:'factory',image:'manufacturing',modules:['Production','Materials','Quality'],names:['FactoryFlow','Factory UI Kit','Manufacturing ERP','Operations AI','QualityTrack'],descriptions:['Production planning for the factory floor.','Clear interfaces for complex operations.','Connect every stage of production.','Find answers across your operations.','Keep quality checks in the same place.']},
  {id:'healthcare',name:'Healthcare',line:'Thoughtful tools for better care.',icon:'heart-pulse',image:'healthcare',modules:['Appointments','Patients','Services'],names:['ClinicDesk','Care UI Kit','Healthcare ERP','Appointment AI','Patient Portal'],descriptions:['A calmer view of clinic administration.','Thoughtful healthcare interface concepts.','Bring your administrative workflows together.','Help visitors navigate appointment enquiries.','A considered patient service experience.']},
  {id:'education',name:'Education',line:'A smarter space to learn and grow.',icon:'graduation-cap',image:'education',modules:['Courses','Students','Schedule'],names:['LearnSpace','Campus UI Kit','Education ERP','Learning Assistant','Student Portal'],descriptions:['Bring learning resources into focus.','Modern interfaces for campus life.','Connect academic administration.','Help students find the right resources.','One place for the student journey.']},
  {id:'hospitality',name:'Hospitality',line:'Behind every stay, a seamless experience.',icon:'hotel',image:'hospitality',modules:['Reservations','Rooms','Guests'],names:['StaySuite','Booking UI Kit','Hospitality ERP','Concierge AI','GuestDesk'],descriptions:['A clear overview of your property.','A welcoming journey from browse to booking.','Your property and operations, connected.','Guide guests through common questions.','Make every guest interaction count.']},
  {id:'textile',name:'Textile',line:'From fibre to finished product.',icon:'layers',modules:['Production','Materials','Dispatch'],names:['LoomFlow','Textile UI Kit','Textile ERP','Textile Assistant','InventoryDesk'],descriptions:['Follow production from yarn to delivery.','Considered tools for textile workflows.','Bring material and production plans together.','Find information across your workspace.','Keep materials and stock in view.']},
  {id:'fashion',name:'Fashion Designing',line:'Bring your next collection to life.',icon:'scissors',modules:['Collections','Samples','Orders'],names:['StudioFlow','Fashion UI Kit','Fashion ERP','Style Assistant','Lookbook Studio'],descriptions:['Plan your next creative collection.','Editorial interfaces with a signature feel.','Connect studio and business operations.','Explore your catalogue through conversation.','Give every collection its own story.']},
  {id:'tourism',name:'Tourism',line:'Make every journey feel effortless.',icon:'plane',modules:['Bookings','Itineraries','Travellers'],names:['TourDesk','Travel UI Kit','Tourism ERP','Travel Assistant','BookingFlow'],descriptions:['Keep tour planning beautifully organised.','An inviting start to the next adventure.','Connect your travel business workflows.','Help travellers discover their next step.','A clearer path from enquiry to booking.']},
  {id:'sports',name:'Sports',line:'Your club. Your team. One workspace.',icon:'trophy',modules:['Members','Events','Schedule'],names:['ClubFlow','Sports UI Kit','Sports ERP','Team Assistant','EventDesk'],descriptions:['Bring your club administration together.','Digital experiences with team spirit.','Connect club and team operations.','Help members find club information.','Plan the moments that bring people together.']},
];
export const categories = {software:'Software',design:'UI/UX kit',erp:'Custom ERP',ai:'AI & chatbots'};
const kinds=['software','design','erp','ai','software'];
const suffixes=['software','design','erp','ai','workspace'];
export const products=sectors.flatMap(sector=>sector.names.map((name,index)=>({
  id:`${sector.id}-${suffixes[index]}`,name,industry:sector.id,industryName:sector.name,
  category:kinds[index],label:categories[kinds[index]],description:sector.descriptions[index],modules:sector.modules,
  features:kinds[index]==='design'?['Desktop and mobile layout concepts','Reusable interface components','Typography and colour direction']:kinds[index]==='ai'?['Business knowledge and FAQ planning','Conversation and escalation design','Integration scoping for your workflow']:[`${sector.modules[0]} overview`,`${sector.modules[1]} workspace`,`${sector.modules[2]} reporting`],
  delivery:kinds[index]==='design'?'Design files and handover, agreed to your brief.':kinds[index]==='ai'?'Configured integration, knowledge scope and usage limits agreed before work.':kinds[index]==='erp'?'A custom system with agreed modules, implementation and handover.':'Delivery format, installation and access to be confirmed for your needs.',
})));
const clean=text=>String(text??'').normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
export function filterCollection({industry='all',category='all',query='',savedOnly=false,saved=[]}={}){
  const words=clean(query).split(/\s+/).filter(Boolean),set=new Set(saved);
  return products.filter(p=>(industry==='all'||p.industry===industry)&&(category==='all'||p.category===category)&&(!savedOnly||set.has(p.id))&&words.every(word=>clean(`${p.name} ${p.industryName} ${p.label} ${p.description} ${p.modules.join(' ')}`).includes(word)));
}
export function carouselItems(items,selected){
  const n=items.length;if(!n)return [];
  const center=Math.floor(n/2);
  return Array.from({length:n},(_,i)=>items[((selected-center+i)%n+n)%n]);
}
export function collectionInquiry(id){
  const p=products.find(p=>p.id===id);if(!p)return null;
  return {service:p.category,industry:p.industry,goal:`I would like to discuss ${p.name} for ${p.industryName}. Please help me confirm the scope, availability and next steps.`};
}
export function readSaved(raw){
  try{const value=JSON.parse(raw);return Array.isArray(value)?[...new Set(value.filter(id=>products.some(p=>p.id===id)))]:[];}catch{return [];}
}
