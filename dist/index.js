'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

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
    var videoRef = react.useRef(null);
    var canvasRef = react.useRef(null);
    var edgeCanvasRef = react.useRef(null);
    var cvRef = react.useRef(null);
    var animationFrameRef = react.useRef(null);
    var streamRef = react.useRef(null);
    var processingRef = react.useRef(false);
    var containerRef = react.useRef(null);
    // State that affects UI rendering
    var _d = react.useState(false), isCameraReady = _d[0], setIsCameraReady = _d[1];
    var _e = react.useState(0), cameraCount = _e[0], setCameraCount = _e[1];
    var _f = react.useState(facingMode), currentFacingMode = _f[0], setCurrentFacingMode = _f[1];
    var _g = react.useState(false), hasTorch = _g[0], setHasTorch = _g[1];
    var _h = react.useState(false), torchOn = _h[0], setTorchOn = _h[1];
    var _j = react.useState(false), isOpenCVReady = _j[0], setIsOpenCVReady = _j[1];
    var _k = react.useState(true), isEdgeDetectionActive = _k[0], setIsEdgeDetectionActive = _k[1]; // Enabled by default
    var _l = react.useState(true), isLoading = _l[0], setIsLoading = _l[1];
    var _m = react.useState(false), isFullscreen = _m[0], setIsFullscreen = _m[1];
    var _o = react.useState(null), documentCorners = _o[0], setDocumentCorners = _o[1];
    // Internal function to stop stream - doesn't trigger re-renders
    var stopStreamInternal = react.useCallback(function () {
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(function (track) { return track.stop(); });
            streamRef.current = null;
        }
    }, []);
    // Load OpenCV.js only once on mount
    react.useEffect(function () {
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
        // Add script only if it doesn't exist
        if (!document.getElementById('opencv-script')) {
            var script = document.createElement('script');
            script.id = 'opencv-script';
            script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
            script.async = true;
            script.onload = function () {
                console.log("OpenCV.js script loaded, waiting for initialization...");
                // Start polling for cv object
                var checkInterval = setInterval(function () {
                    // @ts-ignore
                    if (window.cv) {
                        clearInterval(checkInterval);
                        // @ts-ignore
                        cvRef.current = window.cv;
                        setIsOpenCVReady(true);
                        console.log("OpenCV.js initialized through polling");
                    }
                }, 200);
                // Set a timeout to prevent infinite polling
                setTimeout(function () { return clearInterval(checkInterval); }, 20000);
            };
            script.onerror = function (e) {
                console.error("Failed to load OpenCV.js", e);
                onError === null || onError === void 0 ? void 0 : onError("Failed to load computer vision library");
            };
            document.body.appendChild(script);
        }
        // Add fullscreen event listeners for all browser variants
        var handleFullscreenChange = function () {
            setIsFullscreen(!!document.fullscreenElement ||
                // @ts-ignore - Webkit
                !!document.webkitFullscreenElement ||
                // @ts-ignore - Mozilla
                !!document.mozFullScreenElement ||
                // @ts-ignore - MS
                !!document.msFullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        document.addEventListener('mozfullscreenchange', handleFullscreenChange);
        document.addEventListener('MSFullscreenChange', handleFullscreenChange);
        // Check if user is on mobile
        var isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        if (isMobile) {
            // On mobile, start in full height mode by default
            setIsFullscreen(true);
        }
        // Cleanup function
        return function () {
            stopStreamInternal();
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
            document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
            document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
        };
    }, [onError, stopStreamInternal]);
    // Camera management functions
    var stopStream = react.useCallback(function () {
        stopStreamInternal();
        setIsCameraReady(false);
    }, [stopStreamInternal]);
    var enumerateCameras = react.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
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
    var initCamera = react.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var constraints, newStream_1, playVideo_1, err_2;
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
                    constraints = {
                        video: {
                            facingMode: currentFacingMode,
                            width: { ideal: 1920 },
                            height: { ideal: 1080 },
                            // Prioritize quality over framerate for document scanning
                            frameRate: { ideal: 30 },
                        },
                    };
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
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
    }); }, [currentFacingMode, enumerateCameras, onError, stopStreamInternal]);
    // Helper function to calculate rectangularity score
    var calculateRectangularity = function (corners) {
        if (corners.length !== 4)
            return 0;
        // Calculate sides
        var sides = [];
        for (var i = 0; i < 4; i++) {
            var p1 = corners[i];
            var p2 = corners[(i + 1) % 4];
            var dx = p2.x - p1.x;
            var dy = p2.y - p1.y;
            sides.push(Math.sqrt(dx * dx + dy * dy));
        }
        // Sort sides into pairs (should be 2 pairs of equal lengths for a rectangle)
        sides.sort(function (a, b) { return a - b; });
        // Check if sides[0] ≈ sides[1] and sides[2] ≈ sides[3]
        var ratio1 = Math.min(sides[0], sides[1]) / Math.max(sides[0], sides[1]);
        var ratio2 = Math.min(sides[2], sides[3]) / Math.max(sides[2], sides[3]);
        // Check if the aspect ratio is reasonable (not too narrow)
        var aspectRatio = Math.min(sides[0] / sides[2], sides[2] / sides[0]);
        // Score based on how rectangular the shape is (all sides paired, reasonable aspect ratio)
        return (ratio1 * ratio2) * Math.min(1, aspectRatio * 2);
    };
    // Document detection function using OpenCV - improved version
    var detectDocumentCorners = function (src, cv, width, height) {
        try {
            // Create matrices for processing
            var gray = new cv.Mat();
            var blurred = new cv.Mat();
            var edges = new cv.Mat();
            var dilated = new cv.Mat();
            var contours = new cv.MatVector();
            var hierarchy = new cv.Mat();
            var dst = new cv.Mat();
            // Pre-process the image - more robust preprocessing
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            // Apply bilateral filter for better edge preservation while removing noise
            cv.bilateralFilter(gray, blurred, 9, 75, 75);
            // Use adaptive threshold for better results in varying lighting
            cv.adaptiveThreshold(blurred, dst, 255, cv.ADAPTIVE_THRESH_GAUSSIAN_C, cv.THRESH_BINARY, 11, 2);
            // Apply Canny edge detection with better parameters
            cv.Canny(blurred, edges, 50, 150, 3, true); // Use L2gradient for better accuracy
            // Dilate edges to connect broken lines
            var dilationSize = new cv.Size(2, 2);
            var dilationElement = cv.getStructuringElement(cv.MORPH_RECT, dilationSize);
            cv.dilate(edges, dilated, dilationElement, new cv.Point(-1, -1), 1);
            dilationElement.delete();
            // Find contours on the dilated edge image
            cv.findContours(dilated, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
            // Filter contours by area, angle, and other properties
            var bestCorners = null;
            var maxScore = 0;
            for (var i = 0; i < contours.size(); i++) {
                var contour = contours.get(i);
                var area = cv.contourArea(contour);
                var frameArea = width * height;
                // Skip tiny or huge contours
                if (area < frameArea * 0.03 || area > frameArea * 0.98) {
                    continue;
                }
                // Calculate contour perimeter (arc length)
                var perimeter = cv.arcLength(contour, true);
                // Calculate contour complexity score (area / perimeter ratio)
                // Documents tend to have a certain ratio
                var complexity = area / (perimeter * perimeter);
                // Documents should be somewhat convex
                var hull = new cv.Mat();
                cv.convexHull(contour, hull);
                var hullArea = cv.contourArea(hull);
                var solidity = area / hullArea;
                hull.delete();
                // Rectangle approximation
                var epsilon = 0.02 * perimeter;
                var approx = new cv.Mat();
                cv.approxPolyDP(contour, approx, epsilon, true);
                // Check if approximation has 4 points (rectangular)
                if (approx.rows === 4) {
                    // Convert to corner points
                    var corners = [];
                    for (var j = 0; j < 4; j++) {
                        corners.push({
                            x: approx.data32S[j * 2],
                            y: approx.data32S[j * 2 + 1]
                        });
                    }
                    // Check if the corners form a convex quadrilateral
                    var isConvex = cv.isContourConvex(approx);
                    // Calculate the angles between adjacent sides
                    var minAngle = 180;
                    var maxAngle = 0;
                    for (var j = 0; j < 4; j++) {
                        var p1 = corners[j];
                        var p2 = corners[(j + 1) % 4];
                        var p3 = corners[(j + 2) % 4];
                        // Calculate angle using dot product
                        var v1x = p2.x - p1.x;
                        var v1y = p2.y - p1.y;
                        var v2x = p3.x - p2.x;
                        var v2y = p3.y - p2.y;
                        var dotProduct = v1x * v2x + v1y * v2y;
                        var mag1 = Math.sqrt(v1x * v1x + v1y * v1y);
                        var mag2 = Math.sqrt(v2x * v2x + v2y * v2y);
                        var angle = Math.acos(dotProduct / (mag1 * mag2)) * (180 / Math.PI);
                        minAngle = Math.min(minAngle, angle);
                        maxAngle = Math.max(maxAngle, angle);
                    }
                    // Calculate aspect score
                    var aspectScore = calculateRectangularity(corners);
                    // Calculate total score based on multiple features
                    // Higher score for shapes that are:
                    // 1. Convex
                    // 2. Have angles close to 90°
                    // 3. Have good aspect ratio
                    // 4. Have good solidity
                    var angleScore = (minAngle > 65 && maxAngle < 115) ? (1 - Math.abs(minAngle - 90) / 90) : 0;
                    var solidityScore = solidity > 0.8 ? solidity : 0;
                    var totalScore = ((isConvex ? 1 : 0) * 0.3 +
                        angleScore * 0.3 +
                        aspectScore * 0.2 +
                        solidityScore * 0.2) * area; // Weight by area to prefer larger contours
                    if (totalScore > maxScore) {
                        maxScore = totalScore;
                        // Sort corners in order: top-left, top-right, bottom-right, bottom-left
                        corners.sort(function (a, b) { return a.y + a.x - (b.y + b.x); }); // Top-left first
                        var tl = corners[0];
                        var br = corners[corners.length - 1];
                        // Top-right has smallest difference between y and x
                        // Bottom-left has largest difference between y and x
                        corners.sort(function (a, b) { return (a.y - a.x) - (b.y - b.x); });
                        var tr = corners[0];
                        var bl = corners[corners.length - 1];
                        bestCorners = [tl, tr, br, bl];
                    }
                }
                approx.delete();
            }
            // Clean up
            gray.delete();
            blurred.delete();
            edges.delete();
            dilated.delete();
            dst.delete();
            contours.delete();
            hierarchy.delete();
            return bestCorners;
        }
        catch (err) {
            console.error("Document detection error:", err);
        }
        return null;
    };
    // Edge detection and document finding function
    var processFrame = react.useCallback(function () {
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
        try {
            // Set canvas size to match video exactly
            var width = video.videoWidth || resolution.width;
            var height = video.videoHeight || resolution.height;
            // Only resize if needed to avoid unnecessary reflows
            if (edgeCanvas.width !== width || edgeCanvas.height !== height) {
                edgeCanvas.width = width;
                edgeCanvas.height = height;
            }
            // Get the canvas context and draw the current video frame
            var ctx_1 = edgeCanvas.getContext('2d');
            if (!ctx_1) {
                throw new Error("Could not get canvas context");
            }
            // Clear previous drawings
            ctx_1.clearRect(0, 0, width, height);
            // Create a temporary canvas to get the image data
            var tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            var tempCtx = tempCanvas.getContext('2d');
            if (!tempCtx) {
                throw new Error("Could not get temporary canvas context");
            }
            // Draw the current video frame to the temp canvas
            tempCtx.drawImage(video, 0, 0, width, height);
            // Get the image data from the canvas
            var imageData = tempCtx.getImageData(0, 0, width, height);
            // Create OpenCV matrix from the image data
            var src = cv.matFromImageData(imageData);
            // Detect document corners
            var corners = detectDocumentCorners(src, cv, width, height);
            // If corners were found, draw overlay
            if (corners && corners.length === 4) {
                // Draw semi-transparent yellow quad
                ctx_1.beginPath();
                ctx_1.moveTo(corners[0].x, corners[0].y);
                ctx_1.lineTo(corners[1].x, corners[1].y);
                ctx_1.lineTo(corners[2].x, corners[2].y);
                ctx_1.lineTo(corners[3].x, corners[3].y);
                ctx_1.closePath();
                ctx_1.fillStyle = 'rgba(255, 255, 0, 0.25)';
                ctx_1.fill();
                // Draw solid yellow border
                ctx_1.beginPath();
                ctx_1.moveTo(corners[0].x, corners[0].y);
                ctx_1.lineTo(corners[1].x, corners[1].y);
                ctx_1.lineTo(corners[2].x, corners[2].y);
                ctx_1.lineTo(corners[3].x, corners[3].y);
                ctx_1.closePath();
                ctx_1.strokeStyle = '#FFCC00';
                ctx_1.lineWidth = 3;
                ctx_1.stroke();
                // Draw corner dots
                ctx_1.fillStyle = '#FFCC00';
                corners.forEach(function (corner) {
                    ctx_1.beginPath();
                    ctx_1.arc(corner.x, corner.y, 6, 0, 2 * Math.PI);
                    ctx_1.fill();
                });
                // Store corners for capture
                setDocumentCorners(corners);
            }
            else {
                setDocumentCorners(null);
            }
            // Clean up
            src.delete();
        }
        catch (err) {
            console.error("Edge detection error:", err);
            // Clear the canvas on error to prevent showing garbage
            var ctx = edgeCanvas.getContext('2d');
            if (ctx) {
                ctx.clearRect(0, 0, edgeCanvas.width, edgeCanvas.height);
            }
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
    react.useEffect(function () {
        if (typeof window !== 'undefined') {
            initCamera();
        }
        return function () {
            stopStreamInternal();
        };
    }, [currentFacingMode, initCamera, stopStreamInternal]);
    // Handle edge detection toggle - more efficient with fewer state dependencies
    react.useEffect(function () {
        // Start or stop edge detection based on isEdgeDetectionActive state
        if (isEdgeDetectionActive) {
            if (!animationFrameRef.current && isOpenCVReady) {
                console.log("Starting document detection");
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
        }
        else {
            if (animationFrameRef.current) {
                console.log("Stopping document detection");
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
                // Clear edge canvas when deactivated
                if (edgeCanvasRef.current) {
                    var ctx = edgeCanvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
                    }
                }
                // Clear corners
                setDocumentCorners(null);
            }
        }
        // Cleanup function
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);
    // UI interaction handlers
    var switchCamera = react.useCallback(function () {
        stopStream();
        setCurrentFacingMode(function (prev) { return (prev === "environment" ? "user" : "environment"); });
    }, [stopStream]);
    var toggleTorch = react.useCallback(function () {
        if (hasTorch && streamRef.current) {
            var track = streamRef.current.getVideoTracks()[0];
            var newTorchState_1 = !torchOn;
            track
                .applyConstraints({ advanced: [{ torch: newTorchState_1 }] })
                .then(function () { return setTorchOn(newTorchState_1); })
                .catch(function (err) { return onError === null || onError === void 0 ? void 0 : onError("Torch toggle failed: ".concat(err.message)); });
        }
    }, [hasTorch, onError, torchOn]);
    var toggleEdgeDetection = react.useCallback(function () {
        console.log("Toggle document detection:", !isEdgeDetectionActive, "OpenCV ready:", isOpenCVReady);
        setIsEdgeDetectionActive(function (prev) { return !prev; });
    }, [isEdgeDetectionActive, isOpenCVReady]);
    var toggleFullscreen = react.useCallback(function () {
        // Try standard fullscreen API first
        if (!document.fullscreenElement && containerRef.current) {
            try {
                containerRef.current.requestFullscreen().catch(function (err) {
                    console.warn("Standard fullscreen failed: ".concat(err.message));
                    // If standard fullscreen fails, just set a class for CSS to handle
                    setIsFullscreen(true);
                });
            }
            catch (err) {
                console.warn("Fullscreen API not supported, using CSS fallback");
                setIsFullscreen(true);
            }
        }
        else if (document.exitFullscreen) {
            try {
                document.exitFullscreen().catch(function () {
                    // If exit fails, manually toggle the state
                    setIsFullscreen(false);
                });
            }
            catch (err) {
                console.warn("Exit fullscreen API failed, using CSS fallback");
                setIsFullscreen(false);
            }
        }
        else {
            // Toggle fullscreen state manually for CSS fallback
            setIsFullscreen(function (prev) { return !prev; });
        }
    }, []);
    // Enhanced capture function that uses the detected document corners if available
    var capture = react.useCallback(function () {
        if (!isCameraReady || !videoRef.current || !canvasRef.current) {
            onError === null || onError === void 0 ? void 0 : onError("Camera not ready for capture");
            return;
        }
        // Visual feedback for capture - flash animation
        if (edgeCanvasRef.current) {
            var flashCtx_1 = edgeCanvasRef.current.getContext('2d');
            if (flashCtx_1) {
                // Create flash effect
                flashCtx_1.fillStyle = 'rgba(255, 255, 255, 0.5)';
                flashCtx_1.fillRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
                // Clear the flash after a short delay
                setTimeout(function () {
                    if (edgeCanvasRef.current && flashCtx_1) {
                        flashCtx_1.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
                        // Redraw document overlay if needed
                        if (isEdgeDetectionActive) {
                            processFrame();
                        }
                    }
                }, 300);
            }
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
        // If we have document corners and OpenCV is ready, create a perspective corrected version
        if (documentCorners && documentCorners.length === 4 && isOpenCVReady && cvRef.current) {
            try {
                var cv = cvRef.current;
                // Create source matrix from canvas
                var imgData = context.getImageData(0, 0, canvas.width, canvas.height);
                var src = cv.matFromImageData(imgData);
                // Source points (document corners detected in the image)
                var srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    documentCorners[0].x, documentCorners[0].y, // Top-left
                    documentCorners[1].x, documentCorners[1].y, // Top-right
                    documentCorners[2].x, documentCorners[2].y, // Bottom-right
                    documentCorners[3].x, documentCorners[3].y // Bottom-left
                ]);
                // Calculate width and height of output document
                var widthA = Math.sqrt(Math.pow(documentCorners[2].x - documentCorners[3].x, 2) +
                    Math.pow(documentCorners[2].y - documentCorners[3].y, 2));
                var widthB = Math.sqrt(Math.pow(documentCorners[1].x - documentCorners[0].x, 2) +
                    Math.pow(documentCorners[1].y - documentCorners[0].y, 2));
                var maxWidth = Math.max(Math.floor(widthA), Math.floor(widthB));
                var heightA = Math.sqrt(Math.pow(documentCorners[1].x - documentCorners[2].x, 2) +
                    Math.pow(documentCorners[1].y - documentCorners[2].y, 2));
                var heightB = Math.sqrt(Math.pow(documentCorners[0].x - documentCorners[3].x, 2) +
                    Math.pow(documentCorners[0].y - documentCorners[3].y, 2));
                var maxHeight = Math.max(Math.floor(heightA), Math.floor(heightB));
                // Destination points (rectangle)
                var dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0, // Top-left
                    maxWidth - 1, 0, // Top-right
                    maxWidth - 1, maxHeight - 1, // Bottom-right
                    0, maxHeight - 1 // Bottom-left
                ]);
                // Get perspective transform and apply it
                var M = cv.getPerspectiveTransform(srcPoints, dstPoints);
                var dst = new cv.Mat();
                cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight));
                // Display result on canvas
                var correctedCanvas = document.createElement('canvas');
                correctedCanvas.width = maxWidth;
                correctedCanvas.height = maxHeight;
                cv.imshow(correctedCanvas, dst);
                // Get image data from the corrected canvas
                var imageData_1 = correctedCanvas.toDataURL("image/jpeg", 0.95);
                // Clean up
                src.delete();
                dst.delete();
                srcPoints.delete();
                dstPoints.delete();
                M.delete();
                // Pass the corrected image to parent component
                onCapture(imageData_1);
                return;
            }
            catch (err) {
                console.error("Error during perspective correction:", err);
                // Fall back to uncorrected image
            }
        }
        // If perspective correction failed or wasn't attempted, use the original image
        var imageData = canvas.toDataURL("image/jpeg", 0.92);
        onCapture(imageData);
    }, [isCameraReady, onCapture, onError, resolution.height, resolution.width, documentCorners, isEdgeDetectionActive, isOpenCVReady, processFrame]);
    return (jsxRuntime.jsxs("div", { ref: containerRef, className: "vision-scanner ".concat(isFullscreen ? 'fullscreen' : ''), children: [jsxRuntime.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "vision-scanner-video" }), jsxRuntime.jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas", style: { display: 'none' } }), jsxRuntime.jsx("canvas", { ref: edgeCanvasRef, className: "vision-scanner-edge-canvas" }), isLoading && (jsxRuntime.jsxs("div", { className: "vision-scanner-loading", children: [jsxRuntime.jsx("div", { className: "loading-spinner" }), jsxRuntime.jsx("div", { className: "loading-text", children: "Initializing camera..." })] })), isCameraReady && isOpenCVReady && isEdgeDetectionActive && !documentCorners && (jsxRuntime.jsxs("div", { className: "document-guide-overlay", children: [jsxRuntime.jsxs("div", { className: "document-guide-corners", children: [jsxRuntime.jsx("div", { className: "corner top-left" }), jsxRuntime.jsx("div", { className: "corner top-right" }), jsxRuntime.jsx("div", { className: "corner bottom-right" }), jsxRuntime.jsx("div", { className: "corner bottom-left" })] }), jsxRuntime.jsx("div", { className: "guide-text", children: "Position document within frame" })] })), jsxRuntime.jsxs("div", { className: "vision-scanner-controls", children: [jsxRuntime.jsx("button", { onClick: capture, className: "vision-scanner-capture-button ".concat(documentCorners ? 'document-ready' : ''), disabled: !isCameraReady, "aria-label": "Capture", children: jsxRuntime.jsx("span", { className: "vision-scanner-capture-button-inner" }) }), jsxRuntime.jsxs("div", { className: "vision-scanner-secondary-controls", children: [cameraCount > 1 && (jsxRuntime.jsx("button", { onClick: switchCamera, className: "vision-scanner-icon-button", "aria-label": "Switch Camera", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("path", { d: "M20 16v4a2 2 0 0 1-2 2h-4" }), jsxRuntime.jsx("path", { d: "M14 14l6 6" }), jsxRuntime.jsx("path", { d: "M4 8V4a2 2 0 0 1 2-2h4" }), jsxRuntime.jsx("path", { d: "M10 10L4 4" })] }) })), jsxRuntime.jsx("button", { onClick: toggleFullscreen, className: "vision-scanner-icon-button ".concat(isFullscreen ? 'active-button' : ''), "aria-label": isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen", children: isFullscreen ? (jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("path", { d: "M8 3v3a2 2 0 0 1-2 2H3" }), jsxRuntime.jsx("path", { d: "M21 8h-3a2 2 0 0 1-2-2V3" }), jsxRuntime.jsx("path", { d: "M3 16h3a2 2 0 0 1 2 2v3" }), jsxRuntime.jsx("path", { d: "M16 21v-3a2 2 0 0 1 2-2h3" })] })) : (jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("path", { d: "M8 3H5a2 2 0 0 0-2 2v3" }), jsxRuntime.jsx("path", { d: "M21 8V5a2 2 0 0 0-2-2h-3" }), jsxRuntime.jsx("path", { d: "M3 16v3a2 2 0 0 0 2 2h3" }), jsxRuntime.jsx("path", { d: "M16 21h3a2 2 0 0 0 2-2v-3" })] })) }), hasTorch && (jsxRuntime.jsx("button", { onClick: toggleTorch, className: "vision-scanner-icon-button ".concat(torchOn ? 'active-button' : ''), "aria-label": torchOn ? "Turn Off Light" : "Turn On Light", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "5" }), jsxRuntime.jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), jsxRuntime.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), jsxRuntime.jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), jsxRuntime.jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), jsxRuntime.jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), jsxRuntime.jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), jsxRuntime.jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), jsxRuntime.jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] }) })), jsxRuntime.jsx("button", { onClick: toggleEdgeDetection, disabled: !isCameraReady || !isOpenCVReady, className: "vision-scanner-icon-button ".concat(isEdgeDetectionActive ? 'active-button' : ''), "aria-label": isEdgeDetectionActive ? "Hide Document Detection" : "Show Document Detection", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), jsxRuntime.jsx("line", { x1: "3", y1: "9", x2: "21", y2: "9" }), jsxRuntime.jsx("line", { x1: "9", y1: "21", x2: "9", y2: "9" })] }) })] })] }), !isOpenCVReady && isCameraReady && (jsxRuntime.jsx("div", { className: "vision-scanner-status", children: jsxRuntime.jsx("div", { className: "status-message", children: "Loading vision features..." }) })), documentCorners && (jsxRuntime.jsx("div", { className: "vision-scanner-document-indicator", children: jsxRuntime.jsx("div", { className: "document-ready-message", children: "Document detected" }) }))] }));
};

exports.VisionScanner = VisionScanner;
//# sourceMappingURL=index.js.map
