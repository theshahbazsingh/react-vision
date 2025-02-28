export interface VisionScannerProps {
  onCapture: (image: string) => void; // Base64 image callback
  facingMode?: "user" | "environment"; // Camera direction (default: environment)
}