import React, { useEffect, useRef } from 'react';
import createGlobe from 'cobe';

const ZepAboutGlobe = () => {
    const canvasRef = useRef();
    const pointerInteracting = useRef(null);
    const pointerInteractionMovement = useRef(0);

    useEffect(() => {
        let phi = 0;

        // We use a fixed size for the canvas right now (600px * 2 for retina)
        // The globe is 500px on the screen (from CSS), but we render it slightly larger for crispness.
        const globe = createGlobe(canvasRef.current, {
            devicePixelRatio: 2,
            width: 500 * 2,
            height: 500 * 2,
            phi: 0,
            theta: 0.25,
            dark: 1,
            diffuse: 1.2,
            mapSamples: 16000,
            mapBrightness: 6,
            baseColor: [0.15, 0.2, 0.4],
            markerColor: [0.1, 0.3, 1],
            glowColor: [0.06, 0.12, 0.35],
            markers: [
                { location: [51.5074, -0.1278], size: 0.06 }, // UK (London)
                { location: [28.6139, 77.209], size: 0.07 },  // India (New Delhi)
                { location: [25.2048, 55.2708], size: 0.05 }, // UAE (Dubai)
                { location: [53.3498, -6.2603], size: 0.05 }, // Ireland (Dublin)
                { location: [1.3521, 103.8198], size: 0.05 }, // Singapore
            ],
            // Instead of onRender, we can update in a requestAnimationFrame loop 
            // or we can use onRender if it is supported (the provided docs say use requestAnimationFrame)
        });

        // The user's provided docs say:
        let animationRef;
        function animate() {
            // Smooth auto-rotation, slowed when user is dragging
            if (pointerInteracting.current === null) {
                phi += 0.005; // Auto rotate
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
        <canvas
            ref={canvasRef}
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
                contain: 'layout paint size'
            }}
        />
    );
};

export default ZepAboutGlobe;