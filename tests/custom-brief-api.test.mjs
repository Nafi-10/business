import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp, readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createServer} from 'node:http';
import {once} from 'node:events';
import {randomUUID,createHash} from 'node:crypto';
import {emptyBrief,fieldsForStep,submissionBrief,safeAttachmentName} from '../src/custom-brief-data.mjs';
const api=await import('../scripts/brief-api.mjs').catch(()=>({}));
function payload() {
 const brief=emptyBrief({service:'erp',industry:'manufacturing'});brief.consent=true;
 for(let s=0;s<6;s++)for(const f of fieldsForStep(s,brief))brief.answers[f.id]=f.options?f.options[0][0]:f.id==='email'?'test@example.com':f.type==='tel'?'':`A useful description of our current workflow and desired improvement.`.slice(0,f.max);
 return {submissionId:randomUUID(),brief,attachments:[]};
}
test('private brief API saves once, validates input and never confirms a failed save',async()=>{
 assert.equal(typeof api.createBriefHandler,'function','The private brief submission handler must exist');
 const directory=await mkdtemp(path.join(tmpdir(),'cs-brief-api-'));
 const handler=api.createBriefHandler({directory,rateLimit:100});
 const server=createServer((req,res)=>{handler(req,res).then(handled=>{if(!handled){res.writeHead(404);res.end();}});});
 server.listen(0,'127.0.0.1');await once(server,'listening');const base=`http://127.0.0.1:${server.address().port}`;
 const send=(data,headers={})=>fetch(base+'/api/project-briefs',{method:'POST',headers:{'Content-Type':'application/json',Origin:base,...headers},body:JSON.stringify(data)});
 try{
  const p=payload();p.attachments=[{name:'workflow.txt',type:'text/plain',data:Buffer.from('Fictional workflow example').toString('base64')}];
  const result=await send(p);assert.equal(result.status,201);const receipt=await result.json();assert.match(receipt.reference,/^CS-/);
  const files=await readdir(directory);assert.equal(files.length,1);
  const record=JSON.parse(await readFile(path.join(directory,files[0]),'utf8'));assert.equal(record.brief.answers.email,'test@example.com');assert.equal(record.status,'new');assert.equal(record.attachments.length,1);
  const clientHash=createHash('sha256').update(JSON.stringify({brief:submissionBrief(p.brief),attachments:p.attachments.map(f=>({name:safeAttachmentName(f.name),type:f.type,size:Buffer.from(f.data,'base64').length,data:f.data}))})).digest('hex');
  const lookup=await send({lookup:true,submissionId:p.submissionId,fingerprint:clientHash});assert.equal(lookup.status,200);assert.equal((await lookup.json()).reference,receipt.reference);
  assert.equal((await send({lookup:true,submissionId:p.submissionId,fingerprint:'0'.repeat(64)})).status,404);
  const duplicates=await Promise.all([send(p),send(p)]);for(const r of duplicates){assert.equal(r.status,200);assert.equal((await r.json()).reference,receipt.reference);}
  assert.equal((await readdir(directory)).length,1);
  assert.equal((await send({...p,brief:{...p.brief,answers:{...p.brief.answers,problem:'A different problem with the same submission key.'}}})).status,409);
  const bad=payload();bad.brief.answers.email='bad';assert.equal((await send(bad)).status,422);
  bad.brief=emptyBrief({service:'__proto__',industry:'constructor'});assert.equal((await send(bad)).status,422);
  assert.equal((await send(payload(),{Origin:'https://evil.example'})).status,403);
  const file=payload();file.attachments=[{name:'evil.html',type:'text/html',data:Buffer.from('<script>x</script>').toString('base64')}];assert.equal((await send(file)).status,422);
  file.attachments=[{name:'fake.png',type:'image/png',data:Buffer.from('not a png').toString('base64')}];assert.equal((await send(file)).status,422);
  assert.equal((await fetch(base+'/api/project-briefs')).status,405);
  assert.equal((await fetch(base+'/data/project-briefs')).status,404);
  const raw=await fetch(base+'/api/project-briefs',{method:'POST',headers:{'Content-Type':'application/json'},body:'{bad'});assert.equal(raw.status,400);
  const boundary=payload();boundary.attachments=[{name:'workflow.txt',type:'text/plain',data:Buffer.alloc(5*1024*1024,65).toString('base64')}];assert.equal((await send(boundary)).status,201,'A valid 5 MB file should save');
 }finally{server.closeAllConnections();await new Promise(r=>server.close(r));await rm(directory,{recursive:true,force:true});}
});
test('storage failure returns no receipt and no success',async()=>{
 const directory=await mkdtemp(path.join(tmpdir(),'cs-brief-failure-'));const blocked=path.join(directory,'not-a-directory');await writeFile(blocked,'file');
 const handler=api.createBriefHandler({directory:blocked});const server=createServer(handler);server.listen(0,'127.0.0.1');await once(server,'listening');
 try{const result=await fetch(`http://127.0.0.1:${server.address().port}/api/project-briefs`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload())});assert.equal(result.status,503);assert.equal((await result.json()).reference,undefined);}
 finally{server.closeAllConnections();await new Promise(r=>server.close(r));await rm(directory,{recursive:true,force:true});}
});
