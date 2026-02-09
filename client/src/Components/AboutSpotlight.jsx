import React from 'react';
import Marquee from 'react-fast-marquee';
import '../styles/AboutSpotlight.css';

const AboutSpotlight = () => {
    const articles = [
        {
            title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus, bibendum nisl tellus ac",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus. Dictumst risus,",
        },
        {
            title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus, bibendum nisl tellus ac",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus. Dictumst risus,",
        },
        {
            title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus, bibendum nisl tellus ac",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus. Dictumst risus,",
        },
        {
            title: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Risus, bibendum nisl tellus ac",
            description: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Condimentum diam orci pretium a pharetra, feugiat cursus. Dictumst risus,",
        }
    ];

    return (
        <div className="about-spotlight-container">
            <h2 className="spotlight-title">In the Spotlight</h2>
            <div className="spotlight-slider-container">
                <Marquee gradient={false} speed={40} pauseOnHover={true}>
                    {articles.map((article, index) => (
                        <div key={index} className="spotlight-card">
                            <div className="spotlight-image-placeholder"></div>
                            <div className="spotlight-content">
                                <h3 className="spotlight-card-title">{article.title}</h3>
                                <p className="spotlight-description">{article.description}</p>
                                <button className="read-more-btn">Read More</button>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </div>
    );
};

export default AboutSpotlight;
