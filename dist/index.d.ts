import * as react_jsx_runtime from 'react/jsx-runtime';

interface VisionScannerProps {
    onCapture: (image: string) => void;
    facingMode?: "user" | "environment";
    onError?: (error: string) => void;
    resolution?: {
        width: number;
        height: number;
    };
}

declare const VisionScanner: ({ onCapture, facingMode, onError, resolution, }: VisionScannerProps) => react_jsx_runtime.JSX.Element;

export { VisionScanner, VisionScannerProps };
