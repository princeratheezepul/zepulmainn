import { Link } from "react-router-dom"
import { Instagram, Twitter } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white">
      {/* Main Footer Content */}
      <div className="container mx-auto px-6 lg:px-16 py-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-6">
          {/* Left Column - Logo and Disclaimer */}
          <div className="lg:col-span-4">
            <div className="mb-2">
              <svg className="h-8 w-auto" viewBox="0 0 165 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M0 8L18 24L0 40V8Z" fill="white" />
                <path d="M24 8H8L26 24L8 40H24L42 24L24 8Z" fill="white" />
                <path d="M82 12H96V16H87V21H95V25H87V30H96V34H82V12Z" fill="white" />
                <path d="M102 12H116V16H106V21H115V25H106V34H102V12Z" fill="white" />
                <path d="M122 12H136V16H126V21H135V25H126V30H136V34H122V12Z" fill="white" />
                <path d="M142 12H156V16H146V21H155V25H146V30H156V34H142V12Z" fill="white" />
                <path d="M162 12H165V34H162V12Z" fill="white" />
                <text x="52" y="28" fontFamily="Arial, sans-serif" fontSize="20" fontWeight="bold" fill="white">
                  ZEPUL
                </text>
              </svg>
              <span className="text-xs align-super">™</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Zepul™ and its partners, authorized vendors, and subsidiaries do not charge any fees from job seekers for
              employment placements. If anyone claims otherwise, please report such violations immediately.
            </p>
          </div>

          {/* Middle Columns - Navigation */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-8 lg:gap-6">
            {/* Quick Links Column */}
            <div>
              <h3 className="text-sm font-semibold mb-1.5">Quick Links</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/zep-recruit" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Zep Recruit
                  </Link>
                </li>
                <li>
                  <Link to="/zep-pro-recruiter" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Zep Pro Recruiter
                  </Link>
                </li>
                <li>
                  <Link to="/zep-jobs" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Zep Jobs
                  </Link>
                </li>
                <li>
                  <Link to="/zep-talent-hub" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Zep Talent Hub
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-sm text-white hover:text-gray-300 transition-colors">
                    About
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>

            {/* Company Column */}
            <div>
              <h3 className="text-sm font-semibold mb-1.5">Company</h3>
              <ul className="space-y-1">
                <li>
                  <Link to="/terms" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-sm text-white hover:text-gray-300 transition-colors">
                    Blog
                  </Link>
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
                <a href="mailto:support@zepul.com" className="text-sm hover:text-blue-500 transition-colors">
                  support@zepul.com
                </a>
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
                <a href="tel:+917793955555" className="text-sm hover:text-blue-500 transition-colors">
                  +91-77939 55555
                </a>
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
                  <p className="font-semibold text-white">Product HQ</p>
                  <p>56 Weighton Road, Harrow,</p>
                  <p>London, United Kingdom</p>
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
                  <p className="font-semibold text-white">Services HQ</p>
                  <p>Floor 6, 610/B Sandhya Techno 1,</p>
                  <p>Khajaguda, Hyderabad, India</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section - Social & Certifications */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-6 lg:px-16 py-3">
          <div className="flex flex-col lg:flex-row justify-start items-start lg:items-center gap-4 lg:gap-6">
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
                <p className="text-sm font-semibold mb-1">Report Violations</p>
                <a href="mailto:info@zepul.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  info@zepul.com
                </a>
                <br />
                <a href="mailto:legal@zepul.com" className="text-sm text-gray-400 hover:text-white transition-colors">
                  legal@zepul.com
                </a>
              </div>
            </div>

            {/* Right - Certifications */}
            <div className="flex flex-wrap items-center gap-4">
              {/* MSME/UDYAM */}
              <div className="flex flex-col gap-1">
                <p className="text-base font-bold tracking-wide">MSME / UDYAM</p>
                <p className="text-xs text-gray-400">Recognized Company Certificate</p>
                <p className="text-xs text-gray-400"># UDYAM-TS-02-0210277</p>
              </div>

              {/* DPIIT */}
              <div className="flex items-center gap-3">
                <div className="text-center">
                  <div className="text-xl font-bold text-orange-500">#startupindia</div>
                  <p className="text-xs text-gray-400 mt-1">Recognized Startup</p>
                  <p className="text-xs text-gray-400">Certificate # DIPP123320</p>
                </div>
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
