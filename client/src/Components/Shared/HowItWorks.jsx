import React, { useState } from 'react';

/**
 * Flexible HowItWorks component that can be reused across different pages
 * @param {string} title - Main heading (e.g., "How Zep Recruit Works")
 * @param {string} subtitle - Descriptive text below the title
 * @param {Array} steps - Array of step objects with { id, title, image }
 */
const HowItWorks = ({ title, subtitle, steps }) => {
    const [activeStep, setActiveStep] = useState(1);

    return (
        <div className="w-full relative overflow-hidden" style={{ minHeight: "600px" }}>
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
                <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Content Overlay */}
            <div className="relative z-10 container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Side - Title and Subtitle */}
                    <div className="lg:w-1/3 flex flex-col">
                        <h2 className="text-4xl md:text-5xl font-medium text-white mb-6 leading-tight">
                            {title}
                        </h2>
                        <p className="text-white/90 mb-6 max-w-xs text-sm leading-relaxed">
                            {subtitle}
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
                                <span className={`text-lg md:text-xl font-medium ${activeStep === step.id ? "text-white" : "text-white"}`}>
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

export default HowItWorks;
