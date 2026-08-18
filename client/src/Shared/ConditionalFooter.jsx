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

// Route trees that should NOT display the marketing footer. These are internal
// dashboard/workspace areas — the footer is marketing chrome and doesn't belong
// there. Matches the prefix itself and anything nested under it.
const HIDE_FOOTER_PREFIXES = ["/recruiter", "/manager", "/accountmanager"];

const ConditionalFooter = () => {
  const { pathname } = useLocation();

  // Hide on any explicit path above, any nested "*/login" route, or anywhere
  // inside a dashboard route tree.
  const hideFooter =
    HIDE_FOOTER_PATHS.includes(pathname) ||
    pathname.endsWith("/login") ||
    HIDE_FOOTER_PREFIXES.some(
      (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
    );

  if (hideFooter) return null;

  return <Footer />;
};

export default ConditionalFooter;
