import React from "react";
import "./VideoModal.css";

const VideoModal = ({ videoId, onClose }) => {
  return (
    <div className="video-modal">
      <div className="video-content">
        <button className="close-btn" onClick={onClose}>×</button>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
          title="Topper Video"
          frameBorder="0"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

export default VideoModal;
