export interface VisionScannerProps {
  onCapture: (image: string) => void; // Callback for base64 image
  facingMode?: "user" | "environment"; // Default camera direction
  onError?: (error: string) => void; // Error callback
  resolution?: { width: number; height: number }; // Optional resolution
}