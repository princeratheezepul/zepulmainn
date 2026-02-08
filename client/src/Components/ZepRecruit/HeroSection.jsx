import React from "react";

export const HeroSection = () => {
    return (
        <div className="bg-white w-full">
            <div className="container mx-auto px-8 md:px-12 py-16 md:py-24">
                <div className="max-w-4xl">
                    <h1
                        className="font-bold mb-6"
                        style={{
                            fontFamily: "DM Sans",
                            fontSize: "clamp(32px, 6vw, 56px)",
                            lineHeight: "110%",
                            letterSpacing: "-0.02em",
                        }}
                    >
                        Transform Your Recruitment Process with Zep Recruit
                    </h1>
                    <p
                        className="text-gray-600 mb-8 max-w-2xl"
                        style={{
                            fontFamily: "DM Sans",
                            fontSize: "18px",
                            lineHeight: "150%",
                        }}
                    >
                        A Legacy Pay After Successful Placement Model, Reimagined with AI to
                        Reduce Cost, Time, and Complexity.
                    </p>
                    <button
                        className="bg-blue-600 text-white px-8 py-4 rounded-md hover:bg-blue-700 transition-colors"
                        style={{
                            fontFamily: "DM Sans",
                            fontWeight: 700,
                            fontSize: "18px",
                        }}
                    >
                        Get Started
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroSection;
