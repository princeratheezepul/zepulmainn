import React, { Fragment } from "react";

import Router from "../Routes/Router";

const Layout = () => {
  return (
    <Fragment>
      <div className="wrapper d-flex flex-column justify-content-between h-full overflow-hidden" >
        {/* <TopScroller /> */}
        {/* Footer is rendered inside Router (within its Suspense boundary) so it
            appears together with the page content instead of before it. */}
        <Router />
      </div>
    </Fragment>
  );
};

export default Layout;
