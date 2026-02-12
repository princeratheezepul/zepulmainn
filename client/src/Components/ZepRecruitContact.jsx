import React from 'react';
import '../styles/ZepRecruitContact.css';
import { FaArrowRight } from 'react-icons/fa';

const ZepRecruitContact = () => {
    const [step, setStep] = React.useState(1);
    const [formData, setFormData] = React.useState({
        fullName: '',
        phoneNumber: '',
        email: '',
        website: '',
        query: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.className.includes('form-input') ? 'name' : e.target.name]: e.target.value
        });
        // Note: The original input fields didn't have 'name' attributes properly set in the previous code.
        // I will add them in the render below.
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
            phoneNumber: '',
            email: '',
            website: '',
            query: ''
        });
    };

    return (
        <div className="zep-recruit-contact-container ">
            <div className="zep-recruit-contact-content">
                <div className="zep-recruit-contact-left">
                    <h2>
                        Beyond recruitment, we<br />
                        architect talent intelligently,<br />
                        consistently, and at scale.
                    </h2>
                    <p>Talk to us to see how Zepul can transform the way you hire.</p>
                </div>
                <div className="zep-recruit-contact-right">
                    <div className={`form-step ${step === 1 ? 'active' : 'inactive'}`}>
                        <form className="zep-recruit-contact-form" onSubmit={handleNext}>
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                className="form-input dark-input"
                                required
                            />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                className="form-input light-input"
                                required
                            />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="form-input light-input"
                                required
                            />
                            <div className="input-group">
                                <input
                                    type="url"
                                    name="website"
                                    placeholder="Website link"
                                    value={formData.website}
                                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                                    className="form-input light-input"
                                />
                                <button type="submit" className="submit-btn" aria-label="Next">
                                    <FaArrowRight />
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className={`form-step form-step-2 ${step === 2 ? 'active' : 'inactive'}`}>
                        <form className="zep-recruit-contact-form" onSubmit={handleSubmit}>
                            <button type="button" className="back-btn" onClick={() => setStep(1)}>
                                ← Back
                            </button>
                            <h3 className="query-heading">What is your query?</h3>
                            <textarea
                                name="query"
                                placeholder="Type your message here..."
                                value={formData.query}
                                onChange={(e) => setFormData({ ...formData, query: e.target.value })}
                                className="query-textarea"
                                required
                            />
                            <div className="input-group" style={{ justifyContent: 'flex-end' }}>
                                <button type="submit" className="submit-btn" aria-label="Submit">
                                    <FaArrowRight />
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ZepRecruitContact;
