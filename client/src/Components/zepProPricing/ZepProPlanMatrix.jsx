import React from 'react';
import { PLANS, STAGES, railCaps } from './pricingData';
import useInView from './useInView';

/**
 * Plans laid out over the hiring pipeline. Each covered stage draws a rail
 * segment on reveal (`--r` row / `--i` column stagger), and once both finder
 * questions are answered the matching row is pulled forward.
 */
const ZepProPlanMatrix = ({ answers, picked }) => {
    const [ref, inView] = useInView();

    return (
        <section
            className={`zppr-mx zppr-rv${inView ? ' in' : ''}${picked ? ' picked' : ''}`}
            ref={ref}
            aria-label="Plans by pipeline coverage"
        >
            <div className="zppr-hd">
                <span />
                {STAGES.map((stage) => {
                    const state = stage.q && answers[stage.q] !== undefined
                        ? (answers[stage.q] ? 'want' : 'skip')
                        : '';
                    return <span className={state} key={stage.label}>{stage.label}</span>;
                })}
                <span />
            </div>

            {PLANS.map((plan, r) => {
                const caps = railCaps(plan.cells);
                const isPick = picked === plan.key;
                return (
                    <div
                        className={`zppr-row${plan.featured ? ' feat' : ''}${isPick ? ' pick' : ''}`}
                        key={plan.key}
                    >
                        <div className="zppr-pn">
                            <span className="zppr-rec">Recommended for you</span>
                            <h3>{plan.name}{plan.flag && <span className="zppr-flag">{plan.flag}</span>}</h3>
                            <p>{plan.blurb}</p>
                            <span className="zppr-req">{plan.req}</span>
                        </div>

                        {plan.cells.map((value, i) => (
                            <div
                                className={`zppr-cell ${value ? `on${caps[i]}` : 'off'}`}
                                style={{ '--i': i, '--r': r }}
                                key={STAGES[i].label}
                            >
                                <b>{value || '—'}<em>{STAGES[i].label}</em></b>
                            </div>
                        ))}

                        <div className="zppr-pr">
                            <b>{plan.price}</b>
                            <small>{plan.per}</small>
                            <br />
                            <a className="zppr-btn" href="/login">Start →</a>
                        </div>
                    </div>
                );
            })}
        </section>
    );
};

export default ZepProPlanMatrix;
