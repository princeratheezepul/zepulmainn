import React from "react";

const ZepRecruitHero = () => {
    const stats = [
        {
            value: "40%",
            label: "COST FLEXIBILITY COMPARED TO LEGACY AGENCY HIRING",
        },
        {
            value: "12-24 Hrs",
            label: "REQ ACKNOWLEDGEMENT & INTAKE",
        },
        {
            value: "75-85%",
            label: "FIT ACCURACY / ZERO DUPLICATE CVS",
        },
        {
            value: "80%",
            label: "PRODUCTIVITY INCREASE IN EMPLOYER TA & DELIVERY TEAMS",
        },
    ];

    return (
        <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] bg-gray-100 py-0">
            {/* Main Content */}
            <div className="flex items-stretch justify-between gap-8 min-h-[64vh]">
                {/* Left Content */}
                <div className="flex-1 max-w-[50%] py-12 flex flex-col justify-center"
                    style={{ paddingLeft: 'max(2rem, calc((100vw - 1280px) / 2))' }}>
                    <h1 className="text-6xl font-bold text-black mb-2 leading-none tracking-tight">
                        ZEP RECRUIT
                    </h1>
                    <p className="text-lg text-black font-semibold mt-1 mb-0">
                        A Traditional Hiring Model Re-Imagined with AI
                    </p>
                    <p className="text-[0.95rem] text-gray-600 leading-relaxed mb-6 max-w-[500px]">
                        A legacy "pay after successful placement" model re-engineered with AI empowering entities and partner delivery agencies - delivering superior quality while reducing cost, time & complexity
                    </p>

                    {/* Statistics */}
                    <div className="grid grid-cols-2 gap-10 mb-12">
                        {stats.map((stat, index) => (
                            <div className="flex flex-col" key={index}>
                                <div className="text-4xl font-bold text-black mb-2 leading-none">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-400 uppercase tracking-wide leading-snug max-w-[200px]">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* CTA Button */}
                    <button className="bg-blue-600 text-white px-10 py-4 border-none rounded font-semibold cursor-pointer inline-flex items-center gap-2 transition-all duration-300 hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-600/40 w-fit self-start">
                        Book a Demo →
                    </button>
                </div>

                {/* Right Side Image - Extends to edge */}
                <div className="flex-1 max-w-[50%] flex justify-center items-center p-0">
                    <img
                        src="/Rectangle 161123822(3).png"
                        alt="Zep Recruit"
                        className="w-full h-full object-cover rounded-none"
                    />
                </div>
            </div>
        </div>
    );
};

export default ZepRecruitHero;
