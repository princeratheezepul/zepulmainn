import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const WhyChooseProRecruiter = () => {
    const cards = [
        {
            text: "Access\nAdditional\nJobs From\nZepul Without\nBusiness\nDevelopment\nEffort",
        },
        {
            text: "Enterprise-\nGrade Tools\nWithout\nEnterprise\nCost",
        },
        {
            text: "Objective,\nSkill-Based\nEvaluation",
        },
    ];

    const ZepulLogo = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M4 6H20V10H4V6Z" fill="black" />
            <path d="M4 16H20V20H4V16Z" fill="black" />
            <path d="M15 10L9 16" stroke="black" strokeWidth="4" strokeLinecap="square" />
        </svg>
    );

    return (
        <div className="w-full bg-[#0044FF] pt-16 pb-8 overflow-hidden relative">
            {/* Background Pattern - Isometric Grid (Reused from WhyZepRecruit) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <svg
                    className="absolute w-full h-full opacity-15"
                    viewBox="0 0 1440 900"
                    preserveAspectRatio="xMidYMid slice"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M720 -100V1000" stroke="white" strokeWidth="1" />
                    <path d="M720 0L1440 415" stroke="white" strokeWidth="1" />
                    <path d="M720 200L1440 615" stroke="white" strokeWidth="1" />
                    <path d="M720 400L1440 815" stroke="white" strokeWidth="1" />
                    <path d="M720 600L1440 1015" stroke="white" strokeWidth="1" />
                    <path d="M720 0L0 415" stroke="white" strokeWidth="1" />
                    <path d="M720 200L0 615" stroke="white" strokeWidth="1" />
                    <path d="M720 400L0 815" stroke="white" strokeWidth="1" />
                    <path d="M720 600L0 1015" stroke="white" strokeWidth="1" />
                    <path d="M360 208V1000" stroke="white" strokeWidth="1" />
                    <path d="M1080 208V1000" stroke="white" strokeWidth="1" />
                </svg>
            </div>

            <div className="container mx-auto px-4 mb-12 flex flex-col md:flex-row justify-between items-start relative z-10">
                <h2 className="text-3xl md:text-5xl font-medium text-white max-w-2xl leading-tight">
                    Why Recruiters <br />
                    Choose ProRecruiter
                </h2>
                <p className="text-white/90 mt-4 md:mt-0 max-w-xs text-sm md:text-right leading-relaxed font-light">
                    Ideal for independent recruiters,
                    <br />
                    agencies, and global sourcing
                    <br />
                    partners.
                </p>
            </div>

            <div className="w-full px-4 md:px-0 max-w-[1400px] mx-auto">
                <Swiper
                    grabCursor={true}
                    centeredSlides={false}
                    slidesPerView={3}
                    spaceBetween={30}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    loop={false}
                    modules={[Autoplay, Pagination]}
                    className="recruitment-swiper !pb-8"
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
                            spaceBetween: 40,
                        },
                    }}
                >
                    {cards.map((card, index) => (
                        <SwiperSlide key={index} className="!h-auto">
                            <div className="relative flex flex-col h-[500px] transition-all duration-300 hover:-translate-y-2">
                                {/* Top Section - White with Logo */}
                                <div className="bg-white p-8 rounded-t-3xl relative z-10 h-[100px] flex items-center">
                                    <ZepulLogo />
                                </div>

                                {/* Bottom Section - Light Gray with Text */}
                                <div className="bg-[#F0F4FF] p-8 rounded-b-3xl flex-grow flex flex-col justify-start -mt-4 pt-12">
                                    <h3 className="text-3xl md:text-4xl font-medium text-black leading-[1.1] tracking-tight">
                                        {card.text.split('\n').map((line, i) => (
                                            <React.Fragment key={i}>
                                                {i > 0 && <br />}
                                                {line}
                                            </React.Fragment>
                                        ))}
                                    </h3>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default WhyChooseProRecruiter;
