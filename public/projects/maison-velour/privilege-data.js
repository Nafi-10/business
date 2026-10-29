import {fragrances,money} from './gifting-data.js';
import {offerCampaign} from './offers-data.js';
export {money,fragrances};
export const campaignId='october-2026';
export const isActive=(now=Date.now())=>now<Date.parse(offerCampaign.endsAt);
export const offers=[
  {id:'libre',product:'libre',original:18000,discount:15,category:'seasonal',label:'PRIVILEGE PRICE'},
  {id:'delina',product:'delina',original:31000,discount:20,category:'seasonal',label:'THE ROSE EDIT'},
  {id:'discovery',product:'libre',name:'The First Encounter',brand:'MAISON SAMPLING EDIT',size:'3 × 2 ml boutique samples',description:'Libre, Delina & Sauvage · a curated sample concept',original:2500,discount:20,category:'gifts',label:'A LITTLE DISCOVERY',samples:true},
  {id:'baccarat-rouge',product:'baccarat-rouge',original:43500,discount:10,category:'seasonal',label:'THE EVENING EDIT'},
  {id:'sauvage',product:'sauvage',original:22500,discount:15,category:'last',label:'LAST PIECES · PREVIEW'},
  {id:'wardrobe',product:'delina',name:'The Scent Wardrobe',brand:'MAISON SAMPLING EDIT',size:'3 × 5 ml boutique samples',description:'Delina, Libre & Baccarat Rouge 540 · sample concept',original:6500,discount:10,category:'gifts',label:'A GIFT OF DISCOVERY',samples:true}
];
export const milestones=[
  {amount:5000,title:'Beautifully wrapped',benefit:'Complimentary gift wrap'},
  {amount:8000,title:'A little discovery',benefit:'A 10 ml discovery vial'},
  {amount:12000,title:'The complete gesture',benefit:'Express delivery + premium gift box'}
];
export const revealRewards={
  wrap:{title:'The art of presentation',benefit:'Complimentary signature gift wrap',code:'DEMO-WRAP',detail:'A beautifully wrapped beginning. Preview benefit on an eligible fragrance order.'},
  vial:{title:'A little something more',benefit:'A complimentary discovery sample',code:'DEMO-DISCOVER',detail:'A 2 ml boutique sample to discover a different side of scent. Fragrance selected by the maison.'},
  welcome:{title:'A warm welcome',benefit:'A 5% first-order privilege',code:'DEMO-WELCOME',detail:'A first-order code concept. Cannot be combined with pair prices or other offers.'}
};
export function priceFor(offer,now=Date.now()){return isActive(now)?Math.round(offer.original*(100-offer.discount)/100):offer.original;}
export function pairQuote(first,second,now=Date.now()){
  const a=fragrances.find(p=>p.id===first),b=fragrances.find(p=>p.id===second);
  if(!a||!b||first===second)throw new Error('Choose two different fragrances.');
  const original=a.price+b.price,total=isActive(now)?Math.round(original*.9):original;
  return {original,total,saving:original-total};
}
export function normalizeBag(value){
  if(!Array.isArray(value))return [];
  const keys=new Set(),valid=[];
  for(const item of value){
    if(!item||typeof item.key!=='string'||!item.key.length||item.key.length>80||keys.has(item.key))continue;
    if(item.type==='product'&&offers.some(p=>p.id===item.id))valid.push({key:item.key,type:'product',id:item.id});
    else if(item.type==='pair'){
      try{pairQuote(item.first,item.second);valid.push({key:item.key,type:'pair',first:item.first,second:item.second});}catch{continue;}
    }else continue;
    keys.add(item.key);if(valid.length===100)break;
  }
  return valid;
}
export function bagTotal(bag,now=Date.now()){
  return normalizeBag(bag).reduce((total,item)=>total+(item.type==='pair'?pairQuote(item.first,item.second,now).total:priceFor(offers.find(p=>p.id===item.id),now)),0);
}
export function rewardProgress(total){
  total=Number.isFinite(total)?Math.max(0,total):0;
  const unlocked=milestones.filter(m=>total>=m.amount),next=milestones.find(m=>total<m.amount);
  return {unlocked,next,remaining:next?next.amount-total:0,percent:Math.min(100,total/12000*100)};
}
export function readReveal(raw){
  try{
    const state=JSON.parse(raw);
    if(!state||state.campaign!==campaignId||!Number.isInteger(state.choice)||state.choice<0||state.choice>2||!Object.hasOwn(revealRewards,state.reward)||typeof state.claimed!=='boolean')return null;
    return {campaign:campaignId,choice:state.choice,reward:state.reward,claimed:state.claimed};
  }catch{return null;}
}
