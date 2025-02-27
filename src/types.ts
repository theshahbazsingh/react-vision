export interface ReactVisionProps {
  facingMode?: "user" | "environment";
  aspectRatio?: number | "cover";
  onCapture?: (image: string) => void;
}

export interface ReactVisionRef {
  takePhoto: () => string;
  refocus: (x: number, y: number) => Promise<void>;
}