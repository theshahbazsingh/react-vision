export interface VisionScannerProps {
    onCapture: (image: string) => void;
    facingMode?: "user" | "environment";
}
