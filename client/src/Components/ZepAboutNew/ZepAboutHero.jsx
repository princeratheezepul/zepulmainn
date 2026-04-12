import React, { useEffect } from 'react';

const ZepAboutHero = () => {
  useEffect(() => { const revealObserver = new IntersectionObserver((entries) => { entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('visible'); revealObserver.unobserve(entry.target); } }); }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }); const rootNode = document.getElementById('ZepAboutHero-root'); if (rootNode) { rootNode.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el)); } return () => revealObserver.disconnect(); }, []);
  useEffect(() => {
    const canvas = document.getElementById('globeCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    const cx = W / 2, cy = H / 2, R = W * 0.42;
    let angle = 0;
    const dots = [];
    const latStep = 6, lonStep = 6;
    for (let lat = -90; lat <= 90; lat += latStep) {
        for (let lon = -180; lon < 180; lon += lonStep) {
            const latR = lat * Math.PI / 180;
            const lonR = lon * Math.PI / 180;
            dots.push({ lat, lon, latR, lonR });
        }
    }
    function isHighlighted(lat, lon) {
        if (lat >= 8 && lat <= 35 && lon >= 68 && lon <= 97) return true;
        if (lat >= 22 && lat <= 26 && lon >= 51 && lon <= 56) return true;
        if (lat >= 50 && lat <= 59 && lon >= -8 && lon <= 2) return true;
        return false;
    }
    let animationId;
    function draw() {
        ctx.clearRect(0, 0, W, H);
        const cosA = Math.cos(angle), sinA = Math.sin(angle);
        for (const d of dots) {
            const cosLat = Math.cos(d.latR);
            const sinLat = Math.sin(d.latR);
            const cosLon = Math.cos(d.lonR);
            const sinLon = Math.sin(d.lonR);
            const x3 = cosLat * sinLon;
            const y3 = sinLat;
            const z3 = cosLat * cosLon;
            const rx = x3 * cosA + z3 * sinA;
            const rz = -x3 * sinA + z3 * cosA;
            if (rz < -0.1) continue;
            const scale = 1 + rz * 0.15;
            const px = cx + rx * R * scale;
            const py = cy - y3 * R * scale;
            const highlighted = isHighlighted(d.lat, d.lon);
            const baseAlpha = 0.12 + rz * 0.08;
            const alpha = highlighted ? (0.7 + rz * 0.3) : baseAlpha;
            const radius = highlighted ? 2.2 : 1.3;
            ctx.beginPath();
            ctx.arc(px, py, radius * (window.devicePixelRatio > 1 ? 1 : 1), 0, Math.PI * 2);
            if (highlighted) {
                ctx.fillStyle = `rgba(255,255,255,${alpha})`;
            } else {
                ctx.fillStyle = `rgba(200,205,220,${alpha})`;
            }
            ctx.fill();
        }
        angle += 0.003;
        animationId = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(animationId);
  }, []);
  return (
    <div id="ZepAboutHero-root" className="zep-about-page">
      <section className="hero">
  <div className="hero-inner">
    <div className="hero-word">About</div>
    <p className="hero-desc">Reimagining recruitment with AI — from traditional success-based hiring to a fully integrated RaaS, RPO and Retainer model — reducing cost, time, and complexity for the world's best teams.</p>
  </div>

  {/*  Dotted Globe  */}
  <div className="hero-globe">
    <canvas id="globeCanvas" width="840" height="840"></canvas>
  </div>
</section>
    </div>
  );
};

export default ZepAboutHero;
