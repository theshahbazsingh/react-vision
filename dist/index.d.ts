import * as react_jsx_runtime from 'react/jsx-runtime';

interface VisionScannerProps {
    onCapture: (image: string) => void;
    facingMode?: "user" | "environment";
}

declare const VisionScanner: ({ onCapture, facingMode }: VisionScannerProps) => react_jsx_runtime.JSX.Element;

export { VisionScanner, VisionScannerProps };
