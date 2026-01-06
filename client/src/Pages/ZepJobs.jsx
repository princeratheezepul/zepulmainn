import React from 'react';
import { FaKey } from "react-icons/fa";
import { TalentHubBlackTicker } from '../Components/TalentHub/TalentHubBlackTicker';
import WhyZepJobsWorks from '../Components/TalentHub/WhyZepJobsWorks';
import HowItWorks from '../Components/Shared/HowItWorks';
import HiringModelContact from '../Components/HiringModelContact';

const ZepJobs = () => {
    const howItWorksSteps = [
        { id: 1, title: "Browse Role-Based Talent Pools", image: "/assets/talenthub/how_step1.jpg" },
        { id: 2, title: "Review Detailed Candidate Scorecards", image: "/assets/talenthub/how_step2.jpg" },
        { id: 3, title: "Pay Upfront Per Profile", image: "/assets/talenthub/how_step3.jpg" },
        { id: 4, title: "Interview Or Hire Directly", image: "/assets/talenthub/how_step4.jpg" },
    ];

    return (
        <div className="font-sans text-black">
            {/* Hero Section */}
            <section className="bg-gray-50 relative overflow-hidden" style={{ minHeight: '600px' }}>
                <div className="flex flex-col lg:flex-row items-center justify-between h-full">
                    {/* Left Content */}
                    <div className="px-6 md:px-12 py-12 lg:py-20 lg:w-1/2 z-10">
                        {/* Main Heading */}
                        <div
                            className="font-medium mb-12 lg:mb-36 text-[50px] md:text-[80px] lg:text-[100px]"
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontWeight: 500,
                                lineHeight: '1.1',
                                letterSpacing: '-0.04em',
                                color: '#000000',
                                maxWidth: '900px'
                            }}
                        >
                            A Fair, Skill-First <br />
                            Job Platform
                        </div>

                        {/* Description */}
                        <div
                            className="mb-8"
                            style={{
                                fontFamily: 'DM Sans, sans-serif',
                                fontSize: '16px',
                                fontWeight: 400,
                                lineHeight: '1.1',
                                letterSpacing: '-0.02em',
                                color: '#2E2E2E',
                                maxWidth: '272px'
                            }}
                        >
                            Zep Jobs gives candidates access to quality opportunities through transparent, skill-based evaluation — free of cost.
                        </div>

                        {/* CTA Button */}
                        <button
                            className="px-8 py-3 text-white font-medium rounded transition-all duration-300 hover:shadow-lg"
                            style={{
                                backgroundColor: '#0066FF',
                                fontFamily: 'DM Sans, sans-serif'
                            }}
                        >
                            Book a Demo →
                        </button>
                    </div>

                    {/* Right Image */}
                    <div className="lg:w-1/2 flex items-center justify-center lg:justify-end relative">
                        <img
                            src="/assets/zepjobs-hero.jpg"
                            alt="Zepul Portal Interface"
                            className="object-cover"
                            style={{
                                width: '889px',
                                height: '890px',
                                maxWidth: '100%'
                            }}
                        />
                    </div>
                </div>
            </section>

            <TalentHubBlackTicker />
            <WhyZepJobsWorks />
            <HowItWorks
                title="How ProRecruiter Works"
                subtitle="Only validated, decision-ready candidates are shared with clients."
                steps={howItWorksSteps}
            />
            <HiringModelContact
                title="Beyond recruitment, we architect talent intelligently, consistently, and at scale."
            />




        </div>
    );
};

export default ZepJobs;
