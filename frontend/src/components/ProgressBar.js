import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({ progress, height = '20px', color = '#4CAF50' }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className="progress-bar-container" style={{ height }}>
      <div 
        className="progress-bar-fill"
        style={{ 
          width: `${clampedProgress}%`,
          background: `linear-gradient(90deg, ${color} 0%, ${color}dd 100%)`,
          height: '100%'
        }}
      />
      <span className="progress-text">
        {clampedProgress.toFixed(1)}%
      </span>
    </div>
  );
};

export default ProgressBar;
