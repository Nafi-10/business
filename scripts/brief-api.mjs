import {createHash,randomUUID} from 'node:crypto';
import {mkdir,readFile,writeFile,rename,unlink} from 'node:fs/promises';
import path from 'node:path';
import {submissionBrief,validateBrief,formatCustomBrief,safeAttachmentName} from '../src/custom-brief-data.mjs';

const MAX_BYTES=5*1024*1024, MAX_BODY=8*1024*1024;
const reply=(res,status,data)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});res.end(JSON.stringify(data));};
function attachmentsFor(value) {
  if(!Array.isArray(value)||value.length>3)throw new Error('Attach up to three files, totalling no more than 5 MB.');
  let total=0;
  return value.map(file=>{
    if(!file||typeof file.name!=='string'||typeof file.data!=='string'||file.data.length%4!==0||/[^A-Za-z0-9+/=]/.test(file.data))throw new Error('One attachment could not be read. Please attach it again.');
    const bytes=Buffer.from(file.data,'base64');total+=bytes.length;
    if(bytes.toString('base64')!==file.data)throw new Error('One attachment could not be read. Please attach it again.');
    if(!bytes.length||total>MAX_BYTES)throw new Error('Attachments must be non-empty and total no more than 5 MB.');
    const allowed={
      'image/png':{ext:/\.png$/i,valid:bytes.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10]))},
      'image/jpeg':{ext:/\.jpe?g$/i,valid:bytes[0]===255&&bytes[1]===216&&bytes[2]===255},
      'application/pdf':{ext:/\.pdf$/i,valid:bytes.subarray(0,5).toString()==='%PDF-'},
      'text/plain':{ext:/\.txt$/i,valid:!bytes.includes(0)&&!bytes.toString('utf8').includes('\uFFFD')}
    };
    const kind=Object.hasOwn(allowed,file.type)?allowed[file.type]:null;
    if(!kind?.valid||!kind.ext.test(file.name))throw new Error('Use a valid PDF, PNG, JPEG or plain text file.');
    const name=safeAttachmentName(file.name);
    return {name,type:file.type,size:bytes.length,data:bytes.toString('base64')};
  });
}
async function readBody(req) {
  if(Number(req.headers['content-length'])>MAX_BODY)throw Object.assign(new Error('The brief is too large.'),{status:413});
  let size=0;const chunks=[];
  for await(const chunk of req){size+=chunk.length;if(size>MAX_BODY)throw Object.assign(new Error('The brief is too large.'),{status:413});chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw Object.assign(new Error('Invalid request. Please try again.'),{status:400});}
}
export function createBriefHandler({directory,rateLimit=15,origin=process.env.APP_ORIGIN}={}) {
  if(!directory)throw new Error('A private brief directory is required.');
  const queue=new Map(),visits=new Map();
  return async (req,res)=>{
    if(req.url?.split('?')[0]!=='/api/project-briefs')return false;
    if(req.method!=='POST'){res.setHeader('Allow','POST');reply(res,405,{error:'Use the project brief form to submit an enquiry.'});return true;}
    const expected=origin||`http://${req.headers.host}`;
    if((req.headers.origin&&req.headers.origin!==expected)||req.headers['sec-fetch-site']==='cross-site'){reply(res,403,{error:'Please submit from the CanveliqSoft website.'});return true;}
    if(!/^application\/json(?:;|$)/i.test(req.headers['content-type']||'')){reply(res,415,{error:'This endpoint accepts a JSON project brief.'});return true;}
    const now=Date.now(),ip=req.socket.remoteAddress;
    for(const [key,item] of visits)if(item.expires<now)visits.delete(key);
    const usage=visits.get(ip)||{count:0,expires:now+15*60*1000};usage.count++;visits.set(ip,usage);
    if(usage.count>rateLimit){res.setHeader('Retry-After','900');reply(res,429,{error:'Too many attempts. Your answers are kept; please try again later.'});return true;}
    try {
      const data=await readBody(req);
      if(data?.lookup===true){
        if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId||'')||!/^[0-9a-f]{64}$/.test(data.fingerprint||'')){reply(res,422,{error:'Invalid receipt lookup.'});return true;}
        const key=data.submissionId.toLowerCase();await queue.get(key)?.catch(()=>{});
        let record;try{record=JSON.parse(await readFile(path.join(directory,key+'.json'),'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
        if(!record||record.fingerprint!==data.fingerprint)reply(res,404,{error:'No matching receipt yet.'});
        else reply(res,200,{reference:record.reference,receivedAt:record.receivedAt});
        return true;
      }
      if(!data||typeof data!=='object'||!data.brief||typeof data.brief!=='object'||!data.brief.answers||typeof data.brief.answers!=='object'||Array.isArray(data.brief.answers)) {reply(res,422,{error:'Please complete the project brief.'});return true;}
      if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(data.submissionId||'')){reply(res,422,{error:'Invalid submission reference. Reload the form and try again.'});return true;}
      const errors=validateBrief(data.brief);
      if(Object.keys(errors).length){reply(res,422,{error:'Please check the highlighted answers.',fields:errors});return true;}
      let attachments;try{attachments=attachmentsFor(data.attachments||[]);}catch(error){reply(res,422,{error:error.message,fields:{attachments:error.message}});return true;}
      const brief=submissionBrief(data.brief),fingerprint=createHash('sha256').update(JSON.stringify({brief,attachments})).digest('hex');
      const key=data.submissionId.toLowerCase(),file=path.join(directory,`${key}.json`);
      const persist=async()=>{
        let existing;try{existing=JSON.parse(await readFile(file,'utf8'));}catch(error){if(error.code!=='ENOENT')throw error;}
        if(existing){if(existing.fingerprint!==fingerprint)return {status:409,body:{error:'This submission reference has already been used for different answers. Start a new submission to send your changes.'}};return {status:200,body:{reference:existing.reference,receivedAt:existing.receivedAt}};}
        await mkdir(directory,{recursive:true,mode:0o700});
        const receivedAt=new Date().toISOString(),reference=`CS-${receivedAt.slice(0,10).replaceAll('-','')}-${randomUUID().slice(0,8).toUpperCase()}`;
        const record={reference,receivedAt,status:'new',history:[{status:'new',at:receivedAt}],fingerprint,brief,summary:formatCustomBrief(brief),attachments};
        const temporary=path.join(directory,`${key}.${randomUUID()}.tmp`);
        try{await writeFile(temporary,JSON.stringify(record,null,2),{flag:'wx',mode:0o600,flush:true});await rename(temporary,file);}finally{await unlink(temporary).catch(()=>{});}
        return {status:201,body:{reference,receivedAt}};
      };
      const previous=queue.get(key)||Promise.resolve();
      const task=previous.catch(()=>{}).then(persist);queue.set(key,task);
      try{const result=await task;reply(res,result.status,result.body);}finally{if(queue.get(key)===task)queue.delete(key);}
    }catch(error){reply(res,error.status||503,{error:error.status?error.message:'We could not save your brief. Your answers are still here. Please retry or download a copy.'});}
    return true;
  };
}
