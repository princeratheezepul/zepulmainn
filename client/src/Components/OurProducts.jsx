import React from 'react';
import { Armchair, Users, BriefcaseBusiness, FileSearch } from 'lucide-react';

const OurProducts = () => {
    const products = [
        {
            icon: <Armchair size={24} />,
            title: "Zep\nRecruit",
            description: "Tech-enabled recruitment delivered through Zepul's AI platform and a distributed recruiter network."
        },
        {
            icon: <Users size={24} />,
            title: "Zep Pro\nRecruiter",
            description: "An AI-powered recruiting platform that enables individuals and teams to deliver enterprise-grade hiring outcomes."
        },
        {
            icon: <BriefcaseBusiness size={24} />,
            title: "Zep\nJobs",
            description: "Tech-enabled recruitment delivered through Zepul's AI platform and a distributed recruiter network."
        },
        {
            icon: <FileSearch size={24} />,
            title: "Zep Talent\nHub",
            description: "Instant access to pre-vetted, skill-validated candidate scorecards."
        }
    ];

    return (
        <div className="w-full bg-[#F9FAFB] py-8">
            <div className="container mx-auto px-4">
                <h2 className="text-4xl md:text-5xl font-medium text-black mb-12">
                    Our Products & Services
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product, index) => (
                        <div key={index} className="bg-white rounded-2xl p-8 pb-4 border border-gray-200 flex flex-col h-full hover:shadow-lg transition-shadow duration-300">
                            <div className="w-12 h-12 bg-[#EBF3FF] rounded-lg flex items-center justify-center text-gray-800 mb-8">
                                {product.icon}
                            </div>
                            <h3 className="text-2xl md:text-3xl font-medium text-black mb-6 leading-tight">
                                {product.title.split('\n').map((line, i) => (
                                    <React.Fragment key={i}>
                                        {i > 0 && <br />}
                                        {line}
                                    </React.Fragment>
                                ))}
                            </h3>
                            <p className="text-gray-600 text-sm leading-relaxed mt-auto">
                                {product.description}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default OurProducts;
