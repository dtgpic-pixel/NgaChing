import React, { useEffect, useRef, useState, useCallback } from 'react';
import { CONFIG } from '../constants';

interface GestureHandlerProps {
  onMotionUpdate: (score: number, centerX: number) => void;
  permissionGranted: boolean;
}

const GestureHandler: React.FC<GestureHandlerProps> = ({ onMotionUpdate, permissionGranted }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const prevFrameRef = useRef<Uint8ClampedArray | null>(null);
  const requestRef = useRef<number>();

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas && video.readyState === 4) {
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (ctx) {
        // Downsample for performance
        const width = 64; 
        const height = 48;
        
        if (canvas.width !== width) {
            canvas.width = width;
            canvas.height = height;
        }

        ctx.drawImage(video, 0, 0, width, height);
        
        // Get pixel data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        let motionScore = 0;
        let weightedX = 0;
        let changedPixels = 0;

        // Compare with previous frame
        if (prevFrameRef.current) {
          const prev = prevFrameRef.current;
          
          for (let i = 0; i < data.length; i += 4) {
            // Simple grayscale diff
            const diff = Math.abs(data[i] - prev[i]) + 
                         Math.abs(data[i+1] - prev[i+1]) + 
                         Math.abs(data[i+2] - prev[i+2]);
            
            if (diff > CONFIG.MOTION_THRESHOLD * 3) {
              motionScore += 1;
              changedPixels++;
              const x = (i / 4) % width;
              weightedX += x;
            }
          }
        }

        // Store current frame
        prevFrameRef.current = new Uint8ClampedArray(data);

        // Normalize
        const normalizedScore = motionScore / (width * height * 0.1); // Sensitivity
        const centerX = changedPixels > 0 ? (weightedX / changedPixels / width - 0.5) * 2 : 0;
        
        // Invert X because webcam is mirrored usually
        onMotionUpdate(Math.min(normalizedScore, 1), -centerX);
      }
    }
    
    requestRef.current = requestAnimationFrame(processFrame);
  }, [onMotionUpdate]);

  useEffect(() => {
    if (permissionGranted && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: { width: 320, height: 240 } })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
          requestRef.current = requestAnimationFrame(processFrame);
        })
        .catch(err => console.error("Webcam denied:", err));
    }
    
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [permissionGranted, processFrame]);

  return (
    <>
      <video 
        ref={videoRef} 
        className="fixed bottom-4 left-4 w-32 h-24 object-cover rounded-lg border-2 border-yellow-500 opacity-50 z-50 pointer-events-none transform scale-x-[-1]" 
        muted 
        playsInline 
      />
      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default GestureHandler;
