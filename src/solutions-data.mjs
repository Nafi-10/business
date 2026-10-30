// Illustrative catalog for the storefront preview; no live licenses or payments.
export const industries = [
  ['retail','Retail & commerce'], ['manufacturing','Manufacturing'],
  ['healthcare','Healthcare'], ['education','Education'], ['hospitality','Hospitality'],
  ['textile','Textile'], ['fashion','Fashion Designing'], ['tourism','Tourism'], ['sports','Sports'],
];
const everyIndustry = industries.map(([id]) => id);
export function solutionDetailId(productId,industry='all'){
  const category=new Map([['industry-erp','erp'],['assist-ai','ai']]).get(productId);
  if(category)return `${everyIndustry.includes(industry)?industry:'retail'}-${category}`;
  return new Map([['stockflow','retail-software'],['commerce-ui','retail-design']]).get(productId)||null;
}
export const products = [
  {
    id:'stockflow', name:'StockFlow', category:'software', label:'Ready-made software',
    description:'Inventory, orders and sales. Together.', tags:['Retail','Web app'],
    price:'$49', billing:'/ month', priceDetail:'Illustrative monthly subscription. Final plans and inclusions are not yet published.',
    action:'View product', preview:'Try demo', delivery:'Hosted web app',
    industries:['retail','manufacturing','hospitality','textile','fashion'], goals:['inventory','operations'],
    summary:'A sample workspace that brings stock levels, customer orders and sales into one clear view.',
    features:['Inventory overview with low-stock alerts','Order tracking and sales summaries','A shared workspace for daily operations'],
    includes:'Planned access to a hosted dashboard. Hosting, account limits and onboarding will be confirmed with the final product.',
    support:'Support and update terms to be confirmed before purchase.',
    availability:'Interactive preview',
    licence:'Planned account access. User, business and usage limits will be confirmed with the final plan; source-code ownership is not implied.',
    requirements:'Intended for a modern web browser and an internet connection. Final device support and any data-migration requirements must be confirmed.',
    costs:'Confirm subscription limits, hosting, setup and any optional migration charges before ordering.',
    searchTerms:'stock inventory orders sales dashboard operations web app',
  },
  {
    id:'commerce-ui', name:'Commerce UI Kit', category:'design', label:'UI/UX design kit',
    description:'A thoughtful start for your next store.', tags:['Editable files','Design system'],
    price:'$79', billing:'one-time', priceDetail:'Illustrative one-time price for a design kit; development is a separate service.',
    action:'View product', preview:'Preview', delivery:'Editable design files',
    industries:['retail','fashion'], goals:['experience'],
    summary:'An example commerce design collection, from product discovery through checkout, with desktop and mobile layouts.',
    features:['Storefront, product and checkout screen concepts','Reusable typography, color and component styles','Editable layouts for a consistent shopping journey'],
    includes:'Planned editable Figma files and component styles. Final screen count and commercial license will be specified before sale.',
    support:'Customization and development can be discussed separately.',
    availability:'Design preview',
    licence:'Commercial-use, client-project and redistribution permissions will be stated in the final licence. A preview does not grant a licence.',
    requirements:'Planned for Figma. Confirm the file format, required tools, included assets and any paid fonts or plugins before purchase.',
    costs:'The example price is for a design kit. Development, hosting and custom design work are separate unless expressly included.',
    searchTerms:'figma ui ux design kit template editable storefront mobile screens',
  },
  {
    id:'industry-erp', name:'Industry ERP', category:'erp', label:'Custom ERP',
    description:'Your teams. One connected workspace.', tags:['Modular','Custom-built'],
    price:'Tailored quote', billing:'', priceDetail:'Quoted after reviewing your workflow, modules, users, integrations and deployment needs.',
    action:'View details', preview:'Configure ERP', delivery:'Scoped implementation',
    industries:everyIndustry, goals:['operations','inventory'],
    summary:'Plan a connected business system around your industry. Explore a sample module configuration before discussing your requirements.',
    features:['Select finance, inventory, people and production modules','Map permissions and approvals to your workflow','Discuss migration, integrations and reporting'],
    includes:'An agreed project scope, implementation milestones and handover deliverables. This preview does not generate a binding quote.',
    support:'Training, maintenance and hosting are agreed as part of the project scope.',
    availability:'Custom project',
    licence:'Ownership, source-code access, third-party licences and permitted use are defined in the project agreement.',
    requirements:'Deployment, integrations, data migration and access controls are assessed against your existing workflow before scope is agreed.',
    costs:'Your proposal identifies implementation, hosting, integrations, training and ongoing support costs.',
    searchTerms:'erp enterprise finance inventory production accounting human resources business operations custom',
  },
  {
    id:'assist-ai', name:'Assist AI', category:'ai', label:'Chatbot & automation',
    description:'Helpful conversations. Less busywork.', tags:['Website chat','Automation'],
    price:'$99', billing:'/ month', priceDetail:'Illustrative monthly price. Setup, message allowances and model/provider usage charges are not yet finalized.',
    action:'View product', preview:'Try chatbot', delivery:'Website integration',
    industries:everyIndustry, goals:['support','experience'],
    summary:'Explore a chatbot concept for answering common questions and helping visitors find their next step.',
    features:['Answers shaped around an approved knowledge base','Guided product discovery and contact handoff','Conversation flows designed for your business'],
    includes:'Planned website chat integration. Supported channels and integrations will be confirmed during scoping.',
    support:'Knowledge updates, usage limits and ongoing maintenance to be agreed.',
    availability:'Scripted preview',
    licence:'Business use, data access and third-party provider terms must be agreed for the deployed solution.',
    requirements:'The current example is a local scripted preview. A live bot needs an agreed channel, approved knowledge content and the relevant service connections.',
    costs:'Confirm setup fees, message allowances, model/provider charges and maintenance. These are not finalized in the example price.',
    searchTerms:'ai chatbot chat bot customer support assistant automation knowledge website',
  },
];

const searchWords = value => String(value ?? '').normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim().split(/\s+/).filter(Boolean);
export function searchProducts(query = '') {
  const terms = searchWords(query);
  if (!terms.length) return [...products];
  return products.filter(product => {
    const industryNames = industries.filter(([id]) => product.industries.includes(id)).map(([,name]) => name).join(' ');
    const words = searchWords([product.name, product.label, product.category, product.tags.join(' '), product.searchTerms, industryNames].join(' '));
    return terms.every(term => words.some(word => word === term || (term.length >= 3 && word.startsWith(term))));
  });
}

export function filterProducts({industry='all',category='all',goal='all'} = {}) {
  return products.filter(product =>
    (industry === 'all' || product.industries.includes(industry)) &&
    (category === 'all' || product.category === category) &&
    (goal === 'all' || product.goals.includes(goal))
  );
}

export function demoReply(message) {
  const text = String(message).toLowerCase();
  if (/person|human|contact|help me|advice/.test(text)) return 'You can use the project advice link below to connect with CanveliqSoft. This demo does not send a message or book a meeting.';
  if (/order|track|delivery/.test(text)) return 'In this sample conversation, order #CS-1042 is out for delivery. This is demo data; I cannot look up real orders.';
  if (/erp|price|cost|quote/.test(text)) return 'Industry ERP uses a tailored quote based on your modules and workflow. The catalog prices are illustrative; discuss your requirements for confirmed pricing.';
  if (/design|kit|figma/.test(text)) return 'The Commerce UI Kit concept includes editable store, product and checkout layouts. Final files and license terms will be confirmed before it is available.';
  return 'This is a scripted demo of Assist AI. Try asking about order tracking, ERP pricing, design files or speaking to a person. No messages leave this preview.';
}
