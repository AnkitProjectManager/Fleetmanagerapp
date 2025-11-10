import React from 'react';
import logo from '../../assets/rollandcharge-logo.png';

const RollChargeLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={logo} alt="Roll and Charge" className="h-16" />
    </div>
  );
};

export default RollChargeLogo;