import React from 'react';
import { INCLUDED } from './pricingData';
import useInView from './useInView';

const ZepProIncluded = () => {
    const [ref, inView] = useInView();

    return (
        <section className={`zppr-every zppr-rv${inView ? ' in' : ''}`} ref={ref}>
            <h3>
                Included in every plan
                <small>Credits and minutes are pooled across your active hiring requirements.</small>
            </h3>
            <ul>
                {INCLUDED.map((item) => <li key={item}>{item}</li>)}
            </ul>
        </section>
    );
};

export default ZepProIncluded;
