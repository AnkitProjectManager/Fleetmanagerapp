/* Roll + Charge Logo Component - Matches Brand Style Guide */
import React from 'react';

const RollChargeLogo = ({ 
  size = 120, 
  className = "", 
  showText = true, 
  textSize = "text-xl",
  variant = "horizontal" // "horizontal" | "icon-only" | "stacked"
}) => {
  const brandGreen = "#8BC34A";
  
  if (variant === "icon-only" || !showText) {
    return (
      <div className={`flex items-center justify-center ${className}`}>
        <svg 
          width={size} 
          height={size * 0.8} 
          viewBox="0 0 200 160" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Modern EV Car Silhouette matching brand */}
          <g transform="translate(20, 20)">
            {/* Car Body */}
            <path 
              d="M30 50 C30 45 35 40 40 40 L120 40 C125 40 130 45 130 50 L130 90 C130 95 125 100 120 100 L40 100 C35 100 30 95 30 90 Z" 
              fill={brandGreen}
              stroke="#000" 
              strokeWidth="3"
            />
            
            {/* Car Top/Roof */}
            <path 
              d="M40 40 C40 30 45 25 50 25 L110 25 C115 25 120 30 120 40" 
              fill={brandGreen} 
              stroke="#000" 
              strokeWidth="3"
            />
            
            {/* Windows */}
            <path 
              d="M45 35 L105 35 C110 35 115 38 117 40 L43 40 C43 38 43 35 45 35 Z" 
              fill="#E3F2FD" 
              stroke="#000" 
              strokeWidth="2"
            />
            
            {/* Front Wheel */}
            <circle cx="50" cy="90" r="12" fill="#000"/>
            <circle cx="50" cy="90" r="8" fill="#FFF"/>
            <circle cx="50" cy="90" r="4" fill="#000"/>
            
            {/* Back Wheel */}
            <circle cx="110" cy="90" r="12" fill="#000"/>
            <circle cx="110" cy="90" r="8" fill="#FFF"/>
            <circle cx="110" cy="90" r="4" fill="#000"/>
            
            {/* Car Details */}
            <rect x="35" y="65" width="6" height="3" fill="#FFF" stroke="#000" strokeWidth="0.5"/>
            <rect x="119" y="65" width="6" height="3" fill="#FFF" stroke="#000" strokeWidth="0.5"/>
          </g>
        </svg>
      </div>
    );
  }

  return (
    <div className={`flex items-center ${variant === "horizontal" ? "space-x-3" : "flex-col space-y-2"} ${className}`}>
      {/* Car Icon */}
      <svg 
        width={size * 0.4} 
        height={size * 0.32} 
        viewBox="0 0 200 160" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        <g transform="translate(20, 20)">
          {/* Car Body */}
          <path 
            d="M30 50 C30 45 35 40 40 40 L120 40 C125 40 130 45 130 50 L130 90 C130 95 125 100 120 100 L40 100 C35 100 30 95 30 90 Z" 
            fill={brandGreen}
            stroke="#000" 
            strokeWidth="3"
          />
          
          {/* Car Top/Roof */}
          <path 
            d="M40 40 C40 30 45 25 50 25 L110 25 C115 25 120 30 120 40" 
            fill={brandGreen} 
            stroke="#000" 
            strokeWidth="3"
          />
          
          {/* Windows */}
          <path 
            d="M45 35 L105 35 C110 35 115 38 117 40 L43 40 C43 38 43 35 45 35 Z" 
            fill="#E3F2FD" 
            stroke="#000" 
            strokeWidth="2"
          />
          
          {/* Front Wheel */}
          <circle cx="50" cy="90" r="12" fill="#000"/>
          <circle cx="50" cy="90" r="8" fill="#FFF"/>
          <circle cx="50" cy="90" r="4" fill="#000"/>
          
          {/* Back Wheel */}
          <circle cx="110" cy="90" r="12" fill="#000"/>
          <circle cx="110" cy="90" r="8" fill="#FFF"/>
          <circle cx="110" cy="90" r="4" fill="#000"/>
          
          {/* Car Details */}
          <rect x="35" y="65" width="6" height="3" fill="#FFF" stroke="#000" strokeWidth="0.5"/>
          <rect x="119" y="65" width="6" height="3" fill="#FFF" stroke="#000" strokeWidth="0.5"/>
        </g>
      </svg>
      
      {/* Brand Text */}
      {showText && (
        <div className={`${variant === "horizontal" ? "" : "text-center"}`}>
          {/* Main Brand Name */}
          <div className={`font-black ${textSize} leading-none`}>
            <span className="text-black">ROLL</span>
            <span className="text-[#8BC34A] mx-1">+</span>
            <span className="text-black">CHARGE</span>
          </div>
          
          {/* Tagline */}
          <div className="text-black font-bold text-sm tracking-wide mt-1">
            <span>EV REPAIR</span>
            <span className="text-[#8BC34A] mx-2">&</span>
            <span>TIRES</span>
          </div>
          
          {/* Decorative Lines */}
          <div className="flex items-center justify-center space-x-2 mt-1">
            <div className="h-0.5 w-8 bg-[#8BC34A]"></div>
            <div className="h-0.5 w-8 bg-[#8BC34A]"></div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollChargeLogo;