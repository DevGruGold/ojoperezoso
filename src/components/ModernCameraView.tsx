
import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, AlertTriangle, Camera, Zap, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import { modernFaceDetection, EyeData } from '@/services/ModernFaceDetection';
import { modernCamera } from '@/services/ModernCameraService';
import TherapeuticExercises, { ExerciseResult } from './TherapeuticExercises';

interface ModernCameraViewProps {
  onEyeDetected?: (leftEye: boolean, rightEye: boolean, eyeData?: EyeData) => void;
  showGuides?: boolean;
}

const ModernCameraView = ({ onEyeDetected, showGuides = true }: ModernCameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [currentEyeData, setCurrentEyeData] = useState<EyeData | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [exerciseActive, setExerciseActive] = useState(false);
  const [currentExercise, setCurrentExercise] = useState<'saccades' | 'smooth-pursuit' | 'convergence' | 'binocular'>('saccades');
  const [cameraCapabilities, setCameraCapabilities] = useState<any>(null);

  const { t } = useLanguage();

  // Initialize modern face detection
  useEffect(() => {
    const initFaceDetection = async () => {
      try {
        const success = await modernFaceDetection.initialize();
        if (success) {
          setFaceDetectionReady(true);
          toast.success(t('exercise.modernFaceDetectionReady'));
        } else {
          setError(t('exercise.faceDetectionError'));
        }
      } catch (err) {
        console.error('Face detection initialization failed:', err);
        setError(t('exercise.faceDetectionError'));
      }
    };

    initFaceDetection();

    return () => {
      modernFaceDetection.cleanup();
    };
  }, [t]);

  // Initialize modern camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await modernCamera.initialize({
          resolution: { width: 1920, height: 1080 },
          frameRate: 30,
          facingMode: 'user'
        });

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setError(null);

          // Optimize camera for device
          await modernCamera.optimizeForDevice();
          const capabilities = modernCamera.getCapabilities();
          setCameraCapabilities(capabilities);

          toast.success(t('exercise.modernCameraReady'));
        } else {
          setError(t('exercise.cameraError'));
        }
      } catch (err) {
        console.error('Modern camera initialization failed:', err);
        setError(t('exercise.cameraError'));
      }
    };

    initCamera();

    return () => {
      modernCamera.cleanup();
    };
  }, [t]);

  // Modern face tracking loop
  useEffect(() => {
    if (!cameraReady || !faceDetectionReady || !videoRef.current) return;

    const trackFace = async () => {
      try {
        const result = await modernFaceDetection.detectFace(videoRef.current!);
        
        if (result.detected && result.eyeData) {
          setCurrentEyeData(result.eyeData);
          onEyeDetected?.(true, true, result.eyeData);
          
          // Draw enhanced visualizations
          if (canvasRef.current && containerRef.current && showGuides) {
            drawEnhancedVisualizations(result.eyeData, result.landmarks);
          }
        } else {
          setCurrentEyeData(null);
          onEyeDetected?.(false, false);
          
          // Clear canvas
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
            }
          }
        }
      } catch (err) {
        console.error('Face tracking error:', err);
      }
      
      animationFrameRef.current = requestAnimationFrame(trackFace);
    };

    trackFace();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [cameraReady, faceDetectionReady, onEyeDetected, showGuides]);

  // Enhanced visualization drawing
  const drawEnhancedVisualizations = (eyeData: EyeData, landmarks: any[] | null) => {
    if (!canvasRef.current || !containerRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw eye tracking indicators with alignment feedback
    drawEyeIndicator(ctx, eyeData.leftEye.x, eyeData.leftEye.y, 'left', eyeData.eyeAlignment);
    drawEyeIndicator(ctx, eyeData.rightEye.x, eyeData.rightEye.y, 'right', eyeData.eyeAlignment);

    // Draw gaze direction vector
    if (eyeData.gazeDirection) {
      drawGazeVector(ctx, eyeData.gazeDirection, containerWidth, containerHeight);
    }

    // Draw eye alignment meter
    drawAlignmentMeter(ctx, eyeData.eyeAlignment, containerWidth);

    // Draw blink rate indicator
    drawBlinkRateIndicator(ctx, eyeData.blinkRate, containerWidth, containerHeight);
  };

  const drawEyeIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number, side: 'left' | 'right', alignment: number) => {
    // Color based on alignment quality
    const baseHue = alignment > 0.8 ? 120 : alignment > 0.5 ? 60 : 0; // Green, Yellow, Red
    const color = `hsl(${baseHue}, 70%, 50%)`;

    ctx.save();
    ctx.shadowColor = color;
    ctx.shadowBlur = 15;

    // Draw pulsing circle
    ctx.beginPath();
    const radius = 20 + (alignment * 10);
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color + '40'; // 25% opacity
    ctx.fill();
    
    // Draw center dot
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    // Draw confidence ring
    ctx.beginPath();
    ctx.arc(x, y, radius + 5, 0, Math.PI * 2 * alignment);
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.restore();
  };

  const drawGazeVector = (ctx: CanvasRenderingContext2D, gazeDirection: {x: number, y: number}, width: number, height: number) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const vectorLength = 100;

    ctx.save();
    ctx.strokeStyle = '#00FF88';
    ctx.lineWidth = 3;
    ctx.setLineDash([5, 5]);

    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(
      centerX + gazeDirection.x * vectorLength,
      centerY + gazeDirection.y * vectorLength
    );
    ctx.stroke();

    // Draw arrowhead
    const angle = Math.atan2(gazeDirection.y, gazeDirection.x);
    const arrowX = centerX + gazeDirection.x * vectorLength;
    const arrowY = centerY + gazeDirection.y * vectorLength;

    ctx.beginPath();
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 15 * Math.cos(angle - 0.5), arrowY - 15 * Math.sin(angle - 0.5));
    ctx.moveTo(arrowX, arrowY);
    ctx.lineTo(arrowX - 15 * Math.cos(angle + 0.5), arrowY - 15 * Math.sin(angle + 0.5));
    ctx.stroke();

    ctx.restore();
  };

  const drawAlignmentMeter = (ctx: CanvasRenderingContext2D, alignment: number, width: number) => {
    const meterWidth = 200;
    const meterHeight = 20;
    const x = (width - meterWidth) / 2;
    const y = 30;

    ctx.save();
    
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(x - 5, y - 5, meterWidth + 10, meterHeight + 10);
    
    // Meter background
    ctx.fillStyle = '#333';
    ctx.fillRect(x, y, meterWidth, meterHeight);
    
    // Alignment fill
    const fillWidth = meterWidth * alignment;
    const gradient = ctx.createLinearGradient(x, y, x + meterWidth, y);
    gradient.addColorStop(0, '#FF4444');
    gradient.addColorStop(0.5, '#FFAA00');
    gradient.addColorStop(1, '#44FF44');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(x, y, fillWidth, meterHeight);
    
    // Label
    ctx.fillStyle = 'white';
    ctx.font = '14px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`Eye Alignment: ${(alignment * 100).toFixed(0)}%`, x + meterWidth / 2, y + meterHeight + 20);
    
    ctx.restore();
  };

  const drawBlinkRateIndicator = (ctx: CanvasRenderingContext2D, blinkRate: number, width: number, height: number) => {
    ctx.save();
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(width - 150, height - 60, 140, 50);
    
    ctx.fillStyle = 'white';
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`Blink Rate: ${blinkRate.toFixed(1)}/min`, width - 145, height - 35);
    ctx.fillText(`Normal: 15-20/min`, width - 145, height - 20);
    
    ctx.restore();
  };

  // Fullscreen functionality
  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error('Fullscreen toggle failed:', err);
    }
  };

  // Camera switching
  const switchCamera = async () => {
    setCameraReady(false);
    try {
      const newStream = await modernCamera.switchCamera();
      if (newStream && videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setCameraReady(true);
        toast.success(t('exercise.cameraSwitched'));
      }
    } catch (err) {
      console.error('Camera switch failed:', err);
      toast.error(t('exercise.cameraSwitchFailed'));
    }
  };

  // Exercise completion handler
  const handleExerciseComplete = (results: ExerciseResult) => {
    setExerciseActive(false);
    toast.success(`Exercise completed! Accuracy: ${(results.accuracy * 100).toFixed(0)}%`);
    console.log('Exercise results:', results);
  };

  // Canvas size sync
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      for (const entry of entries) {
        if (canvasRef.current) {
          canvasRef.current.width = entry.contentRect.width;
          canvasRef.current.height = entry.contentRect.height;
        }
      }
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="relative w-full h-full overflow-hidden bg-black">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black/90">
          <AlertTriangle className="w-16 h-16 mb-4 text-amber-500 animate-bounce" />
          <h3 className="text-2xl font-bold mb-2">{t('exercise.modernCameraError')}</h3>
          <p className="text-center text-white/80 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {t('exercise.retry')}
          </button>
        </div>
      ) : (
        <>
          {/* High-quality mirrored video */}
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              "scale-x-[-1]", // Mirror effect
              cameraReady ? "opacity-100" : "opacity-0"
            )}
            playsInline
            muted
            autoPlay
          />

          {/* Enhanced overlay canvas */}
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1] z-10"
          />

          {/* Therapeutic exercises overlay */}
          <TherapeuticExercises
            currentEyeData={currentEyeData || undefined}
            onExerciseComplete={handleExerciseComplete}
            exerciseType={currentExercise}
            isActive={exerciseActive}
          />

          {/* Modern control panel */}
          <div className="absolute top-4 right-4 space-y-2 z-30">
            <button
              onClick={toggleFullscreen}
              className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
              title="Toggle Fullscreen"
            >
              <Zap className="w-5 h-5" />
            </button>
            
            {cameraCapabilities && (
              <button
                onClick={switchCamera}
                className="p-3 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors backdrop-blur-sm"
                title="Switch Camera"
              >
                <RotateCcw className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Exercise controls */}
          <div className="absolute bottom-4 left-4 space-x-2 z-30">
            <button
              onClick={() => setExerciseActive(!exerciseActive)}
              className={cn(
                "px-4 py-2 rounded-lg font-medium transition-colors",
                exerciseActive 
                  ? "bg-red-500 text-white hover:bg-red-600" 
                  : "bg-green-500 text-white hover:bg-green-600"
              )}
            >
              {exerciseActive ? 'Stop Exercise' : 'Start Exercise'}
            </button>
            
            <select
              value={currentExercise}
              onChange={(e) => setCurrentExercise(e.target.value as any)}
              className="px-3 py-2 bg-black/50 text-white rounded-lg backdrop-blur-sm border border-white/20"
              disabled={exerciseActive}
            >
              <option value="saccades">Saccades</option>
              <option value="smooth-pursuit">Smooth Pursuit</option>
              <option value="convergence">Convergence</option>
              <option value="binocular">Binocular</option>
            </select>
          </div>

          {/* Loading states */}
          {!faceDetectionReady && cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
              <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/30">
                <div className="animate-spin w-12 h-12 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
                <p className="text-white text-lg font-medium">{t('exercise.loadingModernFaceDetection')}</p>
              </div>
            </div>
          )}

          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-20">
              <div className="text-center p-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/30">
                <Camera className="w-16 h-16 text-white/80 animate-pulse mx-auto mb-4" />
                <p className="text-white text-xl font-medium">{t('exercise.startingModernCamera')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ModernCameraView;
