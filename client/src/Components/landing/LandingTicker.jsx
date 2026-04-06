import React, { useEffect, useRef } from 'react';

const words = ['Distributed Network', 'Skill Validation', 'AI Screening', 'Global Talent', 'Smart Matching', 'Zero Bias Hiring'];

const LandingTicker = () => {
    const trackRef = useRef(null);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const all = [...words, ...words];
        track.innerHTML = all.map(w => `<span class="lp-ti"><span class="lp-ts">+</span>${w}</span>`).join('');
    }, []);

    return (
        <div className="lp-ticker">
            <div className="lp-ticker-track" ref={trackRef}></div>
        </div>
    );
};

export default LandingTicker;
