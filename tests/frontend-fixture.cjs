const fs=require('node:fs');
const http=require('node:http');
const path=require('node:path');
const assert=require('node:assert/strict');
const {chromium}=require(process.env.TFE_PLAYWRIGHT_MODULE || 'playwright');
const project=path.resolve(__dirname,'..');
const theme=path.join(project,'wp-content/themes/tfe-studios-motion');
let html=fs.readFileSync(path.join(project,'reference/v3.1/index.html'),'utf8').replace(/<script[\s\S]*?<\/script>/g,'').replace(/<style>[\s\S]*?<\/style>/,'<link rel="stylesheet" href="/style.css">');
const front=fs.readFileSync(path.join(theme,'front-page.php'),'utf8');
html=html.replace('<body>','<body class="home page page-id-10 wp-theme-tfe-studios-motion">');
html=html.replace(/<span class="curtain-mark">[\s\S]*?<\/span>STUDIOS<\/span>/,'<span class="curtain-mark" id="curtainTitle">HOME</span>');
html=html.replace(/<section class="page" id="process"[\s\S]*?<\/section>/,front.match(/<section class="page" id="process"[\s\S]*?<\/section>/)[0]);
html=html.replace('role="img"></canvas>','role="img" tabindex="0"></canvas>');
const visual=html.match(/  <div class="hero-visual"[^\n]*/)[0];
html=html.replace(visual,'').replace('  <div class="ticker-wrap">',visual+'\n  <div class="ticker-wrap">');
html=html.replace(/>ABOUT<\/a>/g,'>THE STUDIO</a>').replace(/>About <span>/g,'>The Studio <span>');
let form=front.match(/<form id="contactForm"[\s\S]*?<\/form>/)[0].replace(/<\?php[\s\S]*?\?>/g,'').replace('8 MB total. ','8 MB total. Attachments are not virus-scanned. ');
html=html.replace(/<form id="contactForm"[\s\S]*?<\/form>/,form).replace('<main id="pages">','<main id="pages" tabindex="-1">');
html=html.replace('</body>','<script src="/js/app.js"></script><script src="/js/contact.js"></script></body>');
html=html.replace('</head>','<script>/* fixture configuration only */</script></head>');
const config={assets:{logo:'/assets/TFE-Studios-Official-Logo.png'},threeUrl:'/js/vendor/three.js',enquiriesEnabled:true,attachmentsEnabled:true,tokenUrl:'/token',enquiryUrl:'/enquiry'};
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
   await page.locator('#contactDocuments').setInputFiles({name:'unsupported.exe',mimeType:'application/octet-stream',buffer:Buffer.from('fixture')});
   await page.locator('.form-submit').click();assert.equal(await page.locator('#contactDocuments').getAttribute('aria-invalid'),'true');
   await page.locator('#contactDocuments').setInputFiles({name:'brief.pdf',mimeType:'application/pdf',buffer:Buffer.from('%PDF-1.4 fixture')});
   await page.route('**/enquiry',r=>r.fulfill({status:502,json:{message:'Mail test failure; use email.'}}));
   await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#contactStatus').textContent.includes('Mail test failure'));assert.equal(await page.locator('#contactMessage').inputValue(),'Local test only');
   assert.equal(await page.locator('#contactDocuments').evaluate(el=>el.files.length),1);
   await page.screenshot({path:path.join(project,'evidence/frontend/contact-unscanned-390.png'),fullPage:true});
   await page.unroute('**/enquiry');await page.route('**/enquiry',r=>{assert.ok(r.request().headers()['content-type'].startsWith('multipart/form-data'));assert.ok(r.request().postDataBuffer().includes(Buffer.from('brief.pdf')));return r.fulfill({json:{message:'Mail service accepted (fixture).'}});});
   await page.locator('.form-submit').click();await page.waitForFunction(()=>document.querySelector('#contactStatus').textContent.includes('Mail service accepted'));assert.equal(await page.locator('#contactMessage').inputValue(),'');
   assert.equal(await page.locator('#contactDocuments').evaluate(el=>el.files.length),0);
  }
  assert.equal(await page.evaluate(()=>getComputedStyle(document.body).display),'block');
  await page.evaluate(()=>location.hash='about');await page.waitForSelector('#about.is-active');
  assert.equal(await page.title(),'TFE Studios — The Studio');
  assert.equal(await page.locator('#about').evaluate(el=>getComputedStyle(el).backgroundColor),'rgb(246, 244, 239)');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.waitForTimeout(100);
  await page.screenshot({path:path.join(project,'evidence/frontend',`studio-${width}.png`),fullPage:true});
  await page.evaluate(()=>location.hash='process');await page.waitForSelector('#process.is-active');
  for(let step=0;step<5;step++){
   await page.locator(`[data-step="${step}"]`).click();
   assert.equal(await page.locator('#processDetail').evaluate(el=>el.previousElementSibling?.dataset.step),width<=620?String(step):undefined);
  }
  await page.screenshot({path:path.join(project,'evidence/frontend',`process-${width}.png`),fullPage:true});
  await page.evaluate(()=>location.hash='home');await page.waitForSelector('#home.is-active');
  await page.waitForTimeout(100);
  assert.equal(await page.locator('.hero-line.hollow').evaluate(el=>getComputedStyle(el).webkitTextStrokeWidth),'0px');
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.screenshot({path:path.join(project,'evidence/frontend',`home-${width}.png`),fullPage:true});
  assert.deepEqual(errors,[]);report.push({width,passed:true,errors,staticHomepageBodyVisible:true,studioWhite:true,processSelectionInline:width<=620});await page.close();
 }
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:900}});await nojs.goto('http://127.0.0.1:8899/#services');assert.equal(await nojs.locator('#services').isVisible(),true);report.push({javascriptDisabled:true,servicesVisible:true});
 const gl=await browser.newPage({viewport:{width:390,height:844},isMobile:true,hasTouch:true});const glerrors=[];gl.on('pageerror',e=>glerrors.push(e.message));await gl.goto('http://127.0.0.1:8899/');await gl.waitForSelector('.hero-visual.has-webgl');
 const cdp=await gl.context().newCDPSession(gl);
 async function drag(x1,y1,x2,y2,afterMove){await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:x1,y:y1}]});await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:x2,y:y2}]});if(afterMove)await afterMove();await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
 await gl.locator('#threeCanvas').scrollIntoViewIfNeeded();const rect=await gl.locator('#threeCanvas').boundingBox();
 await gl.touchscreen.tap(rect.x+rect.width*.75,rect.y+rect.height*.5);
 assert.ok(await gl.locator('#threeCanvas').getAttribute('data-tap'));
 assert.equal(await gl.evaluate(()=>location.hash),'');
 await gl.locator('#threeCanvas').focus();const firstTap=await gl.locator('#threeCanvas').getAttribute('data-tap');await gl.keyboard.press('Enter');assert.notEqual(await gl.locator('#threeCanvas').getAttribute('data-tap'),firstTap);
 await gl.waitForTimeout(1800);await gl.locator('#threeCanvas').evaluate(el=>el.blur());await gl.screenshot({path:path.join(project,'evidence/frontend','mobile-three-390.png'),fullPage:false});
 await gl.evaluate(()=>scrollTo(0,0));await drag(310,180,110,180);
 await gl.waitForSelector('#pageCurtain.enter');assert.equal(await gl.locator('#curtainTitle').textContent(),'THE STUDIO');assert.equal(await gl.locator('#pageCurtain').getAttribute('data-direction'),'forward');
 await gl.waitForSelector('#about.is-active');await gl.waitForTimeout(600);await drag(100,220,300,220);await gl.waitForSelector('#pageCurtain.enter');assert.equal(await gl.locator('#curtainTitle').textContent(),'HOME');assert.equal(await gl.locator('#pageCurtain').getAttribute('data-direction'),'backward');await gl.waitForSelector('#home.is-active');
 const desktop=await browser.newPage({viewport:{width:1440,height:900}});await desktop.goto('http://127.0.0.1:8899/');await desktop.waitForSelector('.hero-visual.has-webgl');await desktop.mouse.move(1200,350);assert.ok(await desktop.locator('#threeCanvas').getAttribute('data-tilt'));assert.equal(await desktop.locator('#threeCanvas').getAttribute('role'),'img');
 report.push({webgl:await gl.locator('.hero-visual').getAttribute('class'),mobileTapAndKeyboard:true,desktopPointerTilt:true,touchSwipeBothDirections:true,destinationCurtain:true,errors:glerrors});assert.deepEqual(glerrors,[]);
 }finally{await browser.close();server.close();fs.writeFileSync(path.join(project,'evidence/frontend/frontend-checks.json'),JSON.stringify({scope:'Frontend fixture using supplied static markup and active theme CSS/JS/form; not WordPress PHP/runtime evidence',results:report},null,2));}
 console.log(JSON.stringify(report,null,2));
})().catch(e=>{console.error(e);server.close();process.exitCode=1;});
