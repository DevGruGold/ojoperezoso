
import React from 'react';
import { Eye, EyeOff, Play, Pause, Square } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

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
  const { t } = useLanguage();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!leftEyeDetected || !rightEyeDetected) {
      toast.error(t('exercise.eyesNotDetected'));
      return;
    }
    onStart();
  };

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-blue-100 max-w-md mx-auto">
      {/* Eye Detection Status */}
      <div className="flex justify-center space-x-6 mb-6">
        <div className="flex items-center space-x-2">
          {leftEyeDetected ? (
            <Eye className="w-6 h-6 text-green-500" />
          ) : (
            <EyeOff className="w-6 h-6 text-red-400" />
          )}
          <span className={cn(
            "text-sm font-medium",
            leftEyeDetected ? "text-green-600" : "text-red-500"
          )}>
            {t('exercise.leftEye')}
          </span>
        </div>
        
        <div className="flex items-center space-x-2">
          {rightEyeDetected ? (
            <Eye className="w-6 h-6 text-green-500" />
          ) : (
            <EyeOff className="w-6 h-6 text-red-400" />
          )}
          <span className={cn(
            "text-sm font-medium",
            rightEyeDetected ? "text-green-600" : "text-red-500"
          )}>
            {t('exercise.rightEye')}
          </span>
        </div>
      </div>

      {/* Time and Progress */}
      <div className="text-center mb-6">
        <div className="text-2xl font-bold text-blue-600 mb-2">
          {formatTime(timeRemaining)}
        </div>
        <div className="text-sm text-gray-600">
          {t('exercise.session')} {currentExercise} / {totalExercises}
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            disabled={!leftEyeDetected || !rightEyeDetected}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-full font-medium transition-all",
              (leftEyeDetected && rightEyeDetected)
                ? "bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            )}
          >
            <Play className="w-5 h-5" />
            <span>{t('exercise.start')}</span>
          </button>
        ) : (
          <button
            onClick={onPause}
            className="flex items-center space-x-2 px-6 py-3 bg-amber-500 text-white rounded-full font-medium hover:bg-amber-600 transition-all shadow-lg hover:shadow-xl"
          >
            <Pause className="w-5 h-5" />
            <span>{t('exercise.pause')}</span>
          </button>
        )}
        
        <button
          onClick={onEnd}
          className="flex items-center space-x-2 px-6 py-3 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-all shadow-lg hover:shadow-xl"
        >
          <Square className="w-5 h-5" />
          <span>{t('exercise.end')}</span>
        </button>
      </div>
    </div>
  );
};

export default ExerciseControls;
