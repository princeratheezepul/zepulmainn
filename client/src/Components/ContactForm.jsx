import React, { useState } from "react";
import "../styles/ContactForm.css";

const ContactForm = () => {
    const [formData, setFormData] = useState({
        fullName: "",
        phoneNumber: "",
        email: "",
        websiteLink: "",
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Form submitted:", formData);
        // Add your form submission logic here
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
                    <form className="contact-form" onSubmit={handleSubmit}>
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
            </div>
        </div>
    );
};

export default ContactForm;
