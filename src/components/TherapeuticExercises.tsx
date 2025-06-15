
import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

export interface ExerciseTarget {
  x: number; // percentage 0-100
  y: number; // percentage 0-100
  size: number;
  color: string;
  duration: number; // ms
}

export interface ExerciseResult {
  accuracy: number; // 0-1
  responseTime: number; // ms
  eyeAlignment: number; // 0-1
  completed: boolean;
}

interface TherapeuticExercisesProps {
  currentEyeData?: {
    leftEye: { x: number; y: number };
    rightEye: { x: number; y: number };
    gazeDirection: { x: number; y: number };
    eyeAlignment: number;
  };
  onExerciseComplete?: (results: ExerciseResult) => void;
  exerciseType: 'saccades' | 'smooth-pursuit' | 'convergence' | 'binocular';
  isActive: boolean;
}

const TherapeuticExercises: React.FC<TherapeuticExercisesProps> = ({
  currentEyeData,
  onExerciseComplete,
  exerciseType,
  isActive
}) => {
  const { t } = useLanguage();
  const [currentTarget, setCurrentTarget] = useState<ExerciseTarget | null>(null);
  const [exerciseStartTime, setExerciseStartTime] = useState<number>(0);
  const [gazeHistory, setGazeHistory] = useState<Array<{x: number, y: number, timestamp: number}>>([]);

  // Generate exercise patterns based on type
  const generateExercisePattern = useCallback((type: string): ExerciseTarget[] => {
    switch (type) {
      case 'saccades':
        // Quick eye movements between distant points
        return [
          { x: 20, y: 20, size: 30, color: '#3B82F6', duration: 1000 },
          { x: 80, y: 20, size: 30, color: '#EF4444', duration: 1000 },
          { x: 20, y: 80, size: 30, color: '#10B981', duration: 1000 },
          { x: 80, y: 80, size: 30, color: '#F59E0B', duration: 1000 },
          { x: 50, y: 50, size: 30, color: '#8B5CF6', duration: 1000 },
        ];
      
      case 'smooth-pursuit':
        // Smooth tracking movements
        return Array.from({ length: 20 }, (_, i) => ({
          x: 20 + (60 * Math.sin(i * 0.3)),
          y: 50 + (20 * Math.cos(i * 0.3)),
          size: 25,
          color: '#06B6D4',
          duration: 500
        }));
      
      case 'convergence':
        // Near-far focus training
        return [
          { x: 50, y: 50, size: 50, color: '#DC2626', duration: 2000 },
          { x: 50, y: 50, size: 30, color: '#DC2626', duration: 2000 },
          { x: 50, y: 50, size: 20, color: '#DC2626', duration: 2000 },
          { x: 50, y: 50, size: 15, color: '#DC2626', duration: 2000 },
        ];
      
      case 'binocular':
        // Both eyes coordination
        return [
          { x: 30, y: 50, size: 25, color: '#7C3AED', duration: 1500 },
          { x: 70, y: 50, size: 25, color: '#7C3AED', duration: 1500 },
          { x: 50, y: 30, size: 25, color: '#7C3AED', duration: 1500 },
          { x: 50, y: 70, size: 25, color: '#7C3AED', duration: 1500 },
        ];
      
      default:
        return [];
    }
  }, []);

  // Start exercise sequence
  useEffect(() => {
    if (!isActive) return;

    const pattern = generateExercisePattern(exerciseType);
    let currentIndex = 0;
    setExerciseStartTime(Date.now());

    const showNextTarget = () => {
      if (currentIndex >= pattern.length) {
        // Exercise complete
        const results = calculateExerciseResults();
        onExerciseComplete?.(results);
        setCurrentTarget(null);
        return;
      }

      setCurrentTarget(pattern[currentIndex]);
      
      setTimeout(() => {
        currentIndex++;
        showNextTarget();
      }, pattern[currentIndex].duration);
    };

    showNextTarget();
  }, [isActive, exerciseType, generateExercisePattern, onExerciseComplete]);

  // Track gaze during exercise
  useEffect(() => {
    if (currentEyeData && isActive) {
      setGazeHistory(prev => [
        ...prev.slice(-50), // Keep last 50 points
        {
          x: currentEyeData.gazeDirection.x,
          y: currentEyeData.gazeDirection.y,
          timestamp: Date.now()
        }
      ]);
    }
  }, [currentEyeData, isActive]);

  const calculateExerciseResults = (): ExerciseResult => {
    if (!currentTarget || gazeHistory.length === 0) {
      return { accuracy: 0, responseTime: 0, eyeAlignment: 0, completed: false };
    }

    // Calculate accuracy based on how close gaze was to targets
    const targetAccuracy = gazeHistory.reduce((acc, gaze) => {
      const distance = Math.sqrt(
        Math.pow(gaze.x - (currentTarget.x - 50) / 50, 2) +
        Math.pow(gaze.y - (currentTarget.y - 50) / 50, 2)
      );
      return acc + (1 - Math.min(distance, 1));
    }, 0) / gazeHistory.length;

    // Calculate average response time
    const avgResponseTime = gazeHistory.length > 1 
      ? (gazeHistory[gazeHistory.length - 1].timestamp - gazeHistory[0].timestamp) / gazeHistory.length
      : 0;

    // Use current eye alignment
    const eyeAlignment = currentEyeData?.eyeAlignment || 0;

    return {
      accuracy: targetAccuracy,
      responseTime: avgResponseTime,
      eyeAlignment,
      completed: true
    };
  };

  if (!isActive || !currentTarget) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none z-20">
      {/* Exercise Instructions */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-lg">
        <p className="text-sm font-medium">
          {t(`exercise.instructions.${exerciseType}`)}
        </p>
      </div>

      {/* Current Target */}
      <div
        className={cn(
          "absolute rounded-full border-4 border-white shadow-lg transition-all duration-300",
          "flex items-center justify-center animate-pulse"
        )}
        style={{
          left: `${currentTarget.x}%`,
          top: `${currentTarget.y}%`,
          width: `${currentTarget.size}px`,
          height: `${currentTarget.size}px`,
          backgroundColor: currentTarget.color,
          transform: 'translate(-50%, -50%)'
        }}
      >
        <div className="w-3 h-3 bg-white rounded-full opacity-80" />
      </div>

      {/* Gaze Trail (for smooth pursuit) */}
      {exerciseType === 'smooth-pursuit' && gazeHistory.length > 1 && (
        <svg className="absolute inset-0 w-full h-full">
          <path
            d={`M ${gazeHistory.map((point, i) => 
              `${(point.x + 1) * 50} ${(point.y + 1) * 50}`
            ).join(' L ')}`}
            stroke="#00FF88"
            strokeWidth="2"
            fill="none"
            opacity="0.6"
          />
        </svg>
      )}

      {/* Real-time Feedback */}
      {currentEyeData && (
        <div className="absolute bottom-4 right-4 bg-black/70 text-white p-3 rounded-lg">
          <div className="text-xs space-y-1">
            <div>Alignment: {(currentEyeData.eyeAlignment * 100).toFixed(0)}%</div>
            <div>Gaze: ({currentEyeData.gazeDirection.x.toFixed(2)}, {currentEyeData.gazeDirection.y.toFixed(2)})</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TherapeuticExercises;
