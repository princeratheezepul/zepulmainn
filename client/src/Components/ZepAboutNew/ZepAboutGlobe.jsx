import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';
import './ZepAboutGlobe.css';

const MARKERS = [
    { id: 'uk', location: [51.5074, -0.1278], size: 0.06, label: 'UK' },
    { id: 'india', location: [17.3850, 78.4867], size: 0.07, label: 'India' },
    { id: 'poland', location: [52.2297, 21.0122], size: 0.05, label: 'Poland' },
    { id: 'uae', location: [25.2048, 55.2708], size: 0.05, label: 'UAE' },
    { id: 'singapore', location: [1.3521, 103.8198], size: 0.05, label: 'Singapore' },
    { id: 'hongkong', location: [22.3193, 114.1694], size: 0.05, label: 'Hong Kong' },
    { id: 'japan', location: [35.6762, 139.6503], size: 0.05, label: 'Japan' },
    { id: 'ireland', location: [53.3498, -6.2603], size: 0.05, label: 'Ireland' },
];

const ZepAboutGlobe = () => {
    const canvasRef = useRef();
    const containerRef = useRef();
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);

    useEffect(() => {
        let phi = 0;
        let animationRef;

        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 500 * 2,
            height: 500 * 2,
            phi: 0,
            theta: 0.25,
            dark: 0,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.85, 0.85, 0.9],
            markerColor: [0.1, 0.3, 1],
            glowColor: [1, 1, 1],
            markers: MARKERS.map(({ id, location, size }) => ({ id, location, size })),
        });

        function animate() {
            if (pointerInteracting.current === null) {
                phi += 0.005;
            }
            globe.update({ phi: phi + pointerInteractionMovement.current });
            animationRef = requestAnimationFrame(animate);
        }
        animate();

        return () => {
            cancelAnimationFrame(animationRef);
            globe.destroy();
        };
    }, []);

    return (
        <div ref={containerRef} className="globe-wrapper">
            <canvas
                ref={canvasRef}
                className="globe-canvas"
                onPointerDown={(e) => {
                    pointerInteracting.current = e.clientX - pointerInteractionMovement.current;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grabbing';
                }}
                onPointerUp={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onPointerOut={() => {
                    pointerInteracting.current = null;
                    if (canvasRef.current) canvasRef.current.style.cursor = 'grab';
                }}
                onMouseMove={(e) => {
                    if (pointerInteracting.current !== null) {
                        const delta = e.clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta / 200;
                    }
                }}
                onTouchMove={(e) => {
                    if (pointerInteracting.current !== null && e.touches[0]) {
                        const delta = e.touches[0].clientX - pointerInteracting.current;
                        pointerInteractionMovement.current = delta / 100;
                    }
                }}
                style={{
                    width: 500,
                    height: 500,
                    cursor: 'grab',
                    contain: 'layout paint size',
                }}
            />

            {/* CSS-anchor labels — one per marker */}
            {MARKERS.map((m) => (
                <div
                    key={m.id}
                    className="marker-label"
                    style={{
                        positionAnchor: `--cobe-${m.id}`,
                        opacity: `var(--cobe-visible-${m.id}, 0)`,
                    }}
                >
                    <span className="marker-dot" />
                    {m.label}
                </div>
            ))}
        </div>
    );
};

export default ZepAboutGlobe;