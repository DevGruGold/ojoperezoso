
import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SlothFaceTrackerProps {
  targetPosition: { x: number, y: number };
  isRunning: boolean;
  currentStep: number;
  exerciseSteps?: string[];
}

const SlothFaceTracker: React.FC<SlothFaceTrackerProps> = ({ 
  targetPosition, 
  isRunning,
  currentStep,
  exerciseSteps = ['lookUp', 'lookDown', 'lookLeft', 'lookRight', 'lookCircular']
}) => {
  const [blinking, setBlinking] = useState(false);
  const [smiling, setSmiling] = useState(false);
  const { t } = useLanguage();

  // Calculate eye position based on target position
  // Limit the movement range to make it look natural
  const leftEyeX = 50 + (targetPosition.x - 50) * 0.3; // Increased range of motion
  const leftEyeY = 45 + (targetPosition.y - 50) * 0.3;
  const rightEyeX = 70 + (targetPosition.x - 50) * 0.3;
  const rightEyeY = 45 + (targetPosition.y - 50) * 0.3;

  // Occasional random blinking
  useEffect(() => {
    if (!isRunning) return;
    
    const blinkInterval = setInterval(() => {
      setBlinking(true);
      setTimeout(() => setBlinking(false), 200);
    }, Math.random() * 5000 + 3000); // Random blink between 3-8 seconds
    
    return () => clearInterval(blinkInterval);
  }, [isRunning]);

  // Occasional smiling
  useEffect(() => {
    if (!isRunning) return;
    
    const smileInterval = setInterval(() => {
      setSmiling(true);
      setTimeout(() => setSmiling(false), 2000);
    }, Math.random() * 8000 + 5000); // Random smile between 5-13 seconds
    
    return () => clearInterval(smileInterval);
  }, [isRunning]);

  // Get current exercise name
  const getCurrentExercise = () => {
    if (!exerciseSteps || currentStep >= exerciseSteps.length) return 'lookCircular';
    return exerciseSteps[currentStep];
  };

  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg 
        viewBox="0 0 400 400" 
        className={cn(
          "w-full h-full max-w-[95vh] transition-all duration-300",
          isRunning ? "opacity-100" : "opacity-80"
        )}
      >
        {/* Background circle for the sloth face */}
        <circle cx="200" cy="200" r="190" fill="#C2B39B" />
        
        {/* Fur texture - subtle lines */}
        <g opacity="0.3">
          {[...Array(20)].map((_, i) => (
            <path 
              key={`fur-${i}`}
              d={`M ${180 - i*5},${80 + i*3} Q ${200},${100 + i*5} ${220 + i*5},${80 + i*3}`}
              stroke="#A89078"
              strokeWidth="1"
              fill="none"
            />
          ))}
        </g>
        
        {/* Sloth face markings */}
        <path d="M 130,120 Q 200,100 270,120" stroke="#8D7761" strokeWidth="6" fill="none" />
        
        {/* Sloth nose */}
        <ellipse cx="200" cy="220" rx="25" ry="20" fill="#8D7761" />
        
        {/* Nose details */}
        <ellipse cx="190" cy="215" rx="8" ry="6" fill="#6D5D4B" />
        <ellipse cx="210" cy="215" rx="8" ry="6" fill="#6D5D4B" />
        
        {/* Sloth ears */}
        <circle cx="100" cy="140" r="35" fill="#A89078" />
        <circle cx="300" cy="140" r="35" fill="#A89078" />
        <circle cx="100" cy="140" r="20" fill="#8D7761" opacity="0.5" />
        <circle cx="300" cy="140" r="20" fill="#8D7761" opacity="0.5" />
        
        {/* Eye regions */}
        <circle cx="150" cy="180" r="40" fill="white" />
        <circle cx="250" cy="180" r="40" fill="white" />
        
        {/* Eyelids */}
        <path 
          d={blinking 
            ? "M 110,180 Q 150,170 190,180" 
            : "M 110,160 Q 150,140 190,160"
          }
          fill="#C2B39B" 
          className="transition-all duration-200"
        />
        <path 
          d={blinking 
            ? "M 210,180 Q 250,170 290,180" 
            : "M 210,160 Q 250,140 290,160"
          }
          fill="#C2B39B" 
          className="transition-all duration-200"
        />
        
        {/* Irises - these move with the target */}
        <circle 
          cx={leftEyeX} 
          cy={leftEyeY} 
          r={blinking ? 0 : 15} 
          fill="#6D5D4B" 
          className="transition-all duration-200"
        />
        <circle 
          cx={rightEyeX} 
          cy={rightEyeY} 
          r={blinking ? 0 : 15} 
          fill="#6D5D4B" 
          className="transition-all duration-200"
        />
        
        {/* Pupils - these move with the target */}
        <circle 
          cx={leftEyeX} 
          cy={leftEyeY} 
          r={blinking ? 0 : 8} 
          fill="black" 
          className="transition-all duration-200"
        />
        <circle 
          cx={rightEyeX} 
          cy={rightEyeY} 
          r={blinking ? 0 : 8} 
          fill="black" 
          className="transition-all duration-200"
        />
        
        {/* Eye highlights - static */}
        <circle 
          cx={leftEyeX + 5} 
          cy={leftEyeY - 3} 
          r={blinking ? 0 : 4} 
          fill="white" 
          className="transition-all duration-300"
          opacity="0.8"
        />
        <circle 
          cx={rightEyeX + 5} 
          cy={rightEyeY - 3} 
          r={blinking ? 0 : 4} 
          fill="white" 
          className="transition-all duration-300"
          opacity="0.8"
        />
        
        {/* Mouth - can smile */}
        <path 
          d={smiling 
            ? "M 150,260 Q 200,290 250,260" 
            : "M 150,260 Q 200,270 250,260"
          } 
          stroke="#8D7761" 
          strokeWidth="6" 
          fill="none" 
          strokeLinecap="round"
          className="transition-all duration-500"
        />
        
        {/* Fun hair tuft on top - animated */}
        <path 
          d="M 180,80 Q 200,50 220,80" 
          stroke="#8D7761" 
          strokeWidth="8" 
          fill="none" 
          strokeLinecap="round"
          className={isRunning ? "animate-bounce" : ""}
        />
        
        {/* Visual target indicator */}
        {isRunning && (
          <g className="animate-pulse">
            <circle 
              cx={targetPosition.x / 100 * 400} 
              cy={targetPosition.y / 100 * 400} 
              r="12" 
              fill="#FFCC33" 
              opacity="0.7"
              stroke="#FFA500"
              strokeWidth="2"
            />
            <circle 
              cx={targetPosition.x / 100 * 400} 
              cy={targetPosition.y / 100 * 400} 
              r="6" 
              fill="#FFA500" 
            />
          </g>
        )}
        
        {/* Brief exercise instruction text */}
        {isRunning && (
          <g>
            <rect x="100" y="320" width="200" height="40" rx="20" fill="white" opacity="0.9" />
            <text x="200" y="345" textAnchor="middle" fill="#8D7761" fontWeight="bold" fontSize="16px">
              {t(`exercise.steps.${getCurrentExercise()}`)}
            </text>
          </g>
        )}
      </svg>
    </div>
  );
};

export default SlothFaceTracker;
