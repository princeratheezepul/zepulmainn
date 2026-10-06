import { useEffect, useState } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

// True when the visitor has asked the OS to minimise motion; the landing page
// animations then render their final state instead of looping.
const usePrefersReducedMotion = () => {
  const [reduce, setReduce] = useState(
    () => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(QUERY).matches
  );

  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(QUERY);
    const onChange = () => setReduce(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
};

export default usePrefersReducedMotion;
