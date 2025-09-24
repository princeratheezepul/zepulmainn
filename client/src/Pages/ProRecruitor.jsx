import React from 'react';
import { FaKey } from "react-icons/fa";


const ProRecruitor = () => {
  return (
    <div className="font-sans text-black">
      <section className="bg-white px-6 md:px-20 py-12">
        <p className="text-sm text-blue-700 font-medium mb-2">ZEP PRO RECRUITER</p>
        <h1 className="text-2xl md:text-5xl font-bold max-w-4xl mb-6">
          AI–Powered Comprehensive Recruitment Management Suite: Transforming Recruiters into Pro Recruiters
        </h1>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-36">
          <img src="/assets/prorecruit1.png" alt="Hero" className="w-full md:w-1/2 rounded-md" />
          <div className="md:w-1/2 space-y-4 text-gray-600 text-base">
            <p className='leading-relaxed text-sm'>
              Zep ProRecruiter is a recruiter-first SaaS platform that combines AI automation and human 
              expertise to transform the way agencies deliver hiring solutions. From resume screening to 
              generating interview questions, assisting in evaluations, and producing structured candidate 
              scorecards, it ensures every submission is AI powered, data-backed, transparent, and client-ready.
            </p>
            <p className='leading-relaxed text-sm'>
              With built-in dashboards, integrations, and marketplace connectivity, Zep  ProRecruiter not
              only helps agencies work smarter, close faster, and deliver consistent quality at scale—but
              also creates direct business opportunities for licensed partners through the Zepul
              Marketplace without worrying about verified business or complex agreements.
            </p>
            <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition">
              Try Zepul
            </button>
          </div>
        </div>
      </section>

      {/* <section className="px-6 md:px-20 py-16 bg-gray-50">
        <p className="text-sm text-blue-700 font-medium mb-2">ZEP PRO RECRUITER</p>
        <h1 className="text-2xl md:text-5xl font-bold max-w-3xl mb-10">
          Unlocking Efficiency: Optimizing Resources for Maximum Business Impact
        </h1>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex flex-col gap-6 lg:w-2/3">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1 border border-gray-300 rounded-xl p-4 bg-white">
                <img src="/assets/features1.png" alt="AI-Driven" className="mb-4 w-full h-40 object-contain" />
                <h2 className="text-lg font-semibold mb-2">AI-Driven Candidate Sourcing</h2>
                <p className="text-sm text-gray-600">
                  Intelligent algorithms scan internal & external databases and social networks to find the best talent. Automated candidate ranking based on skill match, experience, and cultural fit.
                </p>
              </div>

              <div className="flex-1 border border-gray-300 rounded-xl p-4 bg-white">
                <img src="/assets/features2.png" alt="Smart Resume" className="mb-4 w-full h-40 object-contain" />
                <h2 className="text-lg font-semibold mb-2">Smart Resume Parsing & Screening</h2>
                <p className="text-sm text-gray-600">
                  AI-powered parsing extracts key candidate information instantly. Our automated scoring system ranks candidates based on job requirements while allowing your recruiters to screen them at stage two to generate a comprehensive report card.
                </p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 border border-gray-300 rounded-xl bg-white p-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold mb-2">Advanced Candidate Engagement & Assessment</h2>
                <p className="text-sm text-gray-600">
                  Automated pre-screening questions filter out unqualified applicants, thus reducing the pre-screening process.
                </p>
              </div>
              <img src="/assets/features3.png" alt="Engagement" className="h-40 w-full md:w-1/2 object-contain" />
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-6">
            <div className="border border-gray-300 rounded-xl p-4 bg-white">
              <div className="flex flex-col xl:flex-row ">
              <h2 className="text-lg font-semibold mb-2">Intelligent Interview Scheduling</h2>
              <img src="/assets/features4.png" alt="Interview Scheduling" className="mb-4 w-full h-40 object-contain" />
              </div>
              <p className="text-sm text-gray-600">
                AI-driven scheduling syncs with recruiters' and candidates' calendars. Our automated reminders and rescheduling reduce no-shows. Virtual interview integrations with video conferencing tools.
              </p>
            </div>

            <div className="border border-gray-300 rounded-xl p-4 bg-white">
            <div className="flex flex-col xl:flex-row ">

             <h2 className="text-lg font-semibold mb-2">Predictive Analytics & Data-Driven Insights</h2>
             <img src="/assets/features5.png" alt="Analytics" className="mb-4 w-full h-40 object-contain" />
             </div>
              <p className="text-sm text-gray-600">
                AI analyzes historical hiring data to predict job success rates. Recruitment trend insights help optimize hiring strategies. Customizable dashboards track recruitment KPIs in real time.
              </p>
            </div>
          </div>
          </div>
      </section> */}

      {/* <section className="py-16 bg-white w-full">
      <div className="container mx-auto px-6">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">
            Our Work <span className="text-blue-600">Process</span>
          </h2>
        </div>

        Process Cards - Grid Layout
         <div className="grid grid-cols-5  gap-[10px]">
          Card 1
          <div className="group flex flex-col items-center text-center px-2 transition-transform">
            <div className="relative mb-8">
              <img
                src="/assets/features1.png"
                alt="Choose a Service"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <p className="font-semibold text-lg">Sign up as a licensed partner</p>
            <p className="text-gray-600 text-sm mt-2">Get access to the Zepul Marketplace with your manager credentials.</p>
          </div>

          Card 2
          <div className="group flex flex-col items-center text-center px-2 transition-transform">
            <div className="relative mb-8">
              <img
                src="/assets/features2.png"
                alt="Request a Meeting"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <p className="font-semibold text-lg">Browse live jobs</p>
            <p className="text-gray-600 text-sm mt-2">View and filter openings posted by Zepul across industries and locations.</p>
          </div>

          Card 3
          <div className="group flex flex-col items-center text-center px-2 transition-transform">
            <div className="relative mb-8">
              <img
                src="/assets/features3.png"
                alt="Receive Custom Plan"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <p className="font-semibold text-lg">Pick and assign jobs</p>
            <p className="text-gray-600 text-sm mt-2">Accept jobs and assign them to your internal recruiters to start sourcing.</p>
          </div>

          Card 4
          <div className="group flex flex-col items-center text-center px-2 transition-transform">
            <div className="relative mb-8">
              <img
                src="/assets/features4.png"
                alt="Let's Make it Happen"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <p className="font-semibold text-lg">Submit talent scorecards</p>
            <p className="text-gray-600 text-sm mt-2">Upload candidate profiles, AI + Human -assessed scorecards, and track their status.</p>
          </div>
           Card 5
          <div className="group flex flex-col items-center text-center px-2 transition-transform">
            <div className="relative mb-8">
              <img
                src="/assets/features5.png"
                alt="Let's Make it Happen"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <p className="font-semibold text-lg">Earn commissions on closures</p>
            <p className="text-gray-600 text-sm mt-2">Get paid directly when your candidates are hired.</p>
          </div>
        </div>
      </div>
    </section> */}
      <section className="bg-white px-6 md:px-20 py-12 w-full">
        <div className="text-center mb-12">
          <h1 className="text-2xl md:text-5xl font-bold">
            How It <span className="text-blue-600">Works</span>
          </h1>
        </div>

        {/* Responsive grid layout with arrows */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-10 relative">
          {/* Card 1 */}
          <div className="group flex flex-col items-center text-center px-2 transition-transform relative">
            <div className="relative mb-6">
              <img
                src="/assets/features1.png"
                alt="Sign up"
                className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600"
              />
            </div>
            <div className="hidden lg:block absolute right-[-40px] top-1/5 -translate-y-1/2 ">
              <img src="/assets/process-arrow.png" className="w-12 h-6 text-blue-600" alt="Process Arrow" />
            </div>
            <p className="font-semibold text-base md:text-lg mb-0">
              Become a Licensed Partner
            </p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">
              Join Zepul and unlock the Pro Recruiter SaaS suite — complete access to our exclusive job marketplace.
            </p>
          </div>

          {/* Card 2 */}
          <div className="group flex flex-col items-center text-center px-2 transition-transform relative">
            <div className="relative mb-6">
              <img src="/assets/features2.png" alt="Browse jobs" className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600" />
            </div>
            <div className="hidden lg:block absolute right-[-40px] top-1/5 -translate-y-1/2 ">
              <img src="/assets/process-arrow.png" className="w-12 h-6 text-blue-600" alt="Process Arrow" />
            </div>
            <p className="font-semibold text-base md:text-lg mb-0">Choose Your Path</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">Manage your own clients using Pro Recruiter, or Access verified jobs from the Zepul Marketplace.(You can do both, at no extra cost.)</p>
          </div>

          {/* Card 3 */}
          <div className="group flex flex-col items-center text-center px-2 transition-transform relative">
            <div className="relative mb-6">
              <img src="/assets/features3.png" alt="Assign jobs" className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600" />
            </div>
            <div className="hidden lg:block absolute right-[-40px] top-1/5 -translate-y-1/2 ">
              <img src="/assets/process-arrow.png" className="w-12 h-6 text-blue-600" alt="Process Arrow" />
            </div>
            <p className="font-semibold text-base md:text-lg mb-0"> Manage Jobs with Ease</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">Accept marketplace jobs or onboard your own, then assign them to your internal recruiters through the platform.</p>
          </div>

          {/* Card 4 */}
          <div className="group flex flex-col items-center text-center px-2 transition-transform relative">
            <div className="relative mb-6">
              <img src="/assets/features4.png" alt="Submit scorecards" className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600" />
            </div>
            <div className="hidden lg:block absolute right-[-40px] top-1/5 -translate-y-1/2 ">
              <img src="/assets/process-arrow.png" className="w-12 h-6 text-blue-600" alt="Process Arrow" />
            </div>
            <p className="font-semibold text-base md:text-lg mb-0">Submit AI-Powered Scorecards</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">Leverage Zep Pro Recruiter to create comprehensive talent scorecards (AI + human insights) and track real-time progress in inbuilt ATS.</p>
          </div>

          {/* Card 5 (No arrow after this one) */}
          <div className="group flex flex-col items-center text-center px-2 transition-transform relative">
            <div className="relative mb-6">
              <img src="/assets/features5.png" alt="Earn commissions" className="rounded-full shadow-md w-28 h-28 md:w-36 md:h-36 object-cover border-4 border-transparent transition-all duration-300 group-hover:scale-110 group-hover:border-blue-600" />
            </div>
            <p className="font-semibold text-base md:text-lg mb-0">Get Paid Your Way</p>
            <p className="text-gray-600 text-sm mt-2 leading-relaxed">Earn commissions on Marketplace hires, orContinue invoicing your own clients.</p>
          </div>
        </div>
      </section>





      <section className="px-6 md:px-20 py-16 bg-white flex flex-col lg:flex-row gap-10">
        <div className="flex-1">
          <p className="text-sm text-blue-700 font-medium mb-2">Why Recruitment Agencies choose Zep ProRecruiter ?</p>
          <h1 className="flex text-2xl md:text-5xl font-bold max-w-3xl mb-6">
            <FaKey /> &nbsp; Key Benefits
          </h1>
          <p className="text-gray-600 max-w-xl mb-10">
            Automated tedious tasks, allowing recruiters to focus on high-value interactions.
          </p>
          <ul className="space-y-2 text-gray-800">
            {[
              // { icon: "benefits1.png", title: "Faster Hiring", desc: "Automates tedious tasks, allowing recruiters to focus on high-value interactions." },
              // { icon: "benefits2.png", title: "Better Talent Matches", desc: "AI-driven insights ensure the right candidates are shortlisted." },
              // { icon: "benefits3.png", title: "Enhanced Candidate Experience", desc: "Personalized communication and efficient scheduling." },
              // { icon: "benefits4.png", title: "Data-Backed Decisions", desc: "Minimize hiring biases and make recruitment truly strategic." },
              // { icon: "benefits5.png", title: "Scalability", desc: "Adaptable to businesses of all sizes, from startups to enterprise." }
              { icon: "benefits1.png", title: "Ready-to-work jobs", desc: "No business development hassle, just pick jobs already brought in by Zepul." },
              { icon: "benefits2.png", title: "AI-powered tools", desc: "Access AI screening, scoring, and candidate scorecards to speed up hiring cycles." },
              { icon: "benefits3.png", title: "Smart dashboards", desc: "Track your team’s performance, job progress, candidate pipeline, and earnings in real time." },
              { icon: "benefits4.png", title: "Transparent commissions", desc: "Clear payouts on every successful hire, tracked through your wallet." },
              { icon: "benefits5.png", title: "Scalable opportunity ", desc: "Work on multiple jobs across industries and locations simultaneously." },
              { icon: "benefits3.png", title: "Partner-first model ", desc: "Designed to maximize recruiter earnings while minimizing overhead." }
            ].map(({ icon, title, desc }, idx) => (
              <li key={idx} className="flex items-start space-x-4">
                <img src={`/assets/${icon}`} className="h-5 w-5 mt-1" alt={title} />
                <div>
                  <h5 className="font-medium">{title}</h5>
                  <p className="text-sm text-gray-600">{desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <img src="/assets/prorecruit2.png" alt="Benefits" className="w-full lg:w-[40%] object-contain" />
      </section>

      <section className="px-6 md:px-20 py-16 bg-gray-50 flex flex-col-reverse lg:flex-row items-center justify-between gap-10">
        <div className="flex-1">
          <p className="text-sm text-blue-700 font-medium mb-2">WHY BUSINESSES CHOOSE US</p>
          <h1 className="text-2xl md:text-3xl font-semibold max-w-3xl mb-6">
            Unlocking Efficiency: <br /> Optimizing Resources for <br /> Maximum Business Impact
          </h1>
          <p className="text-gray-700">
            With our AI-Powered Comprehensive Recruitment <br />
            Management Suite, recruiters evolve from traditional <br />
            hiring professionals to <span className="text-blue-700 font-medium">Pro Recruiters.</span>
          </p>
        </div>
        <img src="/assets/prorecruit3.png" alt="Final Visual" className="flex-1 max-w-full object-contain w-80  h-80" />
      </section>

     
    </div>
  );
};

export default ProRecruitor;