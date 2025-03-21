
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface SlothAssistantProps {
  message: string;
}

const SlothAssistant: React.FC<SlothAssistantProps> = ({ message }) => {
  const [animating, setAnimating] = useState(false);
  const [messageVisible, setMessageVisible] = useState(true);
  
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
  
  return (
    <div className="flex items-start bg-amber-50 rounded-xl p-4 border-2 border-amber-100">
      <div className="relative mr-4 min-w-[80px]">
        {/* Sloth SVG with animations */}
        <div className={cn(
          "w-20 h-20 transition-all duration-500",
          animating && "transform scale-110"
        )}>
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Sloth body */}
            <ellipse cx="50" cy="55" rx="30" ry="40" fill="#A89078" />
            
            {/* Sloth face */}
            <circle cx="50" cy="35" r="25" fill="#C2B39B" />
            
            {/* Sloth eyes */}
            <g className={animating ? "animate-pulse" : ""}>
              <circle cx="40" cy="30" r="5" fill="white" />
              <circle cx="60" cy="30" r="5" fill="white" />
              <circle cx="40" cy="30" r="3" fill="black" className={animating ? "animate-bounce" : ""} />
              <circle cx="60" cy="30" r="3" fill="black" className={animating ? "animate-bounce" : ""} />
            </g>
            
            {/* Sloth nose */}
            <ellipse cx="50" cy="40" rx="6" ry="4" fill="#8D7761" />
            
            {/* Sloth mouth */}
            <path 
              d={animating ? "M 40,45 Q 50,50 60,45" : "M 40,45 Q 50,48 60,45"} 
              stroke="#8D7761" 
              strokeWidth="2" 
              fill="none" 
            />
            
            {/* Sloth arms */}
            <path 
              d="M 25,50 Q 15,70 20,90" 
              stroke="#A89078" 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "origin-top animate-pulse" : ""}
            />
            <path 
              d="M 75,50 Q 85,70 80,90" 
              stroke="#A89078" 
              strokeWidth="8" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "origin-top animate-pulse" : ""}
            />
            
            {/* Sloth claws */}
            <line x1="17" y1="88" x2="23" y2="92" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="19" y1="86" x2="25" y2="90" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="21" y1="84" x2="27" y2="88" stroke="#6D5D4B" strokeWidth="2" />
            
            <line x1="83" y1="88" x2="77" y2="92" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="81" y1="86" x2="75" y2="90" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="79" y1="84" x2="73" y2="88" stroke="#6D5D4B" strokeWidth="2" />
          </svg>
        </div>
      </div>
      
      <div className={cn(
        "bg-white rounded-lg p-3 shadow-md relative transition-all duration-300 max-w-[calc(100%-100px)]",
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
