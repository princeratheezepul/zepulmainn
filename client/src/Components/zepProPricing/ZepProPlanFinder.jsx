import React from 'react';
import { PLANS, QUESTIONS, planNote, recommendedPlan } from './pricingData';
import useInView from './useInView';

/**
 * The two-question finder. Answers live in the page so the plan matrix below
 * can highlight the match; this component only reports changes upward.
 */
const ZepProPlanFinder = ({ answers, onAnswer, onReset }) => {
    const [ref, inView] = useInView();
    const answered = answers.src !== undefined && answers.int !== undefined;
    const noneAnswered = answers.src === undefined && answers.int === undefined;

    let name = 'Answer 2 questions';
    let note = 'We’ll highlight the plan that fits below.';

    if (answered) {
        const key = recommendedPlan(answers);
        const plan = PLANS.find((p) => p.key === key);
        name = `${plan.name} · ${plan.price}/mo`;
        note = planNote(key, answers);
    } else if (!noneAnswered) {
        name = 'One more question';
    }

    return (
        <section className={`zppr-ask zppr-rv${inView ? ' in' : ''}`} ref={ref} aria-label="Find your plan">
            {QUESTIONS.map((q, i) => (
                <div className={`zppr-q${answers[q.key] !== undefined ? ' done' : ''}`} key={q.key}>
                    <p>
                        <span className="zppr-num">{i + 1}</span>
                        {q.title}
                        <small>{q.hint}</small>
                    </p>
                    <div className="zppr-seg">
                        {q.options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                aria-pressed={answers[q.key] === opt.value}
                                onClick={() => onAnswer(q.key, opt.value)}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            ))}

            <div className={`zppr-out${answered ? ' go' : ''}`} aria-live="polite">
                <span className="zppr-out-l">Your plan</span>
                <b className="zppr-out-name">{name}</b>
                <span className="zppr-out-txt">{note}</span>
                <button className="zppr-reset" type="button" onClick={onReset}>Start over</button>
            </div>
        </section>
    );
};

export default ZepProPlanFinder;
