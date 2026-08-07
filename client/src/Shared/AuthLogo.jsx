import { Link } from "react-router-dom";

/**
 * Zepul mark pinned to the top-left of the auth screens. Clicking it takes the
 * user back to the marketing home page. The screen it sits on must be
 * positioned (`relative`) for the absolute placement to anchor correctly.
 */
export default function AuthLogo({ className = "" }) {
  return (
    <Link
      to="/"
      aria-label="Go to Zepul home"
      className={`absolute top-6 left-6 z-20 inline-flex items-center ${className}`}
    >
      <img src="/assets/logo.png" alt="Zepul" className="h-8 w-auto" />
    </Link>
  );
}
