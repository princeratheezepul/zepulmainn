import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const CheckIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const ArrowIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
        <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
);

const proFeatures = [
    "100% Automated workflow",
    "Conversational AI agent for JD and Job Creation",
    "Job board integration — AI Sourcing",
    "CV Strength — Read, Rank, Match",
    "Customised Dynamic Coding Test",
    "Automated Decision Ready Scorecard",
    "Intelligent Performance Dashboards",
    "24×7 Chat Support",
];

const recruitFeatures = [
    "Conversational AI agent for JD and Job Creation",
    "Multiple engagement model support — DH, C2H, C, RaaS",
    "Lowest TAT & Highest Quality vs. agencies",
    "Balanced Cost & Commitment",
    "Dedicated Account Manager",
    "24/7 Priority Support + CSM",
    "Comprehensive Decision-Ready Report Cards",
    "End-to-End lifecycle: Requisition → Onboarding",
    "Scale recruiting capacity instantly, up or down",
];

export default function ProPricingSelector() {
    const navigate = useNavigate();
    const [billing, setBilling] = useState("monthly");

    const price = billing === "annual" ? "160" : "200";

    return (
        <div className="min-h-screen bg-[#F6F8FF] flex flex-col items-center justify-start py-16 px-4">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-1.5 rounded-full mb-6 tracking-wide">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse inline-block"></span>
                FOR EMPLOYERS
            </div>

            {/* Heading */}
            <h1
                className="text-4xl md:text-5xl font-extrabold text-gray-900 text-center leading-tight mb-4"
                style={{ fontFamily: "'Lora', serif" }}
            >
                AI hiring, your way—<br />
                <span className="text-blue-600">choose your model,</span><br />
                choose your price
            </h1>
            <p className="text-gray-500 text-center text-base max-w-xl mb-10">
                Your first job is live. Now pick the plan that powers your full hiring motion.
                No setup fees, no long-term lock-in.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-full p-1 shadow-sm mb-12">
                <button
                    onClick={() => setBilling("monthly")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${billing === "monthly" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
                >
                    Monthly
                </button>
                <button
                    onClick={() => setBilling("annual")}
                    className={`px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 ${billing === "annual" ? "bg-blue-600 text-white shadow" : "text-gray-500 hover:text-gray-800"}`}
                >
                    Annual <span className={`text-xs font-bold ${billing === "annual" ? "text-blue-200" : "text-green-600"}`}>Save 20%</span>
                </button>
            </div>

            {/* Cards */}
            <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8">

                {/* Zep Pro Recruiter */}
                <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-8 flex flex-col relative overflow-hidden">
                    {/* Subtle top gradient bar */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-t-3xl"></div>

                    <div className="inline-flex items-center bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full mb-4 self-start tracking-widest">
                        PRODUCT
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Zep Pro Recruiter</h2>
                    <p className="text-gray-500 text-sm mb-6">
                        For high-growth orgs running full-cycle recruitment with AI at the core.
                    </p>

                    <div className="flex items-end gap-1 mb-1">
                        <span className="text-2xl font-bold text-gray-600">$</span>
                        <span className="text-6xl font-extrabold text-gray-900 leading-none">{price}</span>
                        <span className="text-gray-400 text-sm mb-2">/mo/user</span>
                    </div>
                    <p className="text-gray-400 text-xs mb-8">
                        {billing === "annual" ? "Billed Annually (20% off)" : "Billed Monthly"}
                    </p>

                    <div className="space-y-3 flex-1 mb-8">
                        {proFeatures.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-gray-700">
                                <span className="mt-0.5 text-blue-500 flex-shrink-0"><CheckIcon /></span>
                                {f}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => navigate("/prorecruiter/dashboard")}
                        className="w-full py-3.5 rounded-xl border-2 border-blue-600 text-blue-600 font-semibold hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 group"
                    >
                        Get Started <span className="group-hover:translate-x-1 transition-transform"><ArrowIcon /></span>
                    </button>
                </div>

                {/* Zep Recruit */}
                <div className="bg-gradient-to-br from-[#0A0F2C] to-[#1a2060] rounded-3xl border border-white/10 shadow-xl p-8 flex flex-col relative overflow-hidden">
                    {/* Stars / glow accent */}
                    <div className="absolute -top-16 -right-16 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>

                    <div className="inline-flex items-center bg-white/10 text-blue-300 text-xs font-bold px-3 py-1 rounded-full mb-4 self-start tracking-widest border border-white/5">
                        SERVICES
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Zep Recruit</h2>
                    <p className="text-blue-200 text-sm mb-6">
                        Custom Fullstack AI Hiring services for companies of every size.
                    </p>

                    <div className="flex items-end gap-1 mb-1">
                        <span className="text-5xl font-extrabold text-white leading-none">Custom</span>
                    </div>
                    <p className="text-blue-300 text-xs mb-8">
                        Tailored to your organisation size & needs.
                        100% AI-powered hiring, outsmarting traditional agencies.
                    </p>

                    <div className="space-y-3 flex-1 mb-8">
                        {recruitFeatures.map((f, i) => (
                            <div key={i} className="flex items-start gap-3 text-sm text-blue-100">
                                <span className="mt-0.5 text-blue-400 flex-shrink-0"><CheckIcon /></span>
                                {f}
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={() => window.open("mailto:sales@zepul.com", "_blank")}
                        className="w-full py-3.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-semibold transition-all flex items-center justify-center gap-2 group shadow-lg shadow-blue-900/40"
                    >
                        Talk to Sales <span className="group-hover:translate-x-1 transition-transform"><ArrowIcon /></span>
                    </button>
                </div>
            </div>

            {/* Skip */}
            <button
                onClick={() => navigate("/prorecruiter/dashboard")}
                className="mt-10 text-sm text-gray-400 hover:text-gray-600 underline underline-offset-2 transition-colors"
            >
                Skip for now, take me to the dashboard →
            </button>
        </div>
    );
}
