
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import ExerciseControls from '@/components/ExerciseControls';
import ProgressIndicator from '@/components/ProgressIndicator';
import Button from '@/components/Button';
import SlothAssistant from '@/components/SlothAssistant';
import SlothFaceTracker from '@/components/SlothFaceTracker';
import { Eye, ArrowLeft, Award } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadFaceModels } from '@/utils/downloadFaceModels';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

const Exercise = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [leftEyeDetected, setLeftEyeDetected] = useState(false);
  const [rightEyeDetected, setRightEyeDetected] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(300); // 5 minutes
  const [progress, setProgress] = useState(0);
  const [showInstructions, setShowInstructions] = useState(true);
  const [currentExercise, setCurrentExercise] = useState(1);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [eyeTargetPosition, setEyeTargetPosition] = useState({ x: 50, y: 50 });
  const [exerciseStep, setExerciseStep] = useState(0);
  const [patternType, setPatternType] = useState('smooth');
  
  // Exercise steps for structured progression - more focused on therapy
  const exerciseSteps = [
    'lookUp',
    'lookDown',
    'lookLeft',
    'lookRight',
    'lookCircular',
    'convergence',
    'figure8',
    'randomJumps'
  ];
  
  // Download face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        const result = await downloadFaceModels();
        setModelsLoaded(result);
        if (result) {
          toast.success(t('exercise.modelsLoaded'));
        } else {
          // Still continue even if models fail to load
          toast.error(t('exercise.modelsError'));
        }
      } catch (error) {
        console.error("Error loading models:", error);
        toast.error(t('exercise.modelsError'));
      }
    };
    
    loadModels();
  }, [t]);
  
  // Update exercise target position based on current step - enhanced with therapeutic patterns
  useEffect(() => {
    if (!isRunning) return;
    
    const moveTarget = () => {
      let newX = 50;
      let newY = 50;
      const now = Date.now() / 1000;
      
      // Position based on current exercise step
      switch (exerciseStep % exerciseSteps.length) {
        case 0: // Look up
          newY = 20;
          break;
        case 1: // Look down
          newY = 80;
          break;
        case 2: // Look left
          newX = 20;
          break;
        case 3: // Look right
          newX = 80;
          break;
        case 4: // Look circular - use sine/cosine for circular motion
          newX = 50 + 30 * Math.sin(now);
          newY = 50 + 30 * Math.cos(now);
          break;
        case 5: // Convergence exercise - move from far to near (center)
          newX = 50 + (Math.sin(now * 0.5) * 30);
          newY = 50;
          break;
        case 6: // Figure 8 pattern - good for muscle strengthening
          newX = 50 + 30 * Math.sin(now);
          newY = 50 + 20 * Math.sin(2 * now);
          break;
        case 7: // Random jumps - helps with saccadic movements
          // Change position every 2 seconds for random jumps
          const jumpTime = Math.floor(now / 2);
          const pseudoRandom = Math.sin(jumpTime * 137.5) * 0.5 + 0.5; // Pseudo-random between 0-1
          const pseudoRandom2 = Math.sin(jumpTime * 259.3) * 0.5 + 0.5;
          newX = 20 + pseudoRandom * 60;
          newY = 20 + pseudoRandom2 * 60;
          break;
      }
      
      setEyeTargetPosition({ x: newX, y: newY });
    };
    
    const targetInterval = setInterval(moveTarget, 50); // More frequent updates for smoother motion
    return () => clearInterval(targetInterval);
  }, [isRunning, exerciseStep, exerciseSteps.length, patternType]);
  
  // Timer logic
  useEffect(() => {
    if (!isRunning) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRunning(false);
          setSessionComplete(true);
          return 0;
        }
        return prev - 1;
      });
      
      // Update progress
      setProgress(prev => {
        const newProgress = ((300 - timeRemaining + 1) / 300) * 100;
        return Math.min(newProgress, 100);
      });
      
      // Change exercise step every 30 seconds (more frequent changes)
      if (timeRemaining % 30 === 0 && timeRemaining > 0) {
        setExerciseStep(prev => (prev + 1) % exerciseSteps.length);
        // Alternate between smooth and saccadic patterns
        setPatternType(prev => prev === 'smooth' ? 'saccadic' : 'smooth');
        toast.info(t(`exercise.steps.${exerciseSteps[(exerciseStep + 1) % exerciseSteps.length]}`), {
          icon: <Eye className="text-blue-500" />
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, exerciseStep, exerciseSteps, t]);
  
  // Eye detection simulation
  useEffect(() => {
    if (isRunning) {
      // Simulate detection after short delay
      const detectionTimer = setTimeout(() => {
        setLeftEyeDetected(true);
        setRightEyeDetected(true);
        toast.success(t('exercise.eyesDetected'));
      }, 2000);
      
      return () => clearTimeout(detectionTimer);
    } else {
      setLeftEyeDetected(false);
      setRightEyeDetected(false);
    }
  }, [isRunning, t]);
  
  // Handle start exercise
  const handleStart = useCallback(() => {
    if (showInstructions) {
      setShowInstructions(false);
      setSessionStarted(true);
    } else {
      setIsRunning(true);
      toast.info(t(`exercise.steps.${exerciseSteps[exerciseStep]}`), {
        icon: <Eye className="text-blue-500" />
      });
    }
  }, [showInstructions, exerciseStep, exerciseSteps, t]);
  
  // Handle pause exercise
  const handlePause = useCallback(() => {
    setIsRunning(false);
    toast.info(t('exercise.paused'));
  }, [t]);
  
  // Handle end exercise
  const handleEnd = useCallback(() => {
    if (window.confirm(t('exercise.confirmEnd'))) {
      navigate('/');
    }
  }, [navigate, t]);
  
  // Return to home after session complete
  const handleReturnHome = useCallback(() => {
    navigate('/');
  }, [navigate]);
  
  // Start new session
  const handleNewSession = useCallback(() => {
    setTimeRemaining(300);
    setProgress(0);
    setSessionComplete(false);
    setIsRunning(false);
    setCurrentExercise(prev => prev + 1);
    setExerciseStep(0);
  }, []);
  
  // Renders based on application state
  const renderContent = () => {
    if (showInstructions) {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/70">
          <div className="glass max-w-lg mx-auto p-8 rounded-3xl border-2 border-amber-200 animate-scale-up bg-white/95">
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">
              {t('exercise.instructions.title')}
            </h2>
            
            <p className="text-center mb-6">{t('exercise.followSlothEyes')}</p>
            
            <div className="flex justify-center">
              <Button onClick={handleStart} className="kid-friendly-button">
                {t('exercise.instructions.start')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (sessionComplete) {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/70">
          <div className="glass max-w-lg mx-auto p-8 rounded-3xl animate-scale-up border-2 border-amber-200 bg-white/95">
            <div className="flex justify-center mb-6">
              <div className="relative">
                <ProgressIndicator progress={100} size="lg" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <Award className="w-10 h-10 text-amber-500 animate-pulse" />
                </div>
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">{t('exercise.complete.title')}</h2>
            
            <div className="mb-8">
              <SlothAssistant message={t('exercise.sloth.completed')} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={handleReturnHome} className="rounded-full border-2 border-slate-200">
                {t('exercise.complete.home')}
              </Button>
              <Button onClick={handleNewSession} className="kid-friendly-button">
                {t('exercise.complete.newExercise')}
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 bg-gradient-to-b from-blue-50 to-purple-50">
      {/* Full-screen Sloth Face */}
      <div className="absolute inset-0 flex items-center justify-center">
        <SlothFaceTracker 
          targetPosition={eyeTargetPosition}
          isRunning={isRunning}
          currentStep={exerciseStep}
          exerciseSteps={exerciseSteps}
        />
      </div>
      
      {/* Top Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button 
          variant="ghost" 
          className="bg-white/80 backdrop-blur-sm text-blue-700 hover:bg-white rounded-full"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          {t('exercise.back')}
        </Button>
      </div>
      
      {/* Controls Panel */}
      {sessionStarted && !sessionComplete && (
        <div className="absolute bottom-6 left-0 right-0 z-10 px-4">
          <ExerciseControls 
            onStart={handleStart}
            onPause={handlePause}
            onEnd={handleEnd}
            isRunning={isRunning}
            leftEyeDetected={leftEyeDetected}
            rightEyeDetected={rightEyeDetected}
            currentExercise={currentExercise}
            totalExercises={5}
            timeRemaining={timeRemaining}
          />
        </div>
      )}
      
      {/* Progress indicator */}
      {isRunning && (
        <div className="absolute top-6 right-6 z-10">
          <ProgressIndicator progress={progress} />
        </div>
      )}
      
      {renderContent()}
    </div>
  );
};

export default Exercise;
