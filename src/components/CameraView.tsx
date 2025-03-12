import { useState, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { Eye } from 'lucide-react';

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
  
  // Simulate eye detection (in a real app, this would use proper ML eye tracking)
  useEffect(() => {
    if (!cameraReady || !onEyeDetected) return;
    
    let animationId: number;
    let frameCount = 0;
    
    const simulateEyeDetection = () => {
      frameCount++;
      
      // Simulate detection results every 30 frames (about once per second at 30fps)
      if (frameCount % 30 === 0) {
        // For demo purposes, randomly detect eyes 80% of the time
        const leftEyeDetected = Math.random() > 0.2;
        const rightEyeDetected = Math.random() > 0.2;
        
        onEyeDetected(leftEyeDetected, rightEyeDetected);
        
        // If we have a canvas and both eyes detected, draw eye positions (simulated)
        if (canvasRef.current && containerRef.current && leftEyeDetected && rightEyeDetected) {
          const ctx = canvasRef.current.getContext('2d');
          const containerWidth = containerRef.current.clientWidth;
          const containerHeight = containerRef.current.clientHeight;
          
          if (ctx) {
            // Clear previous frames
            ctx.clearRect(0, 0, containerWidth, containerHeight);
            
            // Only draw guides if showGuides is true
            if (showGuides) {
              // Left eye position (simulated)
              const leftEyeX = containerWidth * 0.35;
              const leftEyeY = containerHeight * 0.4;
              
              // Right eye position (simulated)
              const rightEyeX = containerWidth * 0.65;
              const rightEyeY = containerHeight * 0.4;
              
              // Draw eye detection indicators
              drawEyeIndicator(ctx, leftEyeX, leftEyeY);
              drawEyeIndicator(ctx, rightEyeX, rightEyeY);
            }
          }
        }
      }
      
      animationId = requestAnimationFrame(simulateEyeDetection);
    };
    
    simulateEyeDetection();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [cameraReady, onEyeDetected, showGuides]);
  
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
            className="camera-overlay animate-fade-in"
            width="1280" 
            height="720"
          />
        </>
      )}
    </div>
  );
};

export default CameraView;
