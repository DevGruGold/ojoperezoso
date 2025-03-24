
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SlothAssistantProps {
  message: string;
}

const SlothAssistant: React.FC<SlothAssistantProps> = ({ message }) => {
  const [animating, setAnimating] = useState(false);
  const [messageVisible, setMessageVisible] = useState(true);
  const [blinking, setBlinking] = useState(false);
  const [waving, setWaving] = useState(false);
  
  // Animate sloth on message change
  useEffect(() => {
    setAnimating(true);
    setMessageVisible(false);
    
    const animationTimer = setTimeout(() => {
      setAnimating(false);
    }, 1000);
    
    const messageTimer = setTimeout(() => {
      setMessageVisible(true);
    }, 300);
    
    return () => {
      clearTimeout(animationTimer);
      clearTimeout(messageTimer);
    };
  }, [message]);
  
  // Random blinking effect
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 3000 + 2000); // Random blink between 2-5 seconds
    
    return () => clearInterval(blinkInterval);
  }, []);
  
  // Random arm waving
  useEffect(() => {
    const waveInterval = setInterval(() => {
      setWaving(true);
      setTimeout(() => setWaving(false), 1000);
    }, Math.random() * 5000 + 5000); // Random wave between 5-10 seconds
    
    return () => clearInterval(waveInterval);
  }, []);
  
  return (
    <div className="flex items-start bg-amber-50 rounded-xl p-4 border-2 border-amber-100">
      <div className="relative mr-4 min-w-[100px]">
        {/* Sloth SVG with animations - improved size and positioning */}
        <div className={cn(
          "w-24 h-28 transition-all duration-500",
          animating && "transform scale-110"
        )}>
          <svg viewBox="0 0 130 150" className="w-full h-full">
            {/* Sloth body */}
            <ellipse cx="65" cy="85" rx="35" ry="45" fill="#A89078" />
            
            {/* Sloth arms */}
            <path 
              d={waving ? "M 30,75 Q 15,55 20,45" : "M 30,75 Q 20,95 25,115"} 
              stroke="#A89078" 
              strokeWidth="10" 
              fill="none" 
              strokeLinecap="round"
              className={cn(
                "origin-top transition-all duration-300",
                waving && "animate-[wave_0.5s_ease-in-out_infinite]",
                animating && "origin-top animate-pulse"
              )}
            />
            <path 
              d="M 100,75 Q 110,95 105,115" 
              stroke="#A89078" 
              strokeWidth="10" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "origin-top animate-pulse" : ""}
            />
            
            {/* Sloth face */}
            <circle cx="65" cy="55" r="30" fill="#C2B39B" />
            
            {/* Sloth ears */}
            <circle cx="40" cy="50" r="8" fill="#A89078" />
            <circle cx="90" cy="50" r="8" fill="#A89078" />
            
            {/* Sloth face markings */}
            <path d="M 50,35 Q 65,30 80,35" stroke="#8D7761" strokeWidth="3" fill="none" />
            
            {/* Sloth eyes */}
            <g>
              <circle cx="55" cy="50" r="6" fill="white" />
              <circle cx="75" cy="50" r="6" fill="white" />
              
              {/* Eyelids for blinking */}
              <path 
                d={blinking ? "M 49,50 Q 55,45 61,50" : "M 49,47 Q 55,41 61,47"} 
                fill="#C2B39B" 
                className="transition-all duration-100"
              />
              <path 
                d={blinking ? "M 69,50 Q 75,45 81,50" : "M 69,47 Q 75,41 81,47"} 
                fill="#C2B39B" 
                className="transition-all duration-100"
              />
              
              <circle cx="55" cy="50" r={blinking ? "0" : "3"} fill="black" className="transition-all duration-100" />
              <circle cx="75" cy="50" r={blinking ? "0" : "3"} fill="black" className="transition-all duration-100" />
              
              {/* Eye highlights */}
              <circle cx="56" cy="49" r="1" fill="white" />
              <circle cx="76" cy="49" r="1" fill="white" />
            </g>
            
            {/* Sloth nose */}
            <ellipse cx="65" cy="60" rx="7" ry="5" fill="#8D7761" />
            
            {/* Sloth mouth - animated */}
            <path 
              d={animating ? "M 55,70 Q 65,75 75,70" : "M 55,70 Q 65,72 75,70"} 
              stroke="#8D7761" 
              strokeWidth="2" 
              fill="none" 
              className="transition-all duration-300"
            />
            
            {/* Sloth claws */}
            <line x1="22" y1="113" x2="28" y2="117" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="24" y1="111" x2="30" y2="115" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="26" y1="109" x2="32" y2="113" stroke="#6D5D4B" strokeWidth="2" />
            
            <line x1="108" y1="113" x2="102" y2="117" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="106" y1="111" x2="100" y2="115" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="104" y1="109" x2="98" y2="113" stroke="#6D5D4B" strokeWidth="2" />
            
            {/* Fun hair tuft on top */}
            <path 
              d="M 60,25 Q 65,15 70,25" 
              stroke="#8D7761" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "animate-bounce" : ""}
            />
          </svg>
          
          {/* Add keyframe animation for arm waving */}
          <style dangerouslySetInnerHTML={{
            __html: `
              @keyframes wave {
                0% { transform: rotate(0deg); }
                50% { transform: rotate(10deg); }
                100% { transform: rotate(0deg); }
              }
            `
          }} />
        </div>
      </div>
      
      <div className={cn(
        "bg-white rounded-lg p-3 shadow-md relative transition-all duration-300 max-w-[calc(100%-120px)]",
        messageVisible ? "opacity-100 transform translate-y-0" : "opacity-0 transform -translate-y-2"
      )}>
        {/* Speech bubble triangle */}
        <div className="absolute left-[-8px] top-5 w-0 h-0 border-t-[8px] border-t-transparent border-r-[8px] border-r-white border-b-[8px] border-b-transparent"></div>
        
        <p className="text-sm font-medium text-gray-700">{message}</p>
      </div>
    </div>
  );
};

export default SlothAssistant;
