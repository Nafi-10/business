export const houses = [
  { id:'chanel', name:'Chanel', letter:'C', side:'left', bay:5.2, location:'Left gallery · 01', headline:'A certain French elegance.', products:['chanel'], label:'CHANEL' },
  { id:'creed', name:'Creed', letter:'C', side:'right', bay:5.2, location:'Right gallery · 01', headline:'Character, composed.', products:['aventus'], label:'CREED' },
  { id:'dior', name:'Dior', letter:'D', side:'left', bay:.1, location:'Left gallery · 02', headline:'The art of a lasting impression.', products:['sauvage','dior'], label:'DIOR' },
  { id:'mfk', name:'Maison Francis Kurkdjian', letter:'M', side:'back', bay:0, location:'The private salon', headline:'An extraordinary alchemy.', products:['baccarat-rouge'], label:'MAISON FRANCIS KURKDJIAN' },
  { id:'pdm', name:'Parfums de Marly', letter:'P', side:'right', bay:.1, location:'Right gallery · 02', headline:'A modern kind of romance.', products:['delina'], label:'PARFUMS DE MARLY' },
  { id:'tom-ford', name:'Tom Ford', letter:'T', side:'left', bay:-5, location:'Left gallery · 03', headline:'An unmistakable presence.', products:['tom-ford'], label:'TOM FORD' },
  { id:'ysl', name:'Yves Saint Laurent', letter:'Y', side:'right', bay:-5, location:'Right gallery · 03', headline:'Freedom, in every note.', products:['libre'], label:'YVES SAINT LAURENT' }
];

export const bestSellerIds = ['sauvage','baccarat-rouge','chanel'];

export const bottleStyles = {
  chanel: { body:'#e5c48e', cap:'#f3e6ce', label:'#f7f0e4', ink:'#25211c', width:.47, height:.71, shape:'square', text:['CHANEL','COCO','MADEMOISELLE'] },
  dior: { body:'#c89640', cap:'#c4a15b', label:'#cdaa64', ink:'#392a17', width:.34, height:.87, shape:'teardrop', text:['J’ADORE','DIOR'] },
  'tom-ford': { body:'#373735', cap:'#343432', label:'#9d967c', ink:'#171918', width:.4, height:.79, shape:'square', text:['TOM FORD','OUD WOOD','EAU DE PARFUM'] },
  sauvage: { body:'#101b21', cap:'#111414', label:'#142028', ink:'#f7f3e9', width:.41, height:.82, shape:'round', text:['SAUVAGE','PARFUM','Dior'] },
  libre: { body:'#d1a04e', cap:'#161719', label:'#cca84e', ink:'#33240c', width:.4, height:.79, shape:'square', text:['YSL','LIBRE','EAU DE PARFUM'] },
  'baccarat-rouge': { body:'#d2ad63', cap:'#b8944c', label:'#661f21', ink:'#ecdbb7', width:.5, height:.7, shape:'square', text:['Maison Francis','Kurkdjian','Baccarat Rouge 540'] },
  delina: { body:'#d5a9a3', cap:'#d5a9a3', label:'#d5a9a3', ink:'#68524b', width:.39, height:.81, shape:'delina', text:['PARFUMS de MARLY','PARIS','DELINA'] },
  aventus: { body:'#b9a778', cap:'#181a19', label:'#191b1a', ink:'#e1d8ba', width:.47, height:.74, shape:'square', text:['CREED','AVENTUS','EAU DE PARFUM'] }
};

// Navigation bounds include a visitor-sized margin around the shelves and islands.
export function constrainPosition(x,z) {
  x=Math.max(-4.5,Math.min(4.5,x)); z=Math.max(-8.5,Math.min(9.6,z));
  for(const center of [2,-2.5,-7]) {
    if(Math.abs(x)<1.65 && Math.abs(z-center)<1.65) return null;
  }
  return {x,z};
}

export function houseView(house) {
  if(house.side==='back') return {x:2.5,z:-7.7,yaw:.85,pitch:-.025};
  return {x:house.side==='left'?-2.65:2.65,z:house.bay+.7,yaw:house.side==='left'?1.36:-1.36,pitch:.12};
}
