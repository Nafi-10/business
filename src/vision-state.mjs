export const industries = {
  retail: {label:'Retail & commerce', operation:'Orders', detail:'From storefront to fulfilment.', item:'Storefront'},
  manufacturing: {label:'Manufacturing', operation:'Production', detail:'From materials to the finished product.', item:'Production'},
  healthcare: {label:'Healthcare', operation:'Appointments', detail:'A clearer view of the care journey.', item:'Appointments'},
  education: {label:'Education', operation:'Courses', detail:'Connected learning, from enrolment onward.', item:'Courses'},
  hospitality: {label:'Hospitality', operation:'Reservations', detail:'Thoughtful experiences for every guest.', item:'Reservations'}
};
export const services = {
  software:{label:'Ready-made software',short:'Software',description:'Useful from day one.',features:[
    {id:'inventory',label:'Inventory',icon:'package',copy:'Stock, orders and everyday operations.'},
    {id:'sales',label:'Sales & CRM',icon:'chart-no-axes-combined',copy:'Leads, conversations and your pipeline.'},
    {id:'team',label:'Team projects',icon:'users',copy:'Tasks, milestones and shared progress.'},
    {id:'reports',label:'Reporting',icon:'chart-column',copy:'See the reporting tools across the catalogue.'}
  ]},
  design:{label:'UI/UX design',short:'UI/UX design',description:'Considered in every detail.',features:[
    {id:'website',label:'Website',icon:'panels-top-left',copy:'An expressive home for your business.'},
    {id:'mobile',label:'Mobile app',icon:'smartphone',copy:'A clear experience in the palm of your hand.'},
    {id:'dashboard',label:'Dashboard',icon:'layout-dashboard',copy:'Complex information, made intuitive.'},
    {id:'prototype',label:'Interactive prototype',icon:'mouse-pointer-2',copy:'Explore the journey before development.'}
  ]},
  erp:{label:'Custom ERP',short:'Custom ERP',description:'Your business, connected.',features:[
    {id:'inventory',label:'Inventory',icon:'package',copy:'Materials and availability in one place.'},
    {id:'operations',label:'Operations',icon:'workflow',copy:'The workflow at the heart of your industry.'},
    {id:'finance',label:'Finance',icon:'chart-pie',copy:'Connect transactions with the bigger picture.'},
    {id:'people',label:'People',icon:'users',copy:'Teams, responsibilities and shared work.'}
  ]}
};
const products=[
  {name:'StockFlow',category:'operations',feature:'inventory',description:'Inventory & sales',icon:'package'},
  {name:'Orbit CRM',category:'sales',feature:'sales',description:'Leads & pipeline',icon:'chart-no-axes-combined'},
  {name:'Teamly',category:'teams',feature:'team',description:'Projects & collaboration',icon:'users'}
];
export function createVision(){return {service:'erp',industry:'manufacturing',selections:{erp:['inventory','operations'],design:['website','prototype'],software:['inventory','sales']}};}
export function changeVision(state, action){
  if(action.type==='service' && services[action.value])return {...state,service:action.value};
  if(action.type==='industry' && industries[action.value])return {...state,industry:action.value};
  if(action.type!=='feature'||!services[state.service].features.some(f=>f.id===action.value))return state;
  const current=state.selections[state.service];
  const removing=current.includes(action.value);
  if((removing&&current.length===1)||(!removing&&current.length===3))return state;
  return {...state,selections:{...state.selections,[state.service]:removing?current.filter(id=>id!==action.value):[...current,action.value]}};
}
export function featureOptions(state){return services[state.service].features.map(f=>f.id==='operations'?{...f,label:industries[state.industry].operation}:f);}
export function selectedFeatures(state){return state.selections[state.service].map(id=>featureOptions(state).find(f=>f.id===id));}
export function matchingProducts(state){return products.filter(p=>state.selections.software.includes(p.feature)||state.selections.software.includes('reports'));}
export function visionBrief(state){return `Service: ${services[state.service].label}\nIndustry: ${industries[state.industry].label}\nPriorities: ${selectedFeatures(state).map(f=>f.label).join(', ')}\n\nI would like to explore this vision with CanveliqSoft.`;}
