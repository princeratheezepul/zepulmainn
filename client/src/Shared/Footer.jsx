import React from "react";
import { Link } from "react-router-dom";
import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import { FaPhoneVolume, FaHome } from "react-icons/fa";
import { MdAlternateEmail } from "react-icons/md";
import "../styles/Footer.css";

const Footer = () => {
  return (
    <footer className="bg-black text-white text-sm">

      <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-2 px-6 md:px-16 py-10 md:pt-4 md:pb-1 border-b border-white/20">
        <div className="md:w-1/3 relative">
          <div className="relative inline-block">
            <img src="/assets/image.png" alt="logo" className="mb-4 md:mb-0" />
            <span className="absolute top-0 right-0 text-sm font-semibold">
              ™
            </span>
          </div>
          <p className="opacity-50 mb-4 md:mb-0">
            Zepul™ is committed to removing inefficiencies from the recruitment
            process while maximizing the value of human expertise.
          </p>

          <div className="flex flex-col gap-2 md:gap-0">
            <div className="flex sm:gap-[3.1rem] gap-[7.5rem]">
              <img
                src="/assets/DPIIT.png"
                alt="DPIIT Logo"
                className="sm:w-[8rem] w-[5rem] h-auto object-contain"
              />
              <div className="lg:flex md:absolute  absolute left-[40%] md:left-[19vw] md:w-[13rem]  lg:left-[14vw] xl:left-[12vw] 2xl:left-[10vw] md:mb-[2rem]">
                <span
                  className=" text-[#6E6E6E] leading-snug block"
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.75rem", // ~text-sm
                  }}
                >
                  Recognized Startup
                  <br />
                  Certificate # DIPP123320
                </span>
              </div>
            </div>
            <div className="flex sm:gap-[2.4rem] gap-[0.4rem]">
              <div className="sm:w-[15rem] w-[10rem]">
                <h1
                  className="font-extrabold tracking-wide uppercase text-[0.25rem] sm:text-[1.2rem] leading-tight pt-[0.2rem]  "
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 900,
                    fontSize: "18px",
                    lineHeight: "100%",
                    letterSpacing: "0%",
                  }}
                >
                  MSME / UDYAM
                </h1>
              </div>
              <div className=" sm:pt-0 lg:flex absolute left-[40%] lg:left-[14vw] md:left-[19vw] md:w-[13rem] xl:left-[12vw] 2xl:left-[10vw]">
                <span
                  className=" text-[#6E6E6E] leading-snug block sm:pt-0 "
                  style={{
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.75rem", // ~text-sm
                  }}
                >
                  Recognized Company Certificate
                  <br /># UDYAM-TS-02-0210277
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-row gap-10 md:gap-6 md:w-1/2 md:mx-auto lg:mx-0 ">
          <div>
            <h5 className="uppercase opacity-50 mb-3 md:mb-1 ml-8 md:ml-1 text-sm">Company</h5>
            <ul className="space-y-2 md:space-y-1.5">
              <li>
                <Link
                  to="/terms"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Terms
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/support"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Support
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h5 className="uppercase opacity-50 mb-3 md:mb-1 ml-8 md:ml-1 text-sm">Quick Link</h5>
            <ul className="space-y-2 md:space-y-1.5">
              <li>
                <Link
                  to="/"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/ZepRecruit"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Zep Recruit
                </Link>
              </li>
              <li>
                <Link
                  to="/zepTalentHub"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Zep Talent Hub
                </Link>
              </li>
              <li>
                <Link
                  to="/prorecruitor"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Zep Pro Recruiter
                </Link>
              </li>
              <li>
                <Link
                  to="https://careers.zepul.com/"
                  className="hover:underline text-white text-sm md:text-sm"
                  style={{
                    color: "#024bff",
                    fontFamily: '"DM Sans", sans-serif',
                    fontWeight: 500,
                    fontSize: "14px",
                    lineHeight: 1.2,
                    letterSpacing: "-0.05em",
                    margin: 0,
                    padding: 0,
                    display: "block",
                    textDecoration: "none", // <-- this removes underline
                  }}
                >
                  Zep Jobs
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="md:w-1/3">
          <div className="flex gap-4 mb-4 md:mb-0">
            <a
              href="https://www.facebook.com/tryzepul?mibextid=ZbWKwL"
              target="_blank"
              rel="noreferrer"
            >
              <FaFacebook size={20} color="white" />
            </a>
            <a
              href="https://www.instagram.com/tryzepul/"
              target="_blank"
              rel="noreferrer"
            >
              <FaInstagram size={20} color="white" />
            </a>
            <a
              href="https://x.com/tryzepul?t=a7vaOJwbEV_EnDwn9tNiAg&s=08"
              target="_blank"
              rel="noreferrer"
            >
              <FaTwitter size={20} color="white" />
            </a>
          </div>

          {/* Addresses in horizontal flex row */}
          <div className="flex flex-col md:flex-row gap-4 md:gap-1 mb-4 md:mb-0 opacity-50">
            <div className="flex flex-col md:w-1/2">
              <div className="flex items-start gap-2 md:gap-1">
                <FaHome className="mt-1 flex-shrink-0 md:text-xs" />
                <span className="text-sm md:text-xs">
                  Product HQ
                  <br />
                  56 Weighton Road, Harrow,
                  <br />
                  London, United Kingdom
                </span>
              </div>
              <div className="flex items-center mt-2 md:mt-0 md:gap-1">
                <MdAlternateEmail className="mr-2 md:mr-1 md:text-xs" />
                <span className="text-sm md:text-xs">info@zepul.com</span>
              </div>
            </div>
            <div className="flex flex-col md:w-1/2">
              <div className="flex items-start gap-2 md:gap-1">
                <FaHome className="mt-1 flex-shrink-0 md:text-xs" />
                <span className="text-sm md:text-xs">
                  Services HQ
                  <br />
                  Floor 6, 610/B Sandhya Techno 1,
                  <br />
                  Khajaguda, Hyderabad, India
                </span>
              </div>
              <div className="flex items-center mt-2 md:mt-0 md:gap-1">
                <MdAlternateEmail className="mr-2 md:mr-1 md:text-xs" />
                <span className="text-sm md:text-xs">support@zepul.com</span>
              </div>
              <div className="flex items-center mt-2 md:mt-0 md:gap-1">
                <FaPhoneVolume className="mr-2 md:mr-1 md:text-xs" />
                <span className="text-sm md:text-xs">+91-77939 55555</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-2 px-6 md:px-16 py-6 md:pt-0.5 md:pb-0 border-b border-white/20">
        <div className="md:w-2/3">
          <h4 className="font-semibold mb-2 md:mb-0 text-sm">Attention</h4>
          <p className="opacity-50 leading-none text-xs">
            Zepul™ and its partners, authorized vendors, and subsidiaries do not
            charge any fees from job seekers for employment placements. If
            anyone claims otherwise, please report such violations immediately.
          </p>
        </div>
        <div className="flex flex-col space-y-2 md:space-y-0 md:items-start">
          <Link
            to="/report-violations"
            className="text-lg md:text-sm"
            style={{ textDecoration: "none" }}
          >
            Report Violations
          </Link>
          <a
            href="mailto:info@zepul.com"
            className="opacity-50 hover:underline text-white leading-none text-xs"
            style={{ textDecoration: "none" }}
          >
            info@zepul.com
          </a>
          <a
            href="mailto:legal@zepul.com"
            className="opacity-50 hover:underline text-white text-xs"
            style={{ textDecoration: "none" }}
          >
            legal@zepul.com
          </a>
        </div>
      </div>


    </footer>
  );
};

export default Footer;
