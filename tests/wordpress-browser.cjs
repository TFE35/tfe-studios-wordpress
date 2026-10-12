const fs=require('node:fs');const path=require('node:path');const out=path.resolve(__dirname,'../evidence/wordpress');fs.mkdirSync(out,{recursive:true});const site=process.env.TFE_TEST_URL||'http://127.0.0.1:9401';const assert=require('node:assert/strict');
const {chromium}=require(process.env.TFE_PLAYWRIGHT_MODULE||'playwright');
(async()=>{
 const b=await chromium.launch({headless:true,channel:'msedge'});const report=[];
 try{
 for(const width of [360,390,768,1440]){
  const p=await b.newPage({viewport:{width,height:900},reducedMotion:'reduce'});const errors=[];p.on('pageerror',e=>errors.push(e.message));
  await p.goto(site+'/#services',{waitUntil:'domcontentloaded'});await p.waitForSelector('#services.is-active');
  await p.locator('[data-filter="digital"]').click();assert.equal(await p.locator('.service-row:visible').count(),2);
  await p.evaluate(()=>location.hash='process');await p.waitForSelector('#process.is-active');await p.locator('[data-step="4"]').click();assert.equal(await p.locator('#processDetailTitle').textContent(),'MAKE IT MATTER.');
  await p.goBack();await p.waitForSelector('#services.is-active');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await p.screenshot({path:path.join(out,`wordpress-services-${width}.png`),fullPage:true});
  await p.evaluate(()=>location.hash='contact');await p.waitForSelector('#contact.is-active');
  await p.locator('.form-submit').click();assert.equal(await p.locator('#contactName').getAttribute('aria-invalid'),'true');
  await p.screenshot({path:path.join(out,`wordpress-contact-${width}.png`),fullPage:true});
  const rest=await p.evaluate(async()=>{const config=JSON.parse(document.querySelector('#pages').dataset.tfeConfig);const t=await fetch(config.tokenUrl);const token=await t.json();const r=await fetch(config.enquiryUrl,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({nonce:token.nonce})});return {tokenStatus:t.status,cache:t.headers.get('cache-control'),disabledStatus:r.status,enabled:config.enquiriesEnabled};});assert.equal(rest.tokenStatus,200);assert.equal(rest.disabledStatus,503);
  assert.deepEqual(errors,[]);report.push({width,passed:true,errors,rest});await p.close();
 }
 const nojs=await b.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});await nojs.goto(site+'/#services');assert.equal(await nojs.locator('#services').isVisible(),true);assert.equal(await nojs.locator('.form-submit').isDisabled(),true);report.push({javaScriptDisabled:true,sectionsAvailable:true,submitDisabled:true});
 const p=await b.newPage({viewport:{width:1440,height:900}});const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto(site+'/');await p.waitForSelector('.has-webgl');await p.screenshot({path:path.join(out,'wordpress-home-1440.png'),fullPage:true});
 const gl=await p.evaluate(()=>{const canvas=document.querySelector('#threeCanvas');canvas.dispatchEvent(new Event('webglcontextlost',{cancelable:true}));return !document.querySelector('.hero-visual').classList.contains('has-webgl')});assert.equal(gl,true);report.push({webgl:true,contextLossFallback:true,errors});assert.deepEqual(errors,[]);
 }finally{fs.writeFileSync(path.join(out,'wordpress-checks.json'),JSON.stringify({scope:'Local WordPress Playground 6.8, PHP 8.3, SQLite; not managed hosting',results:report},null,2));await b.close();}
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e.message);process.exitCode=1});
