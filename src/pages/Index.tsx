import { useEffect, useRef, useState } from 'react';
import { modernCamera } from '@/services/ModernCameraService';
import { modernFaceDetection, EyeData } from '@/services/ModernFaceDetection';
import { toast } from 'sonner';
import ExerciseControls from '@/components/ExerciseControls';

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
  const [exerciseActive, setExerciseActive] = useState(false);
  const [currentExerciseStep, setCurrentExerciseStep] = useState(0);
  const [exerciseType, setExerciseType] = useState<'saccades' | 'pursuit' | 'focus'>('saccades');
  
  // Eye deviation tracking for lazy eye detection
  const [eyeDeviationHistory, setEyeDeviationHistory] = useState<number[]>([]);
  const [lazyEyeDetected, setLazyEyeDetected] = useState<'none' | 'left' | 'right'>('none');
  
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

  // Face tracking loop with improved eye detection
  useEffect(() => {
    if (!cameraReady || !faceDetectionReady || !videoRef.current) return;

    const trackFace = async () => {
      try {
        const result = await modernFaceDetection.detectFace(videoRef.current!);
        
        if (result.detected && result.eyeData) {
          setCurrentEyeData(result.eyeData);
          
          // Improved eye deviation calculation
          const eyeDeviation = calculateImprovedEyeDeviation(result.eyeData);
          setEyeDeviationHistory(prev => [...prev.slice(-60), eyeDeviation]); // Extended history
          
          // Enhanced lazy eye detection
          detectLazyEyeImproved(eyeDeviationHistory, result.eyeData);
          
          // Draw improved eye indicators
          if (canvasRef.current && containerRef.current) {
            drawImprovedEyeIndicators(result.eyeData);
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
  }, [cameraReady, faceDetectionReady, eyeDeviationHistory]);

  // Improved eye deviation calculation with multiple factors
  const calculateImprovedEyeDeviation = (eyeData: EyeData): number => {
    const leftEye = eyeData.leftEye;
    const rightEye = eyeData.rightEye;
    
    // 1. Vertical alignment (eyes should be on same horizontal line)
    const verticalDeviation = Math.abs(leftEye.y - rightEye.y);
    
    // 2. Symmetry relative to face center
    const faceCenter = (videoRef.current?.videoWidth || 640) / 2;
    const eyeCenter = (leftEye.x + rightEye.x) / 2;
    const horizontalSymmetryDeviation = Math.abs(eyeCenter - faceCenter);
    
    // 3. Eye distance consistency (should maintain normal interpupillary distance)
    const eyeDistance = Math.abs(rightEye.x - leftEye.x);
    const normalEyeDistance = 60; // approximate pixels for normal distance
    const distanceDeviation = Math.abs(eyeDistance - normalEyeDistance);
    
    // Weighted combination of factors
    return (verticalDeviation * 2) + (horizontalSymmetryDeviation * 0.5) + (distanceDeviation * 0.3);
  };

  // Enhanced lazy eye detection with more sophisticated analysis
  const detectLazyEyeImproved = (deviationHistory: number[], currentEyeData: EyeData) => {
    if (deviationHistory.length < 60) return; // Need more data
    
    const recentHistory = deviationHistory.slice(-30); // Last 30 frames
    const avgDeviation = recentHistory.reduce((sum, dev) => sum + dev, 0) / recentHistory.length;
    const threshold = 12; // Tightened threshold for better detection
    
    if (avgDeviation > threshold && currentEyeData) {
      // Analyze which eye is more deviated
      const leftEyeVerticalPos = currentEyeData.leftEye.y;
      const rightEyeVerticalPos = currentEyeData.rightEye.y;
      const verticalDiff = leftEyeVerticalPos - rightEyeVerticalPos;
      
      // Consider horizontal positioning relative to expected positions
      const leftEyeExpectedX = (videoRef.current?.videoWidth || 640) * 0.35;
      const rightEyeExpectedX = (videoRef.current?.videoWidth || 640) * 0.65;
      
      const leftEyeHorizontalDeviation = Math.abs(currentEyeData.leftEye.x - leftEyeExpectedX);
      const rightEyeHorizontalDeviation = Math.abs(currentEyeData.rightEye.x - rightEyeExpectedX);
      
      // Determine lazy eye based on combined vertical and horizontal deviations
      if (Math.abs(verticalDiff) > 8 || leftEyeHorizontalDeviation > rightEyeHorizontalDeviation + 15) {
        setLazyEyeDetected(verticalDiff > 0 ? 'left' : 'right');
      } else if (rightEyeHorizontalDeviation > leftEyeHorizontalDeviation + 15) {
        setLazyEyeDetected('right');
      } else {
        setLazyEyeDetected('none');
      }
    } else {
      setLazyEyeDetected('none');
    }
  };

  // Improved eye indicator drawing with corrected text direction
  const drawImprovedEyeIndicators = (eyeData: EyeData) => {
    if (!canvasRef.current || !containerRef.current) return;

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;

    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;

    ctx.clearRect(0, 0, containerWidth, containerHeight);

    // Improved eye circle drawing with precise centering
    const drawPreciseEyeCircle = (x: number, y: number, side: 'left' | 'right') => {
      ctx.save();
      
      // More accurate coordinate conversion with offset correction
      const scaleX = containerWidth / (videoRef.current?.videoWidth || 1);
      const scaleY = containerHeight / (videoRef.current?.videoHeight || 1);
      
      // Apply centering offset to better align with actual pupil
      const offsetX = side === 'left' ? -2 : 2; // Fine-tune based on eye
      const offsetY = -3; // Slight upward adjustment for better pupil alignment
      
      const canvasX = (x * scaleX) + offsetX;
      const canvasY = (y * scaleY) + offsetY;
      
      // Determine eye health status
      const isLazy = lazyEyeDetected === side;
      const baseColor = isLazy ? '#FF3333' : '#00FF66';
      
      // Draw outer detection ring with improved visibility
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, isLazy ? 40 : 30, 0, Math.PI * 2);
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = isLazy ? 4 : 3;
      if (isLazy) {
        ctx.setLineDash([8, 4]);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      
      // Draw inner pupil indicator - smaller and more precise
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, 3, 0, Math.PI * 2);
      ctx.fillStyle = baseColor;
      ctx.fill();
      
      // Draw crosshair for precise center marking
      ctx.setLineDash([]);
      ctx.strokeStyle = baseColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(canvasX - 6, canvasY);
      ctx.lineTo(canvasX + 6, canvasY);
      ctx.moveTo(canvasX, canvasY - 6);
      ctx.lineTo(canvasX, canvasY + 6);
      ctx.stroke();
      
      // Enhanced labeling with drift warning - fix text mirroring
      ctx.save();
      // Counter the canvas horizontal flip for text
      ctx.scale(-1, 1);
      ctx.translate(-containerWidth, 0);
      
      ctx.fillStyle = baseColor;
      ctx.font = isLazy ? 'bold 16px sans-serif' : 'bold 14px sans-serif';
      ctx.textAlign = 'center';
      const label = side === 'left' ? 'R' : 'L'; // Corrected for mirror
      const warningText = isLazy ? `${label} (DRIFT)` : label;
      ctx.fillText(warningText, containerWidth - canvasX, canvasY - 50);
      
      ctx.restore();
      ctx.restore();
    };

    // Draw both eyes with improved accuracy
    drawPreciseEyeCircle(eyeData.leftEye.x, eyeData.leftEye.y, 'left');
    drawPreciseEyeCircle(eyeData.rightEye.x, eyeData.rightEye.y, 'right');

    // Enhanced alignment status with drift severity - fix text mirroring
    ctx.save();
    // Counter the canvas horizontal flip for text
    ctx.scale(-1, 1);
    ctx.translate(-containerWidth, 0);
    
    const alignmentColor = lazyEyeDetected !== 'none' ? '#FF3333' : '#00FF66';
    if (eyeData.eyeAlignment > 0.85 && lazyEyeDetected === 'none') {
      ctx.fillStyle = alignmentColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('✓ EYES ALIGNED', containerWidth / 2, 60);
    } else if (lazyEyeDetected !== 'none') {
      ctx.fillStyle = alignmentColor;
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      const driftSeverity = eyeDeviationHistory.length > 0 ? 
        eyeDeviationHistory[eyeDeviationHistory.length - 1] > 20 ? 'SEVERE' : 'MODERATE' : '';
      ctx.fillText(`⚠️ ${lazyEyeDetected.toUpperCase()} EYE ${driftSeverity} DRIFT`, containerWidth / 2, 60);
    }
    
    ctx.restore();

    // Draw exercise targets if active
    if (exerciseActive) {
      drawExerciseTargets(ctx, containerWidth, containerHeight);
    }
  };
  
  // Exercise target drawing
  const drawExerciseTargets = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    const targets = getExerciseTargets(exerciseType, currentExerciseStep, width, height);
    
    targets.forEach((target, index) => {
      ctx.save();
      
      // Draw target circle
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
      ctx.fillStyle = target.color;
      ctx.fill();
      
      // Draw target ring
      ctx.beginPath();
      ctx.arc(target.x, target.y, target.size + 5, 0, Math.PI * 2);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Draw target number - fix text mirroring
      ctx.save();
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
      
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText((index + 1).toString(), width - target.x, target.y + 5);
      
      ctx.restore();
      ctx.restore();
    });
  };

  // Get exercise targets based on type and step
  const getExerciseTargets = (type: string, step: number, width: number, height: number) => {
    const targets = [];
    
    switch (type) {
      case 'saccades':
        // Quick eye movements between corners
        const saccadePositions = [
          { x: width * 0.2, y: height * 0.2 },
          { x: width * 0.8, y: height * 0.2 },
          { x: width * 0.8, y: height * 0.8 },
          { x: width * 0.2, y: height * 0.8 },
          { x: width * 0.5, y: height * 0.5 }
        ];
        targets.push({
          ...saccadePositions[step % saccadePositions.length],
          size: 20,
          color: '#FF6B6B'
        });
        break;
        
      case 'pursuit':
        // Smooth following movement
        const angle = (step * 0.1) % (Math.PI * 2);
        targets.push({
          x: width * 0.5 + Math.cos(angle) * width * 0.3,
          y: height * 0.5 + Math.sin(angle) * height * 0.3,
          size: 15,
          color: '#4ECDC4'
        });
        break;
        
      case 'focus':
        // Near-far focusing
        const focusSize = 10 + (Math.sin(step * 0.05) + 1) * 15;
        targets.push({
          x: width * 0.5,
          y: height * 0.5,
          size: focusSize,
          color: '#45B7D1'
        });
        break;
    }
    
    return targets;
  };

  // Exercise controls
  const startExercise = (type: 'saccades' | 'pursuit' | 'focus') => {
    setExerciseType(type);
    setExerciseActive(true);
    setCurrentExerciseStep(0);
    toast.success(`Starting ${type} exercise`);
  };

  const stopExercise = () => {
    setExerciseActive(false);
    toast.success('Exercise completed');
  };

  // Auto-advance exercise steps
  useEffect(() => {
    if (!exerciseActive) return;
    
    const interval = setInterval(() => {
      setCurrentExerciseStep(prev => prev + 1);
    }, exerciseType === 'saccades' ? 2000 : exerciseType === 'pursuit' ? 100 : 1000);
    
    return () => clearInterval(interval);
  }, [exerciseActive, exerciseType]);

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
          {/* Full-screen mirrored video */}
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

          {/* Exercise Controls */}
          {showControls && (
            <div className="absolute top-4 left-4 space-y-2 z-20">
              <div className="bg-black/70 text-white p-4 rounded-lg backdrop-blur-sm">
                <h3 className="font-bold mb-2">Eye Exercises</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => startExercise('saccades')}
                    disabled={exerciseActive}
                    className="w-full px-3 py-2 bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
                  >
                    Saccades (Quick Movements)
                  </button>
                  <button
                    onClick={() => startExercise('pursuit')}
                    disabled={exerciseActive}
                    className="w-full px-3 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:opacity-50"
                  >
                    Smooth Pursuit
                  </button>
                  <button
                    onClick={() => startExercise('focus')}
                    disabled={exerciseActive}
                    className="w-full px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                  >
                    Focus Training
                  </button>
                  {exerciseActive && (
                    <button
                      onClick={stopExercise}
                      className="w-full px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                    >
                      Stop Exercise
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Minimal overlay controls */}
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

          {/* Exercise status indicator */}
          {exerciseActive && (
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg backdrop-blur-sm z-10">
              <div className="text-center">
                <div className="text-sm font-medium">
                  {exerciseType.charAt(0).toUpperCase() + exerciseType.slice(1)} Exercise
                </div>
                <div className="text-xs opacity-80">
                  Follow the target with your eyes
                </div>
              </div>
            </div>
          )}

          {/* Enhanced eye tracking status indicator */}
          {currentEyeData && (
            <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg backdrop-blur-sm z-10">
              <div className="text-sm space-y-1">
                <div>👁️ Eyes Detected</div>
                <div>Alignment: {(currentEyeData.eyeAlignment * 100).toFixed(0)}%</div>
                {lazyEyeDetected !== 'none' && (
                  <div className="text-red-400 font-bold">
                    ⚠️ {lazyEyeDetected.toUpperCase()} EYE DRIFT
                  </div>
                )}
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
