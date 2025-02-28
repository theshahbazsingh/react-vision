export interface VisionScannerProps {
    onCapture: (image: string) => void;
    facingMode?: "user" | "environment";
    onError?: (error: string) => void;
    resolution?: {
        width: number;
        height: number;
    };
}
export interface VisionScannerProps {
    onCapture: (imageData: string) => void;
    facingMode?: 'user' | 'environment';
    onError?: (message: string) => void;
    resolution?: {
        width: number;
        height: number;
    };
}
