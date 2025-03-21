
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraView from '@/components/CameraView';
import ExerciseControls from '@/components/ExerciseControls';
import ProgressIndicator from '@/components/ProgressIndicator';
import Button from '@/components/Button';
import SlothAssistant from '@/components/SlothAssistant';
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
  
  // Exercise steps for structured progression
  const exerciseSteps = [
    t('exercise.steps.lookUp'),
    t('exercise.steps.lookDown'),
    t('exercise.steps.lookLeft'),
    t('exercise.steps.lookRight'),
    t('exercise.steps.lookCircular'),
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
  
  // Update exercise target position based on current step
  useEffect(() => {
    if (!isRunning) return;
    
    const moveTarget = () => {
      let newX = 50;
      let newY = 50;
      
      // Position based on current exercise step
      switch (exerciseStep % 5) {
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
          const timestamp = Date.now() / 1000;
          newX = 50 + 30 * Math.sin(timestamp);
          newY = 50 + 30 * Math.cos(timestamp);
          break;
      }
      
      setEyeTargetPosition({ x: newX, y: newY });
    };
    
    const targetInterval = setInterval(moveTarget, 100);
    return () => clearInterval(targetInterval);
  }, [isRunning, exerciseStep]);
  
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
      
      // Change exercise step every 60 seconds
      if (timeRemaining % 60 === 0 && timeRemaining > 0) {
        setExerciseStep(prev => (prev + 1) % 5);
        toast.info(exerciseSteps[(exerciseStep + 1) % 5], {
          icon: <Eye className="text-blue-500" />
        });
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining, exerciseStep, exerciseSteps]);
  
  // Handle eye detection
  const handleEyeDetected = useCallback((leftEye: boolean, rightEye: boolean) => {
    setLeftEyeDetected(leftEye);
    setRightEyeDetected(rightEye);
    
    // Provide feedback when eyes are detected
    if (!leftEyeDetected && leftEye) {
      toast.success(t('exercise.leftEyeDetected'));
    }
    if (!rightEyeDetected && rightEye) {
      toast.success(t('exercise.rightEyeDetected'));
    }
  }, [leftEyeDetected, rightEyeDetected, t]);
  
  // Handle start exercise
  const handleStart = useCallback(() => {
    if (showInstructions) {
      setShowInstructions(false);
      setSessionStarted(true);
    } else {
      setIsRunning(true);
      toast.info(exerciseSteps[exerciseStep], {
        icon: <Eye className="text-blue-500" />
      });
    }
  }, [showInstructions, exerciseStep, exerciseSteps]);
  
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
            <div className="mb-6 flex justify-center">
              <SlothAssistant message={t('exercise.sloth.welcome')} />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">{t('exercise.instructions.title')}</h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start kid-card p-3">
                <span className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center mr-3 mt-0.5 text-blue-600 font-bold">
                  1
                </span>
                <p className="text-slate-700">{t('exercise.instructions.step1')}</p>
              </li>
              <li className="flex items-start kid-card p-3">
                <span className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center mr-3 mt-0.5 text-green-600 font-bold">
                  2
                </span>
                <p className="text-slate-700">{t('exercise.instructions.step2')}</p>
              </li>
              <li className="flex items-start kid-card p-3">
                <span className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center mr-3 mt-0.5 text-amber-600 font-bold">
                  3
                </span>
                <p className="text-slate-700">{t('exercise.instructions.step3')}</p>
              </li>
            </ul>
            
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
            
            <p className="text-center mb-8 text-slate-700">
              {t('exercise.complete.message')}
            </p>
            
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
      {/* Camera View */}
      <div className="absolute inset-0">
        <CameraView 
          onEyeDetected={handleEyeDetected} 
          showGuides={sessionStarted && isRunning}
        />
      </div>
      
      {/* Current exercise instruction */}
      {isRunning && (
        <div className="absolute top-20 left-0 right-0 flex justify-center z-20">
          <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-md border border-amber-200 animate-bounce">
            <p className="font-bold text-blue-700">
              {exerciseSteps[exerciseStep % 5]}
            </p>
          </div>
        </div>
      )}
      
      {/* Exercise target that moves based on current step */}
      {isRunning && (
        <div 
          className="eye-target animate-pulse-subtle transition-all duration-1000 ease-in-out"
          style={{
            left: `${eyeTargetPosition.x}%`,
            top: `${eyeTargetPosition.y}%`,
          }}
        />
      )}
      
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
