import React from "react";
import { ArrowDown } from "lucide-react";

const RecruitmentReinvention = () => {
    return (
        <div className="w-full max-w-7xl mx-auto px-4 py-16 md:py-24 relative overflow-hidden">
            {/* Background Circles - subtle decoration */}
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[800px] h-[800px] rounded-full border border-gray-100 hidden md:block pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[600px] h-[600px] rounded-full border border-gray-100 hidden md:block pointer-events-none" />
            <div className="absolute top-1/2 right-0 -translate-y-1/2 translate-x-1/4 w-[400px] h-[400px] rounded-full border border-gray-100 hidden md:block pointer-events-none" />

            <h2 className="text-3xl md:text-5xl font-medium mb-16 max-w-xl text-black leading-tight">
                Recruitment Needs Reinvention In A <br /> Data-Driven World
            </h2>

            {/* Main Content Area - Items Centered Vertically */}
            <div className="flex flex-col md:flex-row items-center justify-between relative">

                {/* Left Column - Cards */}
                <div className="flex flex-col gap-6 md:w-1/2 z-10 relative">

                    {/* Unified Connector System
                        Container position: Right edge of Left Column.
                        Since parent is items-center, the Middle Card (Card 2) is the vertical center axis.
                    */}
                    <div className="hidden md:block absolute right-[-5rem] top-0 h-full w-[5rem] pointer-events-none">

                        {/* 
                           Geometry Logic:
                           - Card 1 (Top) is roughly at top 17% (if evenly spaced).
                           - Card 2 (Mid) is CENTER (50%).
                           - Card 3 (Bottom) is roughly bottom 17% (83%).
                           - Merge Point is CENTER (50%).
                        */}

                        {/* Top Line: From Card 1 Center -> Curve Down -> Merge at Center */}
                        {/* Box from Top 17% to 50%. Top-Right corner rounded. */}
                        <div className="absolute top-[17%] left-0 w-[2.5rem] h-[33%] border-t border-r border-[#024bff] rounded-tr-2xl"></div>

                        {/* Bottom Line: From Card 3 Center -> Curve Up -> Merge at Center */}
                        {/* Box from 50% to 83% (Top of box is 50%, Height is 33%). Bottom-Right corner rounded. */}
                        <div className="absolute top-[50%] left-0 w-[2.5rem] h-[33%] border-b border-r border-[#024bff] rounded-br-2xl"></div>

                        {/* Middle Line: From Card 2 Center -> Straight Right through the vertical bus */}
                        <div className="absolute top-[50%] left-0 w-[5rem] h-[1px] bg-[#024bff]"></div>

                        {/* Main Highway: From the 2.5rem mark (Vertical Bus) -> Right to infinity */}
                        {/* The vertical bus is at `left-[2.5rem]`. */}
                        {/* The middle line joins it automatically because it crosses it. */}
                        {/* Actually, we need the main line to go from the bus (2.5rem) to the right (5rem+). */}
                        <div className="absolute top-[50%] left-[2.5rem] w-[50vw] h-[1px] bg-[#024bff]"></div>

                    </div>


                    {/* Card 1 */}
                    <div className="relative group">
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                            <div className="w-10 h-10 rounded-full bg-[#ffe1e1] flex items-center justify-center text-red-500">
                                <ArrowDown size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="bg-white border md:border-[#024bff] border-gray-200 rounded-lg p-6 shadow-sm md:shadow-none hover:shadow-md transition-shadow relative z-20">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                Talent demand is outpacing supply, while access remains limited
                                and recruiter capacity doesn't scale.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="relative group">
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                            <div className="w-10 h-10 rounded-full bg-[#ffe1e1] flex items-center justify-center text-red-500">
                                <ArrowDown size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="bg-white border md:border-[#024bff] border-gray-200 rounded-lg p-6 shadow-sm md:shadow-none hover:shadow-md transition-shadow relative z-20">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                Hiring Remains Subjective, With Resumes And Interviews Failing
                                To Predict Real Performance And Speed Often Reducing Quality.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="relative group">
                        <div className="absolute -left-5 top-1/2 -translate-y-1/2 flex flex-col items-center z-30">
                            <div className="w-10 h-10 rounded-full bg-[#ffe1e1] flex items-center justify-center text-red-500">
                                <ArrowDown size={20} strokeWidth={2.5} />
                            </div>
                        </div>
                        <div className="bg-white border md:border-[#024bff] border-gray-200 rounded-lg p-6 shadow-sm md:shadow-none hover:shadow-md transition-shadow relative z-20">
                            <p className="text-gray-700 text-sm md:text-base leading-relaxed">
                                Underutilized Tools And Poor Data Visibility Hinder Informed
                                Hiring Decisions.
                            </p>
                        </div>
                    </div>
                </div>


                {/* Right Column - Circle */}
                {/* Removed mt-12, relying on items-center for vertical alignment */}
                <div className="mt-12 md:mt-0 relative z-10 flex justify-center md:justify-end md:w-1/2 pl-10 h-full pointer-events-none">
                    <div className="relative pointer-events-auto">
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-20 rounded-full scale-110"></div>

                        <div className="w-32 h-32 md:w-40 md:h-40 bg-[#024bff] rounded-full flex items-center justify-center shadow-2xl relative z-10">
                            {/* Z Logo SVG */}
                            <svg
                                width="100"
                                height="110"
                                viewBox="0 0 60 60"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                {/* Top Bar shifted Right */}
                                <path
                                    d="M20 18 H50 L40 30 H10 L20 18 Z"
                                    fill="white"
                                />
                                {/* Bottom Bar shifted Left */}
                                <path
                                    d="M50 42 H20 L30 30 H60 L50 42 Z"
                                    fill="white"
                                />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecruitmentReinvention;
