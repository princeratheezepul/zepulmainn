import React, { useState } from 'react';
import '../styles/ContactPage.css';
import { FaArrowRight } from 'react-icons/fa';

const ContactPage = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        email: '',
        phoneNumber: '',
        country: '',
        city: '',
        needs: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add submission logic here
    };

    return (
        <div className="contact-page-container">
            <div className="contact-page-left">
                <img
                    src="/Rectangle 161123841.png"
                    alt="Contact Us"
                    className="contact-hero-image"
                />
            </div>
            <div className="contact-page-right">
                <div className="contact-content">
                    <h1>Contact</h1>
                    <p className="contact-intro">
                        Unlock the power of AI-driven recruitment and expert consulting. Whether you're scaling your team, need strategic IT guidance, or have questions about our platform, we're here to help you achieve your goals.
                    </p>

                    <form onSubmit={handleSubmit} className="contact-page-form">
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="fullName">Full name</label>
                                <input
                                    type="text"
                                    id="fullName"
                                    name="fullName"
                                    value={formData.fullName}
                                    onChange={handleChange}
                                    placeholder="Susheel"
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="companyName">Company Name</label>
                                <input
                                    type="text"
                                    id="companyName"
                                    name="companyName"
                                    value={formData.companyName}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="phoneNumber">Phone Number</label>
                                <input
                                    type="tel"
                                    id="phoneNumber"
                                    name="phoneNumber"
                                    value={formData.phoneNumber}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="country">Country</label>
                                <div className="select-wrapper">
                                    <select
                                        id="country"
                                        name="country"
                                        value={formData.country}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled></option>
                                        <option value="USA">USA</option>
                                        <option value="India">India</option>
                                        <option value="UK">UK</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="city">City</label>
                                <div className="select-wrapper">
                                    <select
                                        id="city"
                                        name="city"
                                        value={formData.city}
                                        onChange={handleChange}
                                    >
                                        <option value="" disabled></option>
                                        <option value="New York">New York</option>
                                        <option value="Mumbai">Mumbai</option>
                                        <option value="London">London</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="form-group full-width">
                            <label htmlFor="needs">Let us know more about your needs</label>
                            <input
                                type="text"
                                id="needs"
                                name="needs"
                                value={formData.needs}
                                onChange={handleChange}
                            />
                        </div>

                        <button type="submit" className="contact-submit-btn">
                            Submit <FaArrowRight className="btn-icon" />
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;
