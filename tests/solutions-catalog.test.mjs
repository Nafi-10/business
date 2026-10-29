import test from 'node:test';
import assert from 'node:assert/strict';
import { products, filterProducts, demoReply, searchProducts } from '../src/solutions-data.mjs';

test('retail buyers see all four starting solutions', () => {
  assert.deepEqual(filterProducts({industry:'retail'}).map(p => p.id), ['stockflow','commerce-ui','industry-erp','assist-ai']);
});
test('industry and category intersect rather than showing unrelated design kits', () => {
  assert.equal(filterProducts({industry:'healthcare',category:'design'}).length,0);
  assert.deepEqual(filterProducts({industry:'fashion',category:'design'}).map(p=>p.id),['commerce-ui']);
});
test('goal and category can refine the same industry', () => {
  assert.deepEqual(filterProducts({industry:'manufacturing',goal:'operations',category:'erp'}).map(p=>p.id),['industry-erp']);
  assert.deepEqual(filterProducts({industry:'education',goal:'support'}).map(p=>p.id),['assist-ai']);
});
test('reset returns the complete catalog without mutating it', () => {
  filterProducts({industry:'healthcare',goal:'inventory',category:'design'});
  assert.equal(filterProducts().length,4);
  assert.equal(products.length,4);
});
test('unknown filter values do not silently match everything', () => {
  assert.equal(filterProducts({industry:'unknown'}).length,0);
  assert.equal(filterProducts({category:'unknown'}).length,0);
});
test('chat preview offers useful preset replies without pretending to look up real data', () => {
  assert.match(demoReply('Can I track my order?'), /sample|demo/i);
  assert.match(demoReply('Tell me about ERP pricing'), /quote/i);
  assert.match(demoReply('Talk to a person'), /project advice|contact/i);
  assert.match(demoReply('<script>alert(1)</script>'), /demo|sample/i);
});

test('search finds products by name, format and business need', () => {
  assert.deepEqual(searchProducts(' stockflow ').map(p=>p.id), ['stockflow']);
  assert.deepEqual(searchProducts('Figma').map(p=>p.id), ['commerce-ui']);
  assert.deepEqual(searchProducts('customer support').map(p=>p.id), ['assist-ai']);
});

test('industry and multiword queries narrow results without incidental short matches', () => {
  assert.deepEqual(searchProducts('AI').map(p=>p.id), ['assist-ai']);
  assert.deepEqual(searchProducts('erp textile').map(p=>p.id), ['industry-erp']);
  assert.deepEqual(searchProducts('fashion figma').map(p=>p.id), ['commerce-ui']);
  assert.deepEqual(searchProducts('fashion designing').map(p=>p.id), products.map(p=>p.id));
  assert.ok(searchProducts('healthcare').some(p=>p.id==='industry-erp'));
  assert.ok(!searchProducts('healthcare').some(p=>p.id==='commerce-ui'));
});

test('search supports prefixes and handles empty, punctuation and unknown queries', () => {
  assert.deepEqual(searchProducts('inven').map(p=>p.id), ['stockflow','industry-erp']);
  assert.equal(searchProducts('   ').length, products.length);
  assert.equal(searchProducts('?!').length, products.length);
  assert.equal(searchProducts('quantum space travel').length, 0);
  assert.equal(searchProducts('<script>alert(1)</script>').length, 0);
});
