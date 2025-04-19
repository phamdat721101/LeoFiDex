import React from "react";
import leofiLogo from "@assets/LeoFi_4x4.jpg";

interface LeoFiLogoProps {
  className?: string;
}

export function LeoFiLogo({ className = "w-10 h-10" }: LeoFiLogoProps) {
  return (
    <img 
      src={leofiLogo} 
      alt="LeoFi Logo" 
      className={className} 
    />
  );
}

// SVG version for favicon and other places
export function LeoFiIcon({ className = "w-6 h-6" }: LeoFiLogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 512 512" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="logo-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E53935" />
          <stop offset="100%" stopColor="#F57C00" />
        </linearGradient>
      </defs>
      {/* Stylized lion head */}
      <path 
        d="M398 182c0-76-62-138-138-138s-138 62-138 138c0 26 7 50 20 70 16 25 39 45 67 57 0 0-15 52-17 60-2 8 2 12 10 6 15-11 95-70 95-70 22 10 46 15 72 15 76 0 138-62 138-138z" 
        fill="url(#logo-gradient)"
      />
      <path 
        d="M352 175c0-42-34-76-76-76s-76 34-76 76c0 14 4 27 11 39 9 14 22 25 37 31 0 0-8 29-9 33-1 4 1 7 5 3 8-6 52-39 52-39 12 6 26 9 40 9 42 0 76-34 76-76z" 
        fill="#FFFFFF"
        opacity="0.3"
      />
    </svg>
  );
}

export function LeoFiFavicon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
      <defs>
        <linearGradient id="leofi-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#E53935"/>
          <stop offset="100%" stopColor="#F57C00"/>
        </linearGradient>
      </defs>
      {/* Stylized lion head based on the logo */}
      <path 
        fill="url(#leofi-gradient)" 
        d="M398 182c0-76-62-138-138-138s-138 62-138 138c0 26 7 50 20 70 16 25 39 45 67 57 0 0-15 52-17 60-2 8 2 12 10 6 15-11 95-70 95-70 22 10 46 15 72 15 76 0 138-62 138-138z"
      />
    </svg>
  );
}
