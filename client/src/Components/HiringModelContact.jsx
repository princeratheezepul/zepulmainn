import React from 'react';
import { ArrowRight } from 'lucide-react';

const HiringModelContact = () => {
    return (
        <div className="w-full bg-[#EAEAEA] pt-12 pb-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Left Side - Text */}
                    <div className="lg:w-1/2 lg:pl-[60px]">
                        <div className="text-3xl md:text-[48px] font-medium text-[#000000] leading-[1.1] mb-8 max-w-[479px]">
                            Not just faster hiring.<br />
                            A new hiring<br />
                            operating model.
                        </div>
                        <div className="text-gray-600 text-lg max-w-md">
                            Talk to us to see how Zepul can transform the way you hire.
                        </div>
                    </div>

                    {/* Right Side - Form Card */}
                    <div className="lg:w-1/2 w-full max-w-xl">
                        <div className="bg-white rounded-3xl p-8 md:p-10 shadow-sm relative">
                            <form className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Full Name"
                                        className="w-full bg-[#1A1A1A] text-white placeholder-gray-400 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-gray-400 transition-all"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="tel"
                                        placeholder="Phone Number"
                                        className="w-full bg-[#F3F3F3] text-black placeholder-gray-500 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                                    />
                                </div>
                                <div>
                                    <input
                                        type="email"
                                        placeholder="Email"
                                        className="w-full bg-[#F3F3F3] text-black placeholder-gray-500 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                                    />
                                </div>
                                <div className="flex items-center gap-4">
                                    <input
                                        type="url"
                                        placeholder="Website link"
                                        className="flex-1 bg-[#F3F3F3] text-black placeholder-gray-500 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                                    />
                                    <div className="w-14 h-14 bg-[#0044FF] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg flex-shrink-0 cursor-pointer">
                                        <ArrowRight size={24} />
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiringModelContact;
