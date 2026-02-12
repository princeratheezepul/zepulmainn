import React, { useState } from 'react';
import '../styles/ZepConsultContact.css';
import { FaArrowRight } from 'react-icons/fa';

const ZepConsultContact = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        website: '',
        query: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleNext = (e) => {
        e.preventDefault();
        setStep(2);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        alert("Form submitted successfully!");
        setStep(1);
        setFormData({
            fullName: '',
            phone: '',
            email: '',
            website: '',
            query: ''
        });
    };

    return (
        <div className="zep-consult-contact-container">
            <div className="contact-left">
                <h2>Build, Secure, and<br />Scale Faster</h2>
                <p className="contact-description">
                    Zep Consult gives you instant access to world-<br />
                    class IT expertise, anywhere in the world, exactly<br />
                    when you need it.
                </p>
            </div>
            <div className="contact-right">
                <div className="contact-form-wrapper">
                    <div className="contact-form">
                        {/* Step 1 */}
                        <div className={`form-step ${step === 1 ? 'active' : 'inactive'}`}>
                            <form onSubmit={handleNext} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <input
                                    type="text"
                                    name="fullName"
                                    placeholder="Full Name"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="tel"
                                    name="phone"
                                    placeholder="Phone Number"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Email"
                                    value={formData.email}
                                    onChange={handleChange}
                                    required
                                />
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="Website link"
                                    value={formData.website}
                                    onChange={handleChange}
                                />
                                <button type="submit" className="submit-button">
                                    <FaArrowRight />
                                </button>
                            </form>
                        </div>

                        {/* Step 2 */}
                        <div className={`form-step form-step-2 ${step === 2 ? 'active' : 'inactive'}`}>
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'auto' }}>
                                    <button type="submit" className="submit-button" style={{ position: 'relative', bottom: 'auto', right: 'auto' }}>
                                        <FaArrowRight />
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

export default ZepConsultContact;
