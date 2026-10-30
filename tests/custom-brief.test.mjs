import test from 'node:test';
import assert from 'node:assert/strict';
const m = await import('../src/custom-brief-data.mjs').catch(() => ({}));
function completed(service='erp', industry='manufacturing') {
  const draft=m.emptyBrief({service,industry});
  for(let step=0;step<6;step++)for(const field of m.fieldsForStep(step,draft)) {
    draft.answers[field.id]=field.type==='select'?field.options[0][0]:field.id==='email'?'client@example.com':field.type==='tel'?'':`Example answer for ${field.label}. We need a clear and reliable workflow.`.slice(0,field.max);
  }
  draft.consent=true; return draft;
}
test('all 36 service/industry routes have distinct relevant questions and valid complete briefs',()=>{
  assert.equal(typeof m.fieldsForStep,'function','The guided brief schema must exist');
  for(const service of Object.keys(m.services))for(const industry of Object.keys(m.industries)) {
    const d=completed(service,industry);
    assert.equal(m.fieldsForStep(1,d).length,5);
    assert.equal(m.fieldsForStep(2,d).length,4);
    assert.deepEqual(m.validateBrief(d),{});
  }
});
test('payload only includes active branch and never accepts arbitrary or prototype keys',()=>{
  const d=completed(); d.answers['service:ai:0']='Unrelated chatbot answer'; d.answers.secret='unrelated';
  const payload=m.submissionBrief(d);
  assert.equal(payload.answers['service:ai:0'],undefined);assert.equal(payload.answers.secret,undefined);
  assert.ok(payload.answers['service:erp:0']);
  assert.ok(m.validateBrief({...d,service:'__proto__'}).service);
  assert.ok(m.validateBrief({...d,industry:'constructor'}).industry);
});
test('draft restoration bounds strings and drops invalid selections; review requires consent and email',()=>{
  assert.equal(m.readDraft('{broken'),null);
  const d=completed();d.answers.problem='x'.repeat(4000);
  const restored=m.readDraft(JSON.stringify(d));assert.equal(restored.answers.problem.length,1600);
  d.answers.problem='Too short';d.answers.email='broken';d.consent=false;
  const errors=m.validateBrief(d);assert.ok(errors.problem);assert.ok(errors.email);assert.ok(errors.consent);
  assert.equal(m.readDraft(JSON.stringify({...d,service:'invalid'})).service,'');
});
test('brief text includes readable field names and only selected industry/service',()=>{
  const text=m.formatCustomBrief(completed('design','retail'));
  assert.match(text,/UI\/UX design/);assert.match(text,/Retail & commerce/);assert.match(text,/Business & problem/i);
  assert.doesNotMatch(text,/\[object Object\]/);
});
