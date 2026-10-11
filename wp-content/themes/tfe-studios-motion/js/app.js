/* TFE Studios — Creative digital experience / v3.1
   Framework-free navigation and interactions; actual Three.js WebGL hero is loaded
   from the locked local bundle when available. A designed CSS sculpture remains if offline. */
(() => {
  'use strict';
  const routes = ['home', 'about', 'services', 'portfolio', 'process', 'contact'];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const $ = (q, root = document) => root.querySelector(q);
  const $$ = (q, root = document) => [...root.querySelectorAll(q)];
  const configElement = $('#pages');
  if (!configElement) return;
  window.tfeSite = JSON.parse(configElement.dataset.tfeConfig);
  document.body.classList.add('tfe-enhanced');
  document.querySelectorAll('.portfolio-photo').forEach(img => img.addEventListener('error', () => img.remove()));
  const header = $('#siteHeader');
  const curtain = $('#pageCurtain');
  const menu = $('#mobileMenu');
  const menuToggle = $('#menuToggle');
  const content = $('#pages');
  let activePage = 'home';
  let animating = false;
  let pendingPage = null;
  let revealObserver = null;
  let lastScroll = 0;
  const safeRoute = () => {
    const name = window.location.hash.slice(1).split('?')[0].toLowerCase();
    return routes.includes(name) ? name : 'home';
  };
  function closeMenu() {
    const wasOpen = document.body.classList.contains('menu-open');
    document.body.classList.remove('menu-open');
    menu.inert = true;
    if (wasOpen && menu.contains(document.activeElement)) menuToggle.focus();
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Open navigation menu');
  }
  function refreshReveals() {
    if (revealObserver) revealObserver.disconnect();
    const els = $$('.is-active .reveal');
    if (!('IntersectionObserver' in window) || prefersReducedMotion.matches) {
      els.forEach(el => el.classList.add('visible'));
      return;
    }
    revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
    }, {threshold:.09, rootMargin:'0px 0px -45px 0px'});
    els.forEach(el => revealObserver.observe(el));
  }
  function updateMeta(route) {
    const pageNo = routes.indexOf(route) + 1;
    const number = String(pageNo).padStart(2, '0');
    $('#indexCurrent').textContent = number;
    $('#curtainNum').textContent = number + ' / 06';
    $('#footerPage').textContent = route.toUpperCase() + ' / ' + number;
    $$('.desktop-nav a').forEach(a => {
      const isActive = a.dataset.nav === route;
      a.classList.toggle('active', isActive);
      if (isActive) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    });
    $('#prevPage').title = 'Previous: ' + routes[(pageNo+4)%routes.length];
    $('#nextPage').title = 'Next: ' + routes[pageNo%routes.length];
    document.title = 'TFE Studios — ' + route[0].toUpperCase() + route.slice(1);
    header.classList.remove('hide-header');
    header.classList.remove('scrolled');
    $('#pageProgress').style.width = '0%';
  }
  function activate(route, focus = false) {
    routes.forEach(r => {
      const el = document.getElementById(r);
      const on = r === route;
      el.classList.toggle('is-active', on);
      el.setAttribute('aria-hidden', String(!on));
      el.hidden = !on;
      el.inert = !on;
      if (!on) el.querySelectorAll('.reveal.visible').forEach(x => x.classList.remove('visible'));
    });
    activePage = route;
    document.dispatchEvent(new Event('tfe:route'));
    updateMeta(route);
    window.scrollTo({top:0,left:0,behavior:'instant'});
    refreshReveals();
    if (focus) {
      const title = $('#' + route + ' h1');
      if (title) {
        title.tabIndex = -1;
        title.focus({preventScroll:true});
      }
    }
  }
  function navigate(route, focus = false) {
    if (!routes.includes(route)) route = 'home';
    closeMenu();
    if (route === activePage && !animating) return;
    if (animating) { pendingPage = route; return; }
    if (prefersReducedMotion.matches) { activate(route, focus); return; }
    animating = true;
    curtain.classList.remove('exit');
    curtain.classList.add('enter');
    setTimeout(() => {
      activate(route, focus);
      curtain.classList.remove('enter');
      curtain.classList.add('exit');
      setTimeout(() => {
        curtain.classList.remove('exit');
        animating = false;
        if (pendingPage && pendingPage !== activePage) {
          const p = pendingPage;
          pendingPage = null;
          navigate(p, false);
        } else pendingPage = null;
      }, 640);
    }, 620);
  }
  window.addEventListener('hashchange', () => navigate(safeRoute(), true));
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', event => {
    const dest = a.getAttribute('href').slice(1);
    if (dest === activePage) { event.preventDefault(); closeMenu(); window.scrollTo({top:0,behavior:prefersReducedMotion.matches?'instant':'smooth'}); }
  }));
  menuToggle.addEventListener('click', () => {
    const isOpen = document.body.classList.toggle('menu-open');
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Close navigation menu' : 'Open navigation menu');
    menu.inert = !isOpen;
    if (isOpen) $('.mobile-menu a').focus();
  });
  menu.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
  $('#prevPage').addEventListener('click', () => { window.location.hash = routes[(routes.indexOf(activePage)+5)%routes.length]; });
  $('#nextPage').addEventListener('click', () => { window.location.hash = routes[(routes.indexOf(activePage)+1)%routes.length]; });
  menu.inert = true;
  document.addEventListener('keydown', event => {
    if (event.key === 'Tab' && document.body.classList.contains('menu-open')) {
      const links = [...menu.querySelectorAll('a'), menuToggle];
      const current = links.indexOf(document.activeElement);
      event.preventDefault(); links[(current + (event.shiftKey ? links.length - 1 : 1)) % links.length].focus(); return;
    }
    if (event.key === 'Escape') { closeMenu(); return; }
    const editing = event.target.closest('input, textarea, select, button, [contenteditable]');
    if (editing || document.body.classList.contains('menu-open') || event.altKey || event.metaKey || event.ctrlKey) return;
    if (event.key === 'ArrowRight') window.location.hash = routes[(routes.indexOf(activePage)+1)%routes.length];
    if (event.key === 'ArrowLeft') window.location.hash = routes[(routes.indexOf(activePage)+5)%routes.length];
  });
  // Horizontal swipes navigate only when primarily horizontal; page scrolling remains normal.
  let touch = null;
  content.addEventListener('touchstart', e => {
    touch = null;
    if (e.touches.length !== 1 || e.target.closest('a,input,button,select,textarea,.filter-bar,.process-list')) return;
    touch = {x:e.touches[0].clientX,y:e.touches[0].clientY,t:Date.now()};
  }, {passive:true});
  content.addEventListener('touchcancel', () => {touch=null;}, {passive:true});
  content.addEventListener('touchend', e => {
    if (!touch || e.changedTouches.length !== 1) return;
    const dx = e.changedTouches[0].clientX - touch.x;
    const dy = e.changedTouches[0].clientY - touch.y;
    if (Math.abs(dx)>110 && Math.abs(dx)>Math.abs(dy)*1.7 && Date.now()-touch.t<850) {
      const i=routes.indexOf(activePage);
      window.location.hash=routes[(i+(dx<0?1:5))%routes.length];
    }
    touch=null;
  }, {passive:true});
  let scrollTicking=false;
  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking=true;
    requestAnimationFrame(() => {
      const st=window.scrollY;
      const el=document.getElementById(activePage);
      const progress=Math.max(0,Math.min(100,100*st/Math.max(1,el.scrollHeight-window.innerHeight)));
      $('#pageProgress').style.width=progress+'%';
      header.classList.toggle('scrolled',st>30);
      if (window.innerWidth>620) {
        if(st>180 && st>lastScroll+5 && !document.body.classList.contains('menu-open')) header.classList.add('hide-header');
        if(st<lastScroll-5 || st<80) header.classList.remove('hide-header');
      }
      lastScroll=st;
      scrollTicking=false;
    });
  }, {passive:true});
  document.addEventListener('pointermove', e => {
    if (e.pointerType!=='mouse') return;
    document.body.classList.add('has-pointer');
    const halo=$('#cursorHalo'); halo.style.left=e.clientX+'px';halo.style.top=e.clientY+'px';
  }, {passive:true});

  // Service category filters.
  $$('.filter-btn').forEach(btn => btn.addEventListener('click', () => {
    const cat = btn.dataset.filter;
    $$('.filter-btn').forEach(x => {const yes=x===btn;x.classList.toggle('active',yes);x.setAttribute('aria-pressed',String(yes));});
    let count = 0;
    $$('.service-row').forEach(row => { const hide = cat!=='all' && row.dataset.category!==cat; row.classList.toggle('is-hidden', hide); row.hidden = hide; if(!hide) count++; });
    $('#serviceStatus').textContent = count ? count + ' services shown.' : 'No services in this category yet. Contact us to discuss your brief.';
  }));

  // Five stages of a verifiable, reusable studio project process.
  const steps=[
    {label:'CLIENT ONBOARDING',title:'FIRST, WE LISTEN.',body:'We learn your world, your audience and your ambitions. Discovery sessions, needs assessment and a clear scope set the foundation for meaningful creative work.',glyph:'✳'},
    {label:'STRATEGY & CONCEPTING',title:'THEN, WE QUESTION.',body:'Research, audience insights, moodboards and brave ideas shape a strategy that feels right for your goals—not just the current trend.',glyph:'◇'},
    {label:'PRODUCTION & EXECUTION',title:'NOW, WE MAKE.',body:'Our designers, creators and production partners bring the concept alive through careful craft, experimentation and technical execution.',glyph:'↗'},
    {label:'REVIEW & REVISIONS',title:'WE PUSH IT FURTHER.',body:'Your feedback meets our creative standards. We iterate, refine, review quality and make sure every detail tells the right story.',glyph:'✦'},
    {label:'DELIVERY & SUPPORT',title:'MAKE IT MATTER.',body:'Final assets, launch support and learning from results help the work live well beyond delivery day.',glyph:'◎'}
  ];
  $$('.process-step').forEach(btn => btn.addEventListener('click', () => {
    const i=Number(btn.dataset.step),stage=steps[i];
    $$('.process-step').forEach(x=>{const on=x===btn;x.classList.toggle('active',on);x.setAttribute('aria-expanded',String(on));x.querySelector('b').textContent=on?'−':'+';});
    $('#processLabel').textContent='STAGE '+String(i+1).padStart(2,'0')+' — '+stage.label;
    $('#processDetailTitle').textContent=stage.title;
    $('#processDetailBody').textContent=stage.body;
    $('#processDoodle').textContent=stage.glyph;
    $('#processDoodle').style.transform='rotate('+(i*31)+'deg)';
    $('#processTrack').style.width=((i+1)*20)+'%';
  }));
  $('#year').textContent=new Date().getFullYear();
  activate(safeRoute());

  /* v3.1: actual user-supplied logo as a dimensional Three.js asset.
     The transparent, original full-colour logo is the face, with a bevelled extruded
     silhouette behind it. No replacement lettering, no redrawn brand artwork.
     Fallback continues animating the exact original PNG if WebGL unavailable. */
  async function initThree() {
    const visual=$('.hero-visual');
    const canvas=$('#threeCanvas');
    if(prefersReducedMotion.matches){$('#threeStatus').textContent='Original TFE Studios logo shown without motion (accessibility preference).';return;}
    let THREE;
    try { THREE=await import(window.tfeSite.threeUrl); }
    catch(err){$('#threeStatus').textContent='3D library unavailable; original logo uses animated CSS fallback.';return;}
    if (!document.body.contains(canvas)) return;
    let renderer;
    try { renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:window.devicePixelRatio<2,powerPreference:'low-power'}); }
    catch(err){$('#threeStatus').textContent='WebGL unavailable; original logo uses animated CSS fallback.';return;}
    const scene=new THREE.Scene();
    const camera=new THREE.PerspectiveCamera(35,1,.1,100);camera.position.set(0,0,12.3);
    const sculpture=new THREE.Group();scene.add(sculpture);
    const logo=new THREE.Group();sculpture.add(logo);
    const logoOutline=[[1.8026,2.3935],[1.6868,2.4741],[1.4799,2.4741],[0.8347,2.2743],[0.6909,2.418],[0.5541,2.4741],[-0.3016,2.1971],[-0.4243,2.3093],[-0.5085,2.3198],[-0.9995,2.0498],[-1.5957,1.8745],[-1.8096,1.871],[-2.0095,2.0393],[-2.1603,1.9376],[-2.2795,1.7622],[-2.2444,1.3169],[-1.9393,0.9241],[-1.757,0.8119],[-1.9428,0.142],[-1.8447,-0.0999],[-2.2199,-0.4051],[-2.3847,-0.7102],[-2.3567,-0.9802],[-2.1673,-1.2222],[-2.3882,-1.3589],[-2.525,-1.5308],[-2.525,-1.6956],[-2.2339,-2.0498],[-1.9464,-2.1936],[-1.5746,-2.1375],[-1.2695,-2.4321],[-1.1222,-2.4706],[-0.4068,-2.1164],[0.3261,-1.871],[1.0135,-1.7482],[1.6588,-1.7517],[1.7956,-1.6079],[1.7956,-1.3905],[2.1147,-1.2888],[2.3251,-1.1205],[2.4023,-0.9837],[2.4093,-0.8539],[2.2339,-0.5453],[2.4724,-0.1175],[2.5215,-0.107],[2.5215,0.0894],[2.1007,0.5208],[2.0761,0.7172],[1.8026,1.0328],[1.8411,1.0714],[1.8061,1.2011],[1.6763,1.3554],[1.9113,1.3835],[2.1252,1.9516],[2.0516,2.1059]];
    const shape=new THREE.Shape();
    logoOutline.forEach(([x,y],i)=>{ if(i===0)shape.moveTo(x,y);else shape.lineTo(x,y); });shape.closePath();
    const extrusion=new THREE.ExtrudeGeometry(shape,{depth:.23,steps:1,bevelEnabled:true,bevelThickness:.043,bevelSize:.038,bevelSegments:2,curveSegments:3});
    extrusion.computeVertexNormals();
    const frontMat=new THREE.MeshPhysicalMaterial({color:0x141414,metalness:.32,roughness:.41,clearcoat:.5});
    const edgeMat=new THREE.MeshPhysicalMaterial({color:0xd59a43,metalness:.66,roughness:.32,clearcoat:.69});
    const backing=new THREE.Mesh(extrusion,[frontMat,edgeMat]);backing.position.z=-.22;logo.add(backing);
    // The original PNG is preserved pixel-for-pixel on the prominent forward-facing surface.
    let textureReady = false;
    const texture=new THREE.TextureLoader().load(window.tfeSite.assets.logo,()=>{texture.colorSpace=THREE.SRGBColorSpace;textureReady=true;syncMotion();},undefined,()=>{visual.classList.remove('has-webgl');$('#threeStatus').textContent='3D texture unavailable; original logo fallback shown.';});
    texture.colorSpace=THREE.SRGBColorSpace;
    const faceMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.01,side:THREE.FrontSide,depthWrite:false});
    const backMaterial=new THREE.MeshBasicMaterial({map:texture,transparent:true,alphaTest:.01,side:THREE.FrontSide,depthWrite:false});
    const face=new THREE.Mesh(new THREE.PlaneGeometry(5.05,5.05*1411/1440),faceMaterial);face.position.z=.105;logo.add(face);
    const back=new THREE.Mesh(new THREE.PlaneGeometry(5.05,5.05*1411/1440),backMaterial);back.position.z=-.25;back.rotation.y=Math.PI;logo.add(back);
    const orbitMat=new THREE.MeshBasicMaterial({color:0xe9a144,transparent:true,opacity:.35,depthWrite:false});
    const orbitA=new THREE.Mesh(new THREE.TorusGeometry(3.37,.013,7,125),orbitMat);orbitA.rotation.set(1.1,.35,-.2);sculpture.add(orbitA);
    const orbitB=new THREE.Mesh(new THREE.TorusGeometry(3.78,.008,6,140),new THREE.MeshBasicMaterial({color:0xe2382c,transparent:true,opacity:.24,depthWrite:false}));orbitB.rotation.set(.25,1.3,.56);sculpture.add(orbitB);
    const n=190,pos=new Float32Array(n*3);
    for(let i=0;i<n;i++){const a=i*2.39996;const r=3.75+(i%11)*.04;pos[i*3]=Math.cos(a)*r;pos[i*3+1]=Math.sin(a)*r*.77;pos[i*3+2]=((i*17)%41-20)*.065;}
    const pg=new THREE.BufferGeometry();pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
    const points=new THREE.Points(pg,new THREE.PointsMaterial({color:0xe2a04d,size:.022,transparent:true,opacity:.68,depthWrite:false}));sculpture.add(points);
    scene.add(new THREE.AmbientLight(0xffffff,1.1));
    const key=new THREE.PointLight(0xffd8a0,100,20);key.position.set(-4,5,7);scene.add(key);
    const rim=new THREE.PointLight(0xff8d49,135,20);rim.position.set(5,-2,4);scene.add(rim);
    let mx=0,my=0,smx=0,smy=0,enabled=true,last=0,frameId=null;
    const onMove=(e)=>{if(activePage!=='home'||e.pointerType!=='mouse')return;const rect=visual.getBoundingClientRect();mx=Math.max(-1,Math.min(1,(e.clientX-rect.left)/rect.width*2-1));my=Math.max(-1,Math.min(1,(e.clientY-rect.top)/rect.height*2-1));};
    window.addEventListener('pointermove',onMove,{passive:true});
    function resize(){const r=visual.getBoundingClientRect();const w=Math.max(1,r.width),h=Math.max(1,r.height);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.6));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix();sculpture.scale.setScalar(w<550?.78:1.00);sculpture.position.x=w<550?.77:.64;}
    window.addEventListener('resize',resize,{passive:true});resize();
    const shouldRun = () => enabled && textureReady && !document.hidden && activePage==='home' && !prefersReducedMotion.matches;
    function syncMotion() {
      const run=shouldRun();
      visual.classList.toggle('has-webgl', enabled && textureReady && !prefersReducedMotion.matches);
      if(run && frameId===null){resize();frameId=requestAnimationFrame(frame);}
      if(!run && frameId!==null){cancelAnimationFrame(frameId);frameId=null;}
    }
    document.addEventListener('visibilitychange',syncMotion);
    window.addEventListener('hashchange',syncMotion);
    document.addEventListener('tfe:route',syncMotion);
    prefersReducedMotion.addEventListener('change',syncMotion);
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();enabled=false;syncMotion();$('#threeStatus').textContent='WebGL context lost; original logo fallback restored.';});
    canvas.addEventListener('webglcontextrestored',()=>{enabled=true;resize();syncMotion();});
    window.addEventListener('pagehide',()=>{enabled=false;syncMotion();});
    window.addEventListener('pageshow',()=>{enabled=true;syncMotion();});
    const clock=new THREE.Clock();
    function frame(t){frameId=null;if(!shouldRun())return;frameId=requestAnimationFrame(frame);
      if(t-last<22)return;last=t;
      smx+=(mx-smx)*.038;smy+=(my-smy)*.038;
      const time=clock.getElapsedTime();
      // Distinctive studio art stays legible: gentle 3D yaw/roll, float and responsive tilt.
      sculpture.rotation.y=Math.sin(time*.27)*.22 + smx*.30;
      sculpture.rotation.x=Math.sin(time*.31)*.10-smy*.20;
      sculpture.rotation.z=Math.sin(time*.17)*.082;
      orbitA.rotation.z=time*.13;
      orbitB.rotation.y=time*.09;
      points.rotation.z=time*.028;
      sculpture.position.y=Math.sin(time*.64)*.13;
      renderer.render(scene,camera);
    }
    syncMotion();
  }
  initThree();
})();
