import React from 'react';
import Marquee from 'react-fast-marquee';
import '../styles/AboutSpotlight.css';

const AboutSpotlight = () => {
    const articles = [
        {
            title: "London remains a world-class city by almost any international measure.",
            description: "London remains a world-class city by almost any international measure. I will continue to play my part in ensuring London remains a destination of choice.",
            link: "https://www.linkedin.com/posts/tarunghulati_london-remains-a-world-class-city-by-almost-activity-7420077495216947202-UNlw",
            image: "/assets/spotlight1.jpg" // User: Please add spotlight1.jpg to client/public/assets
        },
        {
            title: "Nearly 7,000 New UK Jobs To Be Created As Result Of Prime Minister's Trip To India",
            description: "Nearly 7,000 brand new jobs will be created in the United Kingdom thanks to a raft of major new deals secured by the Prime Minister during his visit to India this week.",
            link: "https://www.miragenews.com/nearly-7000-new-uk-jobs-to-be-created-as-result-1548322/",
            image: "/assets/spotlight2.jpg" // User: Please add spotlight2.jpg
        },
        {
            title: "Zepul Joins the Growing Wave of UK–India Technology and Talent Initiatives",
            description: "As the economic relationship between India and the United Kingdom enters a new phase of collaboration, Zepul stands out as one of the key contributors shaping this partnership’s future. Zepul has been acknowledged among the select Indian companies.",
            link: "https://gccrise.com/zepul-joins-the-growing-wave-of-uk-india-technology-and-talent-initiatives/",
            image: "/assets/spotlight3.jpg" // User: Please add spotlight3.jpg
        },
        {
            title: "Midlands jobs from India visit",
            description: "Among 64 Indian investments worth £1.3bn UK-wide, several name the Midlands directly. TVS Motor will invest £250m over five years in Norton Motorcycles, e-bikes and more – partnering with the University of Warwick.",
            link: "https://westmidlands.news/midlands-jobs-from-india-visit/",
            image: "/assets/spotlight4.jpg" // User: Please add spotlight4.jpg
        }
    ];

    const handleReadMore = (link) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

    return (
        <div className="about-spotlight-container">
            <h2 className="spotlight-title">In the Spotlight</h2>
            <div className="spotlight-slider-container">
                <Marquee gradient={false} speed={40} pauseOnHover={true}>
                    {articles.map((article, index) => (
                        <div key={index} className="spotlight-card">
                            <div className="spotlight-image-container">
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="spotlight-image"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = "https://placehold.co/600x400?text=Spotlight+Image"; // Fallback
                                    }}
                                />
                            </div>
                            <div className="spotlight-content">
                                <h3 className="spotlight-card-title">{article.title}</h3>
                                <p className="spotlight-description">{article.description}</p>
                                <button className="read-more-btn" onClick={() => handleReadMore(article.link)}>
                                    Read More
                                </button>
                            </div>
                        </div>
                    ))}
                </Marquee>
            </div>
        </div>
    );
};

export default AboutSpotlight;
