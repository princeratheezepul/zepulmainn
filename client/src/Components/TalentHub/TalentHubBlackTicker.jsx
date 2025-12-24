import React from 'react';

export function TalentHubBlackTicker() {
    const items = ["DISTRIBUTED NETWORK", "SKILL VALIDATION", "AI SCREENING"];

    const TickerGroup = () => (
        <>
            {items.map((item, index) => (
                <React.Fragment key={index}>
                    <span className="text-white">{item}</span>
                    <span className="text-[#333333] mx-12">+</span>
                </React.Fragment>
            ))}
        </>
    );

    return (
        <div className="w-full bg-black overflow-hidden py-2">
            <div className="whitespace-nowrap animate-marquee flex">
                <div
                    className="flex items-center"
                    style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: "16px",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        textTransform: "uppercase"
                    }}
                >
                    {/* Repeat enough times to fill width */}
                    {Array(10).fill(null).map((_, i) => (
                        <TickerGroup key={i} />
                    ))}
                </div>

                {/* Duplicate for seamless loop */}
                <div
                    className="flex items-center"
                    style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: "16px",
                        fontWeight: 400,
                        letterSpacing: "-0.02em",
                        textTransform: "uppercase"
                    }}
                >
                    {Array(10).fill(null).map((_, i) => (
                        <TickerGroup key={i} />
                    ))}
                </div>
            </div>
        </div>
    );
}
