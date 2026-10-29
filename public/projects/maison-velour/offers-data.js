// Fixed preview campaign. These are design examples, not live brand promotions.
export const offerCampaign = Object.freeze({
  endsAt:'2026-10-31T00:00:00+06:00',
  deadlineLabel:'31 Oct 2026 · 00:00 · Dhaka',
  interval:6000
});

export const seasonalOffers = [
  {id:'libre',saving:15,title:'The golden hour',description:'A little freedom. A little floral warmth. Make the everyday feel extraordinary.',tone:'gold'},
  {id:'delina',saving:20,title:'A modern romance',description:'A playful rose, a softer moment. An invitation to fall for something beautiful.',tone:'rose'},
  {id:'baccarat-rouge',saving:10,title:'After the last light',description:'Luminous woods and a trace of mystery. For evenings you wish would linger.',tone:'amber'}
];

export function countdownAt(now=Date.now()) {
  const remaining=Math.max(0,Math.ceil((Date.parse(offerCampaign.endsAt)-now)/1000));
  return {days:Math.floor(remaining/86400),hours:Math.floor(remaining%86400/3600),
    minutes:Math.floor(remaining%3600/60),seconds:remaining%60,expired:remaining===0};
}
