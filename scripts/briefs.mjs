// Local-only research inbox: private records are never exposed over HTTP.
import {readdir,readFile,writeFile,rename} from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const directory=path.resolve(process.env.BRIEF_DATA_DIR||fileURLToPath(new URL('../data/project-briefs',import.meta.url)));
const args=process.argv.slice(2),reference=args.find(a=>a.startsWith('CS-'));
const statuses=['new','needs-clarification','researching','meeting-ready','proposal','closed'];
const names=await readdir(directory).catch(error=>{if(error.code==='ENOENT')return [];throw error;});
const records=await Promise.all(names.filter(n=>/^[a-f0-9-]{36}\.json$/.test(n)).map(async name=>({name,record:JSON.parse(await readFile(path.join(directory,name),'utf8'))})));
if(!reference){console.table(records.map(({record:r})=>({reference:r.reference,status:r.status,received:r.receivedAt,service:r.brief.service,industry:r.brief.industry,business:r.brief.answers.business})));console.log('View: npm run briefs -- CS-REFERENCE\nUpdate: npm run briefs -- CS-REFERENCE --status researching');}
else {
 const item=records.find(({record})=>record.reference===reference);if(!item){console.error('Brief not found.');process.exitCode=1;}
 else {
  const index=args.indexOf('--status');
  if(index>=0){const status=args[index+1];if(!statuses.includes(status))throw new Error('Choose: '+statuses.join(', '));item.record.status=status;item.record.history.push({status,at:new Date().toISOString()});const temp=path.join(directory,randomUUID()+'.tmp');await writeFile(temp,JSON.stringify(item.record,null,2),{mode:0o600,flush:true});await rename(temp,path.join(directory,item.name));}
  console.log(item.record.reference+' · '+item.record.status+'\n\n'+item.record.summary);console.log('\nAttachments: '+item.record.attachments.map(f=>f.name).join(', '));
 }
}
