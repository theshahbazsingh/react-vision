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
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State that affects UI rendering
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [isOpenCVReady, setIsOpenCVReady] = useState(false);
  const [isEdgeDetectionActive, setIsEdgeDetectionActive] = useState(true); // Enabled by default
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [documentCorners, setDocumentCorners] = useState<{ x: number, y: number }[] | null>(null);

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
    
    // Add script only if it doesn't exist
    if (!document.getElementById('opencv-script')) {
      const script = document.createElement('script');
      script.id = 'opencv-script';
      script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
      script.async = true;
      
      script.onload = () => {
        console.log("OpenCV.js script loaded, waiting for initialization...");
        // Start polling for cv object
        const checkInterval = setInterval(() => {
          // @ts-ignore
          if (window.cv) {
            clearInterval(checkInterval);
            // @ts-ignore
            cvRef.current = window.cv;
            setIsOpenCVReady(true);
            console.log("OpenCV.js initialized through polling");
          }
        }, 200);
        
        // Set a timeout to prevent infinite polling
        setTimeout(() => clearInterval(checkInterval), 20000);
      };
      
      script.onerror = (e) => {
        console.error("Failed to load OpenCV.js", e);
        onError?.("Failed to load computer vision library");
      };
      
      document.body.appendChild(script);
    }
    
    // Add fullscreen event listeners for all browser variants
    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!document.fullscreenElement || 
        // @ts-ignore - Webkit
        !!document.webkitFullscreenElement ||
        // @ts-ignore - Mozilla
        !!document.mozFullScreenElement ||
        // @ts-ignore - MS
        !!document.msFullscreenElement
      );
    };
    
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);
    
    // Check if user is on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      // On mobile, start in full height mode by default
      setIsFullscreen(true);
    }
    
    // Cleanup function
    return () => {
      stopStreamInternal();
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, [onError, stopStreamInternal]);

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
      
      // Try to get higher resolution for better document detection
      const constraints = {
        video: {
          facingMode: currentFacingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          // Prioritize quality over framerate for document scanning
          frameRate: { ideal: 30 },
        },
      };
      
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);
      
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
  }, [currentFacingMode, enumerateCameras, onError, stopStreamInternal]);

  // Helper function to calculate rectangularity score
  const calculateRectangularity = (corners: { x: number, y: number }[]): number => {
    if (corners.length !== 4) return 0;
    
    // Calculate sides
    const sides = [];
    for (let i = 0; i < 4; i++) {
      const p1 = corners[i];
      const p2 = corners[(i + 1) % 4];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      sides.push(Math.sqrt(dx * dx + dy * dy));
    }
    
    // Sort sides into pairs (should be 2 pairs of equal lengths for a rectangle)
    sides.sort((a, b) => a - b);
    
    // Check if sides[0] ≈ sides[1] and sides[2] ≈ sides[3]
    const ratio1 = Math.min(sides[0], sides[1]) / Math.max(sides[0], sides[1]);
    const ratio2 = Math.min(sides[2], sides[3]) / Math.max(sides[2], sides[3]);
    
    // Check if the aspect ratio is reasonable (not too narrow)
    const aspectRatio = Math.min(sides[0] / sides[2], sides[2] / sides[0]);
    
    // Score based on how rectangular the shape is (all sides paired, reasonable aspect ratio)
    return (ratio1 * ratio2) * Math.min(1, aspectRatio * 2);
  };

  // Document detection function using OpenCV - improved version
  const detectDocumentCorners = (src: any, cv: any, width: number, height: number): { x: number, y: number }[] | null => {
    try {
      // Create matrices for processing
      const gray = new cv.Mat();
      const blurred = new cv.Mat();
      const edges = new cv.Mat();
      const dilated = new cv.Mat();
      const contours = new cv.MatVector();
      const hierarchy = new cv.Mat();
      const dst = new cv.Mat();

      // Pre-process the image - more robust preprocessing
      cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
      
      // Apply bilateral filter for better edge preservation while removing noise
      cv.bilateralFilter(gray, blurred, 9, 75, 75);
      
      // Use adaptive threshold for better results in varying lighting
      cv.adaptiveThreshold(blurred, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
      
      // Apply Canny edge detection with better parameters
      cv.Canny(blurred, edges, 50, 150, 3, true); // Use L2gradient for better accuracy
      
      // Dilate edges to connect broken lines
      const dilationSize = new cv.Size(2, 2);
      const dilationElement = cv.getStructuringElement(cv.MORPH_RECT, dilationSize);
      cv.dilate(edges, dilated, dilationElement, new cv.Point(-1, -1), 1);
      dilationElement.delete();
      
      // Find contours on the dilated edge image
      cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
      
      // Filter contours by area, angle, and other properties
      let bestCorners = null;
      let maxScore = 0;
      
      for (let i = 0; i < contours.size(); i++) {
        const contour = contours.get(i);
        const area = cv.contourArea(contour);
        const frameArea = width * height;
        
        // Skip tiny or huge contours
        if (area < frameArea * 0.03 || area > frameArea * 0.98) {
          continue;
        }
        
        // Calculate contour perimeter (arc length)
        const perimeter = cv.arcLength(contour, true);
        
        // Calculate contour complexity score (area / perimeter ratio)
        // Documents tend to have a certain ratio
        const complexity = area / (perimeter * perimeter);
        
        // Documents should be somewhat convex
        const hull = new cv.Mat();
        cv.convexHull(contour, hull);
        const hullArea = cv.contourArea(hull);
        const solidity = area / hullArea;
        hull.delete();
        
        // Rectangle approximation
        const epsilon = 0.02 * perimeter;
        const approx = new cv.Mat();
        cv.approxPolyDP(contour, approx, epsilon, true);
        
        // Check if approximation has 4 points (rectangular)
        if (approx.rows === 4) {
          // Convert to corner points
          const corners = [];
          for (let j = 0; j < 4; j++) {
            corners.push({
              x: approx.data32S[j * 2],
              y: approx.data32S[j * 2 + 1]
            });
          }
          
          // Check if the corners form a convex quadrilateral
          const isConvex = cv.isContourConvex(approx);
          
          // Calculate the angles between adjacent sides
          let minAngle = 180;
          let maxAngle = 0;
          
          for (let j = 0; j < 4; j++) {
            const p1 = corners[j];
            const p2 = corners[(j + 1) % 4];
            const p3 = corners[(j + 2) % 4];
            
            // Calculate angle using dot product
            const v1x = p2.x - p1.x;
            const v1y = p2.y - p1.y;
            const v2x = p3.x - p2.x;
            const v2y = p3.y - p2.y;
            
            const dotProduct = v1x * v2x + v1y * v2y;
            const mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
            const mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
            
            const angle = Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI);
            
            minAngle = Math.min(minAngle, angle);
            maxAngle = Math.max(maxAngle, angle);
          }
          
          // Calculate aspect score
          const aspectScore = calculateRectangularity(corners);
          
          // Calculate total score based on multiple features
          // Higher score for shapes that are:
          // 1. Convex
          // 2. Have angles close to 90°
          // 3. Have good aspect ratio
          // 4. Have good solidity
          const angleScore = (minAngle > 65 && maxAngle < 115) ? (1 - Math.abs(minAngle - 90) / 90) : 0;
          const solidityScore = solidity > 0.8 ? solidity : 0;
          
          const totalScore = (
            (isConvex ? 1 : 0) * 0.3 +
            angleScore * 0.3 +
            aspectScore * 0.2 +
            solidityScore * 0.2
          ) * area;  // Weight by area to prefer larger contours
          
          if (totalScore > maxScore) {
            maxScore = totalScore;
            
            // Sort corners in order: top-left, top-right, bottom-right, bottom-left
            corners.sort((a, b) => a.y + a.x - (b.y + b.x)); // Top-left first
            const tl = corners[0];
            const br = corners[corners.length - 1];
            
            // Top-right has smallest difference between y and x
            // Bottom-left has largest difference between y and x
            corners.sort((a, b) => (a.y - a.x) - (b.y - b.x));
            const tr = corners[0];
            const bl = corners[corners.length - 1];
            
            bestCorners = [tl, tr, br, bl];
          }
        }
        
        approx.delete();
      }
      
      // Clean up
      gray.delete();
      blurred.delete();
      edges.delete();
      dilated.delete();
      dst.delete();
      contours.delete();
      hierarchy.delete();
      
      return bestCorners;
    } catch (err) {
      console.error("Document detection error:", err);
    }
    
    return null;
  };

  // Edge detection and document finding function
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
    
    try {
      // Set canvas size to match video exactly
      const width = video.videoWidth || resolution.width;
      const height = video.videoHeight || resolution.height;
      
      // Only resize if needed to avoid unnecessary reflows
      if (edgeCanvas.width !== width || edgeCanvas.height !== height) {
        edgeCanvas.width = width;
        edgeCanvas.height = height;
      }
      
      // Get the canvas context and draw the current video frame
      const ctx = edgeCanvas.getContext('2d');
      if (!ctx) {
        throw new Error("Could not get canvas context");
      }
      
      // Clear previous drawings
      ctx.clearRect(0, 0, width, height);
      
      // Create a temporary canvas to get the image data
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = width;
      tempCanvas.height = height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (!tempCtx) {
        throw new Error("Could not get temporary canvas context");
      }
      
      // Draw the current video frame to the temp canvas
      tempCtx.drawImage(video, 0, 0, width, height);
      
      // Get the image data from the canvas
      const imageData = tempCtx.getImageData(0, 0, width, height);
      
      // Create OpenCV matrix from the image data
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
        
        // Store corners for capture
        setDocumentCorners(corners);
      } else {
        setDocumentCorners(null);
      }
      
      // Clean up
      src.delete();
    } catch (err) {
      console.error("Edge detection error:", err);
      // Clear the canvas on error to prevent showing garbage
      const ctx = edgeCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, edgeCanvas.width, edgeCanvas.height);
      }
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
      if (!animationFrameRef.current && isOpenCVReady) {
        console.log("Starting document detection");
        animationFrameRef.current = requestAnimationFrame(processFrame);
      }
    } else {
      if (animationFrameRef.current) {
        console.log("Stopping document detection");
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
        
        // Clear edge canvas when deactivated
        if (edgeCanvasRef.current) {
          const ctx = edgeCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
          }
        }
        
        // Clear corners
        setDocumentCorners(null);
      }
    }
    
    // Cleanup function
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);

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
    console.log("Toggle document detection:", !isEdgeDetectionActive, "OpenCV ready:", isOpenCVReady);
    setIsEdgeDetectionActive(prev => !prev);
  }, [isEdgeDetectionActive, isOpenCVReady]);

  const toggleFullscreen = useCallback(() => {
    // Try standard fullscreen API first
    if (!document.fullscreenElement && containerRef.current) {
      try {
        containerRef.current.requestFullscreen().catch((err) => {
          console.warn(`Standard fullscreen failed: ${err.message}`);
          // If standard fullscreen fails, just set a class for CSS to handle
          setIsFullscreen(true);
        });
      } catch (err) {
        console.warn("Fullscreen API not supported, using CSS fallback");
        setIsFullscreen(true);
      }
    } else if (document.exitFullscreen) {
      try {
        document.exitFullscreen().catch(() => {
          // If exit fails, manually toggle the state
          setIsFullscreen(false);
        });
      } catch (err) {
        console.warn("Exit fullscreen API failed, using CSS fallback");
        setIsFullscreen(false);
      }
    } else {
      // Toggle fullscreen state manually for CSS fallback
      setIsFullscreen(prev => !prev);
    }
  }, []);

  // Enhanced capture function that uses the detected document corners if available
  const capture = useCallback(() => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) {
      onError?.("Camera not ready for capture");
      return;
    }

    // Visual feedback for capture - flash animation
    if (edgeCanvasRef.current) {
      const flashCtx = edgeCanvasRef.current.getContext('2d');
      if (flashCtx) {
        // Create flash effect
        flashCtx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        flashCtx.fillRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
        
        // Clear the flash after a short delay
        setTimeout(() => {
          if (edgeCanvasRef.current && flashCtx) {
            flashCtx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
            // Redraw document overlay if needed
            if (isEdgeDetectionActive) {
              processFrame();
            }
          }
        }, 300);
      }
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
    
    // If we have document corners and OpenCV is ready, create a perspective corrected version
    if (documentCorners && documentCorners.length === 4 && isOpenCVReady && cvRef.current) {
      try {
        const cv = cvRef.current;
        
        // Create source matrix from canvas
        const imgData = context.getImageData(0, 0, canvas.width, canvas.height);
        const src = cv.matFromImageData(imgData);
        
        // Source points (document corners detected in the image)
        const srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          documentCorners[0].x, documentCorners[0].y, // Top-left
          documentCorners[1].x, documentCorners[1].y, // Top-right
          documentCorners[2].x, documentCorners[2].y, // Bottom-right
          documentCorners[3].x, documentCorners[3].y  // Bottom-left
        ]);
        
        // Calculate width and height of output document
        const widthA = Math.sqrt(Math.pow(documentCorners[2].x - documentCorners[3].x, 2) + 
                               Math.pow(documentCorners[2].y - documentCorners[3].y, 2));
        const widthB = Math.sqrt(Math.pow(documentCorners[1].x - documentCorners[0].x, 2) + 
                               Math.pow(documentCorners[1].y - documentCorners[0].y, 2));
        const maxWidth = Math.max(Math.floor(widthA), Math.floor(widthB));
        
        const heightA = Math.sqrt(Math.pow(documentCorners[1].x - documentCorners[2].x, 2) + 
                                Math.pow(documentCorners[1].y - documentCorners[2].y, 2));
        const heightB = Math.sqrt(Math.pow(documentCorners[0].x - documentCorners[3].x, 2) + 
                                Math.pow(documentCorners[0].y - documentCorners[3].y, 2));
        const maxHeight = Math.max(Math.floor(heightA), Math.floor(heightB));
        
        // Destination points (rectangle)
        const dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
          0, 0,               // Top-left
          maxWidth - 1, 0,    // Top-right
          maxWidth - 1, maxHeight - 1, // Bottom-right
          0, maxHeight - 1    // Bottom-left
        ]);
        
        // Get perspective transform and apply it
        const M = cv.getPerspectiveTransform(srcPoints, dstPoints);
        const dst = new cv.Mat();
        cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight));
        
        // Display result on canvas
        const correctedCanvas = document.createElement('canvas');
        correctedCanvas.width = maxWidth;
        correctedCanvas.height = maxHeight;
        cv.imshow(correctedCanvas, dst);
        
        // Get image data from the corrected canvas
        const imageData = correctedCanvas.toDataURL("image/jpeg", 0.95);
        
        // Clean up
        src.delete();
        dst.delete();
        srcPoints.delete();
        dstPoints.delete();
        M.delete();
        
        // Pass the corrected image to parent component
        onCapture(imageData);
        return;
      } catch (err) {
        console.error("Error during perspective correction:", err);
        // Fall back to uncorrected image
      }
    }
    
    // If perspective correction failed or wasn't attempted, use the original image
    const imageData = canvas.toDataURL("image/jpeg", 0.92);
    onCapture(imageData);
  }, [isCameraReady, onCapture, onError, resolution.height, resolution.width, documentCorners, isEdgeDetectionActive, isOpenCVReady, processFrame]);

  return (
    <div 
      ref={containerRef} 
      className={`vision-scanner ${isFullscreen ? 'fullscreen' : ''}`}
    >
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
      />
      
      {/* Loading overlay */}
      {isLoading && (
        <div className="vision-scanner-loading">
          <div className="loading-spinner"></div>
          <div className="loading-text">Initializing camera...</div>
        </div>
      )}
      
      {/* Document detection guide lines */}
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
      
      {/* UI Controls */}
      <div className="vision-scanner-controls">
        {/* iOS-style camera capture button */}
        <button 
          onClick={capture} 
          className={`vision-scanner-capture-button ${documentCorners ? 'document-ready' : ''}`}
          disabled={!isCameraReady}
          aria-label="Capture"
        >
          <span className="vision-scanner-capture-button-inner"></span>
        </button>
        
        <div className="vision-scanner-secondary-controls">
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
          
          <button 
            onClick={toggleFullscreen}
            className={`vision-scanner-icon-button ${isFullscreen ? 'active-button' : ''}`}
            aria-label={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3"></path>
                <path d="M21 8h-3a2 2 0 0 1-2-2V3"></path>
                <path d="M3 16h3a2 2 0 0 1 2 2v3"></path>
                <path d="M16 21v-3a2 2 0 0 1 2-2h3"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3"></path>
                <path d="M21 8V5a2 2 0 0 0-2-2h-3"></path>
                <path d="M3 16v3a2 2 0 0 0 2 2h3"></path>
                <path d="M16 21h3a2 2 0 0 0 2-2v-3"></path>
              </svg>
            )}
          </button>
          
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
      
      {/* Status indicator for OpenCV */}
      {!isOpenCVReady && isCameraReady && (
        <div className="vision-scanner-status">
          <div className="status-message">Loading vision features...</div>
        </div>
      )}
      
      {/* Document ready indicator */}
      {documentCorners && (
        <div className="vision-scanner-document-indicator">
          <div className="document-ready-message">Document detected</div>
        </div>
      )}
    </div>
  );
};