import React from 'react';
import './Logo.css'; // Ensure the CSS file is in the same directory or adjust the path

const Logo = ({ size = '60px' }) => {
  return (
    <div className="logo-container" style={{ '--logo-size': size }}>
      <div className="logo">
        <div className="camera-icon">
          <div className="camera-body"></div>
          <div className="camera-lens"></div>
        </div>
        <div className="logo-text">
          <span className="logo-text-main">IMG</span>
          <span className="logo-text-sub">BOX</span>
        </div>
      </div>
    </div>
  );
};

export default Logo;
