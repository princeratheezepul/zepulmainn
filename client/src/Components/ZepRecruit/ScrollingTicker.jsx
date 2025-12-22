export function ScrollingTicker() {
    const tickerItems = [
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AI SCREENING",
        "DISTRIBUTED NETWORK",
        "SKILL VALIDATION",
        "AI SCREENING",
    ];

    return (
        <div
            style={{
                backgroundColor: "#000000",
                color: "#FFFFFF",
                overflow: "hidden",
                whiteSpace: "nowrap",
                position: "relative",
                padding: "12px 0",
            }}
        >
            <style>
                {`
          @keyframes scroll {
            0% {
              transform: translateX(0);
            }
            100% {
              transform: translateX(-50%);
            }
          }
          
          .ticker-content {
            display: inline-block;
            animation: scroll 20s linear infinite;
          }
        `}
            </style>

            <div className="ticker-content">
                {/* First set of items */}
                {tickerItems.map((item, index) => (
                    <span
                        key={`first-${index}`}
                        style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: "14px",
                            fontWeight: 400,
                            letterSpacing: "0.1em",
                            marginRight: "40px",
                        }}
                    >
                        <span style={{ marginRight: "20px" }}>•</span>
                        {item}
                    </span>
                ))}

                {/* Duplicate set for seamless loop */}
                {tickerItems.map((item, index) => (
                    <span
                        key={`second-${index}`}
                        style={{
                            fontFamily: '"DM Sans", sans-serif',
                            fontSize: "14px",
                            fontWeight: 400,
                            letterSpacing: "0.1em",
                            marginRight: "40px",
                        }}
                    >
                        <span style={{ marginRight: "20px" }}>•</span>
                        {item}
                    </span>
                ))}
            </div>
        </div>
    );
}
