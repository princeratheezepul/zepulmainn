import React from "react";
import "../styles/HowItWorksDiagram.css";

import diagramImage from "../assets/diagram.png";

const HowItWorksDiagram = () => {
    return (
        <div className="how-it-works-diagram-container">
            <img
                src={diagramImage}
                alt="How Zep Recruit Works Process Diagram"
                className="how-it-works-image"
            />
        </div>
    );
};

export default HowItWorksDiagram;
