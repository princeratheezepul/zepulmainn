import React, { useEffect, useRef } from 'react';

const LandingStats = () => {
    const statRefs = useRef([]);

    useEffect(() => {
        const io = new IntersectionObserver(entries => {
            entries.forEach(({ isIntersecting, target: el }) => {
                if (!isIntersecting) return;
                const end = +el.dataset.target;
                const sfx = el.dataset.suffix;
                let s = null;
                const run = ts => {
                    if (!s) s = ts;
                    const p = Math.min((ts - s) / 1100, 1);
                    el.textContent = Math.round((1 - (1 - p) ** 3) * end) + sfx;
                    if (p < 1) requestAnimationFrame(run);
                };
                requestAnimationFrame(run);
                io.unobserve(el);
            });
        }, { threshold: .5 });

        statRefs.current.forEach(el => el && io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <div className="lp-stats">
            <div className="lp-stat">
                <div className="lp-stat-n">
                    <span ref={el => statRefs.current[0] = el} data-target="100" data-suffix="% AI">100% AI</span>
                </div>
                <div className="lp-stat-l">Hiring Execution</div>
            </div>
            <div className="lp-stat">
                <div className="lp-stat-n">
                    <span ref={el => statRefs.current[1] = el} data-target="150" data-suffix="+">150+</span>
                </div>
                <div className="lp-stat-l">Global Recruitment Partners</div>
            </div>
            <div className="lp-stat">
                <div className="lp-stat-n">
                    <span ref={el => statRefs.current[2] = el} data-target="400" data-suffix="K+">400K+</span>
                </div>
                <div className="lp-stat-l">Decision Ready Talent Data</div>
            </div>
        </div>
    );
};

export default LandingStats;
