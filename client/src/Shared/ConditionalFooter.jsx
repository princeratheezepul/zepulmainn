import React from "react";
import { useLocation } from "react-router-dom";
import Footer from "./Footer";

// Routes that should NOT display the marketing footer.
// Login/auth pages are self-contained screens and shouldn't show the footer.
const HIDE_FOOTER_PATHS = [
  "/login",
  "/admin/login",
  "/candidate/login",
  "/marketplace/login",
];

const ConditionalFooter = () => {
  const { pathname } = useLocation();

  // Hide on any explicit path above, or any nested "*/login" route.
  const hideFooter =
    HIDE_FOOTER_PATHS.includes(pathname) || pathname.endsWith("/login");

  if (hideFooter) return null;

  return <Footer />;
};

export default ConditionalFooter;
