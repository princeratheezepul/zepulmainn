import React from 'react';

const ITEMS = [
    'Autonomous AI hiring',
    'AI sourcing',
    'Candidate interest verification',
    'CV matching',
    'AI coding assessments',
    'AI interviews',
    'Decision-ready scorecards',
    'Zeus · AI hiring agent',
    'Thea · AI career partner',
    '800M+ global talent profiles',
    'Global recruitment partners',
    'Human-in-the-loop decisions',
];

/** The list is rendered twice so the marquee can loop seamlessly at -50%. */
const HomeTicker = () => (
    <div className="strip" aria-label="What Zepul does">
        <div className="track">
            <ul>
                {ITEMS.map(item => <li key={item}>{item}</li>)}
            </ul>
            <ul aria-hidden="true">
                {ITEMS.map(item => <li key={item}>{item}</li>)}
            </ul>
        </div>
    </div>
);

export default HomeTicker;
