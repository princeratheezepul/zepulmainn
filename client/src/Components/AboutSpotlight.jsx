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
        }
        ,
        {
            title: "Midlands jobs from India visit",
            description: "Among 64 Indian investments worth £1.3bn UK-wide, several name the Midlands directly. TVS Motor will invest £250m over five years in Norton Motorcycles, e-bikes and more – partnering with the University of Warwick.",
            link: "https://westmidlands.news/midlands-jobs-from-india-visit/",
            image: "/assets/spotlight4.jpg"
        }
        ,
        {
            title: "We’re thrilled to celebrate another brilliant cohort of global companies choosing #London as their launchpad for growth.",
            description: "From smart lighting and sustainable food tech to fintech, sports innovation, and digital infrastructure, these businesses reflect the incredible breadth of London’s economy.",
            link: "https://www.linkedin.com/posts/growlondon_london-welcomes-global-innovators-ugcPost-7389674494820528130-SoAE",
            image: "/growlondon_logo.jpg"
        }
        ,
        {
            title: "Wonderful to be invited as a Special Guest at the Institute of Directors (IOD), India 2025 London Global Convention",
            description: "Delighted to catch up again with Nara Chandrababu Naidu, Honourable Chief Minister of Andhra Pradesh Government of Andhra Pradesh  ",
            link: "https://www.linkedin.com/posts/tarunghulati_wonderful-to-be-invited-as-a-special-guest-activity-7392109269308821504-TN10/",
            image: "/assets/1762416185274.jpg"
        }
        ,
        {
            title: "Delighted to meet the delegates of High growth IT and Business Process Outsourcing ",
            description: "Delighted to meet the delegates of High growth IT and Business Process Outsourcing (BPO) enterprises from Uganda, Barbados, and Trinidad and Tobago at an excellent reception organised by London Chamber of Commerce and Industry  in collaboration with International Trade Centre, United Nations and Foreign, Commonwealth and Development Office  ",
            link: "https://www.linkedin.com/posts/tarunghulati_delighted-to-meet-the-delegates-of-high-growth-activity-7425133287460810753-D_if",
            image: "/1770289725480.jpg"
        }
        ,
        {
            title: "We were honoured to receive an exclusive invitation to the London Tech Week 2025 Afterglow hosted by the British High Commission in India on 11th August 2025.",
            description: "The event aimed to explore how the UK's  Department for Business and Trade can support businesses looking to expand into the UK, providing resources, guidance, and a deeper understanding of the UK business landscape. It was a highly productive and engaging gathering, bringing together select industry leaders to exchange ideas, explore collaboration opportunities, and discuss the future of emerging technologies.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1754977352947.jpg"
        }
        ,
        {
            title: "We are truly delighted that our Co-founder, Mr. Tarun Ghulati, had the honor of meeting the Hon’ble Chief Minister of Andhra Pradesh, Shri Nara Chandrababu Naidu Garu",
            description: "We extend our best wishes to both Mr. Ghulati and Shri CBN for continued success in their respective endeavors, driven by their shared passion and unwavering commitment to progress. We are confident that the state of Andhra Pradesh will continue to thrive and achieve remarkable growth under Shri CBN's visionary leadership.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7339292676548083712",
            image: "/1749823730651.jpg"
        }
        ,
        {
            title: "We would like to extend our heartfelt appreciation for the exceptional experience provided during London Tech Week 2025",
            description: "We are particularly grateful for the opportunity to participate in various fringe events, which contributed greatly to our objectives around business growth and expansion in the UK. The event schedule was both dynamic and thoughtfully curated—balancing productive daytime sessions with vibrant evening engagements that facilitated meaningful conversations and strategic networking.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1749822259250.jpg"
        }
        ,
        {
            title: "Grateful to reflect on 16 years at the London Chamber of Commerce and Industry-Asian Business Association.",
            description: "As the longest-serving Committee Member of the Asian Business Association (ABA) and a former Deputy Chairman, it has been a privilege to serve the Asian community and work alongside so many inspiring individuals across London and globally.",
            link: "https://www.linkedin.com/feed/update/urn:li:activity:7360908535439781889",
            image: "/1769680210860.jpg"
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
