import React from 'react';
import { Link } from 'react-router-dom';
import useInView from './useInView';

const ZepProPricingCTA = () => {
    const [ref, inView] = useInView();

    return (
        <section className={`zppr-close zppr-rv${inView ? ' in' : ''}`} ref={ref}>
            <div>
                <h3>Not sure which plan fits?</h3>
                <p>We’ll map a plan to your hiring volume — or let Zepul run hiring for you with managed services.</p>
            </div>
            <div className="zppr-acts">
                <Link className="zppr-p" to="/contact">Book a demo</Link>
                <Link className="zppr-o" to="/zeprecruit">Explore managed services</Link>
            </div>
        </section>
    );
};

export default ZepProPricingCTA;
