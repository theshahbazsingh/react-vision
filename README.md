# React Vision

A lightweight, open-source React library for vision-related tools, starting with a mobile-friendly document scanner.

![React Vision Scanner Demo](https://via.placeholder.com/800x450?text=React+Vision+Document+Scanner)

## Features

- **Document Edge Detection**: Automatically detects document edges in the camera view
- **Perspective Correction**: Transforms captured documents to a proper rectangular view
- **Interactive Editing**: Manually adjust detected corners for perfect results
- **Mobile-friendly**: Optimized UI controls and responsive design for mobile devices
- **Multiple Camera Support**: Switch between front and back cameras
- **Torch Control**: Toggle device flashlight (when available)
- **Minimalist Design**: Steve Jobs-inspired clean, minimal interface
- **TypeScript Ready**: Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install react-vision
```

or

```bash
yarn add react-vision
```

## Usage

```jsx
import React, { useState } from 'react';
import { VisionScanner } from 'react-vision';

function DocumentScannerApp() {
  const [scannedImage, setScannedImage] = useState(null);
  
  const handleCapture = (imageData) => {
    setScannedImage(imageData);
  };
  
  const handleError = (errorMessage) => {
    console.error('Scanner error:', errorMessage);
  };
  
  return (
    <div className="app">
      {!scannedImage ? (
        <VisionScanner 
          onCapture={handleCapture}
          onError={handleError}
          facingMode="environment"
        />
      ) : (
        <div className="result">
          <img src={scannedImage} alt="Scanned document" />
          <button onClick={() => setScannedImage(null)}>Scan Another</button>
        </div>
      )}
    </div>
  );
}

export default DocumentScannerApp;
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onCapture` | `(imageData: string) => void` | **Required** | Callback function triggered when an image is captured. Receives the base64-encoded image data. |
| `facingMode` | `'user' \| 'environment'` | `'environment'` | Camera facing mode. Use `'environment'` for the rear camera or `'user'` for the front camera. |
| `onError` | `(message: string) => void` | `undefined` | Callback function for error handling. |
| `resolution` | `{ width: number, height: number }` | `{ width: 640, height: 480 }` | Optional camera resolution settings. |

## Browser Compatibility

React Vision uses standard browser APIs and works on most modern browsers:

- Chrome (desktop and mobile)
- Safari (desktop and mobile)
- Firefox (desktop and mobile)
- Edge (desktop and mobile)

Requires browsers with support for:
- `getUserMedia` API
- Canvas API

## Performance Tips

1. **Mobile Optimization**: The scanner is optimized for mobile use. Use the `facingMode="environment"` prop to use the rear-facing camera for document scanning.

2. **Camera Permissions**: Make sure your app requests camera permissions appropriately. Consider adding instructions for users on how to grant camera access.

3. **Full-Screen Mode**: For the best scanning experience, consider using the scanner in a full-screen or near-full-screen container.

## Styling

The scanner comes with minimal built-in styling. You can customize the appearance by targeting the following CSS classes:

- `.vision-scanner`: The main container element
- `.vision-scanner-video`: The video element showing the camera feed
- `.vision-scanner-controls`: The controls container
- `.vision-scanner-capture-button`: The main capture button

Example custom styling:

```css
.vision-scanner {
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.vision-scanner-capture-button {
  background-color: #2196F3;
}
```

## Example Use Cases

- Document scanning for expense reports
- Business card capture
- Receipt scanning for expense tracking
- Whiteboard capture for meeting notes
- ID card scanning

## Accessibility

The scanner includes proper ARIA labels for all controls and is designed to work with assistive technologies.

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.