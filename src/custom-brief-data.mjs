// Shared client discovery questions. Keep service and industry answers separate.
export const services={
        software:{name:'Custom software', branch:'Product → users → key tasks → platform → operating needs', questions:[
          ['What are we building or improving?','New product, a tailored existing product, or replacement of an old system.'],
          ['Who uses it, and what are their top three tasks?','Role names and approximate user numbers; separate staff and customers.'],
          ['Where must it work?','Web, mobile, desktop; whether offline work or specific devices are needed.'],
          ['What should happen in one typical transaction?','Describe the trigger, actions and final result in plain language.'],
          ['What special operating needs matter?','Permissions, languages, peak usage or required reports; “Not sure” is allowed.']
        ], output:'A first version scope, user roles and a workflow to investigate.'},
        design:{name:'UI/UX design', branch:'Audience → user journey → screens → brand → deliverables', questions:[
          ['Is this a new design or a redesign?','Website, mobile app, dashboard or another interface; add its existing link if available.'],
          ['Who is the main audience, and where do they struggle?','Describe their task, language, device and any accessibility needs.'],
          ['Which journey matters most?','For example, first visit → compare → enquire or purchase.'],
          ['Which design work do you need?','Research, wireframes, visual design, clickable prototype, design system or a combination.'],
          ['What brand material and design references exist?','Logo, colours and example links; state what you like or dislike. Coding can be a separate requested service.']
        ], output:'A priority user journey, screen groups and proposed design deliverables.'},
        erp:{name:'Custom ERP', branch:'Departments → workflow → modules → data → rollout', questions:[
          ['Which departments and locations need to work together?','Teams, branches and approximate staff using the system.'],
          ['Describe one process from start to finish.','Who starts it, who approves it, what is recorded, and where work gets delayed.'],
          ['Which modules are essential for the first release?','Choose relevant modules; mark later additions separately.'],
          ['Where is your current information stored?','Excel, paper or existing applications; approximate data volume and migration needs.'],
          ['What access and rollout arrangements do you need?','Role-based permissions, approvals, pilot branch, training and hosting constraints; “Need advice” is allowed.']
        ], output:'A module map, workflow dependencies and migration questions for discovery.'},
        ai:{name:'Chatbot & automation', branch:'Audience → channel → knowledge → actions → human handoff', questions:[
          ['Who will use the chatbot, and for what purpose?','Customer enquiries, lead collection, staff knowledge or another defined job.'],
          ['Where should it operate, and in which languages?','Website, WhatsApp or another channel; Bangla, English or both.'],
          ['What approved information may it use?','FAQ pages, product catalogue or maintained documents; identify who keeps them current.'],
          ['Should it only answer, or also take actions?','Separate information answers, live lookups and actions such as booking; note approvals and sign-in needs.'],
          ['When should a person take over?','Questions it must not answer, low-confidence replies, handoff destination and approximate monthly conversations.']
        ], output:'A knowledge scope, conversation outline, integration list and human-handoff rules.'}
      };
      export const industries={
        retail:{name:'Retail & commerce',business:'Shop, online store, wholesaler or a combination; branches and approximate order volume.',workflow:'Enquiry → order → payment → fulfilment → return',
          software:[['Which selling channels and stock tasks matter?','POS, online orders, product variants, returns or warehouse picking.'],['How are payments and deliveries handled now?','Name current payment, courier and store systems; no account credentials.']],
          design:[['Which shopping journey needs the most attention?','Product discovery, product detail, cart, checkout or order tracking.'],['What catalogue and content must the design support?','Product variants, filters, offers, photography and desktop/mobile priorities.']],
          erp:[['What must stay in sync across locations?','Purchasing, suppliers, stock transfers, sales and accounts.'],['Who approves discounts, purchases and returns?','Describe approval rules and whether stock must update in real time.']],
          ai:[['Which shop questions should it handle?','Product discovery, availability, delivery policy and returns; distinguish static answers from live lookups.'],['May it access orders or create support requests?','Define customer verification and the handoff for refunds or exceptions.']],
          example:'“We enter online and shop sales separately, so stock counts disagree. We want one reliable stock view.”'},
        manufacturing:{name:'Manufacturing',business:'What you manufacture; factories, shifts and approximate work orders per month.',workflow:'Demand → materials → production → quality → dispatch',
          software:[['Which factory task should the software improve first?','Work orders, production tracking, maintenance or quality checks.'],['What conditions must shop-floor use support?','Shared devices, barcode readers, touchscreens or unreliable connectivity.']],
          design:[['Which roles need different interfaces?','Operators, planners, supervisors and quality inspectors.'],['What must be obvious at a glance?','Machine status, work instructions, exceptions or production progress; specify the devices used.']],
          erp:[['How do you plan materials and production?','Bills of materials, routing, work centres, capacity and work orders; examples can be anonymised.'],['Which records must connect to costing and traceability?','Batches or serials, quality checks, wastage, purchasing and dispatch.']],
          ai:[['Which approved factory knowledge can it search?','SOPs, equipment manuals, maintenance records or order documentation.'],['Should it retrieve status or suggest a next action?','Specify read-only access, roles and supervisor escalation; safety-critical decisions stay with authorised people.']],
          example:'“Material shortages appear after a work order starts. We need earlier visibility and a shared production plan.”'},
        healthcare:{name:'Healthcare',business:'Clinic, hospital, diagnostic centre or another provider; branches and approximate appointment volume.',workflow:'Enquiry → appointment → service administration → billing → follow-up',
          software:[['Which administrative tasks need improvement?','Scheduling, billing, stock or patient portal administration.'],['Who should be allowed to see each type of record?','Describe staff roles and access needs without submitting actual patient records.']],
          design:[['Whose journey are we designing?','Patient booking, reception, clinician administration or management.'],['Which access and readability needs must the interface support?','Mobile use, languages, larger text and assisted booking.']],
          erp:[['Which departments and administrative modules must connect?','Appointments, billing, supplies, finance or staff administration.'],['What existing systems and access rules must be considered?','Name integrations and organisational requirements; describe data types, not identifiable patient data.']],
          ai:[['Which non-clinical enquiries should the assistant answer?','Appointments, opening hours, locations and approved service information.'],['Which enquiries must go to staff immediately?','Define handoff for clinical questions; diagnosis and treatment advice are outside this proposed administrative scope.']],
          example:'“Reception manages bookings in several places. We want fewer scheduling conflicts and clearer appointment information.”'},
        education:{name:'Education',business:'School, university, training centre or online provider; campuses, courses and approximate student count.',workflow:'Enquiry → admission → learning administration → assessment → completion',
          software:[['Which student or staff tasks need a single system?','Attendance, courses, assignments, exams or fees.'],['What academic structure does it need to support?','Terms, classes, subjects, teacher roles and guardian access where relevant.']],
          design:[['Which journey comes first?','Admissions, course discovery, student portal or teacher workspace.'],['What different devices and user needs must be supported?','Students, guardians and staff; language, accessibility and low-bandwidth needs.']],
          erp:[['Which campus functions must share information?','Admissions, student records, scheduling, fees, library or staff administration.'],['What needs to move from existing systems?','Record categories, academic history and role permissions; use fictional examples.']],
          ai:[['Which approved educational information can it use?','Course information, deadlines, policies or learning resources.'],['Who handles account-specific or sensitive questions?','Define staff handoff and authenticated access rather than exposing student records.']],
          example:'“Students ask the same admission questions repeatedly. We need clearer answers and a way to route unusual enquiries.”'},
        hospitality:{name:'Hospitality',business:'Hotel, resort, restaurant or other operation; properties, rooms or tables and booking volume.',workflow:'Discovery → reservation → arrival → service → checkout',
          software:[['Which daily operations should it support?','Reservations, room status, housekeeping, restaurant POS or guest requests.'],['What availability and booking rules matter?','Room/table types, rates, cancellations and existing booking channels.']],
          design:[['Which guest journey needs attention?','Room discovery, booking, check-in or service requests.'],['What should the experience communicate?','Brand style, property photography, languages and mobile booking priorities.']],
          erp:[['Which systems and departments must connect?','Property management, restaurant POS, housekeeping, purchasing and finance.'],['How are properties, rates and stock managed?','Shared or separate records, approvals and management reports.']],
          ai:[['Which guest questions should it answer?','Approved property information, check-in rules, services and local recommendations.'],['Can it retrieve or change reservations?','Clarify authentication, live availability, permitted actions and staff handoff.']],
          example:'“Front desk and housekeeping use separate updates. We want staff to agree on room readiness.”'},
        textile:{name:'Textile',business:'Spinning, weaving, knitting, dyeing, garments or a combination; production sites and order volume.',workflow:'Buyer order → materials → production → quality → shipment',
          software:[['Which production stage is the first priority?','Yarn/fabric stock, job tracking, dye batches, cutting or dispatch.'],['What identifiers and measurements are used?','Rolls, lots, colours, widths, weights or units; sample formats can be fictional.']],
          design:[['Which production views need to be simpler?','Operator entry, planning board, quality checks or management reporting.'],['What device and language conditions apply?','Shop-floor screens, mobile use, shared terminals and readability.']],
          erp:[['Which materials and stages need traceability?','Yarn, fabric, dye lots, production batches, wastage and quality.'],['Which buyer and costing requirements affect the workflow?','Order specifications, approvals, consumption, subcontracting and shipment documentation.']],
          ai:[['Which product or process documents can it search?','Approved specifications, quality manuals, buyer FAQs or order information.'],['Which answers or actions need verification?','Access by role, live order status and human approval for process changes.']],
          example:'“We cannot easily trace a fabric roll back to its dye batch. We need connected lot and quality records.”'},
        fashion:{name:'Fashion Designing',business:'Design studio, label, boutique or apparel brand; collections, team size and sales channels.',workflow:'Concept → sample → approval → production → launch',
          software:[['Which collection tasks should the tool organise?','Design planning, sample tracking, made-to-order work or order management.'],['What variants and approvals do you manage?','Style, size, colour, measurements and client/sample approval stages.']],
          design:[['Which experience are we creating?','Editorial portfolio, lookbook, online shop or wholesale ordering.'],['What expresses the brand?','Art direction, typography, imagery and the key browsing or purchasing journey.']],
          erp:[['Which studio and commercial processes must connect?','Samples, sourcing, production, size/colour inventory, costing and sales.'],['What must be approved before production or launch?','Sample approval, supplier orders, quality and collection budgets.']],
          ai:[['What should the assistant help customers discover?','Approved catalogue information, size guides, availability or collection stories.'],['Which requests should a stylist or staff member take over?','Custom orders, uncertain fit, exceptions and actions needing confirmation.']],
          example:'“Sample approvals live in messages. We want one place to track decisions before production.”'},
        tourism:{name:'Tourism',business:'Travel agency, tour operator or experience provider; destinations and approximate bookings.',workflow:'Enquiry → itinerary → quote → booking → travel support',
          software:[['Which booking workflow is hardest to manage?','Itineraries, quotations, departures, travellers or supplier reservations.'],['Which dates and availability constraints matter?','Group capacity, seasonal pricing, supplier confirmations and cancellations.']],
          design:[['Where should the visitor journey lead?','Discover a destination, compare packages, request a custom trip or book.'],['What travel content must the interface present?','Itineraries, inclusions, availability, cancellation terms and mobile use.']],
          erp:[['Which travel-business records must connect?','Bookings, suppliers, guide assignments, commissions and accounts.'],['What financial and operational variations matter?','Currencies, deposits, group departures, refunds and supplier settlements.']],
          ai:[['Which approved trip information can it use?','Itineraries, package inclusions, availability sources and booking policies.'],['What must be confirmed by a travel adviser?','Custom itineraries, booking changes, uncertain availability and exceptional requests.']],
          example:'“Custom trip enquiries arrive without dates or group size. We need enough context to prepare a useful proposal.”'},
        sports:{name:'Sports',business:'Club, academy, gym, league or event organiser; venues and approximate member/event numbers.',workflow:'Join → schedule → participate → pay → renew',
          software:[['Which activities need better organisation?','Membership, registrations, coaching schedules, fixtures or event bookings.'],['Which people and resources must be scheduled?','Members, coaches, teams, venues and equipment.']],
          design:[['Which member journey is the priority?','Join, discover sessions, book a facility, register for an event or renew.'],['Which audiences and devices should the design serve?','Members, coaches, guardians and administrators; mobile and accessibility needs.']],
          erp:[['Which club operations must share records?','Membership fees, facilities, staff, events, equipment and finance.'],['What permissions and approval rules apply?','Team access, registrations, discounts, payments and management reporting.']],
          ai:[['Which club information should it answer from?','Approved timetables, membership rules, events and facility information.'],['When must it hand over to a person?','Account issues, safeguarding-related enquiries, exceptions and uncertain answers.']],
          example:'“Members miss schedule changes and call reception. We want one reliable source of session information.”'}
      };

export const steps=['Business & problem','Service requirements','Industry workflow','Scope & connections','Budget & timing','Contact & references','Review & submit'];
const field=(id,label,help='',options={})=>({id,label,help,type:'textarea',required:false,max:1600,...options});
const select=(id,label,options,help='')=>field(id,label,help,{type:'select',options,required:true});
export function emptyBrief({service='',industry=''}={}) {
  return {version:1,service:Object.hasOwn(services,service)?service:'',industry:Object.hasOwn(industries,industry)?industry:'',answers:{},consent:false};
}
export function fieldsForStep(step, value={}) {
  const s=Object.hasOwn(services,value.service)?services[value.service]:null;
  const i=Object.hasOwn(industries,value.industry)?industries[value.industry]:null;
  if(step===0)return [
    field('business','Your business or project name','An early-stage idea is welcome too.',{type:'text',required:true,max:120,min:2}),
    field('problem','What problem would you like to solve?','Describe one real situation. Where do customers struggle or work get delayed?',{required:true,min:20}),
    field('current','How do you handle it today?','People, paper, spreadsheets or existing tools.',{required:true,min:10}),
    field('outcome','What would a better result look like?','For example: everyone sees the same stock count, or customers can book without calling.',{required:true,min:10})
  ];
  if(step===1)return s?s.questions.map(([label,help],n)=>field(`service:${value.service}:${n}`,label,help,{required:n<4,uncertain:true,min:5})):[];
  if(step===2)return i&&s?[
    field(`industry:${value.industry}:${value.service}:0`,'Tell us about your operation',i.business,{required:true,min:5,uncertain:true}),
    ...(i[value.service]||[]).map(([label,help],n)=>field(`industry:${value.industry}:${value.service}:${n+1}`,label,help,{required:true,min:5,uncertain:true})),
    field(`industry:${value.industry}:${value.service}:3`,'Where does the process break down?','Describe a bottleneck, handoff or exception. “Need advice” is fine.',{required:true,min:5,uncertain:true})
  ]:[];
  if(step===3)return [
    field('priorities','Your first three priorities','What must work in the first release? List later ideas separately.',{required:true,min:10,uncertain:true}),
    field('integrations','What should it connect to?','Name the tools and what they do. Do not enter passwords or API keys.',{uncertain:true}),
    field('scale','Who needs access, and how often?','Approximate users, locations, conversations or workload.',{uncertain:true}),
    field('constraints','Anything we need to plan around?','Languages, devices, hosting, accessibility, security or internal requirements.',{uncertain:true})
  ];
  if(step===4)return [
    select('currency','Budget currency',[['BDT','BDT · Bangladeshi taka'],['USD','USD · US dollar'],['EUR','EUR · Euro'],['GBP','GBP · British pound'],['other','Another currency']]),
    field('budget','What investment are you considering?','A range with your currency, or “Not sure — help me scope it”. This is not a price commitment.',{type:'text',required:true,min:3,max:200,uncertain:true}),
    select('timeline','Your preferred timeline',[['flexible','Flexible — let’s discuss'],['month','Within a month'],['quarter','In 1–3 months'],['later','More than 3 months']]),
    field('deadline','Is there a reason for that timing?','Optional: a launch, event, season or other deadline.',{max:600}),
    field('decision','Who should be involved in discovery?','Roles or teams; tell us if a phased launch is possible.',{max:600,uncertain:true})
  ];
  if(step===5)return [
    field('name','Your name','',{type:'text',required:true,min:2,max:100,autocomplete:'name'}),
    field('email','Email address','We’ll use this to discuss your enquiry.',{type:'email',required:true,max:254,autocomplete:'email'}),
    field('phone','Phone / WhatsApp (optional)','Include country code if outside Bangladesh.',{type:'tel',max:40,autocomplete:'tel'}),
    select('channel','Preferred contact',[['email','Email'],['whatsapp','WhatsApp']], 'WhatsApp requires a phone number.'),
    select('language','Preferred language',[['english','English'],['bangla','Bangla'],['both','Either Bangla or English']]),
    field('references','Links or references (optional)','A public website, Figma link or example you like. Explain what is useful about it.',{max:1600}),
    field('confidential','Sharing preferences (optional)','Request a confidentiality discussion or mention restrictions before sharing sensitive material.',{max:600})
  ];
  return [];
}
const text=value=>typeof value==='string'?value.trim():'';
export function validateStep(step,draft={}) {
  const errors={};
  if(!Object.hasOwn(services,draft.service))errors.service='Choose the service you need.';
  if(!Object.hasOwn(industries,draft.industry))errors.industry='Choose your industry.';
  for(const f of fieldsForStep(step,draft)) {
    const value=text(draft.answers?.[f.id]);
    if(f.required&&!value)errors[f.id]='Please answer this question.';
    else if(value&&f.min&&value.length<f.min)errors[f.id]=`Please add a little more detail (at least ${f.min} characters).`;
    else if(value.length>f.max)errors[f.id]=`Please use no more than ${f.max} characters.`;
    else if(f.type==='select'&&value&&!f.options.some(([key])=>key===value))errors[f.id]='Choose one of the listed options.';
    else if(f.type==='email'&&value&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))errors[f.id]='Enter a valid email address.';
  }
  if(step===5&&draft.answers?.channel==='whatsapp'&&!/^\+?[\d\s()-]{7,40}$/.test(text(draft.answers?.phone)))errors.phone='Add a valid WhatsApp number, or choose email.';
  if(step===6&&draft.consent!==true)errors.consent='Please acknowledge how we use your brief.';
  return errors;
}
export function validateBrief(draft) {return Object.assign({},...steps.map((_,i)=>validateStep(i,draft)));}
export const safeAttachmentName=name=>name.split(/[\\/]/).pop().replace(/[^\p{L}\p{N} ._()-]/gu,'_').slice(-120);

export function submissionBrief(draft) {
  const next=emptyBrief(draft);next.consent=draft.consent===true;
  for(let step=0;step<6;step++)for(const f of fieldsForStep(step,next))next.answers[f.id]=text(draft.answers?.[f.id]);
  return next;
}
export function readDraft(raw) {
  try {
    const value=JSON.parse(raw);if(!value||value.version!==1||!value.answers||typeof value.answers!=='object'||Array.isArray(value.answers))return null;
    const next=emptyBrief(value);
    // Restore every valid branch so changing a selection doesn't erase previous work.
    const fields=new Map();for(const service of Object.keys(services))for(const industry of Object.keys(industries))for(let n=0;n<6;n++)for(const f of fieldsForStep(n,{service,industry}))fields.set(f.id,f);
    for(const [id,f] of fields){const v=text(value.answers[id]).slice(0,f.max);if(v&&(!f.options||f.options.some(([key])=>key===v)))next.answers[id]=v;}
    return next;
  }catch{return null;}
}
export function summaryGroups(draft) {
  return steps.slice(0,6).map((title,step)=>({title,step,fields:fieldsForStep(step,draft).map(f=>({label:f.label,value:f.options?.find(([key])=>key===draft.answers?.[f.id])?.[1]||text(draft.answers?.[f.id])||'Not provided'}))}));
}
export function formatCustomBrief(draft) {
  return `CANVELIQSOFT · PROJECT BRIEF\nService: ${services[draft.service]?.name||''}\nIndustry: ${industries[draft.industry]?.name||''}\n\n`+summaryGroups(draft).map(g=>g.title.toUpperCase()+'\n'+g.fields.map(f=>f.label+'\n'+f.value).join('\n\n')).join('\n\n──────────\n\n');
}
