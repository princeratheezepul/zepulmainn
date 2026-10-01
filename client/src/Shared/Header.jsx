import React, { Fragment, useEffect, useRef, useState } from "react";
import "../styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);
  const [height, setHeight] = useState(null);

  // The header is pinned, so it no longer takes up space in the flow — the
  // spacer below stands in for it. Its height is measured rather than
  // hardcoded because the logo and button reflow on narrow screens, which
  // makes the header taller there.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const measure = () => setHeight(el.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleTryZepulClick = () => {
    navigate("/login");
  };

  return (
    <Fragment>
      <div
        ref={headerRef}
        className="site-header container-fluid d-flex justify-content-between py-3"
        style={{
          backgroundColor: location.pathname === "/about" ? "black" : "#ffffff",
          transition: "background-color 0.3s ease"
        }}
      >
        <div className="container">
          <div className="d-flex justify-md-content-center  align-items-center justify-content-sm-between header col-md-12 col-sm-12 w-100">
            <div className=" logo">
              <Link to="/">
                <img
                  src="/assets/logo.png"
                  alt="logo"
                  style={{
                    filter: location.pathname === "/about" ? "brightness(0) invert(1)" : "none",
                    transition: "filter 0.3s ease"
                  }}
                />
              </Link>
            </div>


            <div className=" d-flex justify-content-end btn-grp align-items-center ">

              {/* <button className="sign-in-button btnn">sign In</button> */}
              <div className="attr-nav">
                <div className="dropdown">
                  <button
                    className="btn"
                    type="button"
                    id="loginDropdown"
                    style={{
                      backgroundColor: "black",
                      color: "white",
                      borderRadius: "6px",
                      border: "none",
                      padding: "0.55rem 1.4rem",
                      fontFamily: "'DM Sans', system-ui, sans-serif",
                      fontWeight: 500,
                      fontSize: "0.95rem",
                      letterSpacing: "0.01em",
                      whiteSpace: "nowrap",
                    }}
                    onClick={handleTryZepulClick}
                  >
                    Book a Demo →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="site-header-spacer" style={height ? { height } : undefined} />
    </Fragment>
  );
};

export default Header;
