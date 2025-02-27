import React, { useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import {ReactVisionProps, ReactVisionRef } from "./types";
import "./styles.css";

export const ReactVisionCamera = forwardRef<ReactVisionRef, ReactVisionProps>(
  (
    {
      facingMode = "environment",
      aspectRatio = "cover",
      onCapture,
    },
    ref
  ) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Initialize camera stream
    useEffect(() => {
      const startStream = async () => {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode, focusMode: "continuous" },
          });
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.play();
          }
        } catch (err) {
          setError("Failed to access camera: " + (err as Error).message);
        }
      };
      startStream();

      return () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
          streamRef.current = null;
        }
      };
    }, [facingMode]);

    // Take photo
    const takePhoto = () => {
      if (!videoRef.current || !canvasRef.current) throw new Error("Camera not ready");
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context?.drawImage(video, 0, 0, canvas.width, canvas.height);
      const photo = canvas.toDataURL("image/jpeg");

      setImage(photo);
      if (onCapture) onCapture(photo);
      return photo;
    };

    // Tap-to-focus
    const refocus = async (x: number, y: number) => {
      if (streamRef.current) {
        const videoTrack = streamRef.current.getVideoTracks()[0];
        try {
          await videoTrack.applyConstraints({
            advanced: [
              {
                focusMode: "auto",
                pointOfInterest: { x, y }, // Experimental, falls back to auto
              },
            ],
          });
        } catch (err) {
          await videoTrack.applyConstraints({
            advanced: [{ focusMode: "auto" }],
          });
          console.warn("Point focus not supported, using auto:", err);
        }
      }
    };

    useImperativeHandle(ref, () => ({
      takePhoto,
      refocus,
    }));

    const handleTapFocus = (event: React.MouseEvent<HTMLDivElement>) => {
      if (videoRef.current) {
        const rect = videoRef.current.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width;
        const y = (event.clientY - rect.top) / rect.height;
        refocus(x, y).catch(err => setError("Focus error: " + err.message));
      }
    };

    const retakePhoto = () => {
      setImage(null);
      setError(null);
    };

    return (
      <div className="eye-tap-camera">
        {image ? (
          <div className="preview">
            <img src={image} alt="Captured document" />
            <button className="retake-btn" onClick={retakePhoto}>
              Retake
            </button>
          </div>
        ) : (
          <div className="camera-container" onClick={handleTapFocus}>
            <video
              ref={videoRef}
              playsInline
              autoPlay
              muted
              className={aspectRatio === "cover" ? "cover" : ""}
              style={aspectRatio !== "cover" ? { aspectRatio: aspectRatio } : undefined}
            />
            <canvas ref={canvasRef} className="hidden" />
            <div className="focus-overlay">Tap to focus</div>
            {error && <p className="error">{error}</p>}
            <button className="capture-btn" onClick={takePhoto} disabled={!videoRef.current}>
              Capture
            </button>
          </div>
        )}
      </div>
    );
  }
);

ReactVisionCamera.displayName = "ReactVisionCamera";