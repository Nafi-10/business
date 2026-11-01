import test from 'node:test';
import assert from 'node:assert/strict';
const hero=await import('../src/hero-data.mjs').catch(()=>({}));
test('every industry changes the three product previews and exposes four understandable modules',()=>{
 assert.equal(typeof hero.previewFor,'function');
 assert.deepEqual(hero.modules.map(m=>m.id),['software','design','erp','ai']);
 const ids=['retail','manufacturing','healthcare','education','hospitality'];
 const previews=ids.map(id=>hero.previewFor(id));
 for(const p of previews){assert.ok(p.name);assert.match(p.accent,/^#[a-f0-9]{6}$/i);for(const key of ['software','erp','ai'])assert.ok(p[key].title&&p[key].detail);}
 for(const key of ['software','erp','ai'])assert.equal(new Set(previews.map(p=>p[key].detail)).size,5);
 assert.equal(hero.previewFor('__proto__'),previews[0]);
});
test('the arrival assembles every piece once into a stable connected cube',()=>{
 assert.equal(typeof hero.assemblyPose,'function');
 const homes=[];
 for(let i=0;i<8;i++){const start=hero.assemblyPose(i,0),end=hero.assemblyPose(i,1);assert.notDeepEqual(start.position,end.position);assert.deepEqual(end.rotation,[0,0,0]);assert.deepEqual(hero.assemblyPose(i,9),end);homes.push(end.position.join(','));}
 assert.equal(new Set(homes).size,8);
 for(const value of [NaN,Infinity,-Infinity,-1])assert.ok(hero.assemblyPose(0,value).position.every(Number.isFinite));
});
test('motion policy uses a lightweight still scene for reduced motion, mobile and save-data',()=>{
 assert.equal(typeof hero.motionPolicy,'function');
 assert.equal(hero.motionPolicy({}).webgl,true);
 for(const options of [{reduced:true},{compact:true},{saveData:true}]){const p=hero.motionPolicy(options);assert.equal(p.webgl,false);assert.equal(p.ambient,false);assert.equal(p.intro,false);}
});
test('scroll-linked pose shrinks toward the next section without unbounded movement',()=>{
 assert.equal(typeof hero.scrollPose,'function');
 assert.equal(hero.scrollPose(0).scale,1);assert.ok(hero.scrollPose(1).scale<1);assert.ok(hero.scrollPose(1).scale>.65);
 assert.deepEqual(hero.scrollPose(-1),hero.scrollPose(0));assert.deepEqual(hero.scrollPose(10),hero.scrollPose(1));assert.deepEqual(hero.scrollPose(NaN),hero.scrollPose(0));
});
