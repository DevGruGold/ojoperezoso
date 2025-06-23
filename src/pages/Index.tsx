
import { useEffect, useRef, useState } from 'react';
import { modernCamera } from '@/services/ModernCameraService';
import { modernFaceDetection, EyeData } from '@/services/ModernFaceDetection';
import { toast } from 'sonner';

const Index = () => {
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [faceDetectionReady, setFaceDetectionReady] = useState(false);
  const [currentEyeData, setCurrentEyeData] = useState<EyeData | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const animationFrameRef = useRef<number>();
  const [showControls, setShowControls] = useState(false);
  
  // Initialize face detection
  useEffect(() => {
    const initFaceDetection = async () => {
      try {
        const success = await modernFaceDetection.initialize();
        if (success) {
          setFaceDetectionReady(true);
          console.log('Face detection ready');
        } else {
          console.error('Face detection failed to initialize');
        }
      } catch (err) {
        console.error('Face detection initialization failed:', err);
      }
    };

    initFaceDetection();

    return () => {
      modernFaceDetection.cleanup();
    };
  }, []);
  
  // Initialize camera immediately with high quality settings
  useEffect(() => {
    const initCamera = async () => {
      try {
        const stream = await modernCamera.initialize({
          resolution: { width: 1920, height: 1080 },
          frameRate: 60,
          facingMode: 'user'
        });

        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          setCameraReady(true);
          setError(null);

          // Optimize camera for device
          await modernCamera.optimizeForDevice();
          toast.success('High-quality camera ready');
        } else {
          setError('Camera access failed');
        }
      } catch (err) {
        console.error('Camera initialization failed:', err);
        setError('Camera access denied or unavailable');
      }
    };

    initCamera();

    return () => {
      modernCamera.cleanup();
    };
  }, []);

  // Face tracking loop
  useEffect(() => {
    if (!cameraReady || !faceDetectionReady || !videoRef.current) return;

    const trackFace = async () => {
      try {
        const result = await modernFaceDetection.detectFace(videoRef.current!);
        
        if (result.detected && result.eyeData) {
          setCurrentEyeData(result.eyeData);
          
          // Draw eye indicators
          if (canvasRef.current && containerRef.current) {
            drawEyeIndicators(result.eyeData);
          }
        } else {
          setCurrentEyeData(null);
          
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
  }, [cameraReady, faceDetectionReady]);

  // Draw minimal eye indicators
  const drawEyeIndicators = (eyeData: EyeData) => {
    if (!canvasRef.current || !containerRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Draw simple eye circles
    const drawEyeCircle = (x: number, y: number, side: 'left' | 'right') => {
      ctx.save();
      
      // Convert video coordinates to canvas coordinates
      const canvasX = (x / (videoRef.current?.videoWidth || 1)) * containerWidth;
      const canvasY = (y / (videoRef.current?.videoHeight || 1)) * containerHeight;
      
      // Draw outer circle
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 25, 0, Math.PI * 2);
      ctx.strokeStyle = '#00FF88';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw center dot
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00FF88';
      ctx.fill();
      
      // Label
      ctx.fillStyle = '#00FF88';
      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(side === 'left' ? 'L' : 'R', canvasX, canvasY - 35);
      
      ctx.restore();
    };

    // Draw both eyes
    drawEyeCircle(eyeData.leftEye.x, eyeData.leftEye.y, 'left');
    drawEyeCircle(eyeData.rightEye.x, eyeData.rightEye.y, 'right');

    // Draw alignment indicator
    if (eyeData.eyeAlignment > 0.8) {
      ctx.fillStyle = '#00FF88';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Eyes Aligned ✓', containerWidth / 2, 50);
    }
  };

  // Canvas size sync
  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const resizeCanvas = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  // Request fullscreen immediately for immersive experience
  useEffect(() => {
    const requestFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen && !document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
        }
      } catch (err) {
        console.log('Fullscreen not available');
      }
    };

    // Delay to avoid blocking page load
    setTimeout(requestFullscreen, 1000);
  }, []);

  const switchCamera = async () => {
    setCameraReady(false);
    try {
      const newStream = await modernCamera.switchCamera();
      if (newStream && videoRef.current) {
        videoRef.current.srcObject = newStream;
        await videoRef.current.play();
        setCameraReady(true);
        toast.success('Camera switched');
      }
    } catch (err) {
      console.error('Camera switch failed:', err);
      toast.error('Camera switch failed');
    }
  };
  
  return (
    <div ref={containerRef} className="min-h-screen w-full bg-black overflow-hidden">
      {error ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-white bg-black">
          <h3 className="text-2xl font-bold mb-4">Camera Access Required</h3>
          <p className="text-center text-white/80 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      ) : (
        <>
          {/* Full-screen mirrored video - the main therapeutic interface */}
          <video
            ref={videoRef}
            className="w-full h-screen object-cover scale-x-[-1]"
            playsInline
            muted  
            autoPlay
            style={{ 
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              objectFit: 'cover'
            }}
          />

          {/* Eye tracking overlay canvas */}
          <canvas 
            ref={canvasRef}
            className="absolute top-0 left-0 w-full h-full pointer-events-none scale-x-[-1] z-10"
          />

          {/* Minimal overlay controls - hidden by default for clean experience */}
          {showControls && (
            <div className="absolute top-4 right-4 space-y-2 z-10">
              <button
                onClick={switchCamera}
                className="p-3 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm"
                title="Switch Camera"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M15 3h4a2 2 0 0 1 2 2v4m-6 0V4a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2v5"/>
                  <path d="M15 12v5a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2v-5"/>
                  <path d="M9 12h6"/>
                </svg>
              </button>
              
              <button
                onClick={() => setShowControls(false)}
                className="p-3 bg-black/30 text-white rounded-full hover:bg-black/50 transition-colors backdrop-blur-sm"
                title="Hide Controls"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          )}

          {/* Eye tracking status indicator */}
          {currentEyeData && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm z-10">
              <div className="text-sm space-y-1">
                <div>👁️ Eyes Detected</div>
                <div>Alignment: {(currentEyeData.eyeAlignment * 100).toFixed(0)}%</div>
              </div>
            </div>
          )}

          {/* Tap anywhere to show controls when needed */}
          {!showControls && (
            <button 
              onClick={() => setShowControls(true)}
              className="absolute inset-0 w-full h-full bg-transparent z-5"
              aria-label="Show controls"
            />
          )}

          {/* Loading state - clean and minimal */}
          {!cameraReady && !error && (
            <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
              <div className="text-center">
                <div className="animate-spin w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4 mx-auto"></div>
                <p className="text-white text-xl font-medium">Starting high-quality camera...</p>
              </div>
            </div>
          )}

          {/* Face detection loading */}
          {cameraReady && !faceDetectionReady && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/50 text-white px-4 py-2 rounded-lg z-10">
              <p className="text-sm">Loading eye detection...</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Index;
