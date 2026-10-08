// Sterrenhemel: zacht fonkelende sterren en af en toe een vallende ster
// Met data-z op de script-tag leg je de sterren hoger, bv. boven een foto.
(() => {
  const z = document.currentScript?.dataset.z || -1;
  const sky = document.createElement('canvas');
  sky.setAttribute('aria-hidden', 'true');
  sky.style.cssText = `position:fixed;inset:0;width:100%;height:100%;z-index:${z};pointer-events:none`;
  document.body.prepend(sky);
  // Astro-paginaovergangen vervangen de body: hang de hemel er opnieuw in
  document.addEventListener('astro:after-swap', () => document.body.prepend(sky));
  const ctx = sky.getContext('2d');
  const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let W, H, stars = [], meteor = null, nextMeteor = performance.now() + 4000;

  const resize = () => {
    const dpr = window.devicePixelRatio || 1;
    W = window.innerWidth;
    H = window.innerHeight;
    sky.width = W * dpr;
    sky.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    stars = Array.from({ length: Math.round((W * H) / 7000) }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      r: 0.5 + Math.random() * 0.9,
      a: 0.3 + Math.random() * 0.45,
      speed: 0.0004 + Math.random() * 0.0008,
      phase: Math.random() * Math.PI * 2
    }));
  };

  const draw = (t) => {
    ctx.clearRect(0, 0, W, H);
    for (const s of stars) {
      const a = still ? s.a : s.a * (0.6 + 0.4 * Math.sin(t * s.speed + s.phase));
      ctx.fillStyle = `rgba(237,237,233,${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    if (still) return;

    if (!meteor && t > nextMeteor) {
      const angle = (20 + Math.random() * 20) * Math.PI / 180;
      meteor = {
        x: Math.random() * W * 0.7,
        y: Math.random() * H * 0.4,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        len: 110 + Math.random() * 80,
        start: t,
        life: 900 + Math.random() * 500
      };
    }
    if (meteor) {
      const p = (t - meteor.start) / meteor.life;
      if (p >= 1) {
        meteor = null;
        nextMeteor = t + 5000 + Math.random() * 6000;
      } else {
        const dist = p * 420;
        const hx = meteor.x + meteor.dx * dist;
        const hy = meteor.y + meteor.dy * dist;
        const tx = hx - meteor.dx * meteor.len;
        const ty = hy - meteor.dy * meteor.len;
        const fade = Math.sin(p * Math.PI) * 0.8;
        const g = ctx.createLinearGradient(hx, hy, tx, ty);
        g.addColorStop(0, `rgba(255,236,210,${fade})`);
        g.addColorStop(1, 'rgba(255,236,210,0)');
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(hx, hy);
        ctx.lineTo(tx, ty);
        ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };

  resize();
  window.addEventListener('resize', () => {
    resize();
    if (still) draw(0);
  });
  requestAnimationFrame(draw);
})();
