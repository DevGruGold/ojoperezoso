
import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import { useLanguage } from '@/contexts/LanguageContext';
import ModernCameraView from '@/components/ModernCameraView';
import ExerciseControls from '@/components/ExerciseControls';
import { toast } from 'sonner';
import { EyeData } from '@/services/ModernFaceDetection';

const Index = () => {
  const { t } = useLanguage();
  const [leftEyeDetected, setLeftEyeDetected] = useState(false);
  const [rightEyeDetected, setRightEyeDetected] = useState(false);
  const [isExerciseRunning, setIsExerciseRunning] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState(300);
  const [showControls, setShowControls] = useState(true);
  const [currentEyeData, setCurrentEyeData] = useState<EyeData | null>(null);
  
  // Handle modern eye detection with enhanced data
  const handleEyeDetection = (leftEye: boolean, rightEye: boolean, eyeData?: EyeData) => {
    setLeftEyeDetected(leftEye);
    setRightEyeDetected(rightEye);
    if (eyeData) {
      setCurrentEyeData(eyeData);
    }
  };
  
  // Enhanced timer with progress tracking
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

  // Request fullscreen on load for better therapy experience
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen not available or denied');
      }
    };

    // Small delay to avoid blocking page load
    setTimeout(requestFullscreen, 2000);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col bg-black">
      {/* Semi-transparent header - only show when controls are visible */}
      {showControls && (
        <div className="absolute top-0 left-0 w-full z-10">
          <Header />
        </div>
      )}
      
      {/* Full-screen modern camera view with therapeutic features */}
      <div className="flex-1 h-screen">
        <ModernCameraView 
          onEyeDetected={handleEyeDetection}
          showGuides={isExerciseRunning} 
        />
        
        {/* Enhanced floating controls */}
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
        
        {/* Minimal toggle button when controls are hidden */}
        {!showControls && (
          <button 
            onClick={handleToggleControls}
            className="absolute bottom-6 right-6 p-4 rounded-full bg-primary/80 text-white shadow-lg z-10 hover:bg-primary transition-colors backdrop-blur-sm"
            aria-label={t('exercise.showControls')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </button>
        )}

        {/* Real-time eye data display (for debugging/monitoring) */}
        {currentEyeData && showControls && (
          <div className="absolute top-20 right-4 bg-black/70 text-white p-3 rounded-lg text-xs z-10 backdrop-blur-sm">
            <div>Alignment: {(currentEyeData.eyeAlignment * 100).toFixed(0)}%</div>
            <div>Blink Rate: {currentEyeData.blinkRate.toFixed(1)}/min</div>
            <div>Gaze: ({currentEyeData.gazeDirection.x.toFixed(2)}, {currentEyeData.gazeDirection.y.toFixed(2)})</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
