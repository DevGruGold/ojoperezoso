
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface ProgressIndicatorProps {
  progress: number; // 0 to 100
  size?: 'sm' | 'md' | 'lg';
  showValue?: boolean;
  className?: string;
}

const ProgressIndicator = ({
  progress,
  size = 'md',
  showValue = true,
  className
}: ProgressIndicatorProps) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  
  useEffect(() => {
    // Animate the progress change
    const animationDuration = 1000; // ms
    const framesPerSecond = 60;
    const totalFrames = animationDuration / (1000 / framesPerSecond);
    const progressIncrement = (progress - animatedProgress) / totalFrames;
    
    let currentFrame = 0;
    let currentProgress = animatedProgress;
    
    const animateProgress = () => {
      if (currentFrame < totalFrames) {
        currentProgress += progressIncrement;
        setAnimatedProgress(currentProgress);
        currentFrame++;
        requestAnimationFrame(animateProgress);
      } else {
        setAnimatedProgress(progress);
      }
    };
    
    requestAnimationFrame(animateProgress);
  }, [progress]);
  
  // Calculate sizes based on the size prop
  const sizes = {
    sm: {
      container: 'w-20 h-20',
      svg: 'w-20 h-20',
      strokeWidth: 3,
      textSize: 'text-xs',
      valueSize: 'text-sm font-semibold'
    },
    md: {
      container: 'w-28 h-28',
      svg: 'w-28 h-28',
      strokeWidth: 4,
      textSize: 'text-sm',
      valueSize: 'text-xl font-semibold'
    },
    lg: {
      container: 'w-36 h-36',
      svg: 'w-36 h-36',
      strokeWidth: 5,
      textSize: 'text-base',
      valueSize: 'text-2xl font-semibold'
    }
  };
  
  const sizeProps = sizes[size];
  const radius = 45; // SVG circle radius
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (animatedProgress / 100) * circumference;
  
  return (
    <div className={cn('relative flex items-center justify-center', sizeProps.container, className)}>
      <svg className={sizeProps.svg} viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-secondary"
          strokeWidth={sizeProps.strokeWidth}
        />
        
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="currentColor"
          className="text-primary transition-all duration-300"
          strokeWidth={sizeProps.strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 50 50)"
        />
      </svg>
      
      {showValue && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn(sizeProps.valueSize)}>{Math.round(animatedProgress)}%</span>
          <span className={cn(sizeProps.textSize, "text-foreground/60")}>Progreso</span>
        </div>
      )}
    </div>
  );
};

export default ProgressIndicator;
