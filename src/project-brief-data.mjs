export const services = {software:'Software',design:'UI/UX design',erp:'Custom ERP',ai:'Chatbot'};
export const sectors = {retail:'Retail & commerce',manufacturing:'Manufacturing',healthcare:'Healthcare',education:'Education',hospitality:'Hospitality',textile:'Textile',fashion:'Fashion designing',tourism:'Tourism',sports:'Sports',other:'Another industry'};
export const budgets = {'not-sure':'Not sure — help me scope it',under1000:'Under $1,000',from1000:'$1,000–$5,000',from5000:'$5,000–$15,000',over15000:'$15,000+'};
export const timelines = {flexible:'Flexible — let’s discuss',month:'Within a month',quarter:'In 1–3 months',later:'More than 3 months'};
const line = value => String(value ?? '').replace(/[\r\n]+/g,' ').trim();
export function normalizeBrief(value={}) {
  return Object.fromEntries(['service','industry','goal','existing','budget','timeline','name','email'].map(key=>[key,key==='goal'?String(value[key]??'').trim():line(value[key])]));
}
export function validateBriefStep(step, value={}) {
  const data=normalizeBrief(value), errors={};
  if(step===0){
    if(!Object.hasOwn(services,data.service))errors.service='Choose the service you need.';
    if(!Object.hasOwn(sectors,data.industry))errors.industry='Choose your industry.';
    if(data.goal.length<20||data.goal.length>1500)errors.goal='Describe your project in 20–1,500 characters.';
    if(data.existing.length>300)errors.existing='Keep your existing setup within 300 characters.';
  }
  if(step===1){
    if(!Object.hasOwn(budgets,data.budget))errors.budget='Choose a budget range, or select Not sure.';
    if(!Object.hasOwn(timelines,data.timeline))errors.timeline='Choose a desired timeline.';
  }
  if(step===2){
    if(data.name.length<2||data.name.length>100)errors.name='Enter your name (2–100 characters).';
    if(data.email.length>254||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))errors.email='Enter a valid email address.';
  }
  return errors;
}
export function formatBrief(value) {
  const d=normalizeBrief(value);
  return `Hello CanveliqSoft,\n\nI’d like to discuss a project.\n\nService: ${services[d.service]||d.service}\nIndustry: ${sectors[d.industry]||d.industry}\n\nProject goal:\n${d.goal}\n\nExisting setup: ${d.existing||'Not provided'}\nBudget: ${budgets[d.budget]||d.budget}\nDesired timeline: ${timelines[d.timeline]||d.timeline}\n\nName: ${d.name}\nEmail: ${d.email}\n\nPlease help me understand the scope and next steps.`;
}
export function briefEmailUrl(value) {
  return `mailto:kazijawadulislam@gmail.com?subject=${encodeURIComponent('Project enquiry — CanveliqSoft')}&body=${encodeURIComponent(formatBrief(value))}`;
}
