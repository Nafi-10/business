// Maison-curated demo combinations, not official manufacturer gift sets or live offers.
export const giftSets=[
  {id:'romantic',name:'The Romantic',product:'delina',price:32500,contents:'Delina · 75 ml Eau de Parfum',extra:'Signature box + personal message',recipients:['her','couples'],moods:['floral','fresh'],occasions:['wedding','anniversary','birthday','parents'],label:'THE SIGNATURE EDIT',hero:true},
  {id:'midnight',name:'The Midnight Collection',product:'sauvage',price:24000,contents:'Sauvage · 100 ml Parfum',extra:'Cocoa box + personal message',recipients:['him','couples'],moods:['woody','fresh'],occasions:['eid','birthday','parents','corporate'],label:'AFTER DARK'},
  {id:'free-spirit',name:'The Free Spirit',product:'libre',price:19500,contents:'Libre · 90 ml Eau de Parfum',extra:'Signature box + personal message',recipients:['her','couples'],moods:['floral','sweet'],occasions:['wedding','birthday','thank-you','eid'],label:'A BEAUTIFUL BEGINNING'},
  {id:'golden',name:'The Grand Gesture',product:'baccarat-rouge',price:45000,contents:'Baccarat Rouge 540 · 70 ml Eau de Parfum',extra:'Velvet box + personal message',recipients:['her','him','couples','family'],moods:['woody','floral','sweet'],occasions:['wedding','anniversary','eid'],label:'THE EXTRAORDINARY'},
  {id:'discovery',name:'The Little Discovery',product:'libre',price:2500,contents:'3 × 2 ml fragrance samples',extra:'Libre, Delina & Sauvage · sample box',recipients:['her','him','family'],moods:['fresh','floral'],occasions:['birthday','parents','corporate','thank-you','eid'],label:'A FIRST ENCOUNTER',samples:3},
  {id:'rose-edit',name:'The Floral Letters',product:'delina',price:5500,contents:'3 × 5 ml fragrance samples',extra:'Delina, Libre & Baccarat Rouge 540',recipients:['her','couples','family'],moods:['floral','sweet'],occasions:['wedding','anniversary','parents','thank-you'],label:'IN FULL BLOOM',samples:3},
  {id:'evening',name:'The Evening Ritual',product:'baccarat-rouge',price:9500,contents:'3 × 5 ml fragrance samples',extra:'Oud Wood, Sauvage & Baccarat Rouge 540',recipients:['him','couples','family'],moods:['woody','oud'],occasions:['eid','anniversary','corporate','parents'],label:'WARMTH & DEPTH',samples:3},
  {id:'aventus-gift',name:'The Quiet Confidence',product:'aventus',price:38000,contents:'Aventus · 100 ml Eau de Parfum',extra:'Signature box + personal message',recipients:['him','couples'],moods:['fresh','woody'],occasions:['birthday','corporate','wedding','parents'],label:'A LASTING IMPRESSION'}
];
export const occasions=[
  {id:'eid',name:'Eid & festivities',line:'Scents for celebration.',image:'baccarat-rouge.webp'},
  {id:'wedding',name:'Wedding & Gaye Holud',line:'For beautiful beginnings.',image:'gifting-hero.webp'},
  {id:'anniversary',name:'For my love',line:'A little closer, always.',image:'delina.webp'},
  {id:'birthday',name:'Birthday wishes',line:'Their day. Their signature.',image:'libre.webp'},
  {id:'parents',name:'For Mom & Dad',line:'For everything they are.',image:'chanel.webp'},
  {id:'corporate',name:'Thoughtful business',line:'A gracious way to say thank you.',image:'tom-ford.webp'},
  {id:'thank-you',name:'Just because',line:'No occasion needed.',image:'dior.webp'}
];
export const fragrances=[
  {id:'delina',name:'Delina',brand:'Parfums de Marly',size:'75 ml EDP',price:31000},
  {id:'libre',name:'Libre',brand:'Yves Saint Laurent',size:'90 ml EDP',price:18000},
  {id:'sauvage',name:'Sauvage',brand:'Dior',size:'100 ml Parfum',price:22500},
  {id:'baccarat-rouge',name:'Baccarat Rouge 540',brand:'Maison Francis Kurkdjian',size:'70 ml EDP',price:43500},
  {id:'aventus',name:'Aventus',brand:'Creed',size:'100 ml EDP',price:36500}
];
export const boxStyles={ivory:{name:'Signature ivory',price:1500},black:{name:'Matte black',price:1500},velvet:{name:'Cocoa velvet',price:2200}};
export const minis={none:{name:'No extra, thank you',price:0},libre:{name:'Libre · 5 ml sample',price:1500},sauvage:{name:'Sauvage · 5 ml sample',price:1800},delina:{name:'Delina · 5 ml sample',price:2500}};
export const ribbons={champagne:'#d4bb8a',cocoa:'#644b3e',rose:'#aa7b78'};
export const money=value=>'৳'+Number(value).toLocaleString('en-BD',{maximumFractionDigits:0});
export function matchesGift(gift,{recipient='all',budget='all',mood='all',occasion='all'}={}){
  const ranges={under:[0,3000],thoughtful:[3000,7000],special:[7000,15000],luxury:[15000,Infinity]};
  const range=ranges[budget];
  return (recipient==='all'||gift.recipients.includes(recipient))&&(mood==='all'||gift.moods.includes(mood))&&(occasion==='all'||gift.occasions.includes(occasion))&&(!range||(gift.price>=range[0]&&gift.price<range[1]));
}
export function builderTotal({fragrance='delina',mini='none',box='ivory'}={}){
  const p=fragrances.find(p=>p.id===fragrance);
  if(!p||!Object.hasOwn(minis,mini)||!Object.hasOwn(boxStyles,box))throw new Error('Please select a fragrance, mini and box from the available choices.');
  return p.price+minis[mini].price+boxStyles[box].price;
}
export function giftCardAmount(value){const n=Number(value);return Number.isInteger(n)&&n>=1000&&n<=100000?n:null;}
export function localDate(){const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-');}
