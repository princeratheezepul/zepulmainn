import React from "react";
import "../styles/ProductsServices.css";

const ProductsServices = () => {
    const products = [
        {
            iconType: "users",
            title: "Zep Recruit",
            description:
                "A Legacy Pay After Successful Placement Model, Reimagined with AI to Reduce Cost, Time, and Complexity.",
        },
        {
            iconType: "briefcase",
            title: "Zep Pro Recruiter",
            description:
                "Built for every recruiter. Boost productivity, hire quality talent, move fast.",
        },
        {
            iconType: "laptop",
            title: "Zep Jobs",
            description: "Where Talent Meets Opportunity",
        },
        {
            iconType: "chart",
            title: "Zep Consult",
            description:
                "Global, On-Demand IT Consulting for Scalable Enterprises",
        },
    ];

    const renderIcon = (iconType) => {
        const iconMap = {
            users: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            briefcase: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="7" width="20" height="14" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            laptop: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="3" width="20" height="14" rx="2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M8 21h8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 17v4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
            chart: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3v18h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M18 17V9M13 17v-6M8 17v-3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            ),
        };
        return iconMap[iconType];
    };

    return (
        <div className="products-services-container">
            <h2 className="products-services-title">
                Purpose Driven Products And Services For{" "}
                <span className="text-primary">Modern Recruitment</span>
            </h2>

            <div className="products-grid">
                {products.map((product, index) => (
                    <div className="product-card" key={index}>
                        <div className="product-icon">{renderIcon(product.iconType)}</div>
                        <h3 className="product-title">{product.title}</h3>
                        <p className="product-description">{product.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProductsServices;
