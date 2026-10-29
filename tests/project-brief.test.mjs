import test from 'node:test';
import assert from 'node:assert/strict';
import { validateBriefStep, normalizeBrief, formatBrief, briefEmailUrl } from '../src/project-brief-data.mjs';
const valid = {service:'erp',industry:'retail',goal:'Connect our inventory and sales teams.',existing:'https://example.com',budget:'not-sure',timeline:'flexible',name:'Kazi Example',email:'buyer@example.com'};
test('project and contact steps reject missing or invalid input',()=>{
  assert.deepEqual(Object.keys(validateBriefStep(0,{})),['service','industry','goal']);
  assert.ok(validateBriefStep(0,{...valid,goal:'short'}).goal);
  assert.ok(validateBriefStep(2,{...valid,email:'bad address'}).email);
  assert.ok(validateBriefStep(2,{...valid,email:'buyer@example@domain.com'}).email);
  assert.ok(validateBriefStep(0,{...valid,service:'unknown'}).service);
  assert.ok(validateBriefStep(1,{...valid,budget:'infinite'}).budget);
});
test('a complete brief validates each step including not-sure budget',()=>{
  for(let i=0;i<3;i++)assert.deepEqual(validateBriefStep(i,valid),{});
});
test('optional existing setup permits text but rejects excessive input',()=>{
  assert.deepEqual(validateBriefStep(0,{...valid,existing:''}),{});
  assert.deepEqual(validateBriefStep(0,{...valid,existing:'Excel and paper records'}),{});
  assert.ok(validateBriefStep(0,{...valid,existing:'x'.repeat(301)}).existing);
});
test('normalization trims input and strips contact header newlines',()=>{
  const value=normalizeBrief({...valid,name:'  A\r\nB  ',email:' buyer@example.com\r\n'});
  assert.equal(value.name,'A B');assert.equal(value.email,'buyer@example.com');
});
test('handoff is plain text with readable choices and an encoded fixed recipient',()=>{
  const data={...valid,goal:'Need <script>alert(1)</script> & reporting?'};
  assert.match(formatBrief(data),/Custom ERP/);
  assert.match(formatBrief(data),/Not sure/);
  const url=new URL(briefEmailUrl(data));
  assert.equal(url.protocol,'mailto:');assert.equal(url.pathname,'kazijawadulislam@gmail.com');
  assert.equal(url.searchParams.get('body'),formatBrief(data));
  assert.equal(url.searchParams.has('bcc'),false);
});
