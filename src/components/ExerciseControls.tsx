import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import Button from './Button';
import { Eye, EyeOff, Play, Pause, X, AlertTriangle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExerciseControlsProps {
  onClose?: () => void;
  onStart?: () => void;
  onPause?: () => void;
  onEnd?: () => void;
  isRunning?: boolean;
  leftEyeDetected?: boolean;
  rightEyeDetected?: boolean;
  currentExercise?: number;
  totalExercises?: number;
  timeRemaining?: number;
}

const ExerciseControls = ({
  onStart = () => {},
  onPause = () => {},
  onEnd = () => {},
  onClose = () => {},
  isRunning = false,
  leftEyeDetected = false,
  rightEyeDetected = false,
  currentExercise = 1,
  totalExercises = 5,
  timeRemaining = 300
}: ExerciseControlsProps) => {
  const [animateTimeRemaining, setAnimateTimeRemaining] = useState(false);
  const { t } = useLanguage();
  
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
    <div className="w-full max-w-lg mx-auto glass px-8 py-6 rounded-2xl animate-slide-up bg-white/80 border-2 border-amber-200 shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium">{t('exercise.title', { current: currentExercise, total: totalExercises })}</h2>
        <button 
          onClick={onClose}
          className="p-1.5 rounded-full hover:bg-secondary/80 transition-colors"
          aria-label={t('exercise.close')}
        >
          <X className="w-5 h-5" />
        </button>
      </div>
      
      <div className="flex items-center justify-around mb-8">
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-14 h-14 rounded-full mb-2 flex items-center justify-center",
            leftEyeDetected ? "bg-green-100" : "bg-amber-100"
          )}>
            {leftEyeDetected ? (
              <Eye className="w-6 h-6 text-green-600" />
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <span className="text-sm font-medium">{t('exercise.leftEye')}</span>
          <span className="text-xs text-foreground/70">
            {leftEyeDetected ? t('exercise.detected') : t('exercise.keepTrying')}
          </span>
        </div>
        
        <div className="flex flex-col items-center">
          <div className={cn(
            "w-14 h-14 rounded-full mb-2 flex items-center justify-center",
            rightEyeDetected ? "bg-green-100" : "bg-amber-100"
          )}>
            {rightEyeDetected ? (
              <Eye className="w-6 h-6 text-green-600" /> 
            ) : (
              <AlertTriangle className="w-6 h-6 text-amber-600" />
            )}
          </div>
          <span className="text-sm font-medium">{t('exercise.rightEye')}</span>
          <span className="text-xs text-foreground/70">
            {rightEyeDetected ? t('exercise.detected') : t('exercise.keepTrying')}
          </span>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">{t('exercise.timeRemaining')}</span>
          <span 
            className={cn(
              "text-lg font-semibold transition-all",
              animateTimeRemaining && "scale-110 text-primary"
            )}
          >
            {formatTime(timeRemaining)}
          </span>
        </div>
        <div className="w-full h-3 bg-blue-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-1000"
            style={{ width: `${(timeRemaining / 300) * 100}%` }}
          />
        </div>
      </div>
      
      <div className="flex justify-center space-x-4">
        {isRunning ? (
          <Button 
            onClick={onPause}
            variant="secondary"
            className="w-32 rounded-full"
          >
            <Pause className="w-4 h-4 mr-2" />
            {t('exercise.pause')}
          </Button>
        ) : (
          <Button 
            onClick={onStart}
            className="w-32 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white rounded-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {t('exercise.start')}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExerciseControls;
