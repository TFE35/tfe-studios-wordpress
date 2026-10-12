// Native PHP multipart integration without any antivirus scanner.
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),assert=require('node:assert/strict'),{spawn,spawnSync}=require('node:child_process'),net=require('node:net');
(async()=>{
 const scratch=fs.mkdtempSync(path.join(os.tmpdir(),'tfe-upload-test-'));const priv=path.join(scratch,'private');fs.mkdirSync(priv,{mode:0o700});
 const probe=net.createServer();await new Promise(r=>probe.listen(0,'127.0.0.1',r));const port=probe.address().port;await new Promise(r=>probe.close(r));
 const server=spawn('php',['-d','upload_max_filesize=5M','-d','post_max_size=10M','-S',`127.0.0.1:${port}`,path.join(__dirname,'support/upload-router.php')],{env:{...process.env,TFE_TEST_PRIVATE:priv},stdio:['ignore','ignore','pipe']});let logs='';server.stderr.on('data',d=>logs+=d);
 const url=`http://127.0.0.1:${port}`;let ready=false;
 try{
  for(let i=0;i<100;i++){try{await fetch(url);ready=true;break}catch{await new Promise(r=>setTimeout(r,50));}}
  assert.ok(ready,'PHP fixture did not start: '+logs);
  async function send(files=[],suffix='',nonce='valid'){
   const f=new FormData();for(const [k,v]of Object.entries({nonce,name:'Test visitor',email:'visitor@example.org',service:'Brand & identity',message:'Local fixture only',website:'',consent:'yes',request_id:crypto.randomUUID()}))f.append(k,v);
   for(const file of files)f.append('documents[]',new Blob([file.bytes]),file.name);
   const r=await fetch(url+suffix,{method:'POST',body:f});const d=await r.json();assert.equal(d.remaining,0,'Private temporary file leaked');return {status:r.status,...d};
  }
  const pdf=b=>({name:'brief.pdf',bytes:'%PDF-1.4\n'+b});
  function docx(extra=''){
   const generated=spawnSync('python3',['-c',"import io,zipfile,sys\nb=io.BytesIO()\nwith zipfile.ZipFile(b,'w',zipfile.ZIP_DEFLATED) as z:\n z.writestr('[Content_Types].xml','application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml'+('macroEnabled' if sys.argv[1]=='macro' else ''))\n z.writestr('word/document.xml','<document/>')\n if sys.argv[1]=='embedded': z.writestr('word/embeddings/payload.bin','test')\n if sys.argv[1]=='expansion': z.writestr('word/large.xml','x'*(9*1024*1024))\nsys.stdout.buffer.write(b.getvalue())",extra]);
   assert.equal(generated.status,0,generated.stderr.toString());return {name:'brief.docx',bytes:generated.stdout};
  }
  let r=await send([pdf('clean fixture')]);assert.equal(r.status,200);assert.equal(r.calls,1);assert.equal(r.attached,1);
  // Harmless marker is accepted: this flow explicitly performs no antivirus scan.
  r=await send([pdf('UNSAFE_TEST')]);assert.equal(r.status,200);assert.equal(r.attached,1);
  r=await send([pdf('automatic private storage')],'?auto_storage=1');assert.equal(r.status,200);assert.equal(r.attached,1);
  r=await send([docx()]);assert.equal(r.status,200);assert.equal(r.attached,1);
  for(const kind of ['macro','embedded','expansion']){r=await send([docx(kind)]);assert.equal(r.status,400);assert.equal(r.calls,0);}
  r=await send([pdf('one'),pdf('two'),pdf('three')]);assert.equal(r.status,200);assert.equal(r.attached,3);
  r=await send([{name:'brief.pdf',bytes:'<?php echo "disguised";'}]);assert.equal(r.status,400);assert.equal(r.calls,0);
  r=await send([{name:'brief.php',bytes:'%PDF-1.4\n'}]);assert.equal(r.status,400);
  r=await send([pdf('one'),pdf('two'),pdf('three'),pdf('four')]);assert.equal(r.status,400);
  r=await send([pdf('x'.repeat(4*1024*1024))]);assert.equal(r.status,400);
  r=await send([pdf('x'.repeat(3*1024*1024)),pdf('x'.repeat(3*1024*1024)),pdf('x'.repeat(3*1024*1024))]);assert.equal(r.status,400);assert.equal(r.calls,0);
  r=await send([pdf('clean')],'?mail_failure=1');assert.equal(r.status,502);assert.equal(r.calls,1);
  r=await send([pdf('clean')],'?mail_exception=1');assert.equal(r.status,502);assert.equal(r.calls,1);
  r=await send([pdf('clean')],'?cron_failure=1');assert.equal(r.status,503);assert.equal(r.calls,0);
  r=await send([pdf('clean')],'','expired');assert.equal(r.status,403);assert.equal(r.calls,0);
  fs.chmodSync(priv,0o755);r=await send([pdf('clean')]);assert.equal(r.status,503);assert.equal(r.calls,0);fs.chmodSync(priv,0o700);
  r=await send();assert.equal(r.status,200);assert.equal(r.attached,0);
  console.log('PASS: real multipart upload validation, unscanned uploads, no dispatch on validation rejection, and private cleanup after success/failure/exception. No antivirus scanning is performed; no external mail verification claimed.');
 }finally{server.kill();if(server.exitCode===null)await new Promise(r=>server.once('exit',r));assert.equal(path.dirname(path.resolve(scratch)),path.resolve(os.tmpdir()));assert.ok(path.basename(scratch).startsWith('tfe-upload-test-'));fs.rmSync(scratch,{recursive:true,force:true});}
})().catch(e=>{console.error(e);process.exitCode=1});
