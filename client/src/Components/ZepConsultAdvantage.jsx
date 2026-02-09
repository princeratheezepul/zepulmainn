import React from 'react';
import '../styles/ZepConsultAdvantage.css';

const ZepConsultAdvantage = () => {
    return (
        <div className="zep-consult-advantage-container">
            <h2>Our Core<br />Advantage</h2>
            <div className="advantage-cards">
                <div className="advantage-card">
                    <div className="card-image">
                        <img src="/assets/consult_card_1.png" alt="Global Consultant Network" />
                    </div>
                    <h3>On-Demand Global Consultant Network</h3>
                </div>
                <div className="advantage-card">
                    <div className="card-image">
                        <img src="/assets/consult_card_2.png" alt="Vetted Senior Consultants" />
                    </div>
                    <h3>Access vetted, senior IT consultants across North America, Europe, Asia, and the Middle East on demand.</h3>
                </div>
                <div className="advantage-card">
                    <div className="card-image">
                        <img src="/assets/consult_card_3.png" alt="Scale Expertise" />
                    </div>
                    <h3>Scale expertise instantly without long hiring cycles or fixed overhead.</h3>
                </div>
            </div>
        </div>
    );
};

export default ZepConsultAdvantage;
