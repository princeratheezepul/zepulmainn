import React, { useEffect, useRef } from 'react';

const STATS = [
    { to: 100, suffix: '%', initial: '100%', label: 'Autonomous AI hiring execution' },
    { to: 800, suffix: 'M+', initial: '800M+', label: 'Global talent profiles' },
];

const HomeStats = () => {
    const numRefs = useRef([]);

    useEffect(() => {
        const els = numRefs.current.filter(Boolean);
        if (!els.length) return;

        let reduce = false;
        try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch { /* matchMedia unavailable — keep animations */ }
        if (reduce || !('IntersectionObserver' in window)) return;

        const countUp = el => {
            const to = +el.dataset.to;
            const suffix = el.dataset.suffix || '';
            let start = null;
            const frame = ts => {
                if (!start) start = ts;
                const p = Math.min((ts - start) / 1400, 1);
                const eased = 1 - (1 - p) ** 3;
                el.textContent = Math.round(to * eased) + suffix;
                if (p < 1) requestAnimationFrame(frame);
            };
            requestAnimationFrame(frame);
        };

        const io = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (!entry.isIntersecting) return;
                countUp(entry.target);
                io.unobserve(entry.target);
            });
        }, { threshold: 0.6 });

        els.forEach(el => io.observe(el));
        return () => io.disconnect();
    }, []);

    return (
        <section className="stats" aria-label="Zepul in numbers">
            {STATS.map((s, i) => (
                <div className="stat" key={s.label}>
                    <div
                        className="num"
                        ref={el => { numRefs.current[i] = el; }}
                        data-to={s.to}
                        data-suffix={s.suffix}
                    >
                        {s.initial}
                    </div>
                    <div className="lbl">{s.label}</div>
                </div>
            ))}
            <div className="stat">
                {/* TODO: replace with a real figure, e.g. average days from requirement to closure */}
                <div className="num tbd">XX days</div>
                <div className="lbl">From requirement to closure</div>
            </div>
        </section>
    );
};

export default HomeStats;
