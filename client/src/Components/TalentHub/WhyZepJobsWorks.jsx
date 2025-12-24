import React from 'react';

const WhyZepJobsWorks = () => {
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
                        Why Candidates <br />
                        Prefer Zep Jobs
                    </div>
                    <p
                        className="text-white/90 text-lg max-w-sm text-right lg:text-right"
                        style={{ fontFamily: 'DM Sans, sans-serif' }}
                    >
                        {/* Subtitle removed or empty based on image */}
                    </p>
                </div>

                {/* Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Card 1: Skills Matter More Than Keywords */}
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
                                <svg width="83" height="79" viewBox="0 0 83 79" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M70.2308 18.9492H63.8462V12.6281C63.8432 10.0614 63.0513 7.55633 61.5756 5.44603C60.0999 3.33572 58.0104 1.72011 55.5848 0.813999C53.1593 -0.0921169 50.5126 -0.245814 47.9967 0.373343C45.4807 0.9925 43.2148 2.35518 41.5 4.28021C39.8658 2.44637 37.7294 1.12118 35.3498 0.465236C32.9701 -0.190704 30.4494 -0.149233 28.0931 0.584625C25.7368 1.31848 23.6461 2.71322 22.0743 4.59981C20.5025 6.48639 19.5172 8.78384 19.2376 11.2137C17.2983 10.0856 15.0923 9.48472 12.843 9.47185C10.5937 9.45898 8.38089 10.0346 6.42847 11.1404C4.47605 12.2463 2.85331 13.8431 1.72447 15.7693C0.595628 17.6955 0.000738259 19.8828 0 22.1098V37.9126C0 48.8097 4.37231 59.2604 12.1551 66.9658C19.9378 74.6712 30.4935 79 41.5 79C52.5065 79 63.0622 74.6712 70.8449 66.9658C78.6277 59.2604 83 48.8097 83 37.9126V31.5915C83 28.2385 81.6547 25.0229 79.26 22.652C76.8653 20.2811 73.6174 18.9492 70.2308 18.9492ZM51.0769 6.30692C52.7702 6.30692 54.3942 6.9729 55.5915 8.15834C56.7889 9.34378 57.4615 10.9516 57.4615 12.6281V18.9492H44.6923V12.6281C44.6923 10.9516 45.365 9.34378 46.5623 8.15834C47.7597 6.9729 49.3836 6.30692 51.0769 6.30692ZM25.5385 12.6281C25.5385 10.9516 26.2111 9.34378 27.4085 8.15834C28.6058 6.9729 30.2298 6.30692 31.9231 6.30692C33.6164 6.30692 35.2403 6.9729 36.4377 8.15834C37.635 9.34378 38.3077 10.9516 38.3077 12.6281V28.4309C38.3077 30.1074 37.635 31.7152 36.4377 32.9006C35.2403 34.0861 33.6164 34.752 31.9231 34.752C30.2298 34.752 28.6058 34.0861 27.4085 32.9006C26.2111 31.7152 25.5385 30.1074 25.5385 28.4309V12.6281ZM6.38462 22.1098C6.38462 20.4333 7.05728 18.8255 8.25463 17.64C9.45197 16.4546 11.0759 15.7886 12.7692 15.7886C14.4625 15.7886 16.0865 16.4546 17.2838 17.64C18.4812 18.8255 19.1538 20.4333 19.1538 22.1098V28.4309C19.1538 30.1074 18.4812 31.7152 17.2838 32.9006C16.0865 34.0861 14.4625 34.752 12.7692 34.752C11.0759 34.752 9.45197 34.0861 8.25463 32.9006C7.05728 31.7152 6.38462 30.1074 6.38462 28.4309V22.1098ZM76.6154 37.9126C76.6152 47.0048 73.0175 55.7351 66.5933 62.2323C60.1691 68.7295 51.4298 72.4766 42.2484 72.6704C33.067 72.8642 24.1743 69.4892 17.4763 63.2689C10.7783 57.0486 6.80803 48.478 6.41654 39.3941C8.96821 40.8471 11.9493 41.3805 14.8532 40.9037C17.7572 40.4269 20.4048 38.9694 22.3462 36.7788C24.5463 39.2607 27.6417 40.7896 30.9677 41.037C34.2938 41.2845 37.5852 40.2308 40.1353 38.1022C41.2835 39.9867 42.9059 41.5439 44.8439 42.6219C42.79 44.3983 41.144 46.5895 40.0166 49.0481C38.8892 51.5067 38.3065 54.1759 38.3077 56.876C38.3077 57.7143 38.644 58.5182 39.2427 59.1109C39.8414 59.7036 40.6533 60.0366 41.5 60.0366C42.3467 60.0366 43.1586 59.7036 43.7573 59.1109C44.356 58.5182 44.6923 57.7143 44.6923 56.876C44.6923 53.5231 46.0376 50.3075 48.4323 47.9366C50.827 45.5657 54.0749 44.2337 57.4615 44.2337C58.3082 44.2337 59.1202 43.9008 59.7188 43.308C60.3175 42.7153 60.6538 41.9114 60.6538 41.0732C60.6538 40.2349 60.3175 39.431 59.7188 38.8383C59.1202 38.2456 58.3082 37.9126 57.4615 37.9126H51.0769C49.3836 37.9126 47.7597 37.2466 46.5623 36.0612C45.365 34.8757 44.6923 33.2679 44.6923 31.5915V25.2703H70.2308C71.9241 25.2703 73.548 25.9363 74.7454 27.1218C75.9427 28.3072 76.6154 29.915 76.6154 31.5915V37.9126Z" fill="#0449FF" />
                                </svg>
                            </div>

                            <div>
                                <div
                                    className="text-5xl md:text-[64px] leading-tight font-normal"
                                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    Skills Matter <br />
                                    More Than <br />
                                    Keywords
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Fair And Consistent Screening */}
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
                                    Fair And <br />
                                    Consistent <br />
                                    Screening
                                </div>
                            </div>

                            <div className="mb-4">
                                <svg width="100" height="97" viewBox="0 0 100 97" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                                    <path d="M47.0397 -0.000100435L52.4997 -0.000100196L52.4997 88.8999L95.4797 43.2599L99.5397 47.1799L52.4997 96.7399L47.0397 96.7399L-0.000314822 47.1799L4.05969 43.2599L47.0397 88.8999L47.0397 -0.000100435Z" fill="#0449FF" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Card 3: Faster Shortlisting */}
                    <div className="bg-white rounded-2xl p-2 flex flex-col h-[540px] text-black relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
                        <div className="h-16 flex items-center px-6 shrink-0">
                            <svg width="32" height="28" viewBox="0 0 32 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M25.7881 0H7.03271C6.6634 0 6.32415 0.203548 6.15036 0.529412L0.784313 10.5907C0.429057 11.2569 0.911744 12.0613 1.66666 12.0613H19.6555C20.0043 12.0613 20.3279 11.8796 20.5094 11.5818L26.642 1.52046C27.0482 0.854081 26.5685 0 25.7881 0Z" fill="black" />
                                <path d="M29.6651 15.9387H10.9097C10.5404 15.9387 10.2011 16.1423 10.0273 16.4681L4.66127 26.5295C4.30601 27.1956 4.7887 28.0001 5.54362 28.0001H23.5324C23.8812 28.0001 24.2048 27.8183 24.3863 27.5205L30.519 17.4592C30.9251 16.7928 30.4455 15.9387 29.6651 15.9387Z" fill="black" />
                            </svg>
                        </div>

                        <div className="bg-[#F2F6FF] rounded-xl flex-1 p-8 flex flex-col justify-between relative">
                            <div className="mt-4">
                                <svg width="100" height="97" viewBox="0 0 100 97" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-16 h-16">
                                    <path d="M52.5004 96.7401L47.0404 96.7401L47.0403 7.84008L4.06035 53.4801L0.000340777 49.5601L47.0403 8.40863e-05L52.5003 8.38476e-05L99.5403 49.5601L95.4803 53.4801L52.5003 7.84008L52.5004 96.7401Z" fill="#0449FF" />
                                </svg>
                            </div>

                            <div>
                                <div
                                    className="text-5xl md:text-[64px] leading-tight font-normal"
                                    style={{ fontFamily: 'DM Sans, sans-serif', letterSpacing: '-0.02em' }}
                                >
                                    Faster <br />
                                    Shortlisting
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
};

export default WhyZepJobsWorks;
