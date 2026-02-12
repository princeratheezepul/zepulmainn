import React, { useState } from "react";
import "../styles/ContactForm.css";

const ContactForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        websiteLink: "",
        query: ""
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleNext = (e) => {
        e.preventDefault();
        // Basic validation
        if (formData.fullName && formData.phoneNumber && formData.email) {
            setStep(2);
        } else {
            alert("Please fill in all required fields.");
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Add your form submission logic here
        alert("Form submitted successfully!");
        setStep(1);
        setFormData({
            fullName: "",
            phoneNumber: "",
            email: "",
            websiteLink: "",
            query: ""
        });
    };

    return (
        <div className="contact-form-container">
            <div className="contact-form-content">
                <div className="contact-form-left">
                    <h2 className="contact-form-heading">
                        Beyond recruitment, we architect talent intelligently, consistently, and at scale.
                    </h2>
                    <p className="contact-form-subtext">
                        Talk to us to see how Zepul can transform the way you hire.
                    </p>
                </div>

                <div className="contact-form-right">
                    <div className="contact-form">
                        {/* Step 1 */}
                        <div className={`form-step ${step === 1 ? 'active' : 'inactive'}`}>
                            <form onSubmit={handleNext}>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phoneNumber"
                                    placeholder="Phone Number"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="form-input"
                                    required
                                />
                                <div className="form-input-submit">
                                    <input
                                        type="text"
                                        name="websiteLink"
                                        placeholder="Website link"
                                        value={formData.websiteLink}
                                        onChange={handleChange}
                                        className="form-input-last"
                                    />
                                    <button type="submit" className="submit-btn">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>

                        {/* Step 2 */}
                        <div className={`form-step form-step-2 ${step === 2 ? 'active' : 'inactive'}`}>
                            <form onSubmit={handleSubmit}>
                                <button type="button" className="back-btn" onClick={() => setStep(1)}>
                                    ← Back
                                </button>
                                <h3 className="query-heading">What is your query?</h3>
                                <textarea
                                    name="query"
                                    placeholder="Type your message here..."
                                    value={formData.query}
                                    onChange={handleChange}
                                    className="query-textarea"
                                    required
                                />
                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <button type="submit" className="submit-btn">
                                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M4 10h12M12 6l4 4-4 4" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContactForm;
