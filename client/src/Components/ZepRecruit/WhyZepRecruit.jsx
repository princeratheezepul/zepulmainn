import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { ArrowDown } from "lucide-react";

const WhyZepRecruit = () => {
    const cards = [
        {
            preTitle: "From Single\nRecruiters",
            title: "Distributed\nRecruiter\nNetworks",
            stat: "150+",
            highlight: false,
        },
        {
            preTitle: "From\nResumes",
            title: "Evaluation\nThrough AI And\nStructured\nFrameworks",
            stat: "",
            highlight: true,
        },
        {
            preTitle: "From Manual\nScreening",
            title: "Validates\nSkills Before\nInterviews",
            stat: "",
            highlight: false,
        },
        {
            preTitle: "From Fragmented\nProcesses",
            title: "Centralized\nEnd-to-End\nManagement",
            stat: "",
            highlight: false,
        },
        {
            preTitle: "From Slow\nHiring",
            title: "Rapid\nShortlisting\nWithin 48 Hrs",
            stat: "10x Faster",
            highlight: false,
        },
    ];

    return (
        <div className="w-full bg-[#0044FF] py-8 overflow-hidden relative">
            {/* Background Pattern - Isometric Grid */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg
                    className="absolute w-full h-full opacity-15"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    {/* Vertical Center Line */}
                    <path d="M720 -100V1000" stroke="white" strokeWidth="1" />

                    {/* Isometric Lines - Right Side */}
                    <path d="M720 0L1440 415" stroke="white" strokeWidth="1" />
                    <path d="M720 200L1440 615" stroke="white" strokeWidth="1" />
                    <path d="M720 400L1440 815" stroke="white" strokeWidth="1" />
                    <path d="M720 600L1440 1015" stroke="white" strokeWidth="1" />

                    {/* Isometric Lines - Left Side */}
                    <path d="M720 0L0 415" stroke="white" strokeWidth="1" />
                    <path d="M720 200L0 615" stroke="white" strokeWidth="1" />
                    <path d="M720 400L0 815" stroke="white" strokeWidth="1" />
                    <path d="M720 600L0 1015" stroke="white" strokeWidth="1" />

                    {/* Vertical Lines for Grid Effect */}
                    <path d="M360 208V1000" stroke="white" strokeWidth="1" />
                    <path d="M1080 208V1000" stroke="white" strokeWidth="1" />
                </svg>
            </div>

            <div className="container mx-auto px-4 mb-8 flex flex-col md:flex-row justify-between items-start md:items-start relative z-10">
                <h2 className="text-3xl md:text-4xl font-medium text-white max-w-xl leading-tight">
                    Why Zep <br />
                    Recruit
                </h2>
                <p className="text-white/90 mt-4 md:mt-0 max-w-xs text-sm md:text-right leading-relaxed font-light">
                    Ideal for enterprises, GCCs, and fast-
                    <br />
                    scaling organizations.
                </p>
            </div>

            <div className="w-full px-4 md:px-0 max-w-[1400px] mx-auto">
                <Swiper
                    grabCursor={true}
                    centeredSlides={true}
                    slidesPerView={3}
                    spaceBetween={40}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={true}
                    modules={[Autoplay, Pagination]}
                    className="recruitment-swiper !pb-8 !pt-12"
                    breakpoints={{
                        320: {
                            slidesPerView: 1,
                            spaceBetween: 20,
                        },
                        640: {
                            slidesPerView: 2,
                            spaceBetween: 30,
                        },
                        1024: {
                            slidesPerView: 3,
                            spaceBetween: 50,
                        },
                    }}
                >
                    {cards.map((card, index) => (
                        <SwiperSlide key={index} className="!h-auto">
                            {({ isActive }) => (
                                <div
                                    className={`relative flex flex-col h-[460px] transition-all duration-500 ease-out mx-2 ${isActive ? "transform -translate-y-6 scale-105 drop-shadow-2xl z-10" : "opacity-90 scale-95 z-0"
                                        }`}
                                >
                                    {/* Top Section - White */}
                                    <div className="bg-white p-6 rounded-t-3xl relative z-10 h-[120px] flex items-start">
                                        <p className="text-xl md:text-2xl font-medium text-gray-800 leading-tight">
                                            <span className="mr-2">→</span>
                                            {card.preTitle.split('\n').map((line, i) => (
                                                <React.Fragment key={i}>
                                                    {i > 0 && <br />}
                                                    {line}
                                                </React.Fragment>
                                            ))}
                                        </p>
                                    </div>

                                    {/* Arrow Connector */}
                                    <div className="relative z-20 -mt-5 ml-6">
                                        <div className="bg-black rounded-full w-12 h-12 flex items-center justify-center text-white border-4 border-[#EAEAEA]">
                                            <ArrowDown size={24} />
                                        </div>
                                    </div>

                                    {/* Bottom Section - Light Gray */}
                                    <div className="bg-[#EAEAEA] p-6 rounded-b-3xl flex-grow flex flex-col justify-between -mt-7 pt-14">
                                        <div>
                                            <h3 className="text-3xl md:text-4xl font-medium text-gray-900 leading-[1.1] tracking-tight mb-3">
                                                {card.title.split('\n').map((line, i) => (
                                                    <React.Fragment key={i}>
                                                        {i > 0 && <br />}
                                                        {line}
                                                    </React.Fragment>
                                                ))}
                                            </h3>

                                            {card.stat && (
                                                <p className="text-3xl md:text-4xl font-bold text-[#0044FF] mt-3">
                                                    {card.stat}
                                                </p>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-6">
                                            {/* Z Logo */}
                                            <div className="w-8 h-8">
                                                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M4 6H20V10H4V6Z" fill="black" />
                                                    <path d="M4 16H20V20H4V16Z" fill="black" />
                                                    <path d="M15 10L9 16" stroke="black" strokeWidth="4" strokeLinecap="square" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default WhyZepRecruit;
