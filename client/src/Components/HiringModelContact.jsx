import React from 'react';
import { ArrowRight } from 'lucide-react';

const HiringModelContact = () => {
    return (
        <div className="w-full bg-[#EAEAEA] pt-[86px] pb-24">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
                    {/* Left Side - Text */}
                    <div className="lg:w-1/2 lg:pl-[60px]">
                        <div className="text-4xl md:text-[54px] font-medium text-[#000000] leading-[1.1] mb-8 max-w-[479px]">
                            Not just faster hiring.<br />
                            A new hiring<br />
                            operating model.
                        </div>
                        <p className="text-gray-600 text-lg max-w-md">
                            Talk to us to see how Zepul can transform the way you hire.
                        </p>
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
                                <div>
                                    <input
                                        type="url"
                                        placeholder="Website link"
                                        className="w-full bg-[#F3F3F3] text-black placeholder-gray-500 px-6 py-4 rounded-full outline-none focus:ring-2 focus:ring-gray-300 transition-all"
                                    />
                                </div>
                            </form>

                            {/* Submit Button */}
                            <div className="absolute bottom-8 right-8 md:bottom-10 md:right-10">
                                <button className="w-14 h-14 bg-[#0044FF] rounded-full flex items-center justify-center text-white hover:bg-blue-700 transition-colors shadow-lg">
                                    <ArrowRight size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default HiringModelContact;
