import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useState, useEffect, useCallback } from 'react';

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

function __generator(thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var VisionScanner = function (_a) {
    var onCapture = _a.onCapture, _b = _a.facingMode, facingMode = _b === void 0 ? "environment" : _b, onError = _a.onError, _c = _a.resolution, resolution = _c === void 0 ? { width: 640, height: 480 } : _c;
    // Refs - stable references that don't cause re-renders
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var edgeCanvasRef = useRef(null);
    var cvRef = useRef(null);
    var animationFrameRef = useRef(null);
    var streamRef = useRef(null);
    var processingRef = useRef(false);
    // State that affects UI rendering
    var _d = useState(false), isCameraReady = _d[0], setIsCameraReady = _d[1];
    var _e = useState(0), cameraCount = _e[0], setCameraCount = _e[1];
    var _f = useState(facingMode), currentFacingMode = _f[0], setCurrentFacingMode = _f[1];
    var _g = useState(false), hasTorch = _g[0], setHasTorch = _g[1];
    var _h = useState(false), torchOn = _h[0], setTorchOn = _h[1];
    var _j = useState(false), isOpenCVReady = _j[0], setIsOpenCVReady = _j[1];
    var _k = useState(false), isEdgeDetectionActive = _k[0], setIsEdgeDetectionActive = _k[1];
    var _l = useState(true), isLoading = _l[0], setIsLoading = _l[1];
    // Load OpenCV.js only once on mount
    useEffect(function () {
        if (typeof window === 'undefined')
            return;
        // Handle already loaded OpenCV
        // @ts-ignore
        if (window.cv) {
            // @ts-ignore
            cvRef.current = window.cv;
            setIsOpenCVReady(true);
            console.log("OpenCV already loaded");
            return;
        }
        // Set up global callback for OpenCV initialization
        // @ts-ignore
        window.onOpenCvReady = function () {
            // @ts-ignore
            cvRef.current = window.cv;
            setIsOpenCVReady(true);
            console.log("OpenCV.js initialized");
        };
        // Add script only if it doesn't exist
        if (!document.getElementById('opencv-script')) {
            var script = document.createElement('script');
            script.id = 'opencv-script';
            script.src = 'https://docs.opencv.org/4.5.5/opencv.js';
            script.async = true;
            script.onload = function () { return console.log("OpenCV.js script loaded"); };
            script.onerror = function (e) {
                console.error("Failed to load OpenCV.js", e);
                onError === null || onError === void 0 ? void 0 : onError("Failed to load computer vision library");
            };
            document.body.appendChild(script);
        }
        // Cleanup function
        return function () {
            stopStreamInternal();
        };
    }, []); // Empty dependency array - only run once
    // Internal function to stop stream - doesn't trigger re-renders
    var stopStreamInternal = useCallback(function () {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(function (track) { return track.stop(); });
            streamRef.current = null;
        }
    }, []);
    // Camera management functions
    var stopStream = useCallback(function () {
        stopStreamInternal();
        setIsCameraReady(false);
    }, [stopStreamInternal]);
    var enumerateCameras = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var devices, videoDevices, err_1;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof window === 'undefined' || !((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.enumerateDevices)) {
                        onError === null || onError === void 0 ? void 0 : onError("Camera access not supported in this browser");
                        setCameraCount(0);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                case 2:
                    devices = _b.sent();
                    videoDevices = devices.filter(function (device) { return device.kind === "videoinput"; });
                    setCameraCount(videoDevices.length);
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _b.sent();
                    onError === null || onError === void 0 ? void 0 : onError("Failed to detect cameras: ".concat(err_1.message));
                    setCameraCount(0);
                    console.error("Camera enumeration error:", err_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [onError]);
    var initCamera = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var newStream_1, playVideo_1, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof window === 'undefined')
                        return [2 /*return*/];
                    if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia)) {
                        onError === null || onError === void 0 ? void 0 : onError("Camera not supported in this browser");
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    setIsLoading(true);
                    // Stop any existing stream first
                    stopStreamInternal();
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                            video: {
                                facingMode: currentFacingMode,
                                width: { ideal: resolution.width },
                                height: { ideal: resolution.height },
                            },
                        })];
                case 2:
                    newStream_1 = _b.sent();
                    // Store stream in ref to avoid re-renders
                    streamRef.current = newStream_1;
                    if (videoRef.current) {
                        videoRef.current.srcObject = newStream_1;
                        playVideo_1 = function () { return __awaiter(void 0, void 0, void 0, function () {
                            var track, capabilities, err_3;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 3, , 4]);
                                        if (!videoRef.current) return [3 /*break*/, 2];
                                        return [4 /*yield*/, videoRef.current.play()];
                                    case 1:
                                        _a.sent();
                                        setIsCameraReady(true);
                                        setIsLoading(false);
                                        track = newStream_1.getVideoTracks()[0];
                                        capabilities = track.getCapabilities();
                                        setHasTorch(capabilities && "torch" in capabilities);
                                        // Enumerate cameras after successful initialization
                                        enumerateCameras();
                                        _a.label = 2;
                                    case 2: return [3 /*break*/, 4];
                                    case 3:
                                        err_3 = _a.sent();
                                        onError === null || onError === void 0 ? void 0 : onError("Video playback failed: ".concat(err_3.message));
                                        console.error("Video playback error:", err_3);
                                        setIsLoading(false);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                        videoRef.current.onloadedmetadata = function () {
                            playVideo_1();
                        };
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    onError === null || onError === void 0 ? void 0 : onError("Camera access error: ".concat(err_2.message));
                    console.error("Camera initialization error:", err_2);
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [currentFacingMode, enumerateCameras, onError, resolution.height, resolution.width, stopStreamInternal]);
    // Edge detection function that uses refs rather than state for processing
    var processFrame = useCallback(function () {
        if (!videoRef.current || !edgeCanvasRef.current || !cvRef.current || !isCameraReady || !isOpenCVReady) {
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
            return;
        }
        // Prevent concurrent processing using ref instead of state
        if (processingRef.current) {
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
            return;
        }
        processingRef.current = true;
        var cv = cvRef.current;
        var video = videoRef.current;
        var edgeCanvas = edgeCanvasRef.current;
        // Set canvas size to match video
        if (edgeCanvas.width !== video.videoWidth || edgeCanvas.height !== video.videoHeight) {
            edgeCanvas.width = video.videoWidth || resolution.width;
            edgeCanvas.height = video.videoHeight || resolution.height;
        }
        try {
            // Create matrices for processing
            var src = new cv.Mat(edgeCanvas.height, edgeCanvas.width, cv.CV_8UC4);
            var dst = new cv.Mat(edgeCanvas.height, edgeCanvas.width, cv.CV_8UC1);
            var cap = new cv.VideoCapture(video);
            // Read current frame
            cap.read(src);
            // Convert to grayscale
            cv.cvtColor(src, src, cv.COLOR_RGBA2GRAY);
            // Apply Gaussian blur to reduce noise
            cv.GaussianBlur(src, src, new cv.Size(5, 5), 0);
            // Perform Canny edge detection
            cv.Canny(src, dst, 50, 150, 3);
            // Display result on canvas
            cv.imshow(edgeCanvas, dst);
            // Clean up to prevent memory leaks
            src.delete();
            dst.delete();
        }
        catch (err) {
            console.error("Edge detection error:", err);
        }
        finally {
            processingRef.current = false;
            // Continue processing if edge detection is active
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
        }
    }, [isEdgeDetectionActive, isCameraReady, isOpenCVReady, resolution.height, resolution.width]);
    // Initialize camera when component mounts or facingMode changes
    useEffect(function () {
        if (typeof window !== 'undefined') {
            initCamera();
        }
        return function () {
            stopStreamInternal();
        };
    }, [currentFacingMode, initCamera, stopStreamInternal]);
    // Handle edge detection toggle - more efficient with fewer state dependencies
    useEffect(function () {
        // Start or stop edge detection based on isEdgeDetectionActive state
        if (isEdgeDetectionActive) {
            if (!animationFrameRef.current) {
                console.log("Starting edge detection");
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
        }
        else {
            if (animationFrameRef.current) {
                console.log("Stopping edge detection");
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
                // Clear edge canvas when deactivated
                if (edgeCanvasRef.current) {
                    var ctx = edgeCanvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
                    }
                }
            }
        }
        // Cleanup function
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isEdgeDetectionActive, processFrame]);
    // UI interaction handlers
    var switchCamera = useCallback(function () {
        stopStream();
        setCurrentFacingMode(function (prev) { return (prev === "environment" ? "user" : "environment"); });
    }, [stopStream]);
    var toggleTorch = useCallback(function () {
        if (hasTorch && streamRef.current) {
            var track = streamRef.current.getVideoTracks()[0];
            var newTorchState_1 = !torchOn;
            track
                .applyConstraints({ advanced: [{ torch: newTorchState_1 }] })
                .then(function () { return setTorchOn(newTorchState_1); })
                .catch(function (err) { return onError === null || onError === void 0 ? void 0 : onError("Torch toggle failed: ".concat(err.message)); });
        }
    }, [hasTorch, onError, torchOn]);
    var toggleEdgeDetection = useCallback(function () {
        console.log("Toggle edge detection:", !isEdgeDetectionActive, "OpenCV ready:", isOpenCVReady);
        setIsEdgeDetectionActive(function (prev) { return !prev; });
    }, [isEdgeDetectionActive, isOpenCVReady]);
    var capture = useCallback(function () {
        if (!isCameraReady || !videoRef.current || !canvasRef.current) {
            onError === null || onError === void 0 ? void 0 : onError("Camera not ready for capture");
            return;
        }
        var video = videoRef.current;
        var canvas = canvasRef.current;
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth || resolution.width;
        canvas.height = video.videoHeight || resolution.height;
        var context = canvas.getContext("2d");
        if (!context) {
            onError === null || onError === void 0 ? void 0 : onError("Failed to get canvas context");
            return;
        }
        // Capture current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var imageData = canvas.toDataURL("image/jpeg");
        // Pass image to parent component
        onCapture(imageData);
    }, [isCameraReady, onCapture, onError, resolution.height, resolution.width]);
    return (jsxs("div", { className: "vision-scanner", children: [jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "vision-scanner-video" }), jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas", style: { display: 'none' } }), jsx("canvas", { ref: edgeCanvasRef, className: "vision-scanner-edge-canvas", style: {
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: isEdgeDetectionActive ? 'block' : 'none',
                    pointerEvents: 'none'
                } }), isLoading && (jsxs("div", { className: "vision-scanner-loading", children: [jsx("div", { className: "loading-spinner" }), jsx("div", { className: "loading-text", children: "Initializing camera..." })] })), jsxs("div", { className: "vision-scanner-controls", children: [jsx("button", { onClick: capture, className: "vision-scanner-button primary-button", disabled: !isCameraReady, children: "Scan Document" }), cameraCount > 1 && (jsx("button", { onClick: switchCamera, className: "vision-scanner-button", children: "Switch Camera" })), hasTorch && (jsx("button", { onClick: toggleTorch, className: "vision-scanner-button", children: torchOn ? "Light Off" : "Light On" })), jsx("button", { onClick: toggleEdgeDetection, disabled: !isCameraReady || !isOpenCVReady, className: "vision-scanner-button ".concat(isEdgeDetectionActive ? 'active-button' : ''), children: isEdgeDetectionActive ? "Hide Edges" : "Show Edges" })] }), !isOpenCVReady && isCameraReady && (jsx("div", { className: "vision-scanner-status", children: jsx("div", { className: "status-message", children: "Loading vision features..." }) }))] }));
};

export { VisionScanner };
//# sourceMappingURL=index.esm.js.map
