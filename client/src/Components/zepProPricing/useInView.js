import { useEffect, useRef, useState } from 'react';

/**
 * Reveals a section the first time it scrolls into view. Returns `[ref, inView]`
 * so the `.in` class stays part of React's rendered className — mutating the
 * class imperatively would be wiped out by the next re-render.
 */
export default function useInView(threshold = 0.12) {
    const ref = useRef(null);
    const [inView, setInView] = useState(false);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        if (!('IntersectionObserver' in window)) {
            setInView(true);
            return;
        }
        const io = new IntersectionObserver(
            ([entry]) => {
                if (!entry.isIntersecting) return;
                setInView(true);
                io.disconnect();
            },
            { threshold }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    return [ref, inView];
}
