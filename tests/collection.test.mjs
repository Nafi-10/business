import test from 'node:test';
import assert from 'node:assert/strict';
import {filterCollection, carouselItems, collectionInquiry, readSaved} from '../src/collection-data.mjs';

test('search combines industry, category and all query words',()=>{
  const found=filterCollection({industry:'retail',category:'erp',query:' RETAIL  operations '});
  assert.deepEqual(found.map(p=>p.id),['retail-erp']);
  assert.equal(filterCollection({industry:'healthcare',query:'Retail ERP'}).length,0);
  assert.equal(filterCollection({query:'zz-no-such-solution'}).length,0);
});
test('saved-only filtering excludes other products and respects query',()=>{
  assert.deepEqual(filterCollection({savedOnly:true,saved:['retail-erp','healthcare-design'],query:'healthcare'}).map(p=>p.id),['healthcare-design']);
  assert.deepEqual(filterCollection({savedOnly:true,saved:[]}),[]);
});
test('carousel centres the selected item and wraps both directions without duplication',()=>{
  assert.deepEqual(carouselItems(['a','b','c','d','e'],2),['a','b','c','d','e']);
  assert.deepEqual(carouselItems(['a','b','c','d','e'],0),['d','e','a','b','c']);
  assert.deepEqual(carouselItems(['a','b','c','d','e'],-1),['c','d','e','a','b']);
  assert.deepEqual(carouselItems([],3),[]);
  assert.deepEqual(carouselItems(['only'],3),['only']);
});
test('enquiries retain the correct sector and service and reject unknown product IDs',()=>{
  assert.deepEqual(collectionInquiry('healthcare-design'),{service:'design',industry:'healthcare',goal:'I would like to discuss Care UI Kit for Healthcare. Please help me confirm the scope, availability and next steps.'});
  assert.equal(collectionInquiry('<script>'),null);
  assert.equal(collectionInquiry('__proto__'),null);
  assert.equal(collectionInquiry('retail-erp').service,'erp');
});
test('saved state rejects malformed and unknown values and deduplicates valid IDs',()=>{
  assert.deepEqual(readSaved('{broken'),[]);
  assert.deepEqual(readSaved('{"retail-erp":true}'),[]);
  assert.deepEqual(readSaved('["retail-erp","retail-erp",null,"bad"]'),['retail-erp']);
});
