import React, { useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Navigation } from 'swiper/modules';
import { FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/autoplay';
import '../styles/AboutSpotlight.css';

const AboutSpotlight = () => {
    const swiperRef = useRef(null);

    const articles = [
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
            title: "Zepul Joins the Growing Wave of UK–India Technology and Talent Initiatives",
            description: "As the economic relationship between India and the United Kingdom enters a new phase of collaboration, Zepul stands out as one of the key contributors shaping this partnership’s future. Zepul has been acknowledged among the select Indian companies.",
            link: "https://gccrise.com/zepul-joins-the-growing-wave-of-uk-india-technology-and-talent-initiatives/",
            image: "/gccrise.jpeg"
        },
        {
            title: "Midlands jobs from India visit",
            description: "Among 64 Indian investments worth £1.3bn UK-wide, several name the Midlands directly. TVS Motor will invest £250m over five years in Norton Motorcycles, e-bikes and more – partnering with the University of Warwick.",
            link: "https://westmidlands.news/midlands-jobs-from-india-visit/",
            image: "/assets/spotlight4.jpg"
        }
    ];

    const handleReadMore = (link) => {
        window.open(link, '_blank', 'noopener,noreferrer');
    };

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
                                    <button className="read-more-btn" onClick={() => handleReadMore(article.link)}>
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
        </div>
    );
};

export default AboutSpotlight;
