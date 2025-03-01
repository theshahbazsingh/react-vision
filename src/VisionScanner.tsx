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
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const edgeCanvasRef = useRef<HTMLCanvasElement>(null);
  const adjustmentCanvasRef = useRef<HTMLCanvasElement>(null);
  const cvRef = useRef<any>(null);
  const animationFrameRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const processingRef = useRef<boolean>(false);
  const lastProcessTimeRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const capturedImageRef = useRef<HTMLImageElement | null>(null);
  const cornerCacheRef = useRef<{ x: number, y: number }[] | null>(null);
  
  // State
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const [isEdgeDetectionActive, setIsEdgeDetectionActive] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isEmbedded, setIsEmbedded] = useState(true);
  const [documentCorners, setDocumentCorners] = useState<{ x: number, y: number }[] | null>(null);
  
  // Edge adjustment mode - separate from the camera state
  const [isAdjustmentMode, setIsAdjustmentMode] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [adjustedCorners, setAdjustedCorners] = useState<{ x: number, y: number }[] | null>(null);
  const [activeCornerIndex, setActiveCornerIndex] = useState<number | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Stop stream
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

  // Load OpenCV.js
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // @ts-ignore
    if (window.cv) {
      // @ts-ignore
      cvRef.current = window.cv;
      setIsOpenCVReady(true);
      return;
    }
    
    if (!document.getElementById('opencv-script')) {
      const script = document.createElement('script');
      script.id = 'opencv-script';
      script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
      script.async = true;
      
      script.onload = () => {
        const checkInterval = setInterval(() => {
          // @ts-ignore
          if (window.cv) {
            clearInterval(checkInterval);
            // @ts-ignore
            cvRef.current = window.cv;
            setIsOpenCVReady(true);
          }
        }, 100);
        
        setTimeout(() => clearInterval(checkInterval), 10000);
      };
      
      script.onerror = () => {
        onError?.("Failed to load computer vision library");
      };
      
      document.body.appendChild(script);
    }
    
    return () => {
      stopStreamInternal();
    };
  }, [onError, stopStreamInternal]);

  // Camera management
  const stopStream = useCallback(() => {
    stopStreamInternal();
    setIsCameraReady(false);
  }, [stopStreamInternal]);

  const enumerateCameras = useCallback(async () => {
    if (!navigator.mediaDevices?.enumerateDevices) {
      setCameraCount(0);
      return;
    }
    
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === "videoinput");
      setCameraCount(videoDevices.length);
    } catch (err: any) {
      console.error("Camera enumeration error:", err);
      setCameraCount(0);
    }
  }, []);

  const initCamera = useCallback(async () => {
    if (typeof window === 'undefined') return;
    
    if (!navigator.mediaDevices?.getUserMedia) {
      onError?.("Camera not supported in this browser");
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      stopStreamInternal();
      
      const constraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        
        videoRef.current.onloadedmetadata = async () => {
          try {
            if (videoRef.current) {
              await videoRef.current.play();
              setIsCameraReady(true);
              setIsLoading(false);
              
              const track = newStream.getVideoTracks()[0];
              const capabilities = track.getCapabilities();
              setHasTorch(capabilities && "torch" in capabilities);
              
              enumerateCameras();
            }
          } catch (err: any) {
            onError?.(`Video playback failed: ${err.message}`);
            setIsLoading(false);
          }
        };
      }
    } catch (err: any) {
      onError?.(`Camera access error: ${err.message}`);
      setIsLoading(false);
    }
  }, [currentFacingMode, enumerateCameras, onError, stopStreamInternal]);

  // Optimized document detection - further improved stability
  const detectDocumentCorners = useCallback((src: any, cv: any, width: number, height: number): { x: number, y: number }[] | null => {
    try {
      // Use cornerCacheRef to stabilize detection between frames
      // Only recalculate corners if we don't have cached corners or every 3rd frame
      if (cornerCacheRef.current && lastProcessTimeRef.current % 3 !== 0) {
        return cornerCacheRef.current;
      }
      
      const gray = new cv.Mat();
      const edges = new cv.Mat();
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();

      // Pre-process the image
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
      cv.Canny(gray, edges, 30, 200); // Adjusted thresholds for better stability
      
      // Find contours
      cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
      
      let bestCorners = null;
      let maxScore = 0;
      const minArea = width * height * 0.05;
      
      // Process largest contours first
      const contourInfo = [];
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        if (area > minArea) {
          contourInfo.push({ index: i, area });
        }
      }
      
      // Sort by area, largest first
      contourInfo.sort((a, b) => b.area - a.area);
      
      // Only check top contours
      const contoursToCheck = Math.min(8, contourInfo.length);
      
      for (let i = 0; i < contoursToCheck; i++) {
        const { index, area } = contourInfo[i];
        const contour = contours.get(index);
        const perimeter = cv.arcLength(contour, true);
        
        // Approximate the contour - try multiple epsilon values for stability
        const epsilons = [0.02, 0.03, 0.04]; // Try multiple approximation levels
        
        for (const epsilonFactor of epsilons) {
          const epsilon = epsilonFactor * perimeter;
          const approx = new cv.Mat();
          cv.approxPolyDP(contour, approx, epsilon, true);
          
          // Check if it's a quadrilateral
          if (approx.rows === 4) {
            // Convert to corner points
            const corners = [];
            for (let j = 0; j < 4; j++) {
              corners.push({
                x: approx.data32S[j * 2],
                y: approx.data32S[j * 2 + 1]
              });
            }
            
            // Calculate score based on multiple factors
            const isConvex = cv.isContourConvex(approx);
            if (!isConvex) {
              approx.delete();
              continue;
            }
            
            // Calculate aspect ratio score
            const maxX = Math.max(...corners.map(c => c.x));
            const minX = Math.min(...corners.map(c => c.x));
            const maxY = Math.max(...corners.map(c => c.y));
            const minY = Math.min(...corners.map(c => c.y));
            
            const aspectRatio = (maxX - minX) / (maxY - minY);
            // Common document aspect ratios (A4, letter, etc.) are between 0.5 and 2.0
            const aspectScore = (aspectRatio > 0.5 && aspectRatio < 2.0) ? 1.0 : 0.5;
            
            // Calculate distance from center
            const centerX = width / 2;
            const centerY = height / 2;
            const cornersCenterX = corners.reduce((sum, c) => sum + c.x, 0) / 4;
            const cornersCenterY = corners.reduce((sum, c) => sum + c.y, 0) / 4;
            
            // Normalized distance (0-1) from center of frame
            const distanceFromCenter = Math.sqrt(
              Math.pow((cornersCenterX - centerX) / width, 2) + 
              Math.pow((cornersCenterY - centerY) / height, 2)
            );
            
            // Prefer contours near center
            const centerScore = 1.0 - Math.min(distanceFromCenter, 0.5) * 2;
            
            // Combined score with area weight
            const totalScore = (
              aspectScore * 0.3 + 
              centerScore * 0.3 + 
              (area / (width * height)) * 0.4
            ) * area; // Weight by area to prefer larger contours
            
            if (totalScore > maxScore) {
              maxScore = totalScore;
              
              // Sort corners: top-left, top-right, bottom-right, bottom-left
              corners.sort((a, b) => a.y - b.y); // Sort by y first
              
              // Get top and bottom pairs
              const topTwo = corners.slice(0, 2);
              const bottomTwo = corners.slice(2, 4);
              
              // Sort top pair by x
              topTwo.sort((a, b) => a.x - b.x);
              // Sort bottom pair by x
              bottomTwo.sort((a, b) => a.x - b.x);
              
              bestCorners = [topTwo[0], topTwo[1], bottomTwo[1], bottomTwo[0]];
            }
          }
          
          approx.delete();
        }
      }
      
      // Clean up
      gray.delete();
      edges.delete();
      contours.delete();
      hierarchy.delete();
      
      // Update corner cache
      if (bestCorners) {
        cornerCacheRef.current = bestCorners;
      }
      
      return bestCorners;
    } catch (err) {
      console.error("Document detection error:", err);
      return cornerCacheRef.current; // Return last good corners if there's an error
    }
  }, []);

  // Process video frames - improved stability
  const processFrame = useCallback(() => {
    if (!videoRef.current || !edgeCanvasRef.current || !cvRef.current || !isCameraReady || !isOpenCVReady) {
      if (isEdgeDetectionActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
      return;
    }
    
    // Throttle processing - 50ms (20fps) for better stability with less flicker
    const now = performance.now();
    const timeSinceLastProcess = now - lastProcessTimeRef.current;
    if (timeSinceLastProcess < 50) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    // Prevent concurrent processing
    if (processingRef.current) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
      return;
    }
    
    processingRef.current = true;
    lastProcessTimeRef.current = now;
    
    const cv = cvRef.current;
    const video = videoRef.current;
    const edgeCanvas = edgeCanvasRef.current;
    
    try {
      // Set canvas size to match video
      const width = video.videoWidth;
      const height = video.videoHeight;
      
      if (edgeCanvas.width !== width || edgeCanvas.height !== height) {
        edgeCanvas.width = width;
        edgeCanvas.height = height;
      }
      
      const ctx = edgeCanvas.getContext('2d');
      if (!ctx) return;
      
      // Clear previous drawings
      ctx.clearRect(0, 0, width, height);
      
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, width, height);
      
      // Get the image data
      const imageData = ctx.getImageData(0, 0, width, height);
      const src = cv.matFromImageData(imageData);
      
      // Detect document corners
      const corners = detectDocumentCorners(src, cv, width, height);
      
      // If corners were found, draw overlay
      if (corners && corners.length === 4) {
        // Draw semi-transparent yellow quad
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 255, 0, 0.25)';
        ctx.fill();
        
        // Draw solid yellow border
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        // Draw corner dots
        ctx.fillStyle = '#FFCC00';
        corners.forEach(corner => {
          ctx.beginPath();
          ctx.arc(corner.x, corner.y, 6, 0, 2 * Math.PI);
          ctx.fill();
        });
        
        // Only update state if corners have changed significantly
        // This reduces state updates and re-renders
        if (!documentCorners || hasCornersMoved(corners, documentCorners)) {
          setDocumentCorners(corners);
        }
      } else if (documentCorners && !corners) {
        // Only clear corners state if we've lost detection for several frames
        if (!cornerCacheRef.current) {
          setDocumentCorners(null);
        }
      }
      
      // Clean up
      src.delete();
    } catch (err) {
      console.error("Frame processing error:", err);
    } finally {
      processingRef.current = false;
      
      if (isEdgeDetectionActive) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    }
  }, [isEdgeDetectionActive, isCameraReady, isOpenCVReady, documentCorners, detectDocumentCorners]);

  // Helper to determine if corners have moved significantly
  const hasCornersMoved = (corners1: {x: number, y: number}[], corners2: {x: number, y: number}[]) => {
    if (!corners1 || !corners2 || corners1.length !== corners2.length) {
      return true;
    }
    
    // Calculate average movement distance
    let totalDistance = 0;
    for (let i = 0; i < corners1.length; i++) {
      const dx = corners1[i].x - corners2[i].x;
      const dy = corners1[i].y - corners2[i].y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    
    // Only consider it moved if average movement > 5 pixels
    return (totalDistance / corners1.length) > 5;
  };

  // Initialize camera
  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCamera();
    }
    
    return () => {
      stopStreamInternal();
    };
  }, [currentFacingMode, initCamera, stopStreamInternal]);

  // Handle edge detection toggle
  useEffect(() => {
    if (isEdgeDetectionActive) {
      if (!animationFrameRef.current && isOpenCVReady) {
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    } else {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        
        // Clear edge canvas
        if (edgeCanvasRef.current) {
          const ctx = edgeCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
          }
        }
        
        // Clear document corners when edge detection is disabled
        setDocumentCorners(null);
        cornerCacheRef.current = null;
      }
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);

  // Set up adjustment canvas when entering adjustment mode
  useEffect(() => {
    if (isAdjustmentMode && capturedImage && adjustedCorners && adjustmentCanvasRef.current) {
      const canvas = adjustmentCanvasRef.current;
      const img = new Image();
      
      img.onload = () => {
        // Store the image in ref to avoid re-renders
        capturedImageRef.current = img;
        
        // Set canvas dimensions to match image
        canvas.width = img.width;
        canvas.height = img.height;
        
        // Draw initial image and overlay
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear canvas
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Draw image
          ctx.drawImage(img, 0, 0);
          
          // Draw overlay with corners
          drawAdjustmentOverlay(ctx, adjustedCorners);
          
          // Image is now loaded
          setImageLoaded(true);
        }
      };
      
      img.src = capturedImage;
    }
  }, [isAdjustmentMode, capturedImage, adjustedCorners]);

  // Draw adjustment overlay
  const drawAdjustmentOverlay = useCallback((ctx: CanvasRenderingContext2D, corners: {x: number, y: number}[]) => {
    if (!ctx || !corners || corners.length !== 4) return;
    
    // Draw semi-transparent yellow quad
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(255, 204, 0, 0.3)';
    ctx.fill();
    
    // Draw solid yellow border
    ctx.beginPath();
    ctx.moveTo(corners[0].x, corners[0].y);
    ctx.lineTo(corners[1].x, corners[1].y);
    ctx.lineTo(corners[2].x, corners[2].y);
    ctx.lineTo(corners[3].x, corners[3].y);
    ctx.closePath();
    ctx.strokeStyle = '#FFCC00';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Draw corner handles
    corners.forEach((corner, index) => {
      ctx.beginPath();
      ctx.arc(corner.x, corner.y, 12, 0, 2 * Math.PI);
      ctx.fillStyle = index === activeCornerIndex ? '#FF4500' : '#FFCC00';
      ctx.fill();
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 2;
      ctx.stroke();
    });
  }, [activeCornerIndex]);

  // Initialize adjustment mode
  const startAdjustment = useCallback((imageData: string, corners: {x: number, y: number}[]) => {
    // Pause video processing
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Copy corners for adjustment
    setAdjustedCorners([...corners]);
    setCapturedImage(imageData);
    setIsAdjustmentMode(true);
  }, []);

  // Handle pointer events for corner adjustment
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (!adjustedCorners || !adjustmentCanvasRef.current) return;
    
    const canvas = adjustmentCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    // Find closest corner
    let minDistance = Number.MAX_VALUE;
    let closestIndex = -1;
    
    adjustedCorners.forEach((corner, index) => {
      const distance = Math.hypot(corner.x - x, corner.y - y);
      if (distance < minDistance && distance < 30) {
        minDistance = distance;
        closestIndex = index;
      }
    });
    
    if (closestIndex !== -1) {
      setActiveCornerIndex(closestIndex);
      setIsDragging(true);
      
      // Capture pointer
      canvas.setPointerCapture(e.pointerId);
    }
  }, [adjustedCorners]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging || activeCornerIndex === null || !adjustedCorners || !adjustmentCanvasRef.current) return;
    
    const canvas = adjustmentCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX));
    const y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY));
    
    // Update corner position
    const newCorners = [...adjustedCorners];
    newCorners[activeCornerIndex] = { x, y };
    setAdjustedCorners(newCorners);
    
    // Redraw
    const ctx = canvas.getContext('2d');
    if (ctx && capturedImageRef.current) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(capturedImageRef.current, 0, 0);
      drawAdjustmentOverlay(ctx, newCorners);
    }
  }, [isDragging, activeCornerIndex, adjustedCorners, drawAdjustmentOverlay]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging || !adjustmentCanvasRef.current) return;
    
    setIsDragging(false);
    setActiveCornerIndex(null);
    
    // Release pointer
    adjustmentCanvasRef.current.releasePointerCapture(e.pointerId);
  }, [isDragging]);

  // UI action handlers
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
    setIsEdgeDetectionActive(prev => !prev);
  }, []);

  const toggleViewMode = useCallback(() => {
    setIsEmbedded(prev => !prev);
  }, []);

  // Save adjusted document
  const confirmAdjustedDocument = useCallback(() => {
    if (!capturedImage || !adjustedCorners || !cvRef.current || !adjustmentCanvasRef.current) return;
    
    try {
      const cv = cvRef.current;
      const canvas = adjustmentCanvasRef.current;
      
      // Get image data
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const src = cv.matFromImageData(imgData);
      
      // Source points (adjusted corners)
      const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        adjustedCorners[0].x, adjustedCorners[0].y,
        adjustedCorners[1].x, adjustedCorners[1].y,
        adjustedCorners[2].x, adjustedCorners[2].y,
        adjustedCorners[3].x, adjustedCorners[3].y
      ]);
      
      // Calculate dimensions of output document
      const width = Math.max(
        Math.hypot(adjustedCorners[1].x - adjustedCorners[0].x, adjustedCorners[1].y - adjustedCorners[0].y),
        Math.hypot(adjustedCorners[2].x - adjustedCorners[3].x, adjustedCorners[2].y - adjustedCorners[3].y)
      );
      
      const height = Math.max(
        Math.hypot(adjustedCorners[3].x - adjustedCorners[0].x, adjustedCorners[3].y - adjustedCorners[0].y),
        Math.hypot(adjustedCorners[2].x - adjustedCorners[1].x, adjustedCorners[2].y - adjustedCorners[1].y)
      );
      
      const maxWidth = Math.ceil(width);
      const maxHeight = Math.ceil(height);
      
      // Destination points (rectangle)
      const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
        0, 0,
        maxWidth - 1, 0,
        maxWidth - 1, maxHeight - 1,
        0, maxHeight - 1
      ]);
      
      // Apply perspective transform
      const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
      const dst = new cv.Mat();
      cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight));
      
      // Create output canvas
      const outputCanvas = document.createElement('canvas');
      outputCanvas.width = maxWidth;
      outputCanvas.height = maxHeight;
      cv.imshow(outputCanvas, dst);
      
      // Get final image data
      const finalImageData = outputCanvas.toDataURL("image/jpeg", 0.92);
      
      // Clean up
      src.delete();
      dst.delete();
      srcPoints.delete();
      dstPoints.delete();
      M.delete();
      
      // Reset adjustment mode
      resetAdjustmentMode();
      
      // Pass the corrected image to parent
      onCapture(finalImageData);
    } catch (err) {
      console.error("Error processing adjusted document:", err);
      resetAdjustmentMode();
    }
  }, [capturedImage, adjustedCorners, onCapture]);

  // Cancel adjustment and return to camera
  const cancelAdjustment = useCallback(() => {
    resetAdjustmentMode();
  }, []);

  // Reset adjustment mode state
  const resetAdjustmentMode = useCallback(() => {
    setIsAdjustmentMode(false);
    setCapturedImage(null);
    setAdjustedCorners(null);
    setImageLoaded(false);
    capturedImageRef.current = null;
    
    // Resume video processing
    if (isEdgeDetectionActive && isOpenCVReady) {
      animationFrameRef.current = requestAnimationFrame(processFrame);
    }
  }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);

  // Capture image
  const capture = useCallback(() => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) return;

    // Flash animation
    if (edgeCanvasRef.current) {
      const flashCtx = edgeCanvasRef.current.getContext('2d');
      if (flashCtx) {
        const { width, height } = edgeCanvasRef.current;
        flashCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        flashCtx.fillRect(0, 0, width, height);
        
        setTimeout(() => {
          if (edgeCanvasRef.current && flashCtx) {
            flashCtx.clearRect(0, 0, width, height);
          }
        }, 300);
      }
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const context = canvas.getContext('2d');
    if (!context) return;

    // Capture current frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    
    // If document detected, enter adjustment mode
    if (documentCorners && documentCorners.length === 4) {
      startAdjustment(imageData, documentCorners);
    } else {
      // No document detected, just capture the full frame
      onCapture(imageData);
    }
  }, [isCameraReady, documentCorners, startAdjustment, onCapture]);

  return (
    <div 
      ref={containerRef} 
      className={`vision-scanner ${isEmbedded ? 'embedded' : 'expanded'}`}
    >
      {/* Camera View */}
      {!isAdjustmentMode ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            muted
            className="vision-scanner-video" 
          />
          
          <canvas 
            ref={canvasRef} 
            className="vision-scanner-canvas" 
            style={{ display: 'none' }} 
          />
          
          <canvas 
            ref={edgeCanvasRef} 
            className="vision-scanner-edge-canvas" 
          />
          
          {isLoading && (
            <div className="vision-scanner-loading">
              <div className="loading-spinner"></div>
              <div className="loading-text">Initializing camera...</div>
            </div>
          )}
          
          {isCameraReady && isOpenCVReady && isEdgeDetectionActive && !documentCorners && (
            <div className="document-guide-overlay">
              <div className="document-guide-corners">
                <div className="corner top-left"></div>
                <div className="corner top-right"></div>
                <div className="corner bottom-right"></div>
                <div className="corner bottom-left"></div>
              </div>
              <div className="guide-text">Position document within frame</div>
            </div>
          )}
          
          <div className="vision-scanner-controls">
            {/* Capture button */}
            <button 
              onClick={capture} 
              className={`vision-scanner-capture-button ${documentCorners ? 'document-ready' : ''}`}
              disabled={!isCameraReady}
              aria-label="Capture"
            >
              <span className="vision-scanner-capture-button-inner"></span>
            </button>
            
            <div className="vision-scanner-secondary-controls">
              <button 
                onClick={toggleViewMode}
                className={`vision-scanner-icon-button ${!isEmbedded ? 'active-button' : ''}`}
                aria-label={isEmbedded ? "Expand Camera" : "Minimize Camera"}
              >
                {isEmbedded ? (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>
                  </svg>
                )}
              </button>
              
              {cameraCount > 1 && (
                <button 
                  onClick={switchCamera}
                  className="vision-scanner-icon-button"
                  aria-label="Switch Camera"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 16v4a2 2 0 0 1-2 2h-4"></path>
                    <path d="M14 14l6 6"></path>
                    <path d="M4 8V4a2 2 0 0 1 2-2h4"></path>
                    <path d="M10 10L4 4"></path>
                  </svg>
                </button>
              )}
              
              {hasTorch && (
                <button 
                  onClick={toggleTorch}
                  className={`vision-scanner-icon-button ${torchOn ? 'active-button' : ''}`}
                  aria-label={torchOn ? "Turn Off Light" : "Turn On Light"}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5"></circle>
                    <line x1="12" y1="1" x2="12" y2="3"></line>
                    <line x1="12" y1="21" x2="12" y2="23"></line>
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                    <line x1="1" y1="12" x2="3" y2="12"></line>
                    <line x1="21" y1="12" x2="23" y2="12"></line>
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                  </svg>
                </button>
              )}
              
              <button 
                onClick={toggleEdgeDetection} 
                disabled={!isCameraReady || !isOpenCVReady}
                className={`vision-scanner-icon-button ${isEdgeDetectionActive ? 'active-button' : ''}`}
                aria-label={isEdgeDetectionActive ? "Hide Document Detection" : "Show Document Detection"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="3" y1="9" x2="21" y2="9"></line>
                  <line x1="9" y1="21" x2="9" y2="9"></line>
                </svg>
              </button>
            </div>
          </div>
          
          {!isOpenCVReady && isCameraReady && (
            <div className="vision-scanner-status">
              <div className="status-message">Loading vision features...</div>
            </div>
          )}
          
          {documentCorners && (
            <div className="vision-scanner-document-indicator">
              <div className="document-ready-message">Document detected</div>
            </div>
          )}
        </>
      ) : (
        /* Adjustment Mode */
        <div className="vision-scanner-adjustment-mode">
          <div className="adjustment-canvas-container">
            <canvas 
              ref={adjustmentCanvasRef}
              className="vision-scanner-adjustment-canvas"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            />
            
            {!imageLoaded && (
              <div className="loading-overlay">
                <div className="loading-spinner"></div>
                <div className="loading-text">Preparing image...</div>
              </div>
            )}
          </div>
          
          <div className="adjustment-instructions">
            <div className="instruction-text">Drag corners to adjust document edges</div>
          </div>
          
          <div className="adjustment-controls">
            <button 
              onClick={cancelAdjustment}
              className="adjustment-button cancel-button"
            >
              Cancel
            </button>
            <button 
              onClick={confirmAdjustedDocument}
              className="adjustment-button confirm-button"
              disabled={!imageLoaded}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
};