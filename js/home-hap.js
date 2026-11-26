/* 首頁 HAP section：對位、亮白／抗敏切換、微粒動畫；手機 30 秒測驗浮動掣 */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const sec = document.getElementById('hap'), hero = document.getElementById('hapHero');
  const stage = document.getElementById('hapStage');
  const altImg = document.getElementById('hapAltImg');

  document.querySelectorAll('[data-split]').forEach(el => {
    el.innerHTML = [...el.textContent].map((c,i)=>`<span style="--i:${i}">${c}</span>`).join('');
  });

  /* ── 對位 ──
     亮白底圖 2560×1560，隻牙：中心 (0.494, 0.660)，高 0.574
     抗敏底圖 1606×979，隻牙：中心 (0.503, 0.574)，高 0.587 */
  const IW = 2560, IH = 1560;
  const textEl = hero.querySelector('.hx-hero__text'), ctrl = hero.querySelector('.hx-ctrl');
  let W, H, img, tooth;
  function layout(){
    W = hero.clientWidth;
    const mob = W <= 760, L = sec.dataset.layout;
    // 文字區底部 → 隻牙頂要喺佢下面 gap 位
    const tb = textEl.offsetTop + textEl.offsetHeight;
    const gap = mob ? 14 : Math.min(48, Math.max(24, W*.025));
    // 桌面：底圖放大 7%，隻牙中心由 49.4% 移去 46%，右邊讓位畀模特兒
    const iw = mob ? Math.min(W*2.26, 1100) : W*1.07, ih = iw*IH/IW;
    const iy = tb + gap - ih*0.373, ix = mob ? W*0.42 - iw*0.494 : W*0.46 - iw*0.494;
    let hh = iy + ih;
    if (L === 'd'){                                   // 切換掣放喺牙根下面
      const top = iy + ih*0.9; ctrl.style.top = (top - textEl.offsetTop)+'px';
      hh = Math.max(hh, top + ctrl.offsetHeight + 50);
    } else ctrl.style.top = '';
    hero.style.height = hh+'px'; H = hh;
    img = {x: ix, y: iy, w: iw, h: ih};
    Object.assign(stage.style, {left: ix+'px', top: iy+'px', width: iw+'px', height: ih+'px'});

    const cx = ix + iw*0.494, cy = iy + ih*0.660, th = ih*0.574;
    tooth = {cx, cy, h: th, w: th*0.78};
    const ah = th/0.587, aw = ah*1606/979;
    Object.assign(altImg.style, {width: aw+'px', height: ah+'px', left: (cx - aw*0.503)+'px', top: (cy - ah*0.574)+'px'});

    // 標籤錨點：牙冠右上方
    // 桌面：標籤放隻牙左上方（右邊留畀模特兒）；手機：隻牙右上方
    const ax = cx + th*(mob ? .52 : -.62), ay = cy - th*(mob ? .44 : .4);
    const hx = (id, dx, dy, fw) => { const el = document.getElementById(id), w = th*fw;
      Object.assign(el.style, {left: (ax + th*dx)+'px', top: (ay + th*dy)+'px', width: w+'px'}); return w; };
    const hw = hx('hapHex', 0, 0, mob ? .3 : .36); document.getElementById('hapHex').style.setProperty('--fs', (hw*0.2)+'px');
    if (mob){ hx('hapHex2', .22, .12, .07); hx('hapHex3', .16, .19, .09); } else { hx('hapHex2', -.27, -.14, .07); hx('hapHex3', -.2, -.21, .09); }
    // 標籤 2：說明標籤喺牙冠右邊，指示線連去牙面
    const t2 = document.getElementById('hapTag2'), fs = Math.max(12, Math.min(18, th*.045));
    t2.style.setProperty('--fs', fs+'px');
    const px = mob ? Math.min(cx + th*.3, W - t2.offsetWidth - 10) : Math.max(10, cx - th*.52 - t2.offsetWidth), py = cy - th*(mob ? .62 : .3);
    Object.assign(t2.style, {left: px+'px', top: py+'px'});
    const dx = cx + th*(mob ? .22 : -.22), dy = cy - th*.2;
    const ln = document.getElementById('hapLeadLine');
    ln.setAttribute('x1', dx); ln.setAttribute('y1', dy); ln.setAttribute('x2', mob ? px + 30 : px + t2.offsetWidth); ln.setAttribute('y2', mob ? py + t2.offsetHeight/2 : py);
    ['hapDot','hapPing'].forEach(id => { const c = document.getElementById(id); c.setAttribute('cx', dx); c.setAttribute('cy', dy); });
    // 標籤 3：圓形徽章
    const d = th*(mob ? .3 : .3), t3 = document.getElementById('hapTag3');
    Object.assign(t3.style, {left: ax+'px', top: ay+'px', width: d+'px'}); t3.style.setProperty('--d', d+'px');
    // 標籤 4：線條六角形
    const w4 = th*(mob ? .38 : .4), t4 = document.getElementById('hapTag4');
    Object.assign(t4.style, {left: ax+'px', top: ay+'px', width: w4+'px'}); t4.style.setProperty('--w', w4+'px');
  }

  /* ── 光環（亮白）：三條扁橢圓繞住隻牙，有一段光喺環上面行；前半圈光、後半圈暗 ── */
  const RINGS = [
    {dy:-.05, rx:.78, ry:.11, tilt:-.07, sp:.55, ph:0},
    {dy: .07, rx:.95, ry:.15, tilt: .11, sp:-.4, ph:2},
    {dy: .19, rx:.82, ry:.12, tilt: .04, sp:.47, ph:4},
  ];
  const ringGeom = r => ({cx: tooth.cx, cy: tooth.cy + tooth.h*r.dy, rx: tooth.h*r.rx, ry: tooth.h*r.ry, tilt: r.tilt});
  function ringPoint(g, th){ const ex = Math.cos(th)*g.rx, ey = Math.sin(th)*g.ry, c = Math.cos(g.tilt), s = Math.sin(g.tilt);
    return [g.cx + ex*c - ey*s, g.cy + ex*s + ey*c]; }
  let ringOn = false, ringA = 0, ringTarget = 0;
  function drawRings(t){
    if (ringA < .01) return;
    const c = col.map(Math.round).join(','), N = 150;
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round';
    for (const r of RINGS){
      const g = ringGeom(r), head = r.ph + t*r.sp;
      let prev = ringPoint(g, 0);
      for (let i=1;i<=N;i++){
        const th = i/N*Math.PI*2, p = ringPoint(g, th);
        const front = Math.sin(th) > 0 ? 1 : .3;
        let d = Math.abs(((th - head) % (Math.PI*2) + Math.PI*3) % (Math.PI*2) - Math.PI);
        const hi = Math.exp(-d*d/.9);
        const a = (.35 + .65*hi) * front * ringA;
        ctx.strokeStyle = `rgba(${c},${.16*a})`; ctx.lineWidth = 16;
        ctx.beginPath(); ctx.moveTo(prev[0],prev[1]); ctx.lineTo(p[0],p[1]); ctx.stroke();
        ctx.strokeStyle = `rgba(${c},${.35*a})`; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(prev[0],prev[1]); ctx.lineTo(p[0],p[1]); ctx.stroke();
        ctx.strokeStyle = `rgba(230,250,255,${.95*a})`; ctx.lineWidth = 1.8 + hi*1.6;
        ctx.beginPath(); ctx.moveTo(prev[0],prev[1]); ctx.lineTo(p[0],p[1]); ctx.stroke();
        prev = p;
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  }

  /* ── 發光微粒 ── 亮白：沿光環繞圈→落牙面閃一下；抗敏：柔光微粒慢慢向上飄 */
  const cv = document.getElementById('hapParticles'), ctx = cv.getContext('2d');
  const THEMES = {w: [0,166,234], s: [228,110,140]};
  let col = THEMES.w.slice(), colTarget = THEMES.w, mode = 'w';
  let parts = [], dust = [], bok = [], enabled = !reduce, running = false, raf, last = 0, spawnT = 0, clock = 0;

  function size(){
    const dpr = Math.min(devicePixelRatio || 1, 2);
    layout();
    cv.width = W*dpr; cv.height = H*dpr; ctx.setTransform(dpr,0,0,dpr,0,0);
    dust = Array.from({length: W < 760 ? 16 : 30}, () => newDust(true));
    bok = Array.from({length: W < 760 ? 4 : 8}, () => newBok(true));
  }
  function newBok(anyY){ const r = (W < 760 ? 10 : 16) + Math.random()*(W < 760 ? 14 : 26);
    return {x: Math.random()*W, y: anyY ? Math.random()*H : H + r, r, v: 4+Math.random()*6, ph: Math.random()*6.28, a: .12+Math.random()*.14}; }
  function newDust(anyY){ return {x: Math.random()*W, y: anyY ? Math.random()*H : H+5, r: Math.random()*1+.5,
    v: Math.random()*8+5, ph: Math.random()*6.28, a: Math.random()*.35+.2}; }
  function newParticle(){
    return {ring: RINGS[Math.floor(Math.random()*RINGS.length)], th: Math.random()*6.28, w: .5+Math.random()*.35,
      life: 0, dur: 4.5+Math.random()*2.5, lx: (Math.random()-.5)*tooth.w*.8, ly: (Math.random()-.6)*tooth.h*.6,
      r: Math.random()*1.4+1.4, trail: [], rot: Math.random()*6.28, spin: (Math.random()-.5)*1.6, tp: Math.random()*6.28, tf: 4+Math.random()*4};
  }
  function newMote(){
    const pink = Math.random() < .7;
    return {mote: true, x: tooth.cx + (Math.random()-.5)*tooth.w*2.4, y: tooth.cy + tooth.h*(.1+Math.random()*.35),
      vy: -(8+Math.random()*14), ph: Math.random()*6.28, life: 0, dur: 5+Math.random()*4, r: Math.random()*1.6+1.4,
      c: pink ? '255,196,214' : '200,190,255', big: Math.random() < .3};
  }
  function drawMote(p, dt){
    p.life += dt/p.dur; p.ph += dt; p.y += p.vy*dt; const x = p.x + Math.sin(p.ph*.8)*10;
    const k = p.life, o = (k < .2 ? k/.2 : k > .7 ? Math.max(0,(1-k)/.3) : 1), tw = Math.sin(p.ph*2.4)*.5+.5;
    ctx.globalCompositeOperation = 'lighter';
    if (p.big) bokeh(x, p.y, p.r*7, .55*o, p.c);                 // 大粒：柔和散景光斑
    else { glow(x, p.y, p.r*6, .45*o, p.c); star(x, p.y, p.r*11*(.6+.4*tw), o*(.5+.5*tw), p.ph*.3); }
    ctx.globalCompositeOperation = 'source-over';
    return p.life < 1;
  }
  /* ── 星光 sprite：四條主光芒＋四條短光芒＋光心（預先畫好，每格只係縮放／旋轉） ── */
  const STAR = (() => { const c = document.createElement('canvas'); c.width = c.height = 128; const g = c.getContext('2d'); g.translate(64,64);
    const ray = (len, wid, a) => { const gr = g.createLinearGradient(-len,0,len,0);
      gr.addColorStop(0,'rgba(255,255,255,0)'); gr.addColorStop(.5,`rgba(255,255,255,${a})`); gr.addColorStop(1,'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.moveTo(-len,0); g.quadraticCurveTo(0,-wid,len,0); g.quadraticCurveTo(0,wid,-len,0); g.fill(); };
    ray(62,4.5,1); g.rotate(Math.PI/2); ray(62,4.5,1); g.rotate(Math.PI/4); ray(28,2.6,.55); g.rotate(Math.PI/2); ray(28,2.6,.55);
    const rg = g.createRadialGradient(0,0,0,0,0,16); rg.addColorStop(0,'rgba(255,255,255,1)'); rg.addColorStop(.35,'rgba(255,255,255,.8)'); rg.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle = rg; g.beginPath(); g.arc(0,0,16,0,6.28); g.fill(); return c; })();
  const rgb = () => col.map(Math.round).join(',');
  function glow(x, y, rad, a, c){ const g = ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(${c},${a})`); g.addColorStop(.45,`rgba(${c},${a*.35})`); g.addColorStop(1,`rgba(${c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,rad,0,6.28); ctx.fill(); }
  function star(x, y, size, a, rot){ ctx.save(); ctx.translate(x,y); ctx.rotate(rot); ctx.globalAlpha = Math.max(0,Math.min(1,a));
    ctx.drawImage(STAR, -size/2, -size/2, size, size); ctx.restore(); }
  // 散景光點：中間淡、邊緣光，似鏡頭失焦嘅光斑
  function bokeh(x, y, rad, a, c){ const g = ctx.createRadialGradient(x,y,0,x,y,rad);
    g.addColorStop(0,`rgba(${c},${a*.18})`); g.addColorStop(.72,`rgba(${c},${a*.3})`); g.addColorStop(.9,`rgba(${c},${a*.55})`); g.addColorStop(1,`rgba(${c},0)`);
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x,y,rad,0,6.28); ctx.fill(); }
  // 一粒閃光微粒：彩色光暈＋白色星光（會閃、會轉）
  function sparkle(x, y, r, o, rot, tw){ const c = rgb();
    ctx.globalCompositeOperation = 'lighter';
    glow(x, y, r*7, .5*o, c);
    star(x, y, r*13*(.7+.3*tw), o*(.75+.25*tw), rot);
    ctx.globalCompositeOperation = 'source-over'; }

  function drawOrbit(p, dt){
    p.life += dt/p.dur; p.th += p.w*dt*(1+p.life*1.2); p.rot += p.spin*dt; p.tp += dt*p.tf;
    const g = ringGeom(p.ring), k = Math.min(p.life,1), shrink = 1 - Math.pow(k,1.5), land = Math.pow(k,2.2);
    const gs = {...g, rx: g.rx*shrink, ry: g.ry*shrink}, [ox, oy] = ringPoint(gs, p.th);
    const x = ox*(1-land) + (tooth.cx + p.lx)*land, y = oy*(1-land) + (tooth.cy + p.ly)*land;
    let o = (k < .1 ? k/.1 : k > .9 ? (1-k)/.1 : 1) * ((1-land)*(Math.sin(p.th) < 0 ? .4 : 1) + land);
    p.trail.push({x,y}); if (p.trail.length > 22) p.trail.shift();
    // 彗星尾：由粗到幼、由光到暗
    ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; const c = rgb();
    for (let i=1;i<p.trail.length;i++){ const f = i/p.trail.length;
      ctx.strokeStyle = `rgba(${c},${f*f*.45*o})`; ctx.lineWidth = p.r*2.6*f;
      ctx.beginPath(); ctx.moveTo(p.trail[i-1].x,p.trail[i-1].y); ctx.lineTo(p.trail[i].x,p.trail[i].y); ctx.stroke();
      ctx.strokeStyle = `rgba(255,255,255,${f*f*.6*o})`; ctx.lineWidth = p.r*.9*f; ctx.stroke(); }
    ctx.globalCompositeOperation = 'source-over';
    sparkle(x, y, p.r, o, p.rot, Math.sin(p.tp)*.5+.5);
    if (k > .84){ const u = (k-.84)/.16, s = Math.sin(u*Math.PI);   // 落到牙面：大星光一閃＋一圈光環散開
      ctx.globalCompositeOperation = 'lighter';
      star(x, y, p.r*30*s, s, p.rot + u*.6);
      ctx.strokeStyle = `rgba(${c},${.5*(1-u)})`; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.arc(x,y,p.r*2+u*p.r*12,0,6.28); ctx.stroke();
      ctx.globalCompositeOperation = 'source-over'; }
    return p.life < 1;
  }
  function step(t){
    raf = requestAnimationFrame(step);
    const dt = Math.min((t-last)/1000 || 0, .05); last = t; clock += dt;
    for (let i=0;i<3;i++) col[i] += (colTarget[i]-col[i])*Math.min(dt*3,1);
    ringA += (ringTarget-ringA)*Math.min(dt*2.5,1);
    ctx.clearRect(0,0,W,H);
    ctx.globalCompositeOperation = 'lighter';
    for (const d of dust){ d.y -= d.v*dt; d.ph += dt*.9; if (d.y < -5) Object.assign(d, newDust(false));
      const tw = Math.sin(d.ph*1.7), x = d.x + Math.sin(d.ph*.7)*4;
      if (tw > .93) star(x, d.y, 10 + d.r*6, (tw-.93)/.07*.9, d.ph);    // 偶然閃一下
      else { ctx.fillStyle = `rgba(255,255,255,${d.a*(.55+.45*tw)})`; ctx.beginPath(); ctx.arc(x, d.y, d.r, 0, 6.28); ctx.fill(); } }
    for (const b of bok){ b.y -= b.v*dt; b.x += Math.sin(clock*.2 + b.ph)*.15; if (b.y < -b.r) Object.assign(b, newBok(false));
      bokeh(b.x, b.y, b.r, b.a*(.7+.3*Math.sin(clock*.6+b.ph)), rgb()); }
    ctx.globalCompositeOperation = 'source-over';
    drawRings(clock);
    const max = W < 760 ? 14 : 26; spawnT -= dt;
    if (spawnT <= 0 && parts.length < max){
      if (mode === 'w'){ parts.push(newParticle()); spawnT = .2 + Math.random()*.25; }
      else { parts.push(newMote()); spawnT = .35 + Math.random()*.4; }
    }
    parts = parts.filter(p => p.mote ? drawMote(p, dt) : drawOrbit(p, dt));
    if (!running || !enabled){ cancelAnimationFrame(raf); ctx.clearRect(0,0,W,H); }
  }
  function start(){ cancelAnimationFrame(raf); if (running && enabled){ last = performance.now(); raf = requestAnimationFrame(step); } }

  new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) hero.classList.add('is-on');
    running = e.isIntersecting; start();
  }), {threshold: .15}).observe(hero);

  addEventListener('resize', () => { size(); placeThumb(); }); size();

  /* ── 切換產品 ── 入畫面後每 7 秒自動轉，用戶撳過就停 */
  const thumb = sec.querySelector('.hx-switch__thumb'), tabs = [...sec.querySelectorAll('.hx-switch button')];
  const more = document.getElementById('hapMore');
  let auto = !reduce, autoT;
  function placeThumb(){ const b = tabs.find(x => x.getAttribute('aria-selected')==='true');
    thumb.style.width = b.offsetWidth+'px'; thumb.style.transform = `translateX(${b.offsetLeft-5}px)`; }
  function setP(p){
    sec.dataset.p = p; mode = p; colTarget = THEMES[p]; ringTarget = (p === 'w' && ringOn) ? 1 : 0;
    tabs.forEach(b => b.setAttribute('aria-selected', b.dataset.p===p));
    more.href = more.dataset[p];
    placeThumb();
  }
  tabs.forEach(b => b.addEventListener('click', () => { auto = false; clearInterval(autoT); setP(b.dataset.p); }));
  sec.addEventListener('keydown', e => { if (!['ArrowLeft','ArrowRight'].includes(e.key) || !e.target.closest('.hx-switch')) return;
    auto = false; clearInterval(autoT); const p = sec.dataset.p==='w'?'s':'w'; setP(p); tabs.find(b=>b.dataset.p===p).focus(); });
  new IntersectionObserver(es => es.forEach(e => { clearInterval(autoT);
    if (e.isIntersecting && auto) autoT = setInterval(() => setP(sec.dataset.p==='w'?'s':'w'), 7000);
  }), {threshold:.4}).observe(hero);
  document.fonts && document.fonts.ready.then(placeThumb); placeThumb();

})();

(() => { // 30 秒測驗浮動掣：開頁 2 秒後彈出提示，5 秒後收埋
  const fab = document.getElementById('quizFab'); if (!fab) return;
  setTimeout(() => fab.classList.add('tip'), 2000); setTimeout(() => fab.classList.remove('tip'), 7000);
})();
