import React, { useRef, useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight, FaTimes } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import '../styles/AboutSpotlight.css';

const AboutSpotlight = () => {
    const swiperRef = useRef(null);
    const [activeArticle, setActiveArticle] = useState(null);

    const articles = [
        {
            title: "A truly memorable evening at the UK House of Lords graciously hosted by Lord Uday Nagaraju.",
            description: "A truly memorable evening at the UK House of Lords graciously hosted by my dear friend Lord Uday Nagaraju. He inspired confidence among the business leaders who had travelled from various states across India to explore opportunities in the UK and understand the areas of support available to them.",
            link: "https://www.linkedin.com/posts/tarunghulati_a-truly-memorable-evening-at-the-uk-house-ugcPost-7470492508708560896-NAdI?utm_source=share&utm_medium=member_desktop&rcm=ACoAABJ4leYBclPh-DfkZKrFw7Q-Je-L9Duz7zQ",
            image: "/assets/spotlight_house_of_lords.jpg"
        },
        {
            title: "Zepul at the UK\u2013India Business & Innovation Ecosystem: A Farewell to Gareth Wynn Owen",
            description: "Zepul was pleased to be part of the Hyderabad ecosystem gathering that marked the farewell of Gareth Wynn Owen, British Deputy High Commissioner for Andhra Pradesh and Telangana. Gareth has played an important role in strengthening engagement between the United Kingdom and the region, with a focus on business and trade, science and innovation, education, and sustainable growth. For Zepul, the occasion was more than a farewell. It was an opportunity to connect with leaders and ecosystem builders working towards stronger global collaboration between India and the UK.",
            link: null,
            image: "/assets/spotlight24.jpg",
            fullText: [
                "Zepul was pleased to be part of the Hyderabad ecosystem gathering that marked the farewell of Gareth Wynn Owen, British Deputy High Commissioner for Andhra Pradesh and Telangana.",
                "Gareth has played an important role in strengthening engagement between the United Kingdom and the region, with a focus on business and trade, science and innovation, education, and sustainable growth.",
                "For Zepul, the occasion was more than a farewell. It was an opportunity to connect with leaders and ecosystem builders working towards stronger global collaboration between India and the UK.",
                "As an AI-powered Talent Acquisition Operating System, Zepul is building technology and talent infrastructure that enables organisations to discover, evaluate and hire talent more efficiently across markets. With our growing engagement across India, the UK, UAE and Ireland, we believe that the future of talent is increasingly global, connected and AI-driven.",
                "The UK\u2013India relationship continues to create opportunities for businesses, technology companies, entrepreneurs and talent to collaborate across borders. Gatherings such as these reinforce the importance of relationships, knowledge exchange and shared ambition in building that ecosystem.",
                "We thank Gareth for his contribution to the Hyderabad ecosystem and wish him every success in his next chapter.",
                "From Hyderabad to the world \u2014 Zepul continues to build the future of talent."
            ]
        },
        {
            title: "London remains a world-class city by almost any international measure.",
            description: "London remains a world-class city by almost any international measure. I will continue to play my part in ensuring London remains a destination of choice.",
            link: "https://www.linkedin.com/posts/tarunghulati_london-remains-a-world-class-city-by-almost-activity-7420077495216947202-UNlw",
            image: "/assets/spotlight1.jpg"
        },
        {
            title: "Nearly 7,000 New UK Jobs To Be Created As Result Of Prime Minister's Trip To India",
            description: "Nearly 7,000 brand new jobs will be created in the United Kingdom thanks to a raft of major new deals secured by the Prime Minister during his visit to India this week.",
            link: "https://www.miragenews.com/nearly-7000-new-uk-jobs-to-be-created-as-result-1548322/",
            image: "/assets/spotlight2.jpg"
        },
        {
            title: "Zepul Joins the Growing Wave of UK\u2013India Technology and Talent Initiatives",
            description: "As the economic relationship between India and the United Kingdom enters a new phase of collaboration, Zepul stands out as one of the key contributors shaping this partnership\u2019s future. Zepul has been acknowledged among the select Indian companies.",
            link: "https://gccrise.com/zepul-joins-the-growing-wave-of-uk-india-technology-and-talent-initiatives/",
            image: "/gccrise.jpeg"
        },
        {
            title: "Midlands jobs from India visit",
            description: "Among 64 Indian investments worth \u00a31.3bn UK-wide, several name the Midlands directly. TVS Motor will invest \u00a3250m over five years in Norton Motorcycles, e-bikes and more \u2013 partnering with the University of Warwick.",
            link: "https://westmidlands.news/midlands-jobs-from-india-visit/",
            image: "/assets/spotlight4.jpg"
        },
        {
            title: "We\u2019re thrilled to celebrate another brilliant cohort of global companies choosing #London as their launchpad for growth.",
            description: "From smart lighting and sustainable food tech to fintech, sports innovation, and digital infrastructure, these businesses reflect the incredible breadth of London\u2019s economy.",
            link: "https://www.linkedin.com/posts/growlondon_london-welcomes-global-innovators-ugcPost-7389674494820528130-SoAE",
            image: "/growlondon_logo.jpg"
        },
        {
            title: "Wonderful to be invited as a Special Guest at the Institute of Directors (IOD), India 2025 London Global Convention",
            description: "Delighted to catch up again with Nara Chandrababu Naidu, Honourable Chief Minister of Andhra Pradesh Government of Andhra Pradesh",
            link: "https://www.linkedin.com/posts/tarunghulati_wonderful-to-be-invited-as-a-special-guest-activity-7392109269308821504-TN10/",
            image: "/assets/1762416185274.jpg"
        },
        {
            title: "Delighted to meet the delegates of High growth IT and Business Process Outsourcing",
            description: "Delighted to meet the delegates of High growth IT and Business Process Outsourcing (BPO) enterprises from Uganda, Barbados, and Trinidad and Tobago at an excellent reception organised by London Chamber of Commerce and Industry in collaboration with International Trade Centre, United Nations and Foreign, Commonwealth and Development Office",
            link: "https://www.linkedin.com/posts/tarunghulati_delighted-to-meet-the-delegates-of-high-growth-activity-7425133287460810753-D_if",
            image: "/1770289725480.jpg"
        },
        {
            title: "We were honoured to receive an exclusive invitation to the London Tech Week 2025 Afterglow hosted by the British High Commission in India on 11th August 2025.",
            description: "The event aimed to explore how the UK's Department for Business and Trade can support businesses looking to expand into the UK, providing resources, guidance, and a deeper understanding of the UK business landscape. It was a highly productive and engaging gathering, bringing together select industry leaders to exchange ideas, explore collaboration opportunities, and discuss the future of emerging technologies.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1754977352947.jpg"
        },
        {
            title: "We are truly delighted that our Co-founder, Mr. Tarun Ghulati, had the honor of meeting the Hon\u2019ble Chief Minister of Andhra Pradesh, Shri Nara Chandrababu Naidu Garu",
            description: "We extend our best wishes to both Mr. Ghulati and Shri CBN for continued success in their respective endeavors, driven by their shared passion and unwavering commitment to progress. We are confident that the state of Andhra Pradesh will continue to thrive and achieve remarkable growth under Shri CBN's visionary leadership.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7339292676548083712",
            image: "/1749823730651.jpg"
        },
        {
            title: "We would like to extend our heartfelt appreciation for the exceptional experience provided during London Tech Week 2025",
            description: "We are particularly grateful for the opportunity to participate in various fringe events, which contributed greatly to our objectives around business growth and expansion in the UK. The event schedule was both dynamic and thoughtfully curated\u2014balancing productive daytime sessions with vibrant evening engagements that facilitated meaningful conversations and strategic networking.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1749822259250.jpg"
        },
        {
            title: "Grateful to reflect on 16 years at the London Chamber of Commerce and Industry-Asian Business Association.",
            description: "As the longest-serving Committee Member of the Asian Business Association (ABA) and a former Deputy Chairman, it has been a privilege to serve the Asian community and work alongside so many inspiring individuals across London and globally.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1769680210860.jpg"
        },
        {
            title: "It was a true pleasure to serve on a panel in support of the University of Westminster\u2019s South Asian Student Community.",
            description: "The discussion and student engagement session was organised by the University of Westminster in partnership with the London Chamber of Commerce and Industry \u2013 Asian Business Association. We shared practical insights on navigating professional spaces, leveraging networks, and building visibility and credibility.",
            link: "https://www.linkedin.com/posts/tarunghulati_it-was-a-true-pleasure-to-serve-on-a-panel-ugcPost-7427748963094806528-6Cag",
            image: "/1770913352377.jpg"
        },
        {
            title: "Few cities operate at a high level across so many systems simultaneously.",
            description: "That\u2019s what makes London structurally powerful in the global economy. Not dominance in one field\u2014but influence across many.",
            link: "https://www.linkedin.com/posts/tarunghulati_london-remains-a-world-class-city-by-almost-activity-7420077495216947202-UNlw",
            image: "/assets/london_global_power.webp"
        },
        {
            title: "A wonderful evening at the HSBC UK Brokerage dinner event.",
            description: "Thank you to Bhargab K Sarma and Aman Nirwal from HSBC UK for hosting such a fantastic evening. It's great to see how successfully the brokerage channel has grown and the momentum it continues to build within HSBC UK.",
            link: "https://www.linkedin.com/posts/tarunghulati_a-wonderful-evening-at-the-hsbc-uk-brokerage-ugcPost-7437420030474027008-3uEY",
            image: "/assets/spotlight_hsbc.jpg"
        },
        {
            title: "Few cities operate at a high level across so many systems simultaneously.",
            description: "That\u2019s what makes London structurally powerful in the global economy. Not dominance in one field\u2014but influence across many.",
            link: "https://www.linkedin.com/posts/tarunghulati_most-global-cities-dominate-one-thing-new-activity-7439145500395679744-MSoF?utm_source=share&utm_medium=member_desktop&rcm=ACoAABbBgf4BqMzG6tY98WoXzG3v32Tu-1k_UJI",
            image: "/assets/spotlight_london_power.jpg"
        }
    ];
    
    const handleReadMore = (article) => {
        if (article.link) {
            window.open(article.link, '_blank', 'noopener,noreferrer');
        } else if (article.fullText) {
            setActiveArticle(article);
        }
    };

    // Close the modal on Escape and lock background scroll while it is open
    useEffect(() => {
        if (!activeArticle) return;
        const handleKeyDown = (e) => {
            if (e.key === 'Escape') setActiveArticle(null);
        };
        document.addEventListener('keydown', handleKeyDown);
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = previousOverflow;
        };
    }, [activeArticle]);

    return (
        <div className="about-spotlight-container">
            <h2 className="spotlight-title">In the Spotlight</h2>
            <div className="spotlight-slider-container">
                <Swiper
                    modules={[Autoplay, Navigation]}
                    spaceBetween={30}
                    slidesPerView={1}
                    loop={true}
                    autoplay={{
                        delay: 3000,
                        disableOnInteraction: false,
                    }}
                    onBeforeInit={(swiper) => {
                        swiperRef.current = swiper;
                    }}
                    breakpoints={{
                        640: {
                            slidesPerView: 2,
                        },
                        1024: {
                            slidesPerView: 3,
                        },
                    }}
                    className="mySwiper"
                >
                    {articles.map((article, index) => (
                        <SwiperSlide key={index}>
                            <div className="spotlight-card">
                                <div className="spotlight-image-container">
                                    <img
                                        src={article.image}
                                        alt={article.title}
                                        className="spotlight-image"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "https://placehold.co/600x400?text=Spotlight+Image";
                                        }}
                                    />
                                </div>
                                <div className="spotlight-content">
                                    <h3 className="spotlight-card-title">{article.title}</h3>
                                    <p className="spotlight-description">{article.description}</p>
                                    <button className="read-more-btn" onClick={() => handleReadMore(article)}>
                                        Read More
                                    </button>
                                </div>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
            <div className="spotlight-navigation">
                <button onClick={() => swiperRef.current?.slidePrev()} className="nav-btn prev-btn">
                    <FaArrowLeft />
                </button>
                <button onClick={() => swiperRef.current?.slideNext()} className="nav-btn next-btn">
                    <FaArrowRight />
                </button>
            </div>

            {activeArticle && (
                <div className="spotlight-modal-overlay" onClick={() => setActiveArticle(null)}>
                    <div
                        className="spotlight-modal"
                        role="dialog"
                        aria-modal="true"
                        aria-label={activeArticle.title}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            className="spotlight-modal-close"
                            onClick={() => setActiveArticle(null)}
                            aria-label="Close"
                        >
                            <FaTimes />
                        </button>
                        <img
                            src={activeArticle.image}
                            alt={activeArticle.title}
                            className="spotlight-modal-image"
                        />
                        <div className="spotlight-modal-body">
                            <h3 className="spotlight-modal-title">{activeArticle.title}</h3>
                            {activeArticle.fullText.map((paragraph, i) => (
                                <p key={i} className="spotlight-modal-paragraph">{paragraph}</p>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AboutSpotlight;
