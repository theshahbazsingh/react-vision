"use client";

import { useRef, useEffect } from "react";
import { VisionScannerProps } from "./types";
import "./styles.css";

export const VisionScanner = ({ onCapture, facingMode = "environment" }: VisionScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode } })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      })
      .catch((err) => console.error("Camera error:", err));

    return () => {
      if (videoRef.current?.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
      }
    };
  }, [facingMode]);

  const capture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);
    const image = canvas.toDataURL("image/jpeg");
    onCapture(image);
  };

  return (
    <div className="vision-scanner">
      <video ref={videoRef} className="vision-scanner-video" />
      <canvas ref={canvasRef} className="vision-scanner-canvas" />
      <button onClick={capture} className="vision-scanner-capture">Scan</button>
    </div>
  );
};