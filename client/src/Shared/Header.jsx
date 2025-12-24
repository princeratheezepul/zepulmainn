import React, { Fragment } from "react";
import "../styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTryZepulClick = () => {
    const pathname = location.pathname;

    // If route is /, /ZepRecruit or /zepTalentHub, redirect to /login
    if (pathname === "/" || pathname === "/ZepRecruit" || pathname === "/zepTalentHub") {
      navigate("/login", { replace: true });
    } else {
      // For all other routes, redirect to /marketplace/login
      navigate("/marketplace/login", { replace: true });
    }
  };

  return (
    <Fragment>
      <div className="container-fluid d-flex justify-content-between">
        <div className="container">
          <div className="d-flex justify-content-between align-items-center header col-md-12 col-sm-12 w-100 py-3">
            <div className="logo">
              <Link to="/">
                <img src="/assets/logo.png" alt="logo" />
              </Link>
            </div>

            <div className="d-flex justify-content-end btn-grp align-items-center">
              <div className="attr-nav">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary"
                    type="button"
                    id="loginDropdown"
                    style={{
                      backgroundColor: "#000000",
                      color: "#FFFFFF",
                      border: "none",
                      padding: "8px 24px",
                      borderRadius: "4px"
                    }}
                    onClick={handleTryZepulClick}
                  >
                    Sign In
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Fragment>
  );
};

export default Header;
