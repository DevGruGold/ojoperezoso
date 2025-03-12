
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { Eye, EyeOff, Play, Pause, X } from 'lucide-react';

interface ExerciseControlsProps {
  onStart: () => void;
  onPause: () => void;
  onEnd: () => void;
  isRunning: boolean;
  leftEyeDetected: boolean;
  rightEyeDetected: boolean;
  currentExercise: number;
  totalExercises: number;
  timeRemaining: number;
}

const ExerciseControls = ({
  onStart,
  onPause,
  onEnd,
  isRunning,
  leftEyeDetected,
  rightEyeDetected,
  currentExercise,
  totalExercises,
  timeRemaining
}: ExerciseControlsProps) => {
  const [animateTimeRemaining, setAnimateTimeRemaining] = useState(false);
  
  // Animate time remaining when it changes
  useEffect(() => {
    setAnimateTimeRemaining(true);
    const timer = setTimeout(() => setAnimateTimeRemaining(false), 500);
    return () => clearTimeout(timer);
  }, [timeRemaining]);
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  return (
    <div className="w-full max-w-lg mx-auto glass px-8 py-6 rounded-2xl animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">Ejercicio {currentExercise}/{totalExercises}</h2>
        <button 
          onClick={onEnd}
          className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label="Cerrar ejercicio"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center justify-around mb-8">
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-14 h-14 rounded-full mb-2 flex items-center justify-center",
            leftEyeDetected ? "bg-green-100" : "bg-red-100"
          )}>
            <Eye className={cn(
              "w-6 h-6",
              leftEyeDetected ? "text-green-600" : "text-red-500"
            )} />
          </div>
          <span className="text-sm font-medium">Ojo izquierdo</span>
          <span className="text-xs text-foreground/70">
            {leftEyeDetected ? "Detectado" : "No detectado"}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-14 h-14 rounded-full mb-2 flex items-center justify-center",
            rightEyeDetected ? "bg-green-100" : "bg-red-100"
          )}>
            <Eye className={cn(
              "w-6 h-6",
              rightEyeDetected ? "text-green-600" : "text-red-500"
            )} />
          </div>
          <span className="text-sm font-medium">Ojo derecho</span>
          <span className="text-xs text-foreground/70">
            {rightEyeDetected ? "Detectado" : "No detectado"}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">Tiempo restante</span>
          <span 
            className={cn(
              "text-lg font-semibold transition-all",
              animateTimeRemaining && "scale-110 text-primary"
            )}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-1000"
            style={{ width: `${(timeRemaining / 300) * 100}%` }} // Assuming 5 minutes (300 seconds) total
          />
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        {isRunning ? (
          <Button 
            onClick={onPause}
            variant="secondary"
            className="w-32"
          >
            <Pause className="w-4 h-4 mr-2" />
            Pausar
          </Button>
        ) : (
          <Button 
            onClick={onStart}
            className="w-32"
          >
            <Play className="w-4 h-4 mr-2" />
            Iniciar
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseControls;
