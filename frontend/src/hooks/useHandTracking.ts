import {FilesetResolver, HandLandmarker} from '@mediapipe/tasks-vision';
import {MutableRefObject, useEffect, useRef, useState} from 'react';

export type HandData = {
  x: number;  // 0-100 percentage
  y: number;  // 0-100 percentage
  isFist: boolean;
  rawLandmarks?: any;
};

export function useHandTracking(
    videoRef: MutableRefObject<HTMLVideoElement|null>,
    canvasRef: MutableRefObject<HTMLCanvasElement|null>) {
  const [loading, setLoading] = useState(true);
  const [handData, setHandData] = useState<HandData|null>(null);
  const handLandmarkerRef = useRef<HandLandmarker|null>(null);
  const requestRef = useRef<number>(0);

  useEffect(() => {
    async function init() {
      try {
        const vision = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm');

        handLandmarkerRef
            .current = await HandLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task',
            delegate: 'GPU'
          },
          runningMode: 'VIDEO',
          numHands: 1
        });

        // Start Camera
        const stream = await navigator.mediaDevices.getUserMedia(
            {video: {width: 1280, height: 720, facingMode: 'user'}});

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.addEventListener('loadeddata', predict);
        }
        setLoading(false);
      } catch (err) {
        console.error('Camera/AI Init Error:', err);
      }
    }
    init();
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const predict = () => {
    if (!videoRef.current || !handLandmarkerRef.current || !canvasRef.current)
      return;

    // Process Frame
    if (videoRef.current.currentTime > 0) {
      const results = handLandmarkerRef.current.detectForVideo(
          videoRef.current, performance.now());
      const ctx = canvasRef.current.getContext('2d');

      if (ctx) {
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

        if (results.landmarks && results.landmarks.length > 0) {
          const landmarks = results.landmarks[0];

          // 1. Calculate Cursor Position (Index Finger Tip)
          // Mirror X (1 - x) because webcam is mirrored
          const cursorX = (1 - landmarks[8].x) * 100;
          const cursorY = landmarks[8].y * 100;

          // 2. Fist Detection Logic (Distance between Wrist and Middle Finger
          // Tip)
          const wrist = landmarks[0];
          const middleTip = landmarks[12];
          // Simplified Euclidean distance check for "scrunching"
          const dist = Math.sqrt(
              Math.pow(wrist.x - middleTip.x, 2) +
              Math.pow(wrist.y - middleTip.y, 2));
          const isFist = dist < 0.25;  // Threshold may need tuning

          setHandData(
              {x: cursorX, y: cursorY, isFist, rawLandmarks: landmarks});

          // 3. Draw Skeleton (Visual Feedback)
          drawSkeleton(ctx, landmarks);
        } else {
          setHandData(null);
        }
      }
    }
    requestRef.current = requestAnimationFrame(predict);
  };

  const drawSkeleton = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
    ctx.lineWidth = 4;
    ctx.strokeStyle = 'rgba(0, 255, 0, 0.6)';

    // Simple connections for fingers
    const connections = [
      [0, 1], [1, 2], [2, 3], [3, 4], [0, 5], [5, 6], [6, 7], [7, 8], [5, 9],
      [9, 10], [10, 11], [11, 12]
    ];
    ctx.beginPath();
    for (const [start, end] of connections) {
      const p1 = landmarks[start];
      const p2 = landmarks[end];
      // Note: Must mirror X for drawing to match video transform
      ctx.moveTo((1 - p1.x) * ctx.canvas.width, p1.y * ctx.canvas.height);
      ctx.lineTo((1 - p2.x) * ctx.canvas.width, p2.y * ctx.canvas.height);
    }
    ctx.stroke();
  };

  return {loading, handData};
}