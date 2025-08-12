import React from 'react';

interface TRELogoProps {
  width?: number;
  height?: number;
  className?: string;
  animated?: boolean;
}

export const TRELogo: React.FC<TRELogoProps> = ({ 
  width = 200, 
  height = 200, 
  className = '',
  animated = true 
}) => {
  const logoId = React.useId();
  
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 200 200" 
      width={width} 
      height={height} 
      className={className}
      aria-label="Total Reality Engineering Logo"
      role="img"
    >
      <defs>
        {/* Gradients and filters for enhanced visual effects */}
        <linearGradient id={`greenGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#39FF14', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#2ECC71', stopOpacity: 1 }} />
        </linearGradient>
        
        <linearGradient id={`beigeGradient-${logoId}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#F5F5DC', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: '#E8E8D0', stopOpacity: 1 }} />
        </linearGradient>
        
        {/* Glow filter for the green elements */}
        <filter id={`greenGlow-${logoId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
        
        {/* Subtle glow for beige elements */}
        <filter id={`beigeGlow-${logoId}`} x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      
      {/* Background (black) */}
      <rect width="200" height="200" fill="#000000"/>
      
      {/* Animated "A" shape - left leg */}
      <path 
        d="M 60 180 L 100 40" 
        stroke={`url(#beigeGradient-${logoId})`}
        strokeWidth="12" 
        strokeLinecap="round"
        filter={`url(#beigeGlow-${logoId})`}
        opacity={animated ? 0 : 1}
      >
        {animated && (
          <>
            <animate 
              attributeName="opacity" 
              values="0;1;1" 
              dur="1.5s" 
              begin="0s" 
              fill="freeze"
            />
            <animate 
              attributeName="stroke-dasharray" 
              values="0,200;200,0" 
              dur="1.5s" 
              begin="0s" 
              fill="freeze"
            />
          </>
        )}
      </path>
      
      {/* Animated "A" shape - right leg */}
      <path 
        d="M 140 180 L 100 40" 
        stroke={`url(#beigeGradient-${logoId})`}
        strokeWidth="12" 
        strokeLinecap="round"
        filter={`url(#beigeGlow-${logoId})`}
        opacity={animated ? 0 : 1}
      >
        {animated && (
          <>
            <animate 
              attributeName="opacity" 
              values="0;1;1" 
              dur="1.5s" 
              begin="0.3s" 
              fill="freeze"
            />
            <animate 
              attributeName="stroke-dasharray" 
              values="0,200;200,0" 
              dur="1.5s" 
              begin="0.3s" 
              fill="freeze"
            />
          </>
        )}
      </path>
      
      {/* Animated circle inside the "A" */}
      <circle 
        cx="110" 
        cy="80" 
        r={animated ? 0 : 15}
        fill={`url(#beigeGradient-${logoId})`}
        filter={`url(#beigeGlow-${logoId})`}
        opacity={animated ? 0 : 1}
      >
        {animated && (
          <>
            <animate 
              attributeName="opacity" 
              values="0;1;1" 
              dur="1s" 
              begin="1.2s" 
              fill="freeze"
            />
            <animate 
              attributeName="r" 
              values="0;15;15" 
              dur="0.8s" 
              begin="1.2s" 
              fill="freeze"
            />
            {/* Subtle breathing animation */}
            <animate 
              attributeName="r" 
              values="15;16;15" 
              dur="4s" 
              begin="2s" 
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
      
      {/* Animated green diagonal bar */}
      <rect 
        x="95" 
        y="75" 
        width="8" 
        height={animated ? 0 : 60}
        rx="4" 
        ry="4"
        fill={`url(#greenGradient-${logoId})`}
        filter={`url(#greenGlow-${logoId})`}
        transform="rotate(-15 99 105)"
        opacity={animated ? 0 : 1}
      >
        {animated && (
          <>
            <animate 
              attributeName="opacity" 
              values="0;1;1" 
              dur="1s" 
              begin="1.5s" 
              fill="freeze"
            />
            <animate 
              attributeName="height" 
              values="0;60;60" 
              dur="0.8s" 
              begin="1.5s" 
              fill="freeze"
            />
            {/* Pulsing glow effect */}
            <animate 
              attributeName="filter" 
              values={`url(#greenGlow-${logoId});url(#greenGlow-${logoId})`}
              dur="3s" 
              begin="2.5s" 
              repeatCount="indefinite"
            >
              <set attributeName="filter" to={`url(#greenGlow-${logoId})`} begin="0s"/>
              <set attributeName="filter" to={`url(#greenGlow-${logoId})`} begin="1.5s"/>
              <set attributeName="filter" to={`url(#greenGlow-${logoId})`} begin="3s"/>
            </animate>
          </>
        )}
      </rect>
      
      {/* Subtle background glow animation */}
      <circle 
        cx="100" 
        cy="100" 
        r={animated ? 80 : 80}
        fill="none" 
        stroke="#39FF14" 
        strokeWidth="0.5" 
        opacity={animated ? 0.1 : 0.1}
      >
        {animated && (
          <>
            <animate 
              attributeName="opacity" 
              values="0.1;0.3;0.1" 
              dur="6s" 
              begin="3s" 
              repeatCount="indefinite"
            />
            <animate 
              attributeName="r" 
              values="80;85;80" 
              dur="6s" 
              begin="3s" 
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
    </svg>
  );
};

export default TRELogo;
