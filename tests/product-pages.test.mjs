import test from 'node:test';
import assert from 'node:assert/strict';
import {changeSaved} from '../src/collection-data.mjs';
import {solutionDetailId} from '../src/solutions-data.mjs';
import {readBriefDraft,mergeBriefContext} from '../src/project-brief-data.mjs';

test('saving from stale tabs preserves other products and supports blocked storage',()=>{
  let raw='[]';const storage={getItem:()=>raw,setItem:(key,value)=>{raw=value;}};
  changeSaved('retail-erp',[],()=>storage);
  assert.deepEqual(changeSaved('healthcare-ai',[],()=>storage).saved,['retail-erp','healthcare-ai']);
  assert.deepEqual(changeSaved('retail-erp',[],()=>storage).saved,['healthcare-ai']);
  assert.deepEqual(changeSaved('retail-design',['retail-software'],()=>{throw Error('blocked');}),{saved:['retail-software','retail-design'],persisted:false});
});
test('homepage generic solutions retain the selected industry',()=>{
  assert.equal(solutionDetailId('industry-erp','healthcare'),'healthcare-erp');
  assert.equal(solutionDetailId('assist-ai','tourism'),'tourism-ai');
  assert.equal(solutionDetailId('industry-erp','all'),'retail-erp');
  assert.equal(solutionDetailId('commerce-ui','fashion'),'retail-design');
  assert.equal(solutionDetailId('__proto__'),null);
});
test('visit-only saves can be added and removed when storage is readable but full',()=>{
  const full={getItem:()=> '[]',setItem:()=>{throw Error('quota');}};
  const first=changeSaved('retail-erp',[],()=>full);
  const next=changeSaved('retail-design',first.saved,()=>full,!first.persisted);
  assert.deepEqual(next.saved,['retail-erp','retail-design']);
  const removed=changeSaved('retail-erp',next.saved,()=>full,!next.persisted);
  assert.deepEqual(removed.saved,['retail-design']);assert.equal(removed.persisted,false);
});
test('tab drafts restore bounded fields and merge product context without losing notes',()=>{
  const draft=readBriefDraft(JSON.stringify({service:'software',industry:'retail',goal:'My existing stock requirements.',existing:'Current system',name:'Sample Visitor',email:'demo@example.com'}));
  assert.equal(draft.goal,'My existing stock requirements.');
  const merged=mergeBriefContext(draft,{service:'erp',industry:'healthcare',goal:'Discuss Care ERP.'});
  assert.equal(merged.goal,'My existing stock requirements.\n\nDiscuss Care ERP.');
  assert.equal(merged.existing,'Current system');assert.equal(merged.industry,'healthcare');
  assert.equal(mergeBriefContext({...draft,goal:'x'.repeat(1500)},{goal:'More context'}),null);
  assert.equal(readBriefDraft('{bad'),null);
  assert.equal(readBriefDraft(JSON.stringify({industry:'__proto__',goal:'x'.repeat(1600)})).goal.length,1500);
});
import { products } from '../src/collection-data.mjs';
let api;
try { api = await import('../src/product-page-data.mjs'); } catch (error) { if (error.code !== 'ERR_MODULE_NOT_FOUND') throw error; }

test('every collection product has complete ordered detail data and two relevant links', () => {
  assert.ok(api, 'The shared product-detail model must exist');
  assert.equal(api.detailSections.length, 10);
  for (const record of products) {
    const p = api.getProductDetail(record.id);
    assert.equal(p.id, record.id);
    for (const field of ['audience','problems','outcomes','included','notIncluded','story','timeline','pricing','licence','support','requirements','related']) assert.ok(p[field], `${p.id}: ${field}`);
    assert.equal(p.problems.length, 3);
    assert.equal(p.outcomes.length, 3);
    assert.equal(p.related.length, 2);
    for (const related of p.related) { assert.equal(api.getProductDetail(related).industry, p.industry); assert.notEqual(related, p.id); }
  }
});
test('legacy links resolve safely and unknown identifiers do not invent products', () => {
  assert.ok(api);
  assert.equal(api.getProductDetail('stockflow').id, 'retail-software');
  assert.equal(api.getProductDetail('commerce-ui').id, 'retail-design');
  for (const id of ['<script>', '__proto__', '', null, 'missing']) assert.equal(api.getProductDetail(id), null);
  assert.equal(api.productDetailUrl('retail-ai'), './product.html?id=retail-ai');
});
test('Maison uses original project provenance and proposed handover, not a fabricated licence', () => {
  assert.ok(api);
  const p=api.getProductDetail('retail-design');
  assert.equal(p.status, 'Real project · Demo');
  assert.match(p.credit, /Kazi Jawad/);
  assert.equal(p.project.url, './projects/maison-velour/');
  assert.match(p.requirements, /Figma.*scop/i);
  assert.match(p.notIncluded.join(' '), /Live payments/);
});
test('fit answers become a bounded prefilled brief and reject unknown query values', () => {
  assert.ok(api);
  const p=api.getProductDetail('retail-ai');
  const fit={team:'6-20',website:'yes',priority:'support'};
  const inquiry=api.productInquiry(p.id,fit);
  assert.equal(inquiry.service,'ai'); assert.equal(inquiry.industry,'retail');
  assert.match(inquiry.goal,/Shop Assist AI/); assert.match(inquiry.goal,/6–20/);
  const url=new URL(api.productBriefUrl(p.id,fit),'http://localhost:3001');
  assert.equal(url.searchParams.get('collection'),p.id); assert.equal(url.searchParams.get('team'),'6-20');
  assert.equal(url.hash,'#cs-contact');
  assert.deepEqual(api.normalizeFit({team:'<script>',website:'yes',priority:'evil'}),{team:'',website:'yes',priority:''});
  assert.equal(api.productInquiry('bad'),null);
});
test('scripted chat never pretends to access orders or provide healthcare diagnosis', () => {
  assert.ok(api);
  assert.match(api.sampleReply('retail-ai','track order','en'),/connect|integration/i);
  assert.match(api.sampleReply('healthcare-ai','What medicine should I take?','en'),/medical|clinical/i);
  assert.match(api.sampleReply('retail-ai','ডেলিভারি','bn'),/[\u0980-\u09FF]/);
  assert.match(api.sampleReply('retail-ai','unknown request','en'),/team|person/i);
});
test('all four variants render the same ten blocks, correct links and accessible disclosures', async () => {
  let view; try { view=await import('../src/product-page-view.mjs'); } catch(error) { if(error.code!=='ERR_MODULE_NOT_FOUND')throw error; }
  assert.ok(view,'The shared product page renderer must exist');
  for(const id of ['retail-software','retail-design','retail-erp','retail-ai']) {
    const html=view.renderProductPage(api.getProductDetail(id));
    let cursor=-1;
    for(const [section] of api.detailSections) { const next=html.indexOf(`id="pp-${section}"`); assert.ok(next>cursor,`${id}: ${section} follows previous block`);cursor=next; }
    assert.match(html,/<details/);assert.match(html,/Discuss this solution/);
    assert.match(html,/aria-labelledby="pp-fit-title"/);
    assert.match(html,/Illustrative|Prototype checkout/);
    assert.match(html,/product.html\?id=retail-/);
  }
});
