import React, { Fragment } from "react";

import Router from "../Routes/Router";
import Footer from "../Shared/Footer";

const Layout = () => {
  return (
    <Fragment>
      <div className="wrapper d-flex flex-column justify-content-between h-full overflow-hidden" >
        {/* <TopScroller /> */}
        <Router />
        <Footer />
      </div>
    </Fragment>
  );
};

export default Layout;
