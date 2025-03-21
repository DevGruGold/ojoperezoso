
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
          <svg viewBox="0 0 120 140" className="w-full h-full">
            {/* Sloth body */}
            <ellipse cx="60" cy="80" rx="35" ry="45" fill="#A89078" />
            
            {/* Sloth arms */}
            <path 
              d={waving ? "M 25,70 Q 10,50 15,40" : "M 25,70 Q 15,90 20,110"} 
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
              d="M 95,70 Q 105,90 100,110" 
              stroke="#A89078" 
              strokeWidth="10" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "origin-top animate-pulse" : ""}
            />
            
            {/* Sloth face */}
            <circle cx="60" cy="50" r="30" fill="#C2B39B" />
            
            {/* Sloth ears */}
            <circle cx="35" cy="45" r="8" fill="#A89078" />
            <circle cx="85" cy="45" r="8" fill="#A89078" />
            
            {/* Sloth face markings */}
            <path d="M 45,30 Q 60,25 75,30" stroke="#8D7761" strokeWidth="3" fill="none" />
            
            {/* Sloth eyes */}
            <g>
              <circle cx="50" cy="45" r="6" fill="white" />
              <circle cx="70" cy="45" r="6" fill="white" />
              
              {/* Eyelids for blinking */}
              <path 
                d={blinking ? "M 44,45 Q 50,40 56,45" : "M 44,42 Q 50,36 56,42"} 
                fill="#C2B39B" 
                className="transition-all duration-100"
              />
              <path 
                d={blinking ? "M 64,45 Q 70,40 76,45" : "M 64,42 Q 70,36 76,42"} 
                fill="#C2B39B" 
                className="transition-all duration-100"
              />
              
              <circle cx="50" cy="45" r={blinking ? "0" : "3"} fill="black" className="transition-all duration-100" />
              <circle cx="70" cy="45" r={blinking ? "0" : "3"} fill="black" className="transition-all duration-100" />
              
              {/* Eye highlights */}
              <circle cx="51" cy="44" r="1" fill="white" />
              <circle cx="71" cy="44" r="1" fill="white" />
            </g>
            
            {/* Sloth nose */}
            <ellipse cx="60" cy="55" rx="7" ry="5" fill="#8D7761" />
            
            {/* Sloth mouth - animated */}
            <path 
              d={animating ? "M 50,65 Q 60,70 70,65" : "M 50,65 Q 60,67 70,65"} 
              stroke="#8D7761" 
              strokeWidth="2" 
              fill="none" 
              className="transition-all duration-300"
            />
            
            {/* Sloth claws */}
            <line x1="17" y1="108" x2="23" y2="112" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="19" y1="106" x2="25" y2="110" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="21" y1="104" x2="27" y2="108" stroke="#6D5D4B" strokeWidth="2" />
            
            <line x1="103" y1="108" x2="97" y2="112" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="101" y1="106" x2="95" y2="110" stroke="#6D5D4B" strokeWidth="2" />
            <line x1="99" y1="104" x2="93" y2="108" stroke="#6D5D4B" strokeWidth="2" />
            
            {/* Fun hair tuft on top */}
            <path 
              d="M 55,20 Q 60,10 65,20" 
              stroke="#8D7761" 
              strokeWidth="4" 
              fill="none" 
              strokeLinecap="round"
              className={animating ? "animate-bounce" : ""}
            />
          </svg>
          
          {/* Add keyframe animation for arm waving - fixed JSX issue */}
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
