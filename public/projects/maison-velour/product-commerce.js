// Illustrative storefront prices, not live retailer offers. Amounts are in USD cents.
export const demoOffers = {
  chanel: { size:'100 ml', priceCents:17200 },
  dior: { size:'100 ml', priceCents:16500 },
  'tom-ford': { size:'50 ml', priceCents:29500 },
  sauvage: { size:'100 ml', priceCents:19000 },
  libre: { size:'90 ml', priceCents:16500 },
  'baccarat-rouge': { size:'70 ml', priceCents:33500 },
  delina: { size:'75 ml', priceCents:37500 },
  aventus: { size:'100 ml', priceCents:36500 },
  'bal-dafrique': { size:'100 ml', priceCents:32000 },
  philosykos: { size:'75 ml', priceCents:24000 },
  'wood-sage-sea-salt': { size:'100 ml', priceCents:17000 },
  'santal-33': { size:'100 ml', priceCents:33500 },
  'reflection-man': { size:'100 ml', priceCents:38000 },
  'angels-share': { size:'50 ml', priceCents:27500 },
  shalimar: { size:'90 ml', priceCents:16500 }
};
export const formatPrice=cents=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:2}).format(cents/100);
export const bagSubtotal=ids=>ids.reduce((sum,id)=>sum+(demoOffers[id]?.priceCents||0),0);
export const normalizeQuantity=value=>Math.max(1,Math.min(10,Math.floor(Number(value)||1)));
