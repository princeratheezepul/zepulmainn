import React from "react";
import "../styles/FrameComponent.css";

const FrameComponent = () => {
    return (
        <div className="frame-component-container">
            <h2 className="why-zepul-title">
                How <span className="text-primary">Zepul</span> Works ?
            </h2>
            <img
                src="/Hompage.png"
                alt="Frame visualization"
                className="frame-image"
            />
        </div>
    );
};

export default FrameComponent;
