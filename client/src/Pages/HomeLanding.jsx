import React from 'react';
import '../styles/HomeLanding.css';

import HomeNav from '../Components/home/HomeNav';
import HomeHero from '../Components/home/HomeHero';
import HomeStats from '../Components/home/HomeStats';
import HomeTicker from '../Components/home/HomeTicker';
import HomeCoreProblem from '../Components/home/HomeCoreProblem';
import HomeFallShort from '../Components/home/HomeFallShort';
import HomeSolution from '../Components/home/HomeSolution';
import HomeAgents from '../Components/home/HomeAgents';
import HomeBusiness from '../Components/home/HomeBusiness';

/**
 * Zepul home page ("/").
 *
 * Each section keeps its own `.zs<n>` namespace — that is how the stylesheet is
 * scoped, so the wrappers are load-bearing, not decoration. Section styles live
 * in styles/HomeLanding.css; the animation logic lives with each component.
 */
const HomeLanding = () => (
    <div className="zs-root">
        <div className="zs zs1">
            <HomeNav />
            <HomeHero />
            <HomeStats />
            <HomeTicker />
        </div>

        <div className="zs zs2"><HomeCoreProblem /></div>
        <div className="zs zs3"><HomeFallShort /></div>
        <div className="zs zs4"><HomeSolution /></div>
        <div className="zs zs5"><HomeAgents /></div>
        <div className="zs zs6"><HomeBusiness /></div>
    </div>
);

export default HomeLanding;
