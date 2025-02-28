"use client";

import { useRef, useEffect, useState } from "react";
import { VisionScannerProps } from "./types";
import "./styles.css";

export const VisionScanner = ({
  onCapture,
  facingMode = "environment",
  onError,
  resolution = { width: 640, height: 480 },
}: VisionScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [cameraCount, setCameraCount] = useState(0);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Stop the camera stream when unmounting or switching
  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  };

  useEffect(() => {
    const initCamera = async () => {
      // Verify camera API support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        const errorMsg = "Camera not supported on this device.";
        onError?.(errorMsg);
        console.error(errorMsg);
        return;
      }

      try {
        // Count available cameras
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === "videoinput");
        setCameraCount(videoDevices.length);

        // Request camera stream
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: currentFacingMode,
            width: { ideal: resolution.width },
            height: { ideal: resolution.height },
          },
        });
        setStream(newStream);

        if (videoRef.current) {
          videoRef.current.srcObject = newStream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(err => {
              onError?.(`Failed to start video: ${err.message}`);
              console.error(err);
            });
            setIsCameraReady(true);

            // Check for torch support
            const track = newStream.getVideoTracks()[0];
            const capabilities = track.getCapabilities();
            if (capabilities && "torch" in capabilities) {
              setHasTorch(true);
            }
          };
        }
      } catch (err: any) {
        const errorMsg = `Camera error: ${err.message}`;
        onError?.(errorMsg);
        console.error(errorMsg);
      }
    };

    initCamera();

    // Cleanup on unmount or facingMode change
    return () => stopStream();
  }, [currentFacingMode, resolution.width, resolution.height, onError]);

  // Switch between front and back cameras
  const switchCamera = () => {
    stopStream();
    setCurrentFacingMode(prev => (prev === "environment" ? "user" : "environment"));
  };

  // Toggle torch on/off
  const toggleTorch = () => {
    if (hasTorch && stream) {
      const track = stream.getVideoTracks()[0];
      const newTorchState = !torchOn;
      track.applyConstraints({ advanced: [{ torch: newTorchState } as any] })
        .then(() => setTorchOn(newTorchState))
        .catch(err => {
          onError?.(`Torch toggle failed: ${err.message}`);
          console.error(err);
        });
    }
  };

  // Capture image from video feed
  const capture = () => {
    if (!isCameraReady || !videoRef.current || !canvasRef.current) {
      const errorMsg = "Camera not ready.";
      onError?.(errorMsg);
      console.error(errorMsg);
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || resolution.width;
    canvas.height = video.videoHeight || resolution.height;

    const context = canvas.getContext("2d");
    if (!context) {
      const errorMsg = "Failed to get canvas context.";
      onError?.(errorMsg);
      console.error(errorMsg);
      return;
    }

    // Flip the context horizontally to mirror the image
    context.scale(-1, 1); // Mirror horizontally
    context.translate(-canvas.width, 0); // Adjust position after flip
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg");

    // Reset the context transform to avoid affecting future draws
    context.setTransform(1, 0, 0, 1, 0, 0);

    onCapture(image);
  };

  return (
    <div className="vision-scanner">
      <video ref={videoRef} playsInline className="vision-scanner-video" />
      <canvas ref={canvasRef} className="vision-scanner-canvas" />
      <div className="vision-scanner-controls">
        <button onClick={capture} disabled={!isCameraReady}>
          Scan
        </button>
        {cameraCount > 1 && (
          <button onClick={switchCamera}>
            Flip Camera
          </button>
        )}
        {hasTorch && (
          <button onClick={toggleTorch}>
            {torchOn ? "Torch Off" : "Torch On"}
          </button>
        )}
      </div>
    </div>
  );
};