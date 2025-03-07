/**
 * Props for the VisionScanner component
 */
export interface VisionScannerProps {
    /**
     * Callback function triggered when an image is captured
     * @param imageData Base64 encoded image data (JPEG format)
     */
    onCapture: (imageData: string) => void;
    /**
     * Preferred camera facing mode
     * @default "environment"
     */
    facingMode?: 'user' | 'environment';
    /**
     * Callback function for error handling
     * @param message Error message
     */
    onError?: (message: string) => void;
    /**
     * Optional camera resolution settings
     * @default { width: 640, height: 480 }
     */
    resolution?: {
        width: number;
        height: number;
    };
}
