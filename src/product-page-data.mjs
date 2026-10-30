import { products } from './collection-data.mjs';

export const detailSections = [
  ['overview','Overview'],['preview','Product preview'],['fit','Is this for you?'],
  ['outcomes','What gets easier'],['included',"What’s included"],['day','A day with it'],
  ['delivery','How we deliver'],['investment','Investment'],['trust','Good to know'],['next','Your next step'],
];
export const savedKey = 'canveliqsoft-collection-saved';
export const fitOptions = {
  team: {'1-5':'1–5 people','6-20':'6–20 people','21+':'More than 20 people','not-sure':'Not sure yet'},
  website: {yes:'Yes',no:'No',planned:'Being planned'},
  priority: {clarity:'Clearer daily work',experience:'A better customer experience',connected:'Connected operations',support:'Customer support'},
};
const aliases = new Map([['stockflow','retail-software'],['commerce-ui','retail-design'],['industry-erp','retail-erp'],['assist-ai','retail-ai']]);
const contexts = {
  retail:{audience:'independent shops and growing retail teams',problems:['Too many spreadsheets','Orders hard to follow','Reorders left too late'],outcomes:['See stock at a glance.','Follow each order.','Spot what needs restocking.'],story:['Receive stock','Make a sale','Check stock'],item:'Ceramic mug',unit:'in stock',map:['Inventory','Sales','Finance','People']},
  manufacturing:{audience:'factories and production teams',problems:['Work orders in separate files','Material shortages found late','Quality checks hard to follow'],outcomes:['See the production plan.','Keep materials in view.','Follow each quality check.'],story:['Plan a work order','Assign materials','Review progress'],item:'Material batch',unit:'available',map:['Production','Materials','Quality','Finance']},
  healthcare:{audience:'clinics and healthcare administration teams',problems:['Appointment lists in separate tools','Service enquiries piling up','Administrative handovers getting missed'],outcomes:['See the appointment schedule.','Organise service enquiries.','Keep administrative work connected.'],story:['Receive an enquiry','Reserve a time','Update the schedule'],item:'Appointment slots',unit:'available',map:['Appointments','Services','Billing','People']},
  education:{audience:'schools, training providers and campus teams',problems:['Course information scattered','Enrolments tracked manually','Timetable changes hard to share'],outcomes:['Find learning resources.','Follow student administration.','Keep the schedule visible.'],story:['Open enrolment','Reserve a place','Update the course list'],item:'Course places',unit:'available',map:['Courses','Students','Schedule','Finance']},
  hospitality:{audience:'hotels, guesthouses and property teams',problems:['Reservations in separate tools','Room status hard to follow','Guest requests getting missed'],outcomes:['See availability clearly.','Keep the team informed.','Follow every guest request.'],story:['Review availability','Record a reservation','Update room status'],item:'Room nights',unit:'available',map:['Reservations','Rooms','Guests','Finance']},
  textile:{audience:'textile producers and material teams',problems:['Material records scattered','Production stages hard to track','Dispatch updates arriving late'],outcomes:['See materials in one place.','Follow production stages.','Keep dispatch plans connected.'],story:['Receive material','Assign a batch','Review remaining stock'],item:'Fabric rolls',unit:'available',map:['Materials','Production','Dispatch','Finance']},
  fashion:{audience:'fashion studios and collection teams',problems:['Sample notes scattered','Collection plans in separate files','Order handovers hard to track'],outcomes:['Keep collection plans together.','Follow samples and approvals.','See customer orders clearly.'],story:['Plan a collection','Reserve sample material','Review studio capacity'],item:'Sample units',unit:'available',map:['Collections','Samples','Orders','Finance']},
  tourism:{audience:'tour operators and travel teams',problems:['Booking details scattered','Itinerary updates hard to share','Traveller enquiries piling up'],outcomes:['See upcoming bookings.','Keep itineraries organised.','Give travellers a clear next step.'],story:['Create a departure','Reserve places','Review availability'],item:'Tour places',unit:'available',map:['Bookings','Itineraries','Travellers','Finance']},
  sports:{audience:'clubs, sports organisations and event teams',problems:['Member information scattered','Event registrations tracked manually','Schedule changes hard to share'],outcomes:['Keep member records together.','Follow event registrations.','Share a clearer schedule.'],story:['Open an event','Reserve places','Review remaining capacity'],item:'Event places',unit:'available',map:['Members','Events','Schedule','Finance']},
};
const typeContent = {
  software:{tagline:'Daily work, made clear.',audience:null,
    included:['Shared overview','Team records','Activity reports'],notIncluded:['Payment processing','Custom integrations unless scoped','Data migration unless agreed'],
    timeline:{steps:['Discover','Configure','Test','Handover'],range:'1–3 weeks',details:['Confirm your workflow, users and delivery format.','Set up the agreed modules and sample records.','Review key tasks together before using real data.','Receive documentation and an agreed onboarding session.']},
    pricing:{amount:'$29–$79',suffix:'/ month',label:'Illustrative subscription range',summary:'Team size, locations and integrations shape the price.',drivers:['Number of users and locations','Hosting and delivery format','Data migration and integrations']},
    licence:'Business access and usage limits are agreed before purchase. A subscription does not automatically transfer source-code ownership.',support:'Onboarding, updates and support hours are confirmed with your plan.',requirements:'A modern browser and internet access for the hosted option. Installation and migration requirements are confirmed before purchase.'},
  design:{tagline:'A clearer experience, on every screen.',audience:'teams that want a coherent digital experience',
    included:['Desktop & mobile layouts','Key workflow screens','Reusable interface components'],notIncluded:['Live payments','Hosting and backend development','Third-party asset licences unless agreed'],
    timeline:{steps:['Discover','Design','Adapt','Handover'],range:'2–4 weeks',details:['Agree the audience, key journeys and screen list.','Review the visual direction and a representative screen.','Adapt the agreed layouts and interactive states.','Receive the agreed files, component notes and walkthrough.']},
    pricing:{amount:'$300–$900',suffix:'',label:'Illustrative adaptation budget',summary:'One-time project. Screens and interactions shape the quote.',drivers:['Number of screens and responsive layouts','Custom components and interactive states','File format and handover scope']},
    licence:'Permitted use, client work and redistribution rights are defined in the agreement. Third-party images, brands and fonts retain their own rights.',support:'Handover guidance is agreed with the project. Ongoing design changes are scoped separately.',requirements:'Source format and tools are agreed before delivery. Figma handover must be scoped; an existing Figma file is not implied by this preview.'},
  erp:{tagline:'Your business, connected.',audience:null,
    included:['Your agreed modules','Team roles & reports','Training & documentation'],notIncluded:['Unscoped integrations','Hardware and third-party subscriptions','Unlimited support'],
    timeline:{steps:['Discover','Design','Build','Handover'],range:'6–12 weeks',details:['Map workflows, users, existing systems and the first launch priority.','Agree the module map, access roles and delivery milestones.','Review staged demos, integrations and acceptance tests.','Agree migration, training, deployment and ongoing support.']},
    pricing:{amount:'$3,000–$12,000',suffix:'',label:'Illustrative project range',summary:'Modules, migration and integrations shape the quote.',drivers:['Modules, users and business locations','Data quality and migration effort','Integrations, hosting and support scope']},
    licence:'Ownership, permitted use, source-code access and third-party licences are defined in your project agreement.',support:'Training, maintenance, hosting and response expectations are agreed as part of a separate support scope.',requirements:'Discovery confirms hosting, access controls, integrations and the data migration plan. No live business data is needed for this concept preview.'},
  ai:{tagline:'Clear answers. A human when needed.',audience:'teams answering the same questions every day',
    included:['Approved FAQ knowledge','Bangla & English','Website chat & human handover'],notIncluded:['Guaranteed accuracy','Unlimited messages or provider usage','Custom channels unless scoped'],
    timeline:{steps:['Discover','Design','Test','Handover'],range:'2–4 weeks',details:['Agree the channel, customer questions and approved knowledge.','Design answers, consent and handover paths.','Test both languages and responses outside the approved scope.','Set up documentation, monitoring responsibilities and escalation.']},
    pricing:{amount:'$49–$199',suffix:'/ month',label:'Illustrative service range',summary:'Setup and AI usage are scoped separately.',drivers:['Message volume and AI provider costs','Channels and business-system integrations','Knowledge updates and language testing']},
    licence:'Business use and third-party provider terms are agreed before deployment. This scripted preview does not connect to an AI service.',support:'Knowledge updates, monitoring, escalation and maintenance are agreed before launch.',requirements:'A supported website or agreed channel, approved business information and relevant integration access. Data collection and retention need an agreed policy.'},
};

export function getProductDetail(id) {
  const record=products.find(p=>p.id===(aliases.get(id)||id));
  if(!record)return null;
  const c=contexts[record.industry],t=typeContent[record.category];
  const p={...record,...t,audience:`For ${t.audience||c.audience}.`,problems:[...c.problems],outcomes:[...c.outcomes],story:[...c.story],status:'Concept preview',modules:[...record.modules],map:[...c.map],demo:{item:c.item,unit:c.unit,initial:24,change:3},credit:'',project:null,
    promise:record.description,related:products.filter(x=>x.industry===record.industry&&x.id!==record.id&&x.category!==record.category).slice(0,2).map(x=>x.id)};
  if(record.category==='software')p.included=[`${record.modules[0]} overview`,`${record.modules[1]} records`,`${record.modules[2]} reports`];
  if(record.category==='design'){
    p.problems=['An inconsistent visual identity','Key tasks hard to find','A mobile experience that needs care'];
    p.outcomes=['Make a strong first impression.','Help people find their next step.','Keep every screen consistent.'];
    p.story=['Discover','Explore the details','Take the next step'];
  }
  if(record.category==='erp'){
    p.audience=`For ${c.audience} with several teams or locations.`;
    p.problems=['Disconnected departments','Repeated data entry','Reports that arrive late'];
    p.outcomes=['See the whole business.','Connect every handover.','Work from shared information.'];
    p.story=[`New ${record.modules[0].toLowerCase()} activity`,'Update the shared workspace','Review the report'];
  }
  if(record.category==='ai'){
    p.promise='Help customers in Bangla and English using approved information.';
    p.problems=['Repeated customer questions','Visitors waiting for guidance','Enquiries needing a human'];
    p.outcomes=['Make answers easy to find.','Guide people to the right information.','Hand complex questions to a person.'];
    p.story=['Ask','Get guidance','Human handover'];
  }
  if(id==='stockflow'||record.id==='retail-software')Object.assign(p,{tagline:'Stock and orders, made clear.',promise:'See what you have, what sold, and what needs restocking.',included:['Inventory & orders','Customer records','Low-stock alerts']});
  if(record.id==='retail-workspace')Object.assign(p,{tagline:'Every order. A clear next step.',promise:'Follow orders from enquiry through preparation and handover.',story:['Receive an order','Prepare the items','Mark it complete'],outcomes:['See the orders that need attention.','Follow each handover.','Keep your team informed.'],included:['Order overview','Status tracking','Customer order history']});
  if(record.id==='retail-erp')Object.assign(p,{promise:'Bring inventory, sales and accounts into one workspace.',story:['New order','Stock reserved','Accounts updated'],related:['retail-software','retail-ai']});
  if(record.id==='retail-ai')p.related=['retail-design','retail-erp'];
  if(record.id==='retail-design')Object.assign(p,{tagline:'The Maison Velour edition.',status:'Real project · Demo',credit:'Original design & development by Kazi Jawad.',promise:'A considered storefront, from the first impression to the shopping bag.',audience:'For boutique stores that want a polished shopping experience.',problems:['A distinctive storefront','Easy product discovery','A consistent mobile experience'],outcomes:['Make a strong first impression.','Help shoppers find the right product.','Keep every screen consistent.'],included:['Desktop & mobile layouts','Collection & product pages','Wishlist, bag & gifting flows'],story:['Browse','Explore a product','Build a bag'],related:['retail-erp','retail-ai'],project:{name:'Maison Velour',url:'./projects/maison-velour/',image:'./assets/maison-velour/storefront.jpg',mobile:'./assets/maison-velour/mobile.jpg',collection:'./assets/maison-velour/collection.jpg',gifting:'./assets/maison-velour/gifting.jpg'}});
  return p;
}
export function productDetailUrl(id){const p=getProductDetail(id);return p?`./product.html?id=${encodeURIComponent(p.id)}`:'./collection.html';}
export function normalizeFit(value={}){return Object.fromEntries(Object.entries(fitOptions).map(([key,options])=>[key,Object.hasOwn(options,value[key])?value[key]:'']));}
export function productInquiry(id,answers={}){
  const p=getProductDetail(id);if(!p)return null;
  const fit=normalizeFit(answers);
  const lines=[`I would like to discuss ${p.name} for ${p.industryName}. Please help me confirm scope, availability and next steps.`];
  for(const [key,label] of [['team','Team size'],['website','Have a website'],['priority','My priority']])if(fit[key])lines.push(`${label}: ${fitOptions[key][fit[key]]}.`);
  return {service:p.category,industry:p.industry,goal:lines.join('\n')};
}
export function productBriefUrl(id,answers={}){
  const p=getProductDetail(id);if(!p)return './index.html#cs-contact';
  const params=new URLSearchParams({collection:p.id});
  for(const [key,value] of Object.entries(normalizeFit(answers)))if(value)params.set(key,value);
  return `./index.html?${params}#cs-contact`;
}
export function fitResult(id,answers){
  const p=getProductDetail(id),fit=normalizeFit(answers);
  if(!p||Object.values(fit).some(v=>!v))return null;
  if(p.industry==='healthcare')return {title:'Let’s start with a discovery conversation.',note:'We’ll confirm the administrative scope, data requirements and appropriate safeguards together.'};
  if(p.category==='ai'&&fit.website!=='yes')return {title:'A little planning comes first.',note:'We’ll choose a website or another suitable channel before scoping the assistant.'};
  return {title:'This could be a good fit. Let’s talk.',note:'Your answers are ready for the brief. We’ll confirm the right scope together.'};
}
export function sampleReply(id,text,language='en'){
  const p=getProductDetail(id),bn=language==='bn',q=String(text).slice(0,500).toLowerCase();
  if(!p||p.category!=='ai')return '';
  if(p.industry==='healthcare'&&/medicine|diagnos|symptom|treat|pain|ওষুধ|ব্যথা|চিকিৎসা/.test(q))return bn?'এই নমুনা সহকারী চিকিৎসা পরামর্শ দেয় না। অনুগ্রহ করে একজন চিকিৎসকের সঙ্গে যোগাযোগ করুন।':'This sample assistant cannot give medical or clinical advice. Please contact a qualified healthcare professional.';
  if(/order|track|অর্ডার/.test(q))return bn?'অর্ডারের তথ্য দেখতে সংযুক্ত সিস্টেম দরকার। আমি টিমের সঙ্গে যোগাযোগের পথ দেখাতে পারি।':'Order tracking needs a connected system or integration. This sample has no order access, but you can contact the team.';
  if(/deliver|shipping|ডেলিভারি/.test(q))return bn?'এটি নমুনা কথোপকথন, তাই ডেলিভারির সময় নিশ্চিত করতে পারি না। প্রকৃত তথ্যের জন্য টিমের সঙ্গে যোগাযোগ করুন। কোনো তথ্য পাঠানো হয়নি।':'A live assistant could check your approved delivery guide. This sample cannot confirm delivery dates or send an enquiry.';
  if(/price|cost|দাম/.test(q))return bn?'চূড়ান্ত মূল্য কাজের পরিধি অনুযায়ী নিশ্চিত করা হবে। অনুগ্রহ করে টিমের সঙ্গে কথা বলুন।':'Final pricing depends on the agreed scope. Ask the team to confirm a suitable plan or quote.';
  return bn?'এই প্রশ্নটি টিমের সঙ্গে আলোচনা করা ভালো। নিচের যোগাযোগের বাটন ব্যবহার করতে পারেন।':'A person on the team can help with that. Use the contact option below. This is a scripted sample, not a live agent.';
}
