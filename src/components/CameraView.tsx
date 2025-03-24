import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye, AlertTriangle, Camera } from 'lucide-react';
import * as faceapi from 'face-api.js';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';

interface CameraViewProps {
  onEyeDetected?: (leftEye: boolean, rightEye: boolean) => void;
  showGuides?: boolean;
}

const CameraView = ({ onEyeDetected, showGuides = true }: CameraViewProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const { t } = useLanguage();
  
  // Load face-api.js models
  useEffect(() => {
    const loadModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models')
        ]);
        setModelsLoaded(true);
        console.log('Face detection models loaded');
      } catch (err) {
        console.error('Error loading face detection models:', err);
        setError(t('exercise.modelsError'));
        
        // Still allow the app to function without eye tracking
        if (onEyeDetected) {
          // Simulate eye detection with a delay for testing
          setTimeout(() => {
            onEyeDetected(true, true);
          }, 3000);
        }
      }
    };
    
    // Create models directory if it doesn't exist
    const createModelsDirectory = async () => {
      try {
        // Check if models directory exists
        const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json', { method: 'HEAD' });
        if (response.status === 404) {
          setError(t('exercise.modelsError'));
          // We still need to try to download the models
          await loadModels();
        } else {
          await loadModels();
        }
      } catch (err) {
        console.error('Error checking models directory:', err);
        setError(t('exercise.modelsError'));
        await loadModels();
      }
    };
    
    createModelsDirectory();
  }, [t, onEyeDetected]);
  
  // Initialize the camera with high resolution
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initCamera = async () => {
      try {
        // Request camera with highest possible resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 3840 }, // 4K
            height: { ideal: 2160 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play()
            .then(() => {
              setCameraReady(true);
              setError(null);
              toast.success(t('exercise.cameraReady'));
            })
            .catch(err => {
              console.error('Error playing video:', err);
              setError(t('exercise.cameraError'));
            });
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError(t('exercise.cameraError'));
        
        // Simulate eye detection if camera fails
        if (onEyeDetected) {
          setTimeout(() => {
            onEyeDetected(true, true);
          }, 3000);
        }
      }
    };
    
    initCamera();
    
    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [t, onEyeDetected]);
  
  // Track eyes using face-api.js
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || !onEyeDetected || !videoRef.current) return;
    
    let animationId: number;
    let frameCount = 0;
    let detectionSuccess = false;
    
    const trackEyes = async () => {
      frameCount++;
      
      // Process every few frames to improve performance
      if (frameCount % 5 === 0 && videoRef.current) {
        try {
          // Detect faces with landmarks
          const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.5 })
          ).withFaceLandmarks();
          
          if (detections && detections.length > 0) {
            const faceDetection = detections[0]; // Use the first face detected
            const landmarks = faceDetection.landmarks;
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            
            // Check if both eyes are detected
            const leftEyeDetected = leftEye.length > 0;
            const rightEyeDetected = rightEye.length > 0;
            
            // Update eye detection state
            onEyeDetected(leftEyeDetected, rightEyeDetected);
            
            if (!detectionSuccess && (leftEyeDetected || rightEyeDetected)) {
              detectionSuccess = true;
              toast.success(t('exercise.eyesDetected'));
            }
            
            // Draw eye positions if showGuides is true
            if (canvasRef.current && containerRef.current && showGuides) {
              const ctx = canvasRef.current.getContext('2d');
              const containerWidth = containerRef.current.clientWidth;
              const containerHeight = containerRef.current.clientHeight;
              
              if (ctx) {
                // Clear previous frames
                ctx.clearRect(0, 0, containerWidth, containerHeight);
                
                // Calculate center point of each eye
                const leftEyeCenter = leftEye.length > 0 ? {
                  x: leftEye.reduce((sum, pt) => sum + pt.x, 0) / leftEye.length,
                  y: leftEye.reduce((sum, pt) => sum + pt.y, 0) / leftEye.length
                } : null;
                
                const rightEyeCenter = rightEye.length > 0 ? {
                  x: rightEye.reduce((sum, pt) => sum + pt.x, 0) / rightEye.length,
                  y: rightEye.reduce((sum, pt) => sum + pt.y, 0) / rightEye.length
                } : null;
                
                // Scale coordinates to canvas size
                const scaleX = containerWidth / videoRef.current.videoWidth;
                const scaleY = containerHeight / videoRef.current.videoHeight;
                
                // Draw kid-friendly eye indicators
                if (leftEyeCenter) {
                  const scaledLeftEye = {
                    x: leftEyeCenter.x * scaleX,
                    y: leftEyeCenter.y * scaleY
                  };
                  drawKidFriendlyEyeIndicator(ctx, scaledLeftEye.x, scaledLeftEye.y, 'left');
                }
                
                if (rightEyeCenter) {
                  const scaledRightEye = {
                    x: rightEyeCenter.x * scaleX,
                    y: rightEyeCenter.y * scaleY
                  };
                  drawKidFriendlyEyeIndicator(ctx, scaledRightEye.x, scaledRightEye.y, 'right');
                }
              }
            }
          } else {
            // No face detected
            onEyeDetected(false, false);
            
            if (canvasRef.current && containerRef.current) {
              const ctx = canvasRef.current.getContext('2d');
              if (ctx) {
                ctx.clearRect(0, 0, containerRef.current.clientWidth, containerRef.current.clientHeight);
              }
            }
          }
        } catch (err) {
          console.error('Error during face detection:', err);
          onEyeDetected(false, false);
        }
      }
      
      animationId = requestAnimationFrame(trackEyes);
    };
    
    trackEyes();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cameraReady, modelsLoaded, onEyeDetected, showGuides, t]);
  
  // Keep canvas size synced with container
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
    
    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);
  
  // Draw kid-friendly eye indicator helper function
  const drawKidFriendlyEyeIndicator = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number,
    side: 'left' | 'right'
  ) => {
    // Define colors for kid-friendly theme
    const colors = {
      left: {
        primary: '#4299E1', // blue
        secondary: '#90CDF4'
      },
      right: {
        primary: '#68D391', // green
        secondary: '#9AE6B4'
      }
    };
    
    const color = colors[side];
    
    // Draw star shape
    ctx.save();
    ctx.beginPath();
    
    // Add glow effect
    ctx.shadowColor = color.primary;
    ctx.shadowBlur = 10;
    
    // Draw sparkly star (simple version)
    const outerRadius = 25;
    const innerRadius = 10;
    const spikes = 5;
    
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const radius = i % 2 === 0 ? outerRadius : innerRadius;
      const angle = (Math.PI * i) / spikes;
      const circleX = x + radius * Math.sin(angle);
      const circleY = y + radius * Math.cos(angle);
      
      if (i === 0) {
        ctx.moveTo(circleX, circleY);
      } else {
        ctx.lineTo(circleX, circleY);
      }
    }
    ctx.closePath();
    
    // Fill with gradient
    const gradient = ctx.createRadialGradient(x, y, innerRadius / 2, x, y, outerRadius);
    gradient.addColorStop(0, color.secondary);
    gradient.addColorStop(1, color.primary);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // Add edge
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Add center dot
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'white';
    ctx.fill();
    
    ctx.restore();
  };
  
  return (
    <div 
      ref={containerRef}
      className="camera-container w-full h-full overflow-hidden bg-gradient-to-b from-blue-50 to-purple-50"
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black/70">
          <AlertTriangle className="w-12 h-12 mb-4 text-amber-500 animate-bounce" />
          <h3 className="text-xl font-semibold mb-2">{t('exercise.cameraError')}</h3>
          <p className="text-center text-white/80 mb-4">{error}</p>
          <p className="text-center text-white/80 mb-4">
            {t('exercise.continueWithoutCamera')}
          </p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              "scale-x-[-1]", // Mirror the video
              cameraReady ? "opacity-100" : "opacity-0"
            )}
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className="camera-overlay absolute top-0 left-0 w-full h-full animate-fade-in pointer-events-none scale-x-[-1]" // Mirror the canvas too
          />
          {!modelsLoaded && cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
                <p className="text-white text-lg font-medium">{t('exercise.loadingModels')}</p>
              </div>
            </div>
          )}
          {!cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
              <div className="text-center p-4 bg-white/20 backdrop-blur-md rounded-xl border border-white/30 shadow-lg">
                <Camera className="w-10 h-10 text-white/80 animate-pulse mx-auto mb-3" />
                <p className="text-white text-lg font-medium">{t('exercise.startingCamera')}</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraView;
