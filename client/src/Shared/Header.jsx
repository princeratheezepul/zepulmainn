import React, { Fragment } from "react";
import "../styles/Header.css";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaBars } from "react-icons/fa6";
const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const handleTryZepulClick = () => {
    navigate("/login");
  };

  return (
    <Fragment>
      <div className="container-fluid d-flex justify-content-between py-3">
        <div className="container">
          <div className="d-flex justify-md-content-center  align-items-center justify-content-sm-between header col-md-12 col-sm-12 w-100">
            <div className=" logo">
              <Link to="/">
                <img src="/assets/logo.png" alt="logo" />
              </Link>
            </div>


            <div className=" d-flex justify-content-end btn-grp align-items-center ">

              {/* <button className="sign-in-button btnn">sign In</button> */}
              <div className="attr-nav">
                <div className="dropdown">
                  <button
                    className="btn btn-secondary w-[8rem]"
                    type="button"
                    id="loginDropdown"
                    style={{ backgroundColor: "black", color: "white", borderRadius: "0" }}
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
