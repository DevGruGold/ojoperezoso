
import { useEffect, useRef, useState } from 'react';
import { modernCamera } from '@/services/ModernCameraService';
import { toast } from 'sonner';

const Index = () => {
  const [cameraReady, setCameraReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [showControls, setShowControls] = useState(false);
  
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
    <div className="min-h-screen w-full bg-black overflow-hidden">
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
        </>
      )}
    </div>
  );
};

export default Index;
