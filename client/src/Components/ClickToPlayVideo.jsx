import React from "react";

// Does not autoplay: the visitor starts the video with the native controls.
const ClickToPlayVideo = ({ src, label }) => (
  <video src={src} controls playsInline preload="metadata" aria-label={label} />
);

export default ClickToPlayVideo;
