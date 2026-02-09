import React from 'react';
import '../styles/ZepRecruitContact.css';
import { FaArrowRight } from 'react-icons/fa';

const ZepRecruitContact = () => {
    return (
        <div className="zep-recruit-contact-container">
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
                    <form className="zep-recruit-contact-form">
                        <input
                            type="text"
                            placeholder="Full Name"
                            className="form-input dark-input"
                        />
                        <input
                            type="tel"
                            placeholder="Phone Number"
                            className="form-input light-input"
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="form-input light-input"
                        />
                        <div className="input-group">
                            <input
                                type="url"
                                placeholder="Website link"
                                className="form-input light-input"
                            />
                            <button type="submit" className="submit-btn" aria-label="Submit">
                                <FaArrowRight />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ZepRecruitContact;
