import React, { useState } from 'react';

const HowZepulWorks = () => {
    const steps = [
        { id: 1, title: "Demand", image: "/assets/how-zepul-works/demand.jpg" },
        { id: 2, title: "Multi-Source Recruiting", image: "/assets/how-zepul-works/multi-source.jpg" },
        { id: 3, title: "AI CV Strength", image: "/assets/how-zepul-works/cv-strength.jpg" },
        { id: 4, title: "Skill Assessments", image: "/assets/how-zepul-works/skill-assessments.jpg" },
        { id: 5, title: "AI-Assisted Interviews", image: "/assets/how-zepul-works/ai-interviews.jpg" },
        { id: 6, title: "Unified Scorecards", image: "/assets/how-zepul-works/unified-scorecards.jpg" },
        { id: 7, title: "Confident Hiring Decisions", image: "/assets/how-zepul-works/hiring-decisions.jpg" },
    ];

    const [activeStep, setActiveStep] = useState(1);

    return (
        <div className="w-full relative overflow-hidden" style={{ minHeight: "650px" }}>
            {/* Background Images with Smooth Transitions */}
            <div className="absolute inset-0">
                {steps.map((step) => (
                    <div
                        key={step.id}
                        className="absolute inset-0 transition-opacity duration-700 ease-in-out"
                        style={{
                            backgroundImage: `url(${step.image})`,
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                            opacity: activeStep === step.id ? 1 : 0,
                        }}
                    />
                ))}
                {/* Dark overlay for text readability */}
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 py-20">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Side - Title and Subtitle */}
                    <div className="lg:w-1/3 flex flex-col">
                        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 leading-tight">
                            How Zepul<br />Works
                        </h2>
                        <p className="text-white/90 mb-6 max-w-xs text-sm leading-relaxed">
                            Hiring powered by intelligence, with consistent evaluation for every candidate.
                        </p>
                    </div>

                    {/* Divider - Dashed Line */}
                    <div className="hidden lg:block w-px border-l border-dashed border-white/30"></div>

                    {/* Right Side - Steps List */}
                    <div className="lg:w-2/3 flex flex-col justify-center">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`flex items-center p-4 cursor-pointer transition-all duration-300 ${activeStep === step.id
                                        ? "bg-[#0044FF] text-white"
                                        : "bg-white/10 text-white border-b border-white/20 hover:bg-white/20 backdrop-blur-sm"
                                    }`}
                                onMouseEnter={() => setActiveStep(step.id)}
                            >
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-medium mr-5 flex-shrink-0 ${activeStep === step.id
                                            ? "bg-black text-white"
                                            : "bg-[#0044FF] text-white"
                                        }`}
                                >
                                    {step.id}
                                </div>
                                <span className={`text-lg md:text-xl font-medium text-white`}>
                                    {step.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HowZepulWorks;
