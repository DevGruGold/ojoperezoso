
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import CameraView from '@/components/CameraView';
import ExerciseControls from '@/components/ExerciseControls';
import { toast } from 'sonner';

const Index = () => {
  const { t } = useLanguage();
  const [leftEyeDetected, setLeftEyeDetected] = useState(false);
  const [rightEyeDetected, setRightEyeDetected] = useState(false);
  const [isExerciseRunning, setIsExerciseRunning] = useState(true); // Start exercise running by default
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [showControls, setShowControls] = useState(true);
  
  // Handle eye detection
  const handleEyeDetection = (leftEye: boolean, rightEye: boolean) => {
    setLeftEyeDetected(leftEye);
    setRightEyeDetected(rightEye);
  };
  
  // Handle timer
  useEffect(() => {
    if (!isExerciseRunning) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.success(t('exercise.completed'));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isExerciseRunning, t]);
  
  // Reset timer when it reaches 0
  useEffect(() => {
    if (timeRemaining === 0) {
      setTimeRemaining(300);
      setIsExerciseRunning(false);
    }
  }, [timeRemaining]);

  const handlePauseExercise = () => {
    setIsExerciseRunning(false);
  };

  const handleResumeExercise = () => {
    setIsExerciseRunning(true);
  };

  const handleToggleControls = () => {
    setShowControls(prev => !prev);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Semi-transparent header */}
      <div className="absolute top-0 left-0 w-full z-10">
        <Header />
      </div>
      
      {/* Full-screen mirror camera view */}
      <div className="flex-1 h-screen">
        <CameraView 
          onEyeDetected={handleEyeDetection}
          showGuides={isExerciseRunning} 
        />
        
        {/* Floating controls */}
        {showControls && (
          <div className="absolute bottom-6 left-0 right-0 z-10">
            <ExerciseControls 
              onClose={handleToggleControls}
              onStart={handleResumeExercise}
              onPause={handlePauseExercise}
              isRunning={isExerciseRunning}
              leftEyeDetected={leftEyeDetected}
              rightEyeDetected={rightEyeDetected}
              currentExercise={1}
              totalExercises={5}
              timeRemaining={timeRemaining}
            />
          </div>
        )}
        
        {/* Show a toggle button when controls are hidden */}
        {!showControls && (
          <button 
            onClick={handleToggleControls}
            className="absolute bottom-6 right-6 p-3 rounded-full bg-primary text-white shadow-lg z-10 hover:bg-primary/90 transition-colors"
            aria-label={t('exercise.showControls')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="m20 6-5.5 5.5" />
              <path d="m2 12 5.5 5.5" />
              <path d="M15 12h-2" />
              <path d="M11 12H9" />
              <path d="M7 12H5" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};

export default Index;
