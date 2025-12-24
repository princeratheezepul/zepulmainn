import { useNavigate, useLocation } from "react-router-dom"
import { Instagram, Twitter } from "lucide-react"

const Footer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isZepRecruit = location.pathname.toLowerCase().includes('zeprecruit');
  const isTalentHub = location.pathname.toLowerCase().includes('zeptalenthub');
  const isAbout = location.pathname.toLowerCase().includes('about');
  const isZepJobs = location.pathname.toLowerCase().includes('zep-jobs');
  const shouldOverlap = isZepRecruit || isTalentHub || isAbout || isZepJobs;

  return (
    <footer className={`bg-[#1a1a1a] text-white rounded-t-[40px] ${shouldOverlap ? '-mt-10' : 'mt-12'}`}>
      {/* Main Footer Content */}
      <div className="w-full pl-4 md:pl-10 pr-0 pt-10 pb-2">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-4">
          {/* Left Column - Logo and Disclaimer */}
          <div className="lg:col-span-4">
            <div className="mb-2">
              <img
                src="/assets/zepul_footer_logo.png"
                alt="Zepul™"
                className="h-8 w-auto"
              />
            </div>
            <div className="text-sm text-gray-400">
              Zepul™ and its partners, authorized vendors, and subsidiaries do not charge any fees from job seekers for
              employment placements. If anyone claims otherwise, please report such violations immediately.
            </div>
          </div>

          {/* Middle Columns - Navigation */}
          <div className="lg:col-span-5 lg:pl-96 grid grid-cols-2 gap-4 lg:gap-4">
            {/* Quick Links Column */}
            <div>
              <h3 className="text-sm font-semibold mb-1.5">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <div
                    onClick={() => navigate("/zep-recruit")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Zep Recruit
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/zep-pro-recruiter")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Zep Pro Recruiter
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/zep-jobs")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Zep Jobs
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/zep-talent-hub")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Zep Talent Hub
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/about")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    About
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/contact")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Contact
                  </div>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold mb-1.5">Company</h3>
              <ul className="space-y-1">
                <li>
                  <div
                    onClick={() => navigate("/terms")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Terms & Conditions
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/privacy")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Privacy Policy
                  </div>
                </li>
                <li>
                  <div
                    onClick={() => navigate("/blog")}
                    className="text-sm text-white hover:text-gray-300 transition-colors cursor-pointer"
                  >
                    Blog
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="lg:col-span-3">
            <div className="space-y-2">
              {/* Email */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                <div className="text-sm">
                  support@zepul.com
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.243-4.244a1 1 0 01.684-.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                <div className="text-sm">
                  +91-77939 55555
                </div>
              </div>

              {/* Product HQ */}
              <div className="flex gap-2">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="text-sm text-gray-300">
                  <div className="font-semibold text-white">Product HQ</div>
                  <div>56 Weighton Road, Harrow,</div>
                  <div>London, United Kingdom</div>
                </div>
              </div>

              {/* Services HQ */}
              <div className="flex gap-2">
                <svg
                  className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <div className="text-sm text-gray-300">
                  <div className="font-semibold text-white">Services HQ</div>
                  <div>Floor 6, 610/B Sandhya Techno 1,</div>
                  <div>Khajaguda, Hyderabad, India</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Social & Certifications */}
      <div className="border-t border-white/10">
        <div className="w-full pl-4 md:pl-10 pr-0 py-2">
          <div className="flex flex-col lg:flex-row justify-start items-start lg:items-center gap-2 lg:gap-4">
            {/* Left - Social & Report */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              {/* Social Icons */}
              <div className="flex items-center gap-4">
                <a
                  href="https://www.instagram.com/zepul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="https://twitter.com/zepul"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>

              {/* Report Violations */}
              <div className="border-l border-white/10 pl-6 hidden sm:block">
                <div className="text-sm font-semibold mb-1">Report Violations</div>
                <div className="text-sm text-gray-400">
                  info@zepul.com
                </div>
                <div className="text-sm text-gray-400">
                  legal@zepul.com
                </div>
              </div>
            </div>

            {/* Vertical Separator */}
            <div className="hidden lg:block h-12 w-px bg-white/10 mx-4"></div>

            {/* Right - Certifications */}
            <div className="flex flex-wrap items-center gap-4">
              {/* MSME/UDYAM */}
              <div className="flex flex-col gap-1">
                <div className="text-base font-bold tracking-wide">MSME / UDYAM</div>
                <div className="text-xs text-gray-400">Recognized Company Certificate</div>
                <div className="text-xs text-gray-400"># UDYAM-TS-02-0210277</div>
              </div>

              {/* DPIIT */}
              <div className="flex flex-col gap-1">
                <img
                  src="/assets/DPIIT.png"
                  alt="#startupindia"
                  className="h-12 w-auto object-contain"
                />
                <div className="text-xs text-gray-400">Recognized Startup</div>
                <div className="text-xs text-gray-400">Certificate # DIPP123320</div>
              </div>

              {/* London Chamber */}
              <div>
                <img
                  src="/assets/london_chamber.png"
                  alt="Proud to be a Member of London Chamber of Commerce and Industry"
                  className="h-14 w-auto object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer;
