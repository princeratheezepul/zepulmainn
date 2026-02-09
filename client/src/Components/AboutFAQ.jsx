import React, { useState } from 'react';
import '../styles/AboutFAQ.css';
import { FaPlus, FaMinus } from 'react-icons/fa';

const AboutFAQ = () => {
    const [activeIndex, setActiveIndex] = useState(0);

    const faqs = [
        {
            question: "What makes Zepul different from traditional recruitment platforms?",
            answer: "Zepul is an AI-powered HRTech marketplace that unifies the entire talent ecosystem—employers, recruiters, and candidates. Unlike traditional platforms, we combine a robust AI engine with human expertise for multi-layer screening, ensuring precise talent matching, faster hiring, and complete transparency."
        },
        {
            question: "How does Zepul ensure the quality of candidates?",
            answer: "We employ a rigorous multi-layer screening process. Candidates undergo AI-driven analysis followed by expert human evaluation. We provide comprehensive report cards that include resume scores, functional evaluation scores, and background verification insights, ensuring you only interview the top 5% of talent."
        },
        {
            question: "What services does Zep Consult offer?",
            answer: "Zep Consult is our premium technology consulting vertical. We deliver high-impact services including IT strategy, software engineering, and digital transformation. We leverage a global network of senior consultants to help enterprises architect, secure, and scale their technology infrastructure."
        },
        {
            question: "Can I hire for project-based or gig roles through Zepul?",
            answer: "Yes. Zepul supports diverse hiring models including Full-time, Contractual, and Gig workforce. Whether you need a team for a short-term project or long-term staff augmentation, our platform manages the entire lifecycle from requisition to onboarding/offboarding."
        },
        {
            question: "How does the AI engine reduce hiring time?",
            answer: "Our AI engine instantly sources candidates from a vast database (ZepDB) and automates initial screening and scheduling. This significantly reduces manual effort and Turnaround Time (TAT), allowing recruiters to focus on engagement and decision-making rather than administrative tasks."
        }
    ];

    const toggleFAQ = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className="about-faq-container">
            <div className="faq-left">
                <h2>Let's Answer<br />Your Questions</h2>
                <p>
                    We're here to provide clarity and transparency, so you can make informed decisions.
                </p>
            </div>
            <div className="faq-right">
                {faqs.map((faq, index) => (
                    <div
                        key={index}
                        className={`faq-item ${activeIndex === index ? 'active' : ''}`}
                        onClick={() => toggleFAQ(index)}
                    >
                        <div className="faq-question">
                            <span className="question-text">{faq.question}</span>
                            <span className="toggle-icon">
                                {activeIndex === index ? <FaMinus /> : <FaPlus />}
                            </span>
                        </div>
                        <div className={`faq-answer ${activeIndex === index ? 'show' : ''}`}>
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AboutFAQ;
