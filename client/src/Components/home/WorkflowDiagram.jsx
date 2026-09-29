import React, { useEffect, useRef } from 'react';

/** One lap of the signal along the workflow route, then a beat on "human in the loop". */
const LAP_MS = 9000;
const HOLD_MS = 1200;

/**
 * Boxes that light up together with another box: passing the Hiring Agent also
 * lights Zeus and Thea, and passing sourcing lights every talent data source.
 */
const LINKED = {
    b1: ['zeus', 'thea'],
    b2: ['s0', 's1', 's2'],
};

/**
 * The end-to-end hiring workflow, with a signal tracing the route and lighting
 * each stage as it arrives. Wide screens only — `running` gates the animation
 * so it does not burn frames before the section is scrolled into view.
 */
const WorkflowDiagram = ({ running }) => {
    const routeRef = useRef(null);
    const sigRef = useRef(null);
    const svgRef = useRef(null);

    useEffect(() => {
        const route = routeRef.current;
        const sig = sigRef.current;
        const svg = svgRef.current;
        if (!running || !route || !sig || !svg) return;

        let reduce = false;
        try {
            reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        } catch { /* matchMedia unavailable — keep animations */ }
        if (reduce) return;

        const boxes = Array.from(svg.querySelectorAll('.box')).map(el => ({
            el,
            key: el.dataset.key,
            x: +el.dataset.x,
            y: +el.dataset.y,
            w: +el.dataset.w,
            h: +el.dataset.h,
        }));
        // Only the boxes sitting on the route carry geometry; the rest light up via LINKED.
        const onRoute = boxes.filter(b => Number.isFinite(b.x));

        const len = route.getTotalLength();
        let raf = 0;
        let t0 = null;

        const frame = ts => {
            if (t0 === null) t0 = ts;
            const p = ((ts - t0) % (LAP_MS + HOLD_MS)) / LAP_MS;
            const lit = new Set();

            if (p <= 1) {
                const pt = route.getPointAtLength(p * len);
                sig.setAttribute('cx', pt.x);
                sig.setAttribute('cy', pt.y);
                sig.style.opacity = 1;
                onRoute.forEach(b => {
                    const inside = pt.x >= b.x - 2 && pt.x <= b.x + b.w + 2
                        && pt.y >= b.y - 2 && pt.y <= b.y + b.h + 2;
                    if (inside) lit.add(b.key);
                });
            } else {
                // End of the lap: the handover to a human holds on screen.
                sig.style.opacity = 0;
                lit.add('hum');
            }

            Object.entries(LINKED).forEach(([key, partners]) => {
                if (lit.has(key)) partners.forEach(id => lit.add(id));
            });

            boxes.forEach(b => b.el.classList.toggle('on', lit.has(b.key)));
            raf = requestAnimationFrame(frame);
        };

        raf = requestAnimationFrame(frame);
        return () => cancelAnimationFrame(raf);
    }, [running]);

    return (
        <>
            <div className="swipe">
                <svg ref={svgRef} className="dia" viewBox="-6 -4 1172 482" role="img" aria-label="Zepul hiring workflow diagram">
                <defs><marker id="z4-ah" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="#0A4DFF" /></marker>
                <marker id="z4-ah2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" className="ahs" /></marker></defs>
                {/* dashboards */}
                <g data-key="dash" className="box sm" data-x="0" data-y="4" data-w="356" data-h="52"><rect x="0" y="4" width="356" height="52" rx="10" />
                <text x="16" y="25" className="lbl">LIVE DASHBOARDS</text><text x="16" y="44" className="bs l dm">Live jobs · Coding tests · AI interviews · Scorecards · Closures</text>
                <circle cx="340" cy="21" r="4" className="live" /></g>
                <path className="cn" d="M70,100 V60" markerEnd="url(#z4-ah2)" />
                {/* outreach */}
                <g data-key="out" className="box sm" data-x="374" data-y="4" data-w="222" data-h="52"><rect x="374" y="4" width="222" height="52" rx="10" />
                <text x="485" y="26" textAnchor="middle" className="bt">AI candidate outreach</text><text x="485" y="43" textAnchor="middle" className="bs">to confirm job interest</text></g>
                <path className="cn" d="M402,100 V60" markerEnd="url(#z4-ah2)" /><path className="cn" d="M568,56 V96" markerEnd="url(#z4-ah2)" />
                <path className="ar" d="M142,146 L162,146" markerEnd="url(#z4-ah)" /><path className="ar" d="M308,146 L328,146" markerEnd="url(#z4-ah)" /><path className="ar" d="M474,146 L494,146" markerEnd="url(#z4-ah)" /><path className="ar" d="M640,146 L660,146" markerEnd="url(#z4-ah)" /><path className="ar" d="M806,146 L826,146" markerEnd="url(#z4-ah)" /><path className="ar" d="M972,146 L992,146" markerEnd="url(#z4-ah)" />
                <g data-key="b0" className="box" data-x="0" data-y="100" data-w="140" data-h="92"><rect x="0" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="70.0" cy="124" r="14" /><g transform="translate(61.6 115.6) scale(.7)" className="icn"><path d="M10 17l5-5-5-5M15 12H3M14 4h5a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-5" /></g><text x="70.0" y="156" textAnchor="middle" className="bt">Customer platform</text><text x="70.0" y="171" textAnchor="middle" className="bt">access</text></g><g data-key="b1" className="box" data-x="166" data-y="100" data-w="140" data-h="92"><rect x="166" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="236.0" cy="124" r="14" /><g transform="translate(227.6 115.6) scale(.7)" className="icn"><path d="M12 3a3 3 0 0 1 3 3v5a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3z" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3" /></g><text x="236.0" y="156" textAnchor="middle" className="bt">Hiring Agent</text><text x="236.0" y="171" textAnchor="middle" className="bt">Zeus</text></g><g data-key="b2" className="box" data-x="332" data-y="100" data-w="140" data-h="92"><rect x="332" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="402.0" cy="124" r="14" /><g transform="translate(393.6 115.6) scale(.7)" className="icn"><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></g><text x="402.0" y="156" textAnchor="middle" className="bt">AI-powered multi-</text><text x="402.0" y="171" textAnchor="middle" className="bt">channel sourcing</text></g><g data-key="b3" className="box" data-x="498" data-y="100" data-w="140" data-h="92"><rect x="498" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="568.0" cy="124" r="14" /><g transform="translate(559.6 115.6) scale(.7)" className="icn"><path d="M7 3h7l4 4v14H7z" /><path d="M14 3v4h4M10 12h5M10 16h5" /></g><text x="568.0" y="156" textAnchor="middle" className="bt">CV match</text><text x="568.0" y="174" textAnchor="middle" className="bs">Read · Rank · Match</text></g><g data-key="b4" className="box" data-x="664" data-y="100" data-w="140" data-h="92"><rect x="664" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="734.0" cy="124" r="14" /><g transform="translate(725.6 115.6) scale(.7)" className="icn"><path d="M9 8l-4 4 4 4M15 8l4 4-4 4" /></g><text x="734.0" y="156" textAnchor="middle" className="bt">Personalised</text><text x="734.0" y="171" textAnchor="middle" className="bt">coding test</text><text x="734" y="189" textAnchor="middle" className="bs">AI-driven</text></g><g data-key="b5" className="box" data-x="830" data-y="100" data-w="140" data-h="92"><rect x="830" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="900.0" cy="124" r="14" /><g transform="translate(891.6 115.6) scale(.7)" className="icn"><rect x="3" y="5" width="18" height="12" rx="2" /><path d="M8 21h8M12 17v4" /></g><text x="900.0" y="156" textAnchor="middle" className="bt">Interview with AI</text><text x="900.0" y="174" textAnchor="middle" className="bs">100% automated</text></g><g data-key="b6" className="box" data-x="996" data-y="100" data-w="140" data-h="92"><rect x="996" y="100" width="140" height="92" rx="10" /><circle className="ic" cx="1066.0" cy="124" r="14" /><g transform="translate(1057.6 115.6) scale(.7)" className="icn"><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4v2h6V4M9 11h6M9 15h4" /></g><text x="1066.0" y="156" textAnchor="middle" className="bt">Decision-ready</text><text x="1066.0" y="171" textAnchor="middle" className="bt">scorecard</text></g>
                {/* human */}
                <g data-key="hum" className="box human" data-x="976" data-y="240" data-w="180" data-h="72"><rect x="976" y="240" width="180" height="72" rx="10" />
                <text x="1066" y="270" textAnchor="middle" className="ht">Human in the loop</text><text x="1066" y="288" textAnchor="middle" className="hs">for the final review</text></g>
                <path className="ar" d="M1066,194 V236" markerEnd="url(#z4-ah)" />
                {/* Zeus / Thea */}
                <g data-key="zeus" className="box agent"><rect x="0" y="244" width="316" height="92" rx="10" />
                <text x="16" y="268" className="lbl">ZEUS — AI HIRING AGENT</text>
                <text x="16" y="289" className="bs l">Voice-engage with Zeus → understands the</text><text x="16" y="305" className="bs l">requirement → creates the JD → autonomously</text><text x="16" y="321" className="bs l">executes the entire hiring workflow.</text></g>
                <path className="cn" d="M236,192 V240" markerEnd="url(#z4-ah2)" />
                <path className="cn" d="M130,336 V362" markerEnd="url(#z4-ah2)" /><path className="cn" d="M170,368 V340" markerEnd="url(#z4-ah2)" />
                <g data-key="thea" className="box agent"><rect x="0" y="368" width="316" height="102" rx="10" />
                <text x="16" y="392" className="lbl">THEA — AI CAREER PARTNER</text>
                <text x="16" y="413" className="bs l">Discover, prepare &amp; apply →</text><text x="16" y="429" className="bt l">Your personalised career guide.</text><text x="16" y="447" className="bs l">Thea connects with Zeus to match the right</text><text x="16" y="463" className="bs l">talent to the right JD.</text></g>
                {/* talent sources */}
                <text x="686" y="246" textAnchor="end" className="lbl">TALENT DATA SOURCES</text>
                <path className="cn" d="M402,254 V196" markerEnd="url(#z4-ah2)" />
                <g data-key="s0" className="box src"><rect x="350" y="256" width="336" height="72" rx="10" />
                <g transform="translate(364 270) scale(.7)" className="icn"><ellipse cx="12" cy="5" rx="8" ry="3" /><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" /></g>
                <text x="390" y="279" className="bt l">Zep DB — Intelligent Talent Repository</text><text x="390" y="297" className="bs l">800M+ global profiles in one searchable database.</text><text x="390" y="313" className="bs l">Zeus scans and matches the right candidates.</text></g>
                <g data-key="s1" className="box src"><rect x="350" y="336" width="336" height="44" rx="10" />
                <g transform="translate(364 349) scale(.7)" className="icn"><path d="M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5" /></g><text x="390" y="362" className="bt l">Local job boards integration</text></g>
                <g data-key="s2" className="box src"><rect x="350" y="388" width="336" height="64" rx="10" />
                <g transform="translate(364 401) scale(.7)" className="icn"><circle cx="9" cy="8" r="3" /><path d="M4 19c0-3 2.2-5 5-5s5 2 5 5" /><circle cx="17" cy="9" r="2.3" /><path d="M16 14.2c2.6-.2 4.5 1.6 4.5 4.3" /></g>
                <text x="390" y="410" className="bt l">Recruitment partners</text><text x="390" y="428" className="bs l">Partner talent pools strengthen sourcing</text><text x="390" y="443" className="bs l">for niche and hard-to-fill roles.</text></g>
                <path className="cn" d="M316,420 H333 V292 H346" markerEnd="url(#z4-ah2)" />
                <path ref={routeRef} d="M70,146 H402 V30 H568 V146 H1066 V276" fill="none" stroke="none" />
                <circle ref={sigRef} r="6" className="sig" />
                </svg>
            </div>
        </>
    );
};

export default WorkflowDiagram;
