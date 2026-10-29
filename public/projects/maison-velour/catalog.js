import { arrivalProducts } from './arrivals-data.js';

export const heroProducts = [
  { id:'chanel',brand:'Chanel',name:'Coco Mademoiselle',type:'Eau de Parfum',subtitle:'The modern classic',notes:'Orange · Jasmine · Patchouli',tags:['For Her','Oriental / Amber','Woody','Fresh / Citrus'],source:'https://www.chanel.com/us/fragrance/p/116520/coco-mademoiselle-eau-de-parfum-spray/' },
  { id:'dior',brand:'Dior',name:'J’adore',type:'Eau de Parfum',subtitle:'An ode to golden florals',notes:'Ylang-ylang · Rose · Jasmine',tags:['For Her','Floral'],source:'https://www.dior.com/en_int/beauty/products/j%E2%80%99adore-eau-de-parfum-Y0998031.html' },
  { id:'tom-ford',brand:'Tom Ford',name:'Oud Wood',type:'Eau de Parfum',subtitle:'An understated obsession',notes:'Cardamom · Oud · Sandalwood',tags:['For Him','Unisex','Woody'],source:'https://www.tomfordbeauty.com/product/oud-wood-eau-de-parfum' }
];
const newHouses = [
  {id:'bal-dafrique',brand:'Byredo',name:'Bal d’Afrique',type:'Eau de Parfum',size:'100 ml',notes:'Bergamot · Violet · Vetiver',tags:['Unisex','Woody','Fresh / Citrus'],description:'Bright bergamot, delicate violet and textured vetiver. A luminous composition with an easy, sun-warmed elegance.'},
  {id:'philosykos',brand:'Diptyque',name:'Philosykos',type:'Eau de Parfum',size:'75 ml',notes:'Fig leaves · Fig tree wood · Black pepper',tags:['Unisex','Woody','Fresh / Citrus'],description:'A walk beneath a fig tree: green leaves, warm wood and a gently spicy accent. A fragrant invitation to linger.'},
  {id:'wood-sage-sea-salt',brand:'Jo Malone London',name:'Wood Sage & Sea Salt',type:'Cologne',size:'100 ml',notes:'Ambrette seeds · Sea salt · Sage',tags:['Unisex','Woody','Fresh / Citrus'],description:'Sea air meets earthy sage and the soft touch of ambrette. An open, windswept scent with a beautifully relaxed spirit.'},
  {id:'santal-33',brand:'Le Labo',name:'Santal 33',type:'Eau de Parfum',size:'100 ml',notes:'Cardamom · Iris · Sandalwood',tags:['Unisex','Woody'],description:'A distinctive conversation between aromatic cardamom, powdery iris and sandalwood. Warm, textured and quietly compelling.'},
  {id:'reflection-man',brand:'Amouage',name:'Reflection Man',type:'Eau de Parfum',size:'100 ml',notes:'Rosemary · Neroli · Sandalwood',tags:['For Him','Floral','Woody'],description:'Aromatic freshness opens into luminous neroli and smooth sandalwood. A refined floral-wood composition with graceful depth.'},
  {id:'angels-share',brand:'Kilian Paris',name:'Angels’ Share',type:'Eau de Parfum',size:'50 ml',notes:'Cognac · Oak · Tonka bean',tags:['Unisex','Gourmand','Oriental / Amber'],description:'Rich cognac, seasoned oak and the enveloping warmth of tonka bean. A golden, indulgent scent for slower evenings.'},
  {id:'shalimar',brand:'Guerlain',name:'Shalimar',type:'Eau de Parfum',size:'90 ml',notes:'Bergamot · Iris · Vanilla',tags:['For Her','Oriental / Amber','Floral'],description:'Sparkling bergamot softens into elegant iris and deep vanilla. A storied amber composition, full of warmth and romance.'}
];
const sources={
  "bal-dafrique": "https://www.byredo.com/us_en/p/bal-d-afrique-eau-de-parfum",
  "philosykos": "https://sa.diptyqueparis.com/en-sa/products/eau-de-parfum-philosykos-2",
  "wood-sage-sea-salt": "https://www.jomalone.com/product/25946/32241/colognes/wood-sage-sea-salt-cologne",
  "santal-33": "https://www.lelabofragrances.com/santal-33-147.html?size=100ml",
  "reflection-man": "https://amouage.com/en-bh/products/reflection-man-100ml",
  "angels-share": "https://www.bykilian.com/product/19797/82905/perfume/angels-share/the-liquors",
  "shalimar": "https://www.guerlain.com/uk/en-uk/p/shalimar-eau-de-parfum-G011353.html"
};
export const products=[...heroProducts,...arrivalProducts].map(p=>({...p,image:`./assets/${p.id}.webp`,portrait:`./assets/${p.id}${heroProducts.includes(p)?'':'-bottle'}.webp`,hasModel:true})).concat(newHouses.map(p=>({...p,source:sources[p.id],image:`./assets/collection/${p.id}.webp`,portrait:`./assets/collection/${p.id}.webp`,hasModel:false})));
export const brands=[...new Set(products.map(p=>p.brand))].sort((a,b)=>a.localeCompare(b));
export const readSavedIds=key=>{try{const value=JSON.parse(localStorage.getItem(key));return Array.isArray(value)?value.filter(id=>products.some(p=>p.id===id)):[];}catch{return [];}};
