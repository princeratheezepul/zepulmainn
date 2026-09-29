import React from 'react';
import EcosystemDiagram from './EcosystemDiagram';

const HomeHero = () => (
    <section className="hero" aria-labelledby="z1-heroTitle">
        <div>
            <h1 id="z1-heroTitle">
                <span className="ln"><span>The <span className="b">Future Of</span></span></span>
                <span className="ln"><span><span className="b">Recruitment</span> Is Here.</span></span>
            </h1>
            <p className="intro">
                AI-powered Talent Acquisition Operating System that connects Employers, Job Seekers,
                and Recruitment Partners through a unified autonomous Agentic AI ecosystem.
            </p>
        </div>
        <EcosystemDiagram />
    </section>
);

export default HomeHero;
