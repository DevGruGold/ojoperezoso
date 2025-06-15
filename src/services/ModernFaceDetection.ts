
import { FaceMesh } from '@mediapipe/face_mesh';
import * as tf from '@tensorflow/tfjs';

export interface EyeData {
  leftEye: { x: number; y: number; confidence: number };
  rightEye: { x: number; y: number; confidence: number };
  gazeDirection: { x: number; y: number };
  eyeAlignment: number; // 0-1 scale, 1 = perfect alignment
  blinkRate: number;
}

export interface FaceDetectionResult {
  detected: boolean;
  eyeData: EyeData | null;
  landmarks: any[] | null;
}

class ModernFaceDetectionService {
  private faceMesh: FaceMesh | null = null;
  private isInitialized = false;
  private previousEyePositions: Array<{left: {x: number, y: number}, right: {x: number, y: number}}> = [];
  private blinkHistory: boolean[] = [];

  async initialize(): Promise<boolean> {
    try {
      await tf.ready();
      
      this.faceMesh = new FaceMesh({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`
      });

      this.faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize modern face detection:', error);
      return false;
    }
  }

  async detectFace(videoElement: HTMLVideoElement): Promise<FaceDetectionResult> {
    if (!this.isInitialized || !this.faceMesh) {
      return { detected: false, eyeData: null, landmarks: null };
    }

    return new Promise((resolve) => {
      this.faceMesh!.onResults((results) => {
        if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
          const landmarks = results.multiFaceLandmarks[0];
          const eyeData = this.extractEyeData(landmarks, videoElement);
          resolve({
            detected: true,
            eyeData,
            landmarks: landmarks
          });
        } else {
          resolve({ detected: false, eyeData: null, landmarks: null });
        }
      });

      this.faceMesh!.send({ image: videoElement });
    });
  }

  private extractEyeData(landmarks: any[], videoElement: HTMLVideoElement): EyeData {
    // MediaPipe face landmark indices for eyes
    const leftEyeIndices = [33, 7, 163, 144, 145, 153, 154, 155, 133, 173, 157, 158, 159, 160, 161, 246];
    const rightEyeIndices = [362, 382, 381, 380, 374, 373, 390, 249, 263, 466, 388, 387, 386, 385, 384, 398];

    // Calculate eye centers
    const leftEyeCenter = this.calculateEyeCenter(landmarks, leftEyeIndices, videoElement);
    const rightEyeCenter = this.calculateEyeCenter(landmarks, rightEyeIndices, videoElement);

    // Calculate gaze direction (simplified)
    const gazeDirection = this.calculateGazeDirection(leftEyeCenter, rightEyeCenter);

    // Calculate eye alignment
    const eyeAlignment = this.calculateEyeAlignment(leftEyeCenter, rightEyeCenter);

    // Calculate blink rate
    const blinkRate = this.calculateBlinkRate(landmarks, leftEyeIndices, rightEyeIndices);

    // Store history for analysis
    this.previousEyePositions.push({
      left: leftEyeCenter,
      right: rightEyeCenter
    });
    if (this.previousEyePositions.length > 30) { // Keep last 30 frames
      this.previousEyePositions.shift();
    }

    return {
      leftEye: { ...leftEyeCenter, confidence: 0.9 },
      rightEye: { ...rightEyeCenter, confidence: 0.9 },
      gazeDirection,
      eyeAlignment,
      blinkRate
    };
  }

  private calculateEyeCenter(landmarks: any[], eyeIndices: number[], videoElement: HTMLVideoElement) {
    let sumX = 0, sumY = 0;
    eyeIndices.forEach(index => {
      sumX += landmarks[index].x * videoElement.videoWidth;
      sumY += landmarks[index].y * videoElement.videoHeight;
    });
    return {
      x: sumX / eyeIndices.length,
      y: sumY / eyeIndices.length
    };
  }

  private calculateGazeDirection(leftEye: {x: number, y: number}, rightEye: {x: number, y: number}) {
    // Simplified gaze calculation - would need pupil detection for accuracy
    const centerX = (leftEye.x + rightEye.x) / 2;
    const centerY = (leftEye.y + rightEye.y) / 2;
    
    return {
      x: (centerX - 320) / 320, // Normalized to -1 to 1
      y: (centerY - 240) / 240
    };
  }

  private calculateEyeAlignment(leftEye: {x: number, y: number}, rightEye: {x: number, y: number}): number {
    // Calculate how well aligned the eyes are (0-1 scale)
    const yDifference = Math.abs(leftEye.y - rightEye.y);
    const maxAllowedDifference = 20; // pixels
    return Math.max(0, 1 - (yDifference / maxAllowedDifference));
  }

  private calculateBlinkRate(landmarks: any[], leftEyeIndices: number[], rightEyeIndices: number[]): number {
    // Calculate eye openness ratio
    const leftOpenness = this.calculateEyeOpenness(landmarks, leftEyeIndices);
    const rightOpenness = this.calculateEyeOpenness(landmarks, rightEyeIndices);
    
    const avgOpenness = (leftOpenness + rightOpenness) / 2;
    const isBlinking = avgOpenness < 0.3;
    
    this.blinkHistory.push(isBlinking);
    if (this.blinkHistory.length > 60) { // Keep last 60 frames (2 seconds at 30fps)
      this.blinkHistory.shift();
    }
    
    // Return blinks per minute
    const blinksInHistory = this.blinkHistory.filter(blink => blink).length;
    return (blinksInHistory / this.blinkHistory.length) * 60 * 30; // Estimate per minute
  }

  private calculateEyeOpenness(landmarks: any[], eyeIndices: number[]): number {
    // Simplified eye openness calculation
    if (eyeIndices.length < 6) return 1;
    
    const topY = landmarks[eyeIndices[1]].y;
    const bottomY = landmarks[eyeIndices[5]].y;
    const leftX = landmarks[eyeIndices[0]].x;
    const rightX = landmarks[eyeIndices[3]].x;
    
    const height = Math.abs(topY - bottomY);
    const width = Math.abs(rightX - leftX);
    
    return height / width; // Eye aspect ratio
  }

  cleanup() {
    if (this.faceMesh) {
      this.faceMesh.close();
      this.faceMesh = null;
    }
    this.isInitialized = false;
  }
}

export const modernFaceDetection = new ModernFaceDetectionService();
