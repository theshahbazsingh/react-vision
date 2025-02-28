"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import { VisionScannerProps } from "./types";
import "./styles.css";

export const VisionScanner = ({
  onCapture,
  facingMode = "environment",
  onError,
  resolution = { width: 640, height: 480 },
}: VisionScannerProps) => {
  // Refs - stable references that don't cause re-renders
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  
  // State that affects UI rendering
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const [isEdgeDetectionActive, setIsEdgeDetectionActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load OpenCV.js only once on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Handle already loaded OpenCV
    // @ts-ignore
    if (window.cv) {
      // @ts-ignore
      cvRef.current = window.cv;
      setIsOpenCVReady(true);
      console.log("OpenCV already loaded");
      return;
    }
    
    // Set up global callback for OpenCV initialization
    // @ts-ignore
    window.onOpenCvReady = () => {
      // @ts-ignore
      cvRef.current = window.cv;
      setIsOpenCVReady(true);
      console.log("OpenCV.js initialized");
    };

    // Add script only if it doesn't exist
    if (!document.getElementById('opencv-script')) {
      const script = document.createElement('script');
      script.id = 'opencv-script';
      script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
      script.async = true;
      script.onload = () => console.log("OpenCV.js script loaded");
      script.onerror = (e) => {
        console.error("Failed to load OpenCV.js", e);
        onError?.("Failed to load computer vision library");
      };
      document.body.appendChild(script);
    }
    
    // Cleanup function
    return () => {
      stopStreamInternal();
    };
  }, []); // Empty dependency array - only run once

  // Internal function to stop stream - doesn't trigger re-renders
  const stopStreamInternal = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Camera management functions
  const stopStream = useCallback(() => {
    stopStreamInternal();
    setIsCameraReady(false);
  }, [stopStreamInternal]);

  const enumerateCameras = useCallback(async () => {
    if (typeof window === 'undefined' || !navigator.mediaDevices?.enumerateDevices) {
      onError?.("Camera access not supported in this browser");
      setCameraCount(0);
      return;
    }
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameraCount(videoDevices.length);
    } catch (err: any) {
      onError?.(`Failed to detect cameras: ${err.message}`);
      setCameraCount(0);
      console.error("Camera enumeration error:", err);
    }
  }, [onError]);

  const initCamera = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.("Camera not supported in this browser");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Stop any existing stream first
      stopStreamInternal();
      
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: currentFacingMode,
          width: { ideal: resolution.width },
          height: { ideal: resolution.height },
        },
      });
      
      // Store stream in ref to avoid re-renders
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        // Use promise-based approach for onloadedmetadata
        const playVideo = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              setIsCameraReady(true);
              setIsLoading(false);
              
              // Check for torch capability
              const track = newStream.getVideoTracks()[0];
              const capabilities = track.getCapabilities();
              setHasTorch(capabilities && "torch" in capabilities);
              
              // Enumerate cameras after successful initialization
              enumerateCameras();
            }
          } catch (err: any) {
            onError?.(`Video playback failed: ${err.message}`);
            console.error("Video playback error:", err);
            setIsLoading(false);
          }
        };
        
        videoRef.current.onloadedmetadata = () => {
          playVideo();
        };
      }
    } catch (err: any) {
      onError?.(`Camera access error: ${err.message}`);
      console.error("Camera initialization error:", err);
      setIsLoading(false);
    }
  }, [currentFacingMode, enumerateCameras, onError, resolution.height, resolution.width, stopStreamInternal]);

  // Edge detection function that uses refs rather than state for processing
  const processFrame = useCallback(() => {
    if (!videoRef.current || !edgeCanvasRef.current || !cvRef.current || !isCameraReady || !isOpenCVReady) {
      if (isEdgeDetectionActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }
    
    // Prevent concurrent processing using ref instead of state
    if (processingRef.current) {
      if (isEdgeDetectionActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }
    
    processingRef.current = true;
    
    const cv = cvRef.current;
    const video = videoRef.current;
    const edgeCanvas = edgeCanvasRef.current;
    
    // Set canvas size to match video
    if (edgeCanvas.width !== video.videoWidth || edgeCanvas.height !== video.videoHeight) {
      edgeCanvas.width = video.videoWidth || resolution.width;
      edgeCanvas.height = video.videoHeight || resolution.height;
    }
    
    try {
      // Create matrices for processing
      const src = new cv.Mat(edgeCanvas.height, edgeCanvas.width, cv.CV_8UC4);
      const dst = new cv.Mat(edgeCanvas.height, edgeCanvas.width, cv.CV_8UC1);
      const cap = new cv.VideoCapture(video);
      
      // Read current frame
      cap.read(src);
      
      // Convert to grayscale
      cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
      
      // Apply Gaussian blur to reduce noise
      cv.GaussianBlur(src, src, new cv.Size(5, 5), 0);
      
      // Perform Canny edge detection
      cv.Canny(src, dst, 50, 150, 3);
      
      // Display result on canvas
      cv.imshow(edgeCanvas, dst);
      
      // Clean up to prevent memory leaks
      src.delete();
      dst.delete();
    } catch (err) {
      console.error("Edge detection error:", err);
    } finally {
      processingRef.current = false;
      
      // Continue processing if edge detection is active
      if (isEdgeDetectionActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    }
  }, [isEdgeDetectionActive, isCameraReady, isOpenCVReady, resolution.height, resolution.width]);

  // Initialize camera when component mounts or facingMode changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCamera();
    }
    
    return () => {
      stopStreamInternal();
    };
  }, [currentFacingMode, initCamera, stopStreamInternal]);

  // Handle edge detection toggle - more efficient with fewer state dependencies
  useEffect(() => {
    // Start or stop edge detection based on isEdgeDetectionActive state
    if (isEdgeDetectionActive) {
      if (!animationFrameRef.current) {
        console.log("Starting edge detection");
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    } else {
      if (animationFrameRef.current) {
        console.log("Stopping edge detection");
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        
        // Clear edge canvas when deactivated
        if (edgeCanvasRef.current) {
          const ctx = edgeCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
          }
        }
      }
    }
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isEdgeDetectionActive, processFrame]);

  // UI interaction handlers
  const switchCamera = useCallback(() => {
    stopStream();
    setCurrentFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  }, [stopStream]);

  const toggleTorch = useCallback(() => {
    if (hasTorch && streamRef.current) {
      const track = streamRef.current.getVideoTracks()[0];
      const newTorchState = !torchOn;
      track
        .applyConstraints({ advanced: [{ torch: newTorchState }] as any })
        .then(() => setTorchOn(newTorchState))
        .catch(err => onError?.(`Torch toggle failed: ${err.message}`));
    }
  }, [hasTorch, onError, torchOn]);

  const toggleEdgeDetection = useCallback(() => {
    console.log("Toggle edge detection:", !isEdgeDetectionActive, "OpenCV ready:", isOpenCVReady);
    setIsEdgeDetectionActive(prev => !prev);
  }, [isEdgeDetectionActive, isOpenCVReady]);

  const capture = useCallback(() => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) {
      onError?.("Camera not ready for capture");
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth || resolution.width;
    canvas.height = video.videoHeight || resolution.height;

    const context = canvas.getContext("2d");
    if (!context) {
      onError?.("Failed to get canvas context");
      return;
    }

    // Capture current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const imageData = canvas.toDataURL("image/jpeg");

    // Pass image to parent component
    onCapture(imageData);
  }, [isCameraReady, onCapture, onError, resolution.height, resolution.width]);

  return (
    <div className="vision-scanner">
      {/* Video element - main camera feed */}
      <video 
        ref={videoRef} 
        autoPlay 
        playsInline 
        muted
        className="vision-scanner-video" 
      />
      
      {/* Hidden canvas for captures */}
      <canvas 
        ref={canvasRef} 
        className="vision-scanner-canvas" 
        style={{ display: 'none' }} 
      />
      
      {/* Edge detection overlay */}
      <canvas 
        ref={edgeCanvasRef} 
        className="vision-scanner-edge-canvas" 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          display: isEdgeDetectionActive ? 'block' : 'none',
          pointerEvents: 'none'
        }} 
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="vision-scanner-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing camera...</div>
        </div>
      )}
      
      {/* UI Controls */}
      <div className="vision-scanner-controls">
        <button 
          onClick={capture} 
          className="vision-scanner-button primary-button"
          disabled={!isCameraReady}
        >
          Scan Document
        </button>
        
        {cameraCount > 1 && (
          <button 
            onClick={switchCamera}
            className="vision-scanner-button"
          >
            Switch Camera
          </button>
        )}
        
        {hasTorch && (
          <button 
            onClick={toggleTorch}
            className="vision-scanner-button"
          >
            {torchOn ? "Light Off" : "Light On"}
          </button>
        )}
        
        <button 
          onClick={toggleEdgeDetection} 
          disabled={!isCameraReady || !isOpenCVReady}
          className={`vision-scanner-button ${isEdgeDetectionActive ? 'active-button' : ''}`}
        >
          {isEdgeDetectionActive ? "Hide Edges" : "Show Edges"}
        </button>
      </div>
      
      {/* Status indicator for OpenCV */}
      {!isOpenCVReady && isCameraReady && (
        <div className="vision-scanner-status">
          <div className="status-message">Loading vision features...</div>
        </div>
      )}
    </div>
  );
};