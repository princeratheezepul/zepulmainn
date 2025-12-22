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
        <div className="w-full bg-white pt-20 pb-8">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                    {/* Left Side */}
                    <div className="lg:w-1/3 flex flex-col">
                        <h2 className="text-4xl md:text-5xl font-medium text-black mb-6 leading-tight">
                            {title}
                        </h2>
                        <p className="text-gray-500 mb-6 max-w-xs text-sm leading-relaxed">
                            {subtitle}
                        </p>
                        <div className="relative h-[400px] w-full rounded-sm overflow-hidden bg-gray-100">
                            {steps.map((step) => (
                                <img
                                    key={step.id}
                                    src={step.image}
                                    alt={step.title}
                                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ease-in-out ${activeStep === step.id ? "opacity-100" : "opacity-0"
                                        }`}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Divider - Dashed Line */}
                    <div className="hidden lg:block w-px border-l border-dashed border-gray-300"></div>

                    {/* Right Side - Steps List */}
                    <div className="lg:w-2/3 flex flex-col justify-center">
                        {steps.map((step) => (
                            <div
                                key={step.id}
                                className={`flex items-center p-4 cursor-pointer transition-all duration-300 ${activeStep === step.id
                                    ? "bg-[#0044FF] text-white"
                                    : "bg-white text-black border-b border-gray-200 hover:bg-gray-50"
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
                                <span className={`text-lg md:text-xl font-medium ${activeStep === step.id ? "text-white" : "text-gray-900"}`}>
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
