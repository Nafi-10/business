import test from 'node:test';
import assert from 'node:assert/strict';
import {sectors} from '../src/collection-data.mjs';
import {getIndustryPage,industryStories} from '../src/industry-page-data.mjs';

test('every View all industry page has the complete reference-led content set',()=>{
  assert.deepEqual(Object.keys(industryStories),sectors.map(sector=>sector.id));
  for(const sector of sectors){
    const page=getIndustryPage(sector.id);
    assert.ok(page,`${sector.id} page exists`);
    assert.equal(page.products.length,5,`${sector.id} has five collection concepts`);
    assert.equal(page.priorities.length,4,`${sector.id} has four starting priorities`);
    assert.equal(page.flow.length,4,`${sector.id} has four workflow steps`);
    assert.equal(page.labels.length,3,`${sector.id} has three dashboard metrics`);
    assert.ok(page.lead&&page.intro&&page.insight,`${sector.id} has complete industry copy`);
  }
});

test('healthcare guide keeps its administrative-only safety notice',()=>{
  assert.match(getIndustryPage('healthcare').disclaimer,/not a clinical tool/i);
});
