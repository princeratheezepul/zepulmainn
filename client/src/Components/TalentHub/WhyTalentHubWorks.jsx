import React from 'react';

const WhyTalentHubWorks = () => {
    return (
        <section className="bg-[#0055FF] py-12 px-8 md:px-20 lg:px-32 text-white font-sans relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 pointer-events-none">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-20">
                    <defs>
                        <pattern id="grid-pattern" width="100" height="100" patternUnits="userSpaceOnUse">
                            <path d="M0 100 L100 0" stroke="white" strokeWidth="0.5" fill="none" />
                            <path d="M0 0 L100 100" stroke="white" strokeWidth="0.5" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>
            <div className="w-full mx-auto relative z-10">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row justify-between items-start mb-16">
                    <div
                        className="text-4xl md:text-5xl lg:text-[64px] font-medium leading-tight mb-6 lg:mb-0"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Why Talent <br />
                        Hub Works
                    </div>
                    <p
                        className="text-white/90 text-lg max-w-sm text-right lg:text-right"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        Ideal for enterprises, GCCs, and fast-scaling organizations.
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Zero Sourcing Time */}
                    <div className="bg-white rounded-2xl p-2 flex flex-col h-[540px] text-black relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                        {/* Top White Section with Z Logo */}
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.7881 0H7.03271C6.6634 0 6.32415 0.203548 6.15036 0.529412L0.784313 10.5907C0.429057 11.2569 0.911744 12.0613 1.66666 12.0613H19.6555C20.0043 12.0613 20.3279 11.8796 20.5094 11.5818L26.642 1.52046C27.0482 0.854081 26.5685 0 25.7881 0Z" fill="black" />
                                <path d="M29.6651 15.9387H10.9097C10.5404 15.9387 10.2011 16.1423 10.0273 16.4681L4.66127 26.5295C4.30601 27.1956 4.7887 28.0001 5.54362 28.0001H23.5324C23.8812 28.0001 24.2048 27.8183 24.3863 27.5205L30.519 17.4592C30.9251 16.7928 30.4455 15.9387 29.6651 15.9387Z" fill="black" />
                            </svg>
                        </div>

                        {/* Bottom Darker Section */}
                        <div className="bg-[#F2F6FF] rounded-xl flex-1 p-8 flex flex-col justify-between relative">
                            <div className="mt-4">
                                <div
                                    style={{
                                        fontFamily: 'DM Sans, sans-serif',
                                        fontWeight: 200,
                                        fontSize: '140px',
                                        lineHeight: '100%',
                                        letterSpacing: '-0.02em',
                                        color: '#0449FF'
                                    }}
                                >
                                    0
                                </div>
                            </div>

                            <div>
                                <div
                                    className="text-5xl md:text-[64px] leading-tight font-normal"
                                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    Zero <br />
                                    Sourcing <br />
                                    Time
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Predictable Hiring Cost */}
                    <div className="bg-white rounded-2xl p-2 flex flex-col h-[540px] text-black relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.7881 0H7.03271C6.6634 0 6.32415 0.203548 6.15036 0.529412L0.784313 10.5907C0.429057 11.2569 0.911744 12.0613 1.66666 12.0613H19.6555C20.0043 12.0613 20.3279 11.8796 20.5094 11.5818L26.642 1.52046C27.0482 0.854081 26.5685 0 25.7881 0Z" fill="black" />
                                <path d="M29.6651 15.9387H10.9097C10.5404 15.9387 10.2011 16.1423 10.0273 16.4681L4.66127 26.5295C4.30601 27.1956 4.7887 28.0001 5.54362 28.0001H23.5324C23.8812 28.0001 24.2048 27.8183 24.3863 27.5205L30.519 17.4592C30.9251 16.7928 30.4455 15.9387 29.6651 15.9387Z" fill="black" />
                            </svg>
                        </div>

                        <div className="bg-[#F2F6FF] rounded-xl flex-1 p-8 flex flex-col justify-between relative">
                            <div className="mt-4">
                                <div
                                    className="text-5xl md:text-[64px] leading-tight font-normal mb-12"
                                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    Predictable <br />
                                    Hiring Cost
                                </div>
                            </div>

                            <div className="mb-4">
                                {/* Provided Search Icon SVG */}
                                <svg width="99" height="99" viewBox="0 0 99 99" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                                    <path d="M19.6667 0H59V9.83333H19.6667V0ZM9.83333 19.6667V9.83333H19.6667V19.6667H9.83333ZM9.83333 59H0V19.6667H9.83333V59ZM19.6667 68.8333H9.83333V59H19.6667V68.8333ZM59 68.8333V78.6667H19.6667V68.8333H59ZM68.8333 59H59V68.8333H68.8333V78.6667H78.6667V88.5H88.5V98.3333H98.3333V88.5H88.5V78.6667H78.6667V68.8333H68.8333V59ZM68.8333 19.6667H78.6667V59H68.8333V19.6667ZM68.8333 19.6667V9.83333H59V19.6667H68.8333Z" fill="#0449FF" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Verified Candidate Quality */}
                    <div className="bg-white rounded-2xl p-2 flex flex-col h-[540px] text-black relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.7881 0H7.03271C6.6634 0 6.32415 0.203548 6.15036 0.529412L0.784313 10.5907C0.429057 11.2569 0.911744 12.0613 1.66666 12.0613H19.6555C20.0043 12.0613 20.3279 11.8796 20.5094 11.5818L26.642 1.52046C27.0482 0.854081 26.5685 0 25.7881 0Z" fill="black" />
                                <path d="M29.6651 15.9387H10.9097C10.5404 15.9387 10.2011 16.1423 10.0273 16.4681L4.66127 26.5295C4.30601 27.1956 4.7887 28.0001 5.54362 28.0001H23.5324C23.8812 28.0001 24.2048 27.8183 24.3863 27.5205L30.519 17.4592C30.9251 16.7928 30.4455 15.9387 29.6651 15.9387Z" fill="black" />
                            </svg>
                        </div>

                        <div className="bg-[#F2F6FF] rounded-xl flex-1 p-8 flex flex-col justify-between relative">
                            <div className="mt-4">
                                {/* Verified Badge */}
                                <div className="text-[#0449FF]">
                                    <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M12 2L14.8 4.2L18.4 3.8L19.8 7L23 8.8L22.2 12.4L24 15.6L21 18L20.8 21.6L17.2 21.2L14.8 23.8L12 22L9.2 23.8L6.8 21.2L3.2 21.6L3 18L0 15.6L1.8 12.4L1 8.8L4.2 7L5.6 3.8L9.2 4.2L12 2Z" stroke="currentColor" strokeWidth="1.5" fill="none" />
                                        <path d="M9 12L11 14L15 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </div>

                            <div>
                                <div
                                    className="text-5xl md:text-[64px] leading-tight font-normal"
                                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    Verified <br />
                                    Candidate <br />
                                    Quality
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyTalentHubWorks;
