import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';
import * as faceapi from 'face-api.js';

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
        setError('Error loading face tracking models. Please reload the page.');
      }
    };
    
    // Create models directory if it doesn't exist
    const createModelsDirectory = async () => {
      try {
        // Check if models directory exists
        const response = await fetch('/models/tiny_face_detector_model-weights_manifest.json', { method: 'HEAD' });
        if (response.status === 404) {
          setError('Face detection models not found. Downloading...');
          // We need to download the models
          await loadModels();
        } else {
          await loadModels();
        }
      } catch (err) {
        console.error('Error checking models directory:', err);
        await loadModels();
      }
    };
    
    createModelsDirectory();
  }, []);
  
  // Initialize the camera
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const initCamera = async () => {
      try {
        // Request camera with high resolution
        stream = await navigator.mediaDevices.getUserMedia({
          video: { 
            facingMode: 'user',
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setError(null);
        }
      } catch (err) {
        console.error('Error accessing camera:', err);
        setError('No pudimos acceder a tu cámara. Por favor, da permiso y recarga la página.');
      }
    };
    
    initCamera();
    
    // Cleanup
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);
  
  // Track eyes using face-api.js
  useEffect(() => {
    if (!cameraReady || !modelsLoaded || !onEyeDetected || !videoRef.current) return;
    
    let animationId: number;
    let frameCount = 0;
    
    const trackEyes = async () => {
      frameCount++;
      
      // Process every few frames to improve performance
      if (frameCount % 3 === 0 && videoRef.current) {
        try {
          // Detect faces with landmarks
          const detections = await faceapi.detectAllFaces(
            videoRef.current, 
            new faceapi.TinyFaceDetectorOptions()
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
            
            // Draw eye positions if both eyes detected and showGuides is true
            if (canvasRef.current && containerRef.current && leftEyeDetected && rightEyeDetected && showGuides) {
              const ctx = canvasRef.current.getContext('2d');
              const containerWidth = containerRef.current.clientWidth;
              const containerHeight = containerRef.current.clientHeight;
              
              if (ctx) {
                // Clear previous frames
                ctx.clearRect(0, 0, containerWidth, containerHeight);
                
                // Calculate center point of each eye
                const leftEyeCenter = {
                  x: leftEye.reduce((sum, pt) => sum + pt.x, 0) / leftEye.length,
                  y: leftEye.reduce((sum, pt) => sum + pt.y, 0) / leftEye.length
                };
                
                const rightEyeCenter = {
                  x: rightEye.reduce((sum, pt) => sum + pt.x, 0) / rightEye.length,
                  y: rightEye.reduce((sum, pt) => sum + pt.y, 0) / rightEye.length
                };
                
                // Scale coordinates to canvas size
                const scaleX = containerWidth / videoRef.current.videoWidth;
                const scaleY = containerHeight / videoRef.current.videoHeight;
                
                const scaledLeftEye = {
                  x: leftEyeCenter.x * scaleX,
                  y: leftEyeCenter.y * scaleY
                };
                
                const scaledRightEye = {
                  x: rightEyeCenter.x * scaleX,
                  y: rightEyeCenter.y * scaleY
                };
                
                // Draw eye detection indicators
                drawEyeIndicator(ctx, scaledLeftEye.x, scaledLeftEye.y);
                drawEyeIndicator(ctx, scaledRightEye.x, scaledRightEye.y);
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
  }, [cameraReady, modelsLoaded, onEyeDetected, showGuides]);
  
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
  
  // Draw eye indicator helper function
  const drawEyeIndicator = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Outer ring
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(59, 130, 246, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // Inner ring with pulse animation
    ctx.beginPath();
    ctx.arc(x, y, 15, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    ctx.fill();
    
    // Center dot
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(59, 130, 246, 0.7)';
    ctx.fill();
  };
  
  return (
    <div 
      ref={containerRef}
      className="camera-container w-full h-full overflow-hidden rounded-2xl bg-black"
    >
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black/90">
          <Eye className="w-12 h-12 mb-4 text-red-500" />
          <h3 className="text-xl font-semibold mb-2">Error de cámara</h3>
          <p className="text-center text-white/80 mb-4">{error}</p>
        </div>
      ) : (
        <>
          <video
            ref={videoRef}
            className={cn(
              "w-full h-full object-cover transition-opacity duration-1000",
              cameraReady ? "opacity-100" : "opacity-0"
            )}
            playsInline
            muted
          />
          <canvas 
            ref={canvasRef}
            className="camera-overlay absolute top-0 left-0 w-full h-full animate-fade-in pointer-events-none"
          />
          {!modelsLoaded && cameraReady && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70">
              <div className="text-center p-4">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mb-4 mx-auto"></div>
                <p className="text-white">Cargando modelos de detección facial...</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CameraView;
