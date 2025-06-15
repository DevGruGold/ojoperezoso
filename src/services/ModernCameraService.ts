
export interface CameraCapabilities {
  maxResolution: { width: number; height: number };
  hasHDR: boolean;
  hasTorch: boolean;
  hasZoom: boolean;
  frameRate: number;
}

export interface CameraSettings {
  resolution: { width: number; height: number };
  frameRate: number;
  hdr: boolean;
  facingMode: 'user' | 'environment';
}

class ModernCameraService {
  private stream: MediaStream | null = null;
  private capabilities: CameraCapabilities | null = null;

  async initialize(settings: Partial<CameraSettings> = {}): Promise<MediaStream | null> {
    try {
      // Request highest quality camera with modern constraints
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: settings.facingMode || 'user',
          width: { ideal: settings.resolution?.width || 1920, max: 3840 },
          height: { ideal: settings.resolution?.height || 1080, max: 2160 },
          frameRate: { ideal: settings.frameRate || 30, max: 60 },
          // Modern constraints
          aspectRatio: { ideal: 16/9 },
          resizeMode: 'crop-and-scale',
          latency: { ideal: 0.1 }, // Low latency for real-time
        }
      };

      // Add HDR support if available
      if (settings.hdr && 'getDisplayMedia' in navigator.mediaDevices) {
        (constraints.video as any).colorSpace = 'rec2020';
        (constraints.video as any).hdr = true;
      }

      this.stream = await navigator.mediaDevices.getUserMedia(constraints);
      await this.detectCapabilities();
      return this.stream;
    } catch (error) {
      console.error('Failed to initialize modern camera:', error);
      // Fallback to basic constraints
      try {
        this.stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: 1280, height: 720 }
        });
        return this.stream;
      } catch (fallbackError) {
        console.error('Camera fallback failed:', fallbackError);
        return null;
      }
    }
  }

  private async detectCapabilities(): Promise<void> {
    if (!this.stream) return;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      const capabilities = videoTrack.getCapabilities();
      const settings = videoTrack.getSettings();

      this.capabilities = {
        maxResolution: {
          width: capabilities.width?.max || settings.width || 1920,
          height: capabilities.height?.max || settings.height || 1080
        },
        hasHDR: !!(capabilities as any).colorSpace,
        hasTorch: !!(capabilities as any).torch,
        hasZoom: !!(capabilities as any).zoom,
        frameRate: capabilities.frameRate?.max || settings.frameRate || 30
      };

      console.log('Camera capabilities detected:', this.capabilities);
    } catch (error) {
      console.error('Could not detect camera capabilities:', error);
      this.capabilities = {
        maxResolution: { width: 1920, height: 1080 },
        hasHDR: false,
        hasTorch: false,
        hasZoom: false,
        frameRate: 30
      };
    }
  }

  async optimizeForDevice(): Promise<void> {
    if (!this.stream || !this.capabilities) return;

    const videoTrack = this.stream.getVideoTracks()[0];
    if (!videoTrack) return;

    try {
      // Apply device-specific optimizations
      const constraints: MediaTrackConstraints = {};

      // Optimize for mobile devices
      if (/Mobile|Android|iPhone|iPad/.test(navigator.userAgent)) {
        constraints.width = { ideal: 1280 };
        constraints.height = { ideal: 720 };
        constraints.frameRate = { ideal: 30 };
      } else {
        // Desktop optimization
        constraints.width = { ideal: 1920 };
        constraints.height = { ideal: 1080 };
        constraints.frameRate = { ideal: 60 };
      }

      await videoTrack.applyConstraints(constraints);
      console.log('Camera optimized for device');
    } catch (error) {
      console.error('Failed to optimize camera:', error);
    }
  }

  getCapabilities(): CameraCapabilities | null {
    return this.capabilities;
  }

  async switchCamera(): Promise<MediaStream | null> {
    const currentFacingMode = this.getCurrentFacingMode();
    const newFacingMode = currentFacingMode === 'user' ? 'environment' : 'user';
    
    this.cleanup();
    return this.initialize({ facingMode: newFacingMode });
  }

  private getCurrentFacingMode(): 'user' | 'environment' {
    if (!this.stream) return 'user';
    const videoTrack = this.stream.getVideoTracks()[0];
    const settings = videoTrack?.getSettings();
    return (settings?.facingMode as 'user' | 'environment') || 'user';
  }

  async enableTorch(enabled: boolean): Promise<void> {
    if (!this.stream || !this.capabilities?.hasTorch) return;

    const videoTrack = this.stream.getVideoTracks()[0];
    try {
      await videoTrack.applyConstraints({
        advanced: [{ torch: enabled } as any]
      });
    } catch (error) {
      console.error('Failed to toggle torch:', error);
    }
  }

  cleanup(): void {
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    this.capabilities = null;
  }
}

export const modernCamera = new ModernCameraService();
