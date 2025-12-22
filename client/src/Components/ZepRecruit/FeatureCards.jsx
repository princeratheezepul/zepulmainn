export function FeatureCards() {
  const stats = [
    {
      description: "Recruiters activated per role on demand",
      value: "15+",
      isText: false,
    },
    {
      description: "Sourcing channels operating in parallel",
      value: "3",
      isText: false,
    },
    {
      description: "Single contract, centralized governance",
      value: "→",
      isText: true,
    },
    {
      description: "AI + human validation on every candidate",
      value: "AI",
      isText: true,
    },
    {
      description: "Profiles evaluated per role when required",
      value: "100+",
      isText: false,
    },
    {
      description: "Shortlisted profiles delivered within",
      value: "48 hrs",
      isText: false,
    },
  ];

  return (
    <section className="bg-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-[auto_1fr] gap-12 items-start">
          {/* Left: Heading */}
          <h2
            style={{
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 500,
              fontSize: "48px",
              lineHeight: "1.1",
              letterSpacing: "-0.02em",
              color: "#000000",
              minWidth: "287px",
            }}
          >
            Zep Recruit
            <br />
            At A Glance
          </h2>

          {/* Right: Stats Grid */}
          <div className="grid md:grid-cols-2 gap-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                style={{
                  backgroundColor: "#F5F5F5",
                  borderRadius: "8px",
                  padding: "24px 28px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >
                {/* Description */}
                <p
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 400,
                    fontSize: "24px",
                    lineHeight: "1.1",
                    letterSpacing: "-0.01em",
                    color: "rgba(0, 0, 0, 0.7)",
                    flex: "1",
                  }}
                >
                  {stat.description}
                </p>

                {/* Value */}
                <div
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 300,
                    fontSize: stat.isText ? "64px" : "80px",
                    lineHeight: "1",
                    letterSpacing: "-0.02em",
                    color: "#0449FF",
                    textAlign: "center",
                    minWidth: stat.isText ? "auto" : "110px",
                  }}
                >
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

