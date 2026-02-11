import React from 'react';
import '../styles/ZepConsultServices.css';
import { FaCode, FaCloud, FaChartLine, FaBrain, FaShieldAlt, FaCogs } from 'react-icons/fa';

const ZepConsultServices = () => {
    const services = [
        { title: "Software Development", description: "Custom software solutions tailored to your business needs.", icon: <FaCode /> },
        { title: "Cloud Migration", description: "Seamless transition to cloud infrastructure for scalability.", icon: <FaCloud /> },
        { title: "Data Analytics", description: "Actionable insights derived from your data to drive decisions.", icon: <FaChartLine /> },
        { title: "AI/ML Solutions", description: "Leveraging artificial intelligence for process automation.", icon: <FaBrain /> },
        { title: "Cybersecurity", description: "Robust security measures to protect your digital assets.", icon: <FaShieldAlt /> },
        { title: "DevOps", description: "Streamlined development and operations for faster delivery.", icon: <FaCogs /> }
    ];

    return (
        <div className="zep-consult-services-container">
            <h2>Our Services</h2>
            <div className="services-grid">
                {services.map((service, index) => (
                    <div key={index} className="service-card">
                        <div className="service-icon">
                            {service.icon}
                        </div>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ZepConsultServices;
