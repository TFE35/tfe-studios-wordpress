const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.TFE_PLAYWRIGHT_MODULE || 'playwright');
const project=path.resolve(__dirname,'..');
const theme=path.join(project,'wp-content/themes/tfe-studios-motion');
let html=fs.readFileSync(path.join(project,'reference/v3.1/index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="/style.css">');
const front=fs.readFileSync(path.join(theme,'front-page.php'),'utf8');
let form=front.match(/<form id="contactForm"[\s\S]*?<\/form>/)[0].replace(/<\?php[\s\S]*?\?>/g,'');
html=html.replace(/<form id="contactForm"[\s\S]*?<\/form>/,form).replace('<main id="pages">','<main id="pages" tabindex="-1">');
html=html.replace('</body>','<script src="/js/app.js"></script><script src="/js/contact.js"></script></body>');
html=html.replace('</head>','<script>/* fixture configuration only */</script></head>');
const config={assets:{logo:'/assets/TFE-Studios-Official-Logo.png'},threeUrl:'/js/vendor/three.js',enquiriesEnabled:true,tokenUrl:'/token',enquiryUrl:'/enquiry'};
html=html.replace('<main id="pages" tabindex="-1">','<main id="pages" tabindex="-1" data-tfe-config="'+JSON.stringify(config).replace(/"/g,'&quot;')+'">');
html=html.replace('<div class="services-cta reveal">','<p id="serviceStatus" role="status"></p><div class="services-cta reveal">');
const server=http.createServer((req,res)=>{
 if(req.url.split('?')[0]==='/'){res.setHeader('Content-Type','text/html');res.end(html);return;}
 const file=path.join(theme,decodeURIComponent(req.url.split('?')[0]));
 if(!file.startsWith(theme)||!fs.existsSync(file)){res.statusCode=404;res.end();return;}
 res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':file.endsWith('.css')?'text/css':'image/png');res.end(fs.readFileSync(file));
});
(async()=>{
 await new Promise(r=>server.listen(8899,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const report=[];
 try{
 for(const width of [360,390,768,1440]){
  const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('http://127.0.0.1:8899/#services');
  await page.waitForSelector('#services.is-active');
  assert.equal(await page.locator('#home').isVisible(),false);
  await page.locator('[data-filter="digital"]').click();assert.equal(await page.locator('.service-row:visible').count(),2);
  await page.evaluate(()=>location.hash='process');await page.waitForSelector('#process.is-active');
  await page.locator('[data-step="4"]').click();assert.equal(await page.locator('#processDetailTitle').textContent(),'MAKE IT MATTER.');
  await page.goBack();await page.waitForSelector('#services.is-active');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(project,`evidence/frontend/candidate-services-${width}.png`),fullPage:true});
  if(width===390){
   await page.locator('#menuToggle').click();assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('#menuToggle').getAttribute('aria-expanded'),'false');
   await page.evaluate(()=>location.hash='contact');await page.waitForSelector('#contact.is-active');
   await page.locator('.form-submit').click();assert.equal(await page.locator('#contactName').getAttribute('aria-invalid'),'true');
   await page.locator('#contactName').fill('Test visitor');await page.locator('#contactEmail').fill('visitor@example.org');await page.locator('#contactMessage').fill('Local test only');await page.locator('#contactConsent').check();
   await page.route('**/token',r=>r.fulfill({json:{nonce:'fixture-token'}}));
   await page.route('**/enquiry',r=>r.fulfill({status:502,json:{message:'Mail test failure; use email.'}}));
   await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#contactStatus').textContent.includes('Mail test failure'));assert.equal(await page.locator('#contactMessage').inputValue(),'Local test only');
   await page.unroute('**/enquiry');await page.route('**/enquiry',r=>r.fulfill({json:{message:'Mail service accepted (fixture).'}}));
   await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#contactStatus').textContent.includes('Mail service accepted'));assert.equal(await page.locator('#contactMessage').inputValue(),'');
  }
  assert.deepEqual(errors,[]);report.push({width,passed:true,errors});await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});await nojs.goto('http://127.0.0.1:8899/#services');assert.equal(await nojs.locator('#services').isVisible(),true);report.push({javascriptDisabled:true,servicesVisible:true});
 const gl=await browser.newPage({viewport:{width:1440,height:900}});const glerrors=[];gl.on('pageerror',e=>glerrors.push(e.message));await gl.goto('http://127.0.0.1:8899/');await gl.waitForTimeout(2000);report.push({webgl:await gl.locator('.hero-visual').getAttribute('class'),errors:glerrors});assert.deepEqual(glerrors,[]);
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(project,'evidence/frontend/frontend-checks.json'),JSON.stringify({scope:'Frontend fixture using supplied static markup and active theme CSS/JS/form; not WordPress PHP/runtime evidence',results:report},null,2));}
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
