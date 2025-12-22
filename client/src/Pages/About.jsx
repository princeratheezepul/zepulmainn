import React, { useState } from 'react';
import srikanthImg from '../assets/srikanth.png';
import tarunImg from '../assets/tarun.png';
import reenaImg from '../assets/reena.png';
import { Plus, Minus } from 'lucide-react';
import HiringModelContact from '../Components/HiringModelContact';

const About = () => {
    const [openIndex, setOpenIndex] = useState(0);

    const teamMembers = [
        {
            name: 'Srikanth Dhanwada',
            role: 'Founder & CEO',
            image: srikanthImg
        },
        {
            name: 'Tarun Ghulati',
            role: 'Co-Founder',
            image: tarunImg
        },
        {
            name: 'Syed Reena Sumera',
            role: 'COO',
            image: reenaImg
        }
    ];

    const faqs = [
        {
            question: "What is Zepul and how does it differ from traditional recruitment agencies?",
            answer: "Zepul is a comprehensive Talent Acquisition Services Platform that combines AI-powered sourcing (ZepDB) with human expertise. Unlike traditional agencies, we offer a unified marketplace connecting employers, recruiters, and candidates, ensuring faster hiring and higher quality matches through multi-layer screening."
        },
        {
            question: "How does the AI-powered sourcing work?",
            answer: "Our proprietary ZepDB utilizes advanced AI algorithms to instantly source and match candidates from a vast pool of profiles. It analyzes skills, experience, and cultural fit to provide precise matches, significantly reducing the time-to-hire."
        },
        {
            question: "What hiring models do you support?",
            answer: "We offer flexible hiring solutions tailored to your needs, including Full-time placement, Contractual staffing, Gig workforce for short-term tasks, and end-to-end Project management."
        },
        {
            question: "How do you ensure the quality of candidates?",
            answer: "We employ a multi-layer screening process that blends AI-driven assessments with human evaluation. This results in a comprehensive scorecard for each candidate, covering technical skills, soft skills, and background verification."
        },
        {
            question: "Can I partner with Zepul as a recruiter?",
            answer: "Yes! We empower recruitment partners to expand their reach and drive growth. By partnering with us, you gain access to a global market, reduce administrative tasks, and leverage our platform to optimize your operational efficiency."
        }
    ];

    const toggleAccordion = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    return (
        <div className="w-full min-h-screen bg-white flex flex-col">
            {/* About Section */}
            <div className="w-full flex flex-col lg:flex-row">
                {/* Left Side - Text Content */}
                <div className="w-full lg:w-1/2 px-[70px] py-[30px] flex flex-col gap-[10px]">
                    <h1
                        className="text-black"
                        style={{
                            fontFamily: 'DM Sans',
                            fontWeight: 300,
                            fontSize: '64px',
                            lineHeight: '100%',
                            letterSpacing: '-0.03em'
                        }}
                    >
                        About
                    </h1>

                    <div
                        className="flex flex-col gap-3 text-black"
                        style={{
                            fontFamily: 'DM Sans',
                            fontWeight: 300,
                            fontSize: '28px',
                            lineHeight: '120%',
                            letterSpacing: '0'
                        }}
                    >
                        <p>
                            Hiring has become one of the most critical and complex challenges for organizations today. Fragmented systems, slow processes, and misaligned stakeholders continue to hold businesses back. We built this HRTech marketplace to fundamentally change how talent is discovered and hired.
                        </p>
                        <p>
                            Our platform unifies the entire talent ecosystem employers, recruiters, talent partners, and candidates into a single, intelligent marketplace. Powered by a robust AI engine, we enable faster hiring, higher-quality matches, and data-driven decisions with precision and scale.
                        </p>
                        <p>
                            By bringing together technology, intelligence, and collaboration, we are redefining talent acquisition transforming it into a streamlined, transparent, and future-ready experience for modern organizations.
                        </p>
                    </div>
                </div>

                {/* Right Side - Image Placeholder */}
                <div className="w-full lg:w-1/2 bg-white">
                    {/* Placeholder for future image */}
                </div>
            </div>

            {/* Divider */}
            <div className="w-full px-[70px] mt-10">
                <div className="w-full h-[1px] bg-[#E5E5E5]"></div>
            </div>

            {/* Team Section */}
            <div className="w-full px-[70px] py-[60px] flex flex-col lg:flex-row gap-[20px]">
                {/* Left: Heading */}
                <div className="w-full lg:w-[15%]">
                    <h2
                        className="text-black"
                        style={{
                            fontFamily: 'DM Sans',
                            fontWeight: 300,
                            fontSize: '64px',
                            lineHeight: '100%',
                            letterSpacing: '-0.03em'
                        }}
                    >
                        Team
                    </h2>
                </div>

                {/* Right: Team Grid */}
                <div className="w-full lg:w-[60%] grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
                    {teamMembers.map((member, index) => (
                        <div key={index} className="flex flex-col gap-4">
                            <div className="w-full aspect-[3/4] overflow-hidden grayscale">
                                <img
                                    src={member.image}
                                    alt={member.name}
                                    className="w-full h-full object-cover object-top"
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <h3
                                    style={{
                                        color: '#024bff',
                                        fontFamily: 'DM Sans',
                                        fontWeight: 400,
                                        fontSize: '20px',
                                        lineHeight: '120%'
                                    }}
                                >
                                    {member.name}
                                </h3>
                                <p
                                    className="text-[#4d4d4d]"
                                    style={{
                                        fontFamily: 'DM Sans',
                                        fontWeight: 400,
                                        fontSize: '16px',
                                        lineHeight: '120%'
                                    }}
                                >
                                    {member.role}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            {/* Bottom Divider */}
            <div className="w-full px-[70px] mb-10">
                <div className="w-full h-[1px] bg-[#E5E5E5]"></div>
            </div>

            {/* FAQ Section */}
            <div className="w-full px-[70px] py-[60px] flex flex-col lg:flex-row gap-[60px]">
                {/* Left Side - Heading */}
                <div className="w-full lg:w-[40%] flex flex-col gap-4">
                    <h2
                        className="text-black"
                        style={{
                            fontFamily: 'DM Sans',
                            fontWeight: 500,
                            fontSize: '48px',
                            lineHeight: '110%',
                            letterSpacing: '-0.02em'
                        }}
                    >
                        Let’s Answer<br />Your Questions
                    </h2>
                    <p
                        className="text-[#4d4d4d]"
                        style={{
                            fontFamily: 'DM Sans',
                            fontWeight: 400,
                            fontSize: '18px',
                            lineHeight: '150%'
                        }}
                    >
                        We’re here to provide clarity and transparency, so you can make informed decisions.
                    </p>
                </div>

                {/* Right Side - Accordion */}
                <div className="w-full lg:w-[60%] flex flex-col">
                    {faqs.map((faq, index) => (
                        <div key={index} className="border-b border-[#E5E5E5] last:border-b">
                            <button
                                onClick={() => toggleAccordion(index)}
                                className="w-full py-6 flex justify-between items-start text-left group"
                            >
                                <span
                                    className={`text-xl transition-colors duration-200 ${openIndex === index ? 'text-[#024bff]' : 'text-black'}`}
                                    style={{
                                        fontFamily: 'DM Sans',
                                        fontWeight: 400,
                                        lineHeight: '140%'
                                    }}
                                >
                                    {faq.question}
                                </span>
                                <span className="ml-4 mt-1 text-[#4d4d4d]">
                                    {openIndex === index ? <Minus size={20} /> : <Plus size={20} />}
                                </span>
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-[200px] opacity-100 mb-6' : 'max-h-0 opacity-0'}`}
                            >
                                <p
                                    className="text-black"
                                    style={{
                                        fontFamily: 'DM Sans',
                                        fontWeight: 400,
                                        fontSize: '16px',
                                        lineHeight: '150%'
                                    }}
                                >
                                    {faq.answer}
                                </p>
                            </div>
                        </div>
                    ))}
                    <div className="w-full h-[1px] bg-[#E5E5E5]"></div>
                </div>
            </div>

            {/* Contact Section */}
            <HiringModelContact />
        </div>
    );
};

export default About;
