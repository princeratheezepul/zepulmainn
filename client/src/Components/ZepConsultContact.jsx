import React, { useState } from 'react';
import '../styles/ZepConsultContact.css';
import { FaArrowRight } from 'react-icons/fa';

const ZepConsultContact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        phone: '',
        email: '',
        website: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        // Add form submission logic here
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
                <form className="contact-form" onSubmit={handleSubmit}>
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
        </div>
    );
};

export default ZepConsultContact;
