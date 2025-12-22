export function TalentHubHeroSection() {
    return (
        <section className="bg-[#F5F5F5] min-h-[600px]">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-[1fr_1.3fr] gap-12 items-center">
                    {/* Left Section: Text Content */}
                    <div className="flex flex-col justify-center">
                        {/* Main Heading */}
                        <h1
                            style={{
                                fontFamily: '"DM Sans", sans-serif',
                                fontWeight: 500,
                                fontSize: "clamp(48px, 5vw, 64px)",
                                lineHeight: "1.1",
                                letterSpacing: "-0.04em",
                                color: "#000000",
                                marginBottom: "80px",
                            }}
                        >
                            Enterprise Grade
                            <br />
                            Recruiting,
                            <br />
                            Powered By AI
                        </h1>

                        {/* Description */}
                        <p
                            style={{
                                fontFamily: '"DM Sans", sans-serif',
                                fontWeight: 400,
                                fontSize: "clamp(14px, 1.5vw, 16px)",
                                lineHeight: "1.1",
                                letterSpacing: "-0.02em",
                                color: "#2E2E2E",
                                maxWidth: "263px",
                                marginBottom: "32px",
                            }}
                        >
                            Zep ProRecruiter enables capable recruiters and teams to deliver
                            structured, data-backed hiring using Zepul's intelligence
                            platform.
                        </p>

                        {/* CTA Button */}
                        <button
                            style={{
                                fontFamily: '"DM Sans", sans-serif',
                                fontWeight: 500,
                                fontSize: "16px",
                                backgroundColor: "#0066FF",
                                color: "white",
                                padding: "14px 28px",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                width: "fit-content",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                            }}
                        >
                            Book a Demo
                            <svg
                                width="20"
                                height="20"
                                viewBox="0 0 20 20"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    d="M5 10H15M15 10L10 5M15 10L10 15"
                                    stroke="white"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>
                    </div>

                    {/* Right Section: Hero Image */}
                    <div className="flex items-center justify-end">
                        <img
                            src="/assets/talenthub/hero-image-3.jpg"
                            alt="Enterprise Grade Recruiting"
                            className="w-full h-auto"
                            style={{
                                maxWidth: "120%",
                                objectFit: "cover",
                            }}
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
