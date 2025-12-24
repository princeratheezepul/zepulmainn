import React, { Fragment } from 'react'
import FeatureCards from '../Components/TalentHub/FeatureCards'
import { TalentHubHeroSection } from '../Components/TalentHub/TalentHubHeroSection'
import { TalentHubTicker } from '../Components/TalentHub/TalentHubTicker'
import WhyChooseProRecruiter from '../Components/TalentHub/WhyChooseProRecruiter'
import HowItWorks from '../Components/Shared/HowItWorks'
import HiringModelContact from '../Components/HiringModelContact'
import WhyChooseSection from '../Components/TalentHub/WhyChooseSection'
import CtaBanner from '../Components/TalentHub/CtaBanner'

function ProRecruitor() {
    const howItWorksSteps = [
        { id: 1, title: "Create Or Receive Job Assignments", image: "/assets/talenthub/step1.jpg" },
        { id: 2, title: "Assign Recruiters & Manage Workload", image: "/assets/talenthub/step2.jpg" },
        { id: 3, title: "AI CV Strength Screening", image: "/assets/talenthub/step3.jpg" },
        { id: 4, title: "Technical And Skill Validation", image: "/assets/talenthub/step4.jpg" },
        { id: 5, title: "AI-Supported Interview Intelligence", image: "/assets/talenthub/step5.jpg" },
        { id: 6, title: "Submit Standardized Candidate Scorecards", image: "/assets/talenthub/step1.jpg" },
    ];

    return (
        <Fragment>
            <TalentHubHeroSection />
            <TalentHubTicker />
            <FeatureCards />
            <WhyChooseProRecruiter />
            <HowItWorks
                title="How ProRecruiter Works"
                subtitle="Only validated, decision-ready candidates are shared with clients."
                steps={howItWorksSteps}
            />
            <HiringModelContact />
            {/* <WhyChooseSection />
      <CtaBanner /> */}
        </Fragment>
    )
}

export default ProRecruitor
