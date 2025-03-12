
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import CameraView from '@/components/CameraView';
import ExerciseControls from '@/components/ExerciseControls';
import ProgressIndicator from '@/components/ProgressIndicator';
import Button from '@/components/Button';
import { Eye, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { downloadFaceModels } from '@/utils/downloadFaceModels';
import { useLanguage } from '@/contexts/LanguageContext';

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
  
  // Download face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      const result = await downloadFaceModels();
      setModelsLoaded(result);
    };
    
    loadModels();
  }, []);
  
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
    }, 1000);
    
    return () => clearInterval(timer);
  }, [isRunning, timeRemaining]);
  
  // Handle eye detection
  const handleEyeDetected = useCallback((leftEye: boolean, rightEye: boolean) => {
    setLeftEyeDetected(leftEye);
    setRightEyeDetected(rightEye);
  }, []);
  
  // Handle start exercise
  const handleStart = useCallback(() => {
    if (showInstructions) {
      setShowInstructions(false);
      setSessionStarted(true);
    } else {
      setIsRunning(true);
    }
  }, [showInstructions]);
  
  // Handle pause exercise
  const handlePause = useCallback(() => {
    setIsRunning(false);
  }, []);
  
  // Handle end exercise
  const handleEnd = useCallback(() => {
    if (window.confirm('¿Estás seguro que deseas finalizar el ejercicio?')) {
      navigate('/');
    }
  }, [navigate]);
  
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
  }, []);
  
  // Renders based on application state
  const renderContent = () => {
    if (showInstructions) {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="glass max-w-lg mx-auto p-8 rounded-2xl animate-scale-up">
            <div className="mb-6 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Eye className="w-8 h-8 text-primary" />
              </div>
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-center">Instrucciones del ejercicio</h2>
            
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold">1</span>
                </span>
                <p>Mantén tu cabeza estable y a una distancia cómoda de la pantalla.</p>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold">2</span>
                </span>
                <p>Sigue con ambos ojos los objetivos visuales que aparecerán en pantalla.</p>
              </li>
              <li className="flex items-start">
                <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-xs font-semibold">3</span>
                </span>
                <p>Completa la sesión de 5 minutos para obtener mejores resultados.</p>
              </li>
            </ul>
            
            <div className="flex justify-center">
              <Button onClick={handleStart}>
                Comenzar ejercicio
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    if (sessionComplete) {
      return (
        <div className="fixed inset-0 flex items-center justify-center z-20 bg-black/80">
          <div className="glass max-w-lg mx-auto p-8 rounded-2xl animate-scale-up">
            <div className="flex justify-center mb-6">
              <ProgressIndicator progress={100} size="lg" />
            </div>
            
            <h2 className="text-2xl font-bold mb-4 text-center">¡Ejercicio completado!</h2>
            
            <p className="text-center mb-8">
              Has completado con éxito una sesión de entrenamiento para tu ojo perezoso.
              La práctica constante es clave para ver mejoras significativas.
            </p>
            
            <div className="grid grid-cols-2 gap-4">
              <Button variant="secondary" onClick={handleReturnHome}>
                Volver al inicio
              </Button>
              <Button onClick={handleNewSession}>
                Nuevo ejercicio
              </Button>
            </div>
          </div>
        </div>
      );
    }
    
    return null;
  };
  
  return (
    <div className="fixed inset-0 bg-black">
      {/* Camera View */}
      <div className="absolute inset-0">
        <CameraView 
          onEyeDetected={handleEyeDetected} 
          showGuides={sessionStarted && isRunning}
        />
      </div>
      
      {/* Exercise target that moves around (would be enhanced with proper eye tracking) */}
      {isRunning && (
        <div 
          className="eye-target animate-pulse-subtle transition-all duration-1000 ease-in-out"
          style={{
            left: `calc(40% + ${Math.sin(Date.now() / 1000) * 20}%)`,
            top: `calc(40% + ${Math.cos(Date.now() / 1500) * 20}%)`,
          }}
        />
      )}
      
      {/* Top Navigation */}
      <div className="absolute top-6 left-6 z-10">
        <Button 
          variant="ghost" 
          className="bg-black/30 text-white hover:bg-black/50"
          onClick={() => navigate('/')}
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver
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
