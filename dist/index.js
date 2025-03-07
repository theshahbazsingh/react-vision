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

function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

var VisionScanner = function (_a) {
    var _b, _c, _d, _e;
    var onCapture = _a.onCapture, _f = _a.facingMode, facingMode = _f === void 0 ? "environment" : _f, _g = _a.onError, onError = _g === void 0 ? function () { } : _g; _a.resolution;
    // Refs
    var videoRef = react.useRef(null);
    var canvasRef = react.useRef(null);
    var edgeCanvasRef = react.useRef(null);
    var adjustmentCanvasRef = react.useRef(null);
    var cvRef = react.useRef(null);
    var animationFrameRef = react.useRef(null);
    var streamRef = react.useRef(null);
    var processingRef = react.useRef(false);
    var lastProcessTimeRef = react.useRef(0);
    var containerRef = react.useRef(null);
    var capturedImageRef = react.useRef(null);
    var cornerCacheRef = react.useRef(null);
    var orientationRef = react.useRef("portrait");
    var resizeObserverRef = react.useRef(null);
    // State
    var _j = react.useState(false), isCameraReady = _j[0], setIsCameraReady = _j[1];
    var _k = react.useState(0), cameraCount = _k[0], setCameraCount = _k[1];
    var _l = react.useState(facingMode), currentFacingMode = _l[0], setCurrentFacingMode = _l[1];
    var _m = react.useState(false), hasTorch = _m[0], setHasTorch = _m[1];
    var _o = react.useState(false), torchOn = _o[0], setTorchOn = _o[1];
    var _p = react.useState(false), isOpenCVReady = _p[0], setIsOpenCVReady = _p[1];
    var _q = react.useState(true), isEdgeDetectionActive = _q[0], setIsEdgeDetectionActive = _q[1];
    var _r = react.useState(true), isLoading = _r[0], setIsLoading = _r[1];
    var _s = react.useState(true), isEmbedded = _s[0], setIsEmbedded = _s[1];
    var _t = react.useState(null), documentCorners = _t[0], setDocumentCorners = _t[1];
    var _u = react.useState(null), errorMessage = _u[0], setErrorMessage = _u[1];
    var _v = react.useState(false), permissionDenied = _v[0], setPermissionDenied = _v[1];
    // Edge adjustment mode - separate from the camera state
    var _w = react.useState(false), isAdjustmentMode = _w[0], setIsAdjustmentMode = _w[1];
    var _x = react.useState(null), capturedImage = _x[0], setCapturedImage = _x[1];
    var _y = react.useState(false), imageLoaded = _y[0], setImageLoaded = _y[1];
    var _z = react.useState(null), adjustedCorners = _z[0], setAdjustedCorners = _z[1];
    var _0 = react.useState(null), activeCornerIndex = _0[0], setActiveCornerIndex = _0[1];
    var _1 = react.useState(false), isDragging = _1[0], setIsDragging = _1[1];
    var _2 = react.useState(null), magnifierPosition = _2[0], setMagnifierPosition = _2[1];
    var _3 = react.useState(false), showMagnifier = _3[0], setShowMagnifier = _3[1];
    // Error handling wrapper
    var handleError = react.useCallback(function (message) {
        console.error(message);
        setErrorMessage(message);
        onError(message);
    }, [onError]);
    // Stop stream
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
    // Detect screen orientation changes
    react.useEffect(function () {
        var handleOrientationChange = function () {
            var isPortrait = window.innerHeight > window.innerWidth;
            orientationRef.current = isPortrait ? "portrait" : "landscape";
            // Reset corner cache on orientation change to force recalculation
            cornerCacheRef.current = null;
            // If camera is ready, we need to adjust canvas dimensions
            if (videoRef.current && edgeCanvasRef.current && isCameraReady) {
                var video_1 = videoRef.current;
                var canvas_1 = edgeCanvasRef.current;
                // Ensure canvas matches video dimensions after orientation change
                setTimeout(function () {
                    if (video_1 && canvas_1) {
                        canvas_1.width = video_1.videoWidth;
                        canvas_1.height = video_1.videoHeight;
                    }
                }, 300); // Short delay to allow video dimensions to update
            }
        };
        window.addEventListener('resize', handleOrientationChange);
        // Set initial orientation
        handleOrientationChange();
        return function () {
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, [isCameraReady]);
    // Monitor container dimensions with ResizeObserver
    react.useEffect(function () {
        if (typeof ResizeObserver === 'undefined' || !containerRef.current)
            return;
        resizeObserverRef.current = new ResizeObserver(function (entries) {
            if (!entries[0])
                return;
            var containerWidth = entries[0].contentRect.width;
            var containerHeight = entries[0].contentRect.height;
            // Check if container dimensions change significantly
            if (cornerCacheRef.current && (containerWidth < 300 || containerHeight < 300)) {
                // Reset corner cache if container becomes too small
                cornerCacheRef.current = null;
            }
        });
        resizeObserverRef.current.observe(containerRef.current);
        return function () {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
        };
    }, []);
    // Load OpenCV.js with improved error handling
    react.useEffect(function () {
        if (typeof window === 'undefined')
            return;
        // @ts-ignore
        if (window.cv) {
            // @ts-ignore
            cvRef.current = window.cv;
            setIsOpenCVReady(true);
            return;
        }
        if (!document.getElementById('opencv-script')) {
            var script = document.createElement('script');
            script.id = 'opencv-script';
            script.src = 'https://docs.opencv.org/4.7.0/opencv.js';
            script.async = true;
            // Track loading time
            var startTime_1 = Date.now();
            var timeoutLimit_1 = 15000; // 15 seconds timeout
            var loadingTimeout_1 = setTimeout(function () {
                handleError("Computer vision library taking too long to load. Please check your connection and try again.");
            }, timeoutLimit_1);
            script.onload = function () {
                clearTimeout(loadingTimeout_1);
                var checkInterval = setInterval(function () {
                    // @ts-ignore
                    if (window.cv) {
                        clearInterval(checkInterval);
                        // @ts-ignore
                        cvRef.current = window.cv;
                        setIsOpenCVReady(true);
                        console.log("OpenCV loaded in ".concat(Date.now() - startTime_1, "ms"));
                    }
                    else if (Date.now() - startTime_1 > timeoutLimit_1) {
                        clearInterval(checkInterval);
                        handleError("Failed to initialize computer vision library");
                    }
                }, 100);
                // Safety cleanup after 20 seconds
                setTimeout(function () { return clearInterval(checkInterval); }, 20000);
            };
            script.onerror = function () {
                clearTimeout(loadingTimeout_1);
                handleError("Failed to load computer vision library. Please check your connection and try again.");
            };
            document.body.appendChild(script);
        }
        return function () {
            stopStreamInternal();
        };
    }, [handleError, stopStreamInternal]);
    // Camera management
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
                    if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.enumerateDevices)) {
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
                    console.error("Camera enumeration error:", err_1);
                    setCameraCount(0);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, []);
    var initCamera = react.useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var constraints, newStream_1, err_2;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (typeof window === 'undefined')
                        return [2 /*return*/];
                    // Reset error states
                    setErrorMessage(null);
                    setPermissionDenied(false);
                    if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia)) {
                        handleError("Camera not supported in this browser");
                        setIsLoading(false);
                        return [2 /*return*/];
                    }
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 3, , 4]);
                    setIsLoading(true);
                    stopStreamInternal();
                    constraints = {
                        video: {
                            facingMode: currentFacingMode,
                            width: { ideal: 1280 },
                            height: { ideal: 720 },
                        },
                    };
                    return [4 /*yield*/, navigator.mediaDevices.getUserMedia(constraints)];
                case 2:
                    newStream_1 = _b.sent();
                    streamRef.current = newStream_1;
                    if (videoRef.current) {
                        videoRef.current.srcObject = newStream_1;
                        videoRef.current.onloadedmetadata = function () { return __awaiter(void 0, void 0, void 0, function () {
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
                                        enumerateCameras();
                                        _a.label = 2;
                                    case 2: return [3 /*break*/, 4];
                                    case 3:
                                        err_3 = _a.sent();
                                        handleError("Video playback failed: ".concat(err_3.message));
                                        setIsLoading(false);
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        }); };
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _b.sent();
                    if (err_2.name === 'NotAllowedError' || err_2.name === 'PermissionDeniedError') {
                        setPermissionDenied(true);
                        handleError("Camera access denied. Please allow camera access to use the document scanner.");
                    }
                    else {
                        handleError("Camera access error: ".concat(err_2.message));
                    }
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [currentFacingMode, enumerateCameras, handleError, stopStreamInternal]);
    // Optimized document detection with improvements
    var detectDocumentCorners = react.useCallback(function (src, cv, width, height) {
        try {
            // Use cornerCacheRef to stabilize detection between frames
            // Only recalculate corners if we don't have cached corners or every 3rd frame
            if (cornerCacheRef.current && lastProcessTimeRef.current % 3 !== 0) {
                return cornerCacheRef.current;
            }
            var gray = new cv.Mat();
            var edges = new cv.Mat();
            var contours = new cv.MatVector();
            var hierarchy = new cv.Mat();
            try {
                // Pre-process the image
                cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
                cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
                // Adaptive threshold parameters based on image size
                var cannyThresholdLow = Math.min(30, width * height / 80000);
                var cannyThresholdHigh = Math.min(200, width * height / 12000);
                cv.Canny(gray, edges, cannyThresholdLow, cannyThresholdHigh);
                // Find contours
                cv.findContours(edges, contours, hierarchy, cv.RETR_LIST, cv.CHAIN_APPROX_SIMPLE);
                var bestCorners = null;
                var maxScore = 0;
                var minArea = width * height * 0.05;
                // Process largest contours first
                var contourInfo = [];
                for (var i = 0; i < contours.size(); i++) {
                    var contour = contours.get(i);
                    var area = cv.contourArea(contour);
                    if (area > minArea) {
                        contourInfo.push({ index: i, area: area });
                    }
                }
                // Sort by area, largest first
                contourInfo.sort(function (a, b) { return b.area - a.area; });
                // Only check top contours
                var contoursToCheck = Math.min(8, contourInfo.length);
                for (var i = 0; i < contoursToCheck; i++) {
                    var _a = contourInfo[i], index = _a.index, area = _a.area;
                    var contour = contours.get(index);
                    var perimeter = cv.arcLength(contour, true);
                    // Adjust epsilon factors based on screen orientation
                    var epsilons = orientationRef.current === "portrait"
                        ? [0.02, 0.03, 0.04]
                        : [0.03, 0.04, 0.05]; // Slightly larger epsilon for landscape
                    for (var _i = 0, epsilons_1 = epsilons; _i < epsilons_1.length; _i++) {
                        var epsilonFactor = epsilons_1[_i];
                        var epsilon = epsilonFactor * perimeter;
                        var approx = new cv.Mat();
                        cv.approxPolyDP(contour, approx, epsilon, true);
                        // Check if it's a quadrilateral
                        if (approx.rows === 4) {
                            // Convert to corner points
                            var corners = [];
                            for (var j = 0; j < 4; j++) {
                                corners.push({
                                    x: approx.data32S[j * 2],
                                    y: approx.data32S[j * 2 + 1]
                                });
                            }
                            // Calculate score based on multiple factors
                            var isConvex = cv.isContourConvex(approx);
                            if (!isConvex) {
                                approx.delete();
                                continue;
                            }
                            // Calculate aspect ratio score
                            var maxX = Math.max.apply(Math, corners.map(function (c) { return c.x; }));
                            var minX = Math.min.apply(Math, corners.map(function (c) { return c.x; }));
                            var maxY = Math.max.apply(Math, corners.map(function (c) { return c.y; }));
                            var minY = Math.min.apply(Math, corners.map(function (c) { return c.y; }));
                            var aspectRatio = (maxX - minX) / (maxY - minY);
                            // Different aspect ratio ranges for portrait vs landscape
                            var aspectScore = 1.0;
                            if (orientationRef.current === "portrait") {
                                // In portrait mode, prefer taller documents (0.5-1.3)
                                aspectScore = (aspectRatio >= 0.5 && aspectRatio <= 1.3) ? 1.0 :
                                    (aspectRatio > 1.3 && aspectRatio <= 2.0) ? 0.6 : 0.3;
                            }
                            else {
                                // In landscape mode, prefer wider documents (0.8-2.0)
                                aspectScore = (aspectRatio >= 0.8 && aspectRatio <= 2.0) ? 1.0 :
                                    (aspectRatio >= 0.5 && aspectRatio < 0.8) ? 0.7 : 0.3;
                            }
                            // Calculate distance from center
                            var centerX = width / 2;
                            var centerY = height / 2;
                            var cornersCenterX = corners.reduce(function (sum, c) { return sum + c.x; }, 0) / 4;
                            var cornersCenterY = corners.reduce(function (sum, c) { return sum + c.y; }, 0) / 4;
                            // Normalized distance (0-1) from center of frame
                            var distanceFromCenter = Math.sqrt(Math.pow((cornersCenterX - centerX) / width, 2) +
                                Math.pow((cornersCenterY - centerY) / height, 2));
                            // Prefer contours near center
                            var centerScore = 1.0 - Math.min(distanceFromCenter, 0.5) * 2;
                            // Size score: prefer contours that use a significant portion of the view
                            var sizeScore = Math.min(area / (width * height * 0.9), 1.0);
                            // Combined score
                            var totalScore = (aspectScore * 0.3 +
                                centerScore * 0.3 +
                                sizeScore * 0.4) * area; // Weight by area to prefer larger contours
                            if (totalScore > maxScore) {
                                maxScore = totalScore;
                                // Sort corners: top-left, top-right, bottom-right, bottom-left
                                corners.sort(function (a, b) { return a.y - b.y; }); // Sort by y first
                                // Get top and bottom pairs
                                var topTwo = corners.slice(0, 2);
                                var bottomTwo = corners.slice(2, 4);
                                // Sort top pair by x
                                topTwo.sort(function (a, b) { return a.x - b.x; });
                                // Sort bottom pair by x
                                bottomTwo.sort(function (a, b) { return a.x - b.x; });
                                bestCorners = [topTwo[0], topTwo[1], bottomTwo[1], bottomTwo[0]];
                            }
                        }
                        approx.delete();
                    }
                }
                // Update corner cache
                if (bestCorners) {
                    cornerCacheRef.current = bestCorners;
                }
                else if (lastProcessTimeRef.current % 10 === 0) {
                    // Every 10th frame, if no corners found, clear cache to avoid stale corners
                    cornerCacheRef.current = null;
                }
                return bestCorners;
            }
            finally {
                // Ensure cleanup happens even if processing fails
                gray.delete();
                edges.delete();
                contours.delete();
                hierarchy.delete();
            }
        }
        catch (err) {
            console.error("Document detection error:", err);
            return cornerCacheRef.current; // Return last good corners if there's an error
        }
    }, []);
    // Process video frames with improved stability and reliability
    var processFrame = react.useCallback(function () {
        if (!videoRef.current || !edgeCanvasRef.current || !cvRef.current || !isCameraReady || !isOpenCVReady) {
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
            return;
        }
        // Throttle processing - dynamic rate based on device capability
        var now = performance.now();
        var timeSinceLastProcess = now - lastProcessTimeRef.current;
        // Aim for maximum 15fps on all devices to balance performance and battery
        if (timeSinceLastProcess < 66) { // ~15fps
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }
        // Prevent concurrent processing
        if (processingRef.current) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
            return;
        }
        processingRef.current = true;
        lastProcessTimeRef.current = now;
        var cv = cvRef.current;
        var video = videoRef.current;
        var edgeCanvas = edgeCanvasRef.current;
        try {
            // Set canvas size to match video
            var width = video.videoWidth;
            var height = video.videoHeight;
            if (!width || !height) {
                // Skip this frame if video dimensions aren't available
                processingRef.current = false;
                animationFrameRef.current = requestAnimationFrame(processFrame);
                return;
            }
            if (edgeCanvas.width !== width || edgeCanvas.height !== height) {
                edgeCanvas.width = width;
                edgeCanvas.height = height;
            }
            var ctx_1 = edgeCanvas.getContext('2d');
            if (!ctx_1) {
                processingRef.current = false;
                animationFrameRef.current = requestAnimationFrame(processFrame);
                return;
            }
            // Clear previous drawings
            ctx_1.clearRect(0, 0, width, height);
            // Draw current frame to canvas
            ctx_1.drawImage(video, 0, 0, width, height);
            // Get the image data
            var imageData = ctx_1.getImageData(0, 0, width, height);
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
                // Only update state if corners have changed significantly
                // This reduces state updates and re-renders
                if (!documentCorners || hasCornersMoved(corners, documentCorners)) {
                    setDocumentCorners(corners);
                }
            }
            else if (documentCorners && !corners) {
                // Only clear corners state if we've lost detection for several frames
                if (!cornerCacheRef.current) {
                    setDocumentCorners(null);
                }
            }
            // Clean up
            src.delete();
        }
        catch (err) {
            console.error("Frame processing error:", err);
        }
        finally {
            processingRef.current = false;
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
        }
    }, [isEdgeDetectionActive, isCameraReady, isOpenCVReady, documentCorners, detectDocumentCorners]);
    // Helper to determine if corners have moved significantly
    var hasCornersMoved = function (corners1, corners2) {
        if (!corners1 || !corners2 || corners1.length !== corners2.length) {
            return true;
        }
        // Calculate average movement distance
        var totalDistance = 0;
        for (var i = 0; i < corners1.length; i++) {
            var dx = corners1[i].x - corners2[i].x;
            var dy = corners1[i].y - corners2[i].y;
            totalDistance += Math.sqrt(dx * dx + dy * dy);
        }
        // Only consider it moved if average movement > 5 pixels
        return (totalDistance / corners1.length) > 5;
    };
    // Initialize camera
    react.useEffect(function () {
        var _a;
        if (typeof window !== 'undefined') {
            // Check if browser supports getUserMedia
            if (!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia)) {
                handleError("Camera access not supported in this browser");
                return;
            }
            initCamera();
        }
        return function () {
            stopStreamInternal();
        };
    }, [currentFacingMode, initCamera, stopStreamInternal, handleError]);
    // Handle edge detection toggle - fixed to prevent video freeze
    react.useEffect(function () {
        if (isEdgeDetectionActive) {
            if (!animationFrameRef.current && isOpenCVReady && isCameraReady) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
        }
        else {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
                // Clear edge canvas
                if (edgeCanvasRef.current) {
                    var ctx = edgeCanvasRef.current.getContext('2d');
                    if (ctx) {
                        ctx.clearRect(0, 0, edgeCanvasRef.current.width, edgeCanvasRef.current.height);
                    }
                }
                // Clear document corners when edge detection is disabled
                setDocumentCorners(null);
                cornerCacheRef.current = null;
            }
        }
        // Ensure video continues playing even when edge detection is toggled
        if (isCameraReady && videoRef.current && videoRef.current.paused) {
            videoRef.current.play().catch(function (err) {
                console.error("Failed to play video after toggle:", err);
            });
        }
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isEdgeDetectionActive, isOpenCVReady, isCameraReady, processFrame]);
    // Handle visibility changes to save battery
    react.useEffect(function () {
        var handleVisibilityChange = function () {
            if (document.hidden) {
                // Page is hidden, pause processing
                if (animationFrameRef.current) {
                    cancelAnimationFrame(animationFrameRef.current);
                    animationFrameRef.current = null;
                }
            }
            else if (isEdgeDetectionActive && isOpenCVReady && isCameraReady) {
                // Page is visible again, resume processing
                if (!animationFrameRef.current) {
                    animationFrameRef.current = requestAnimationFrame(processFrame);
                }
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return function () {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isEdgeDetectionActive, isOpenCVReady, isCameraReady, processFrame]);
    // Set up adjustment canvas when entering adjustment mode
    react.useEffect(function () {
        if (isAdjustmentMode && capturedImage && adjustedCorners && adjustmentCanvasRef.current) {
            var canvas_2 = adjustmentCanvasRef.current;
            var img_1 = new Image();
            img_1.onload = function () {
                // Store the image in ref to avoid re-renders
                capturedImageRef.current = img_1;
                // Set canvas dimensions to match image
                canvas_2.width = img_1.width;
                canvas_2.height = img_1.height;
                // Draw initial image and overlay
                var ctx = canvas_2.getContext('2d');
                if (ctx) {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas_2.width, canvas_2.height);
                    // Draw image
                    ctx.drawImage(img_1, 0, 0);
                    // Draw overlay with corners
                    drawAdjustmentOverlay(ctx, adjustedCorners);
                    // Image is now loaded
                    setImageLoaded(true);
                }
            };
            img_1.onerror = function () {
                handleError("Failed to load captured image for adjustment");
                resetAdjustmentMode();
            };
            img_1.src = capturedImage;
        }
    }, [isAdjustmentMode, capturedImage, adjustedCorners, handleError]);
    // Draw adjustment overlay
    var drawAdjustmentOverlay = react.useCallback(function (ctx, corners) {
        if (!ctx || !corners || corners.length !== 4)
            return;
        // Draw semi-transparent yellow quad
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.fillStyle = 'rgba(255, 204, 0, 0.3)';
        ctx.fill();
        // Draw solid yellow border
        ctx.beginPath();
        ctx.moveTo(corners[0].x, corners[0].y);
        ctx.lineTo(corners[1].x, corners[1].y);
        ctx.lineTo(corners[2].x, corners[2].y);
        ctx.lineTo(corners[3].x, corners[3].y);
        ctx.closePath();
        ctx.strokeStyle = '#FFCC00';
        ctx.lineWidth = 3;
        ctx.stroke();
        // Draw corner handles
        corners.forEach(function (corner, index) {
            ctx.beginPath();
            ctx.arc(corner.x, corner.y, 12, 0, 2 * Math.PI);
            ctx.fillStyle = index === activeCornerIndex ? '#FF4500' : '#FFCC00';
            ctx.fill();
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 2;
            ctx.stroke();
        });
    }, [activeCornerIndex]);
    // Initialize adjustment mode
    var startAdjustment = react.useCallback(function (imageData, corners) {
        // Pause video processing
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }
        // Copy corners for adjustment
        setAdjustedCorners(__spreadArray([], corners, true));
        setCapturedImage(imageData);
        setIsAdjustmentMode(true);
    }, []);
    // Handle pointer events for corner adjustment
    var handlePointerDown = react.useCallback(function (e) {
        if (!adjustedCorners || !adjustmentCanvasRef.current)
            return;
        var canvas = adjustmentCanvasRef.current;
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var x = (e.clientX - rect.left) * scaleX;
        var y = (e.clientY - rect.top) * scaleY;
        // Find closest corner
        var minDistance = Number.MAX_VALUE;
        var closestIndex = -1;
        adjustedCorners.forEach(function (corner, index) {
            var distance = Math.hypot(corner.x - x, corner.y - y);
            if (distance < minDistance && distance < 30) {
                minDistance = distance;
                closestIndex = index;
            }
        });
        if (closestIndex !== -1) {
            setActiveCornerIndex(closestIndex);
            setIsDragging(true);
            // Show magnifier
            setShowMagnifier(true);
            // Set initial magnifier position
            var corner = adjustedCorners[closestIndex];
            setMagnifierPosition({ x: corner.x, y: corner.y });
            // Capture pointer
            canvas.setPointerCapture(e.pointerId);
        }
    }, [adjustedCorners]);
    var handlePointerMove = react.useCallback(function (e) {
        if (!isDragging || activeCornerIndex === null || !adjustedCorners || !adjustmentCanvasRef.current)
            return;
        var canvas = adjustmentCanvasRef.current;
        var rect = canvas.getBoundingClientRect();
        var scaleX = canvas.width / rect.width;
        var scaleY = canvas.height / rect.height;
        var x = Math.max(0, Math.min(canvas.width, (e.clientX - rect.left) * scaleX));
        var y = Math.max(0, Math.min(canvas.height, (e.clientY - rect.top) * scaleY));
        // Update corner position
        var newCorners = __spreadArray([], adjustedCorners, true);
        newCorners[activeCornerIndex] = { x: x, y: y };
        setAdjustedCorners(newCorners);
        // Update magnifier position
        setMagnifierPosition({ x: x, y: y });
        // Redraw
        var ctx = canvas.getContext('2d');
        if (ctx && capturedImageRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(capturedImageRef.current, 0, 0);
            drawAdjustmentOverlay(ctx, newCorners);
        }
    }, [isDragging, activeCornerIndex, adjustedCorners, drawAdjustmentOverlay]);
    var handlePointerUp = react.useCallback(function (e) {
        if (!isDragging || !adjustmentCanvasRef.current)
            return;
        setIsDragging(false);
        setActiveCornerIndex(null);
        setShowMagnifier(false);
        // Release pointer
        adjustmentCanvasRef.current.releasePointerCapture(e.pointerId);
    }, [isDragging]);
    // UI action handlers
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
                .catch(function (err) { return handleError("Torch toggle failed: ".concat(err.message)); });
        }
    }, [hasTorch, handleError, torchOn]);
    var toggleEdgeDetection = react.useCallback(function () {
        setIsEdgeDetectionActive(function (prev) { return !prev; });
    }, []);
    var toggleViewMode = react.useCallback(function () {
        setIsEmbedded(function (prev) { return !prev; });
    }, []);
    // Retry camera access after permission denial
    var retryCamera = react.useCallback(function () {
        setPermissionDenied(false);
        setErrorMessage(null);
        initCamera();
    }, [initCamera]);
    react.useEffect(function () {
        if (!isAdjustmentMode && videoRef.current && isCameraReady) {
            // Make sure video is playing after exiting adjustment mode
            if (videoRef.current.paused) {
                videoRef.current.play().catch(function (err) {
                    console.error("Failed to play video after adjustment mode change:", err);
                    // If playing fails, reinitialize the camera
                    initCamera();
                });
            }
        }
    }, [isAdjustmentMode, isCameraReady, initCamera]);
    // Save adjusted document - ensuring no yellow corners are included
    var confirmAdjustedDocument = react.useCallback(function () {
        if (!capturedImage || !adjustedCorners || !cvRef.current || !capturedImageRef.current)
            return;
        try {
            var cv = cvRef.current;
            // Create a clean canvas to hold the original image without any overlays
            var cleanCanvas = document.createElement('canvas');
            var originalImg = capturedImageRef.current;
            cleanCanvas.width = originalImg.width;
            cleanCanvas.height = originalImg.height;
            // Draw only the original image, no overlays
            var cleanCtx = cleanCanvas.getContext('2d');
            if (!cleanCtx)
                return;
            cleanCtx.drawImage(originalImg, 0, 0);
            // Get clean image data
            var imgData = cleanCtx.getImageData(0, 0, cleanCanvas.width, cleanCanvas.height);
            var src = cv.matFromImageData(imgData);
            // Source points (adjusted corners)
            var srcPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                adjustedCorners[0].x, adjustedCorners[0].y,
                adjustedCorners[1].x, adjustedCorners[1].y,
                adjustedCorners[2].x, adjustedCorners[2].y,
                adjustedCorners[3].x, adjustedCorners[3].y
            ]);
            // Calculate dimensions of output document
            var width = Math.max(Math.hypot(adjustedCorners[1].x - adjustedCorners[0].x, adjustedCorners[1].y - adjustedCorners[0].y), Math.hypot(adjustedCorners[2].x - adjustedCorners[3].x, adjustedCorners[2].y - adjustedCorners[3].y));
            var height = Math.max(Math.hypot(adjustedCorners[3].x - adjustedCorners[0].x, adjustedCorners[3].y - adjustedCorners[0].y), Math.hypot(adjustedCorners[2].x - adjustedCorners[1].x, adjustedCorners[2].y - adjustedCorners[1].y));
            // Ensure reasonable dimensions
            var maxWidth = Math.min(Math.ceil(width), 3000); // Limit max size
            var maxHeight = Math.min(Math.ceil(height), 3000);
            // Destination points (rectangle)
            var dstPoints = cv.matFromArray(4, 1, cv.CV_32FC2, [
                0, 0,
                maxWidth - 1, 0,
                maxWidth - 1, maxHeight - 1,
                0, maxHeight - 1
            ]);
            // Apply perspective transform
            var M = cv.getPerspectiveTransform(srcPoints, dstPoints);
            var dst = new cv.Mat();
            cv.warpPerspective(src, dst, M, new cv.Size(maxWidth, maxHeight));
            // Create output canvas
            var outputCanvas = document.createElement('canvas');
            outputCanvas.width = maxWidth;
            outputCanvas.height = maxHeight;
            cv.imshow(outputCanvas, dst);
            // Get final image data
            var finalImageData = outputCanvas.toDataURL("image/jpeg", 0.92);
            // Clean up
            src.delete();
            dst.delete();
            srcPoints.delete();
            dstPoints.delete();
            M.delete();
            // Reset adjustment mode
            resetAdjustmentMode();
            // Pass the corrected image to parent
            onCapture(finalImageData);
        }
        catch (err) {
            console.error("Error processing adjusted document:", err);
            handleError("Failed to process the document. Please try again.");
            resetAdjustmentMode();
        }
    }, [capturedImage, adjustedCorners, onCapture, handleError]);
    // Cancel adjustment and return to camera
    var cancelAdjustment = react.useCallback(function () {
        resetAdjustmentMode();
    }, []);
    // Reset adjustment mode state and ensure video resumes
    var resetAdjustmentMode = react.useCallback(function () {
        setIsAdjustmentMode(false);
        setCapturedImage(null);
        setAdjustedCorners(null);
        setImageLoaded(false);
        capturedImageRef.current = null;
        // Ensure camera is properly reinitialized
        if (videoRef.current && videoRef.current.srcObject && isCameraReady) {
            // Make sure video is playing
            if (videoRef.current.paused) {
                videoRef.current.play().catch(function (err) {
                    console.error("Failed to restart video after adjustment:", err);
                    // If playback fails, try reinitializing the camera
                    initCamera();
                });
            }
            // Resume video processing if edge detection is active
            if (isEdgeDetectionActive && isOpenCVReady) {
                if (!animationFrameRef.current) {
                    animationFrameRef.current = requestAnimationFrame(processFrame);
                }
            }
        }
        else if (isCameraReady) {
            // If video reference is broken, reinitialize the camera
            initCamera();
        }
    }, [isEdgeDetectionActive, isOpenCVReady, isCameraReady, processFrame, initCamera]);
    // Capture image
    var capture = react.useCallback(function () {
        if (!isCameraReady || !videoRef.current || !canvasRef.current)
            return;
        // Flash animation
        if (edgeCanvasRef.current) {
            var flashCtx_1 = edgeCanvasRef.current.getContext('2d');
            if (flashCtx_1) {
                var _a = edgeCanvasRef.current, width_1 = _a.width, height_1 = _a.height;
                flashCtx_1.fillStyle = 'rgba(255, 255, 255, 0.5)';
                flashCtx_1.fillRect(0, 0, width_1, height_1);
                setTimeout(function () {
                    if (edgeCanvasRef.current && flashCtx_1) {
                        flashCtx_1.clearRect(0, 0, width_1, height_1);
                    }
                }, 300);
            }
        }
        var video = videoRef.current;
        var canvas = canvasRef.current;
        // Set canvas dimensions to match video
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        var context = canvas.getContext('2d');
        if (!context)
            return;
        // Capture current frame
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        // Get image data
        var imageData = canvas.toDataURL("image/jpeg", 0.92);
        // If document detected, enter adjustment mode
        if (documentCorners && documentCorners.length === 4) {
            startAdjustment(imageData, documentCorners);
        }
        else {
            // No document detected, just capture the full frame
            onCapture(imageData);
        }
    }, [isCameraReady, documentCorners, startAdjustment, onCapture]);
    return (jsxRuntime.jsx("div", { ref: containerRef, className: "vision-scanner ".concat(isEmbedded ? 'embedded' : 'expanded'), children: permissionDenied ? (jsxRuntime.jsx("div", { className: "vision-scanner-permission-denied", children: jsxRuntime.jsxs("div", { className: "permission-message", children: [jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "48", height: "48", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }), jsxRuntime.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), jsxRuntime.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "16" })] }), jsxRuntime.jsx("h3", { children: "Camera Access Denied" }), jsxRuntime.jsx("p", { children: "Please allow camera access in your browser settings to use the document scanner." }), jsxRuntime.jsx("button", { onClick: retryCamera, className: "retry-button", children: "Retry Camera Access" })] }) })) : (jsxRuntime.jsx(jsxRuntime.Fragment, { children: !isAdjustmentMode ? (jsxRuntime.jsxs(jsxRuntime.Fragment, { children: [jsxRuntime.jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "vision-scanner-video" }), jsxRuntime.jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas", style: { display: 'none' } }), jsxRuntime.jsx("canvas", { ref: edgeCanvasRef, className: "vision-scanner-edge-canvas" }), isLoading && (jsxRuntime.jsxs("div", { className: "vision-scanner-loading", children: [jsxRuntime.jsx("div", { className: "loading-spinner" }), jsxRuntime.jsx("div", { className: "loading-text", children: "Initializing camera..." })] })), errorMessage && !isLoading && !permissionDenied && (jsxRuntime.jsx("div", { className: "vision-scanner-error", children: jsxRuntime.jsxs("div", { className: "error-message", children: [jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", children: [jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "10" }), jsxRuntime.jsx("line", { x1: "12", y1: "8", x2: "12", y2: "12" }), jsxRuntime.jsx("line", { x1: "12", y1: "16", x2: "12", y2: "16" })] }), errorMessage] }) })), isCameraReady && isOpenCVReady && isEdgeDetectionActive && !documentCorners && (jsxRuntime.jsxs("div", { className: "document-guide-overlay", children: [jsxRuntime.jsxs("div", { className: "document-guide-corners", children: [jsxRuntime.jsx("div", { className: "corner top-left" }), jsxRuntime.jsx("div", { className: "corner top-right" }), jsxRuntime.jsx("div", { className: "corner bottom-right" }), jsxRuntime.jsx("div", { className: "corner bottom-left" })] }), jsxRuntime.jsx("div", { className: "guide-text", children: "Position document within frame" })] })), jsxRuntime.jsxs("div", { className: "vision-scanner-controls", children: [jsxRuntime.jsx("button", { onClick: capture, className: "vision-scanner-capture-button ".concat(documentCorners ? 'document-ready' : ''), disabled: !isCameraReady, "aria-label": "Capture", children: jsxRuntime.jsx("span", { className: "vision-scanner-capture-button-inner" }) }), jsxRuntime.jsxs("div", { className: "vision-scanner-secondary-controls", children: [jsxRuntime.jsx("button", { onClick: toggleViewMode, className: "vision-scanner-icon-button ".concat(!isEmbedded ? 'active-button' : ''), "aria-label": isEmbedded ? "Expand Camera" : "Minimize Camera", children: isEmbedded ? (jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: jsxRuntime.jsx("path", { d: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" }) })) : (jsxRuntime.jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: jsxRuntime.jsx("path", { d: "M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" }) })) }), cameraCount > 1 && (jsxRuntime.jsx("button", { onClick: switchCamera, className: "vision-scanner-icon-button", "aria-label": "Switch Camera", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("path", { d: "M20 16v4a2 2 0 0 1-2 2h-4" }), jsxRuntime.jsx("path", { d: "M14 14l6 6" }), jsxRuntime.jsx("path", { d: "M4 8V4a2 2 0 0 1 2-2h4" }), jsxRuntime.jsx("path", { d: "M10 10L4 4" })] }) })), hasTorch && (jsxRuntime.jsx("button", { onClick: toggleTorch, className: "vision-scanner-icon-button ".concat(torchOn ? 'active-button' : ''), "aria-label": torchOn ? "Turn Off Light" : "Turn On Light", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("circle", { cx: "12", cy: "12", r: "5" }), jsxRuntime.jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), jsxRuntime.jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), jsxRuntime.jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), jsxRuntime.jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), jsxRuntime.jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), jsxRuntime.jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), jsxRuntime.jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), jsxRuntime.jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] }) })), jsxRuntime.jsx("button", { onClick: toggleEdgeDetection, disabled: !isCameraReady || !isOpenCVReady, className: "vision-scanner-icon-button ".concat(isEdgeDetectionActive ? 'active-button' : ''), "aria-label": isEdgeDetectionActive ? "Hide Document Detection" : "Show Document Detection", children: jsxRuntime.jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsxRuntime.jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), jsxRuntime.jsx("line", { x1: "3", y1: "9", x2: "21", y2: "9" }), jsxRuntime.jsx("line", { x1: "9", y1: "21", x2: "9", y2: "9" })] }) })] })] }), !isOpenCVReady && isCameraReady && (jsxRuntime.jsx("div", { className: "vision-scanner-status", children: jsxRuntime.jsx("div", { className: "status-message", children: "Loading vision features..." }) })), documentCorners && (jsxRuntime.jsx("div", { className: "vision-scanner-document-indicator", children: jsxRuntime.jsx("div", { className: "document-ready-message", children: "Document detected" }) }))] })) : (
            /* Adjustment Mode */
            jsxRuntime.jsxs("div", { className: "vision-scanner-adjustment-mode", children: [jsxRuntime.jsxs("div", { className: "adjustment-canvas-container", children: [jsxRuntime.jsx("canvas", { ref: adjustmentCanvasRef, className: "vision-scanner-adjustment-canvas", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp }), !imageLoaded && (jsxRuntime.jsxs("div", { className: "loading-overlay", children: [jsxRuntime.jsx("div", { className: "loading-spinner" }), jsxRuntime.jsx("div", { className: "loading-text", children: "Preparing image..." })] })), showMagnifier && magnifierPosition && imageLoaded && capturedImageRef.current && (jsxRuntime.jsx("div", { className: "corner-magnifier", style: {
                                    left: "".concat(Math.min(Math.max(magnifierPosition.x - 75, 20), ((_c = (_b = adjustmentCanvasRef.current) === null || _b === void 0 ? void 0 : _b.width) !== null && _c !== void 0 ? _c : 800) - 170), "px"),
                                    top: "".concat(Math.min(Math.max(magnifierPosition.y - 75, 20), ((_e = (_d = adjustmentCanvasRef.current) === null || _d === void 0 ? void 0 : _d.height) !== null && _e !== void 0 ? _e : 600) - 170), "px")
                                }, children: jsxRuntime.jsx("div", { className: "magnifier-content", style: {
                                        backgroundImage: "url(".concat(capturedImage, ")"),
                                        backgroundPosition: "-".concat(magnifierPosition.x * 2 - 75, "px -").concat(magnifierPosition.y * 2 - 75, "px"),
                                        backgroundSize: "".concat(capturedImageRef.current.width * 2, "px ").concat(capturedImageRef.current.height * 2, "px")
                                    }, children: jsxRuntime.jsx("div", { className: "magnifier-crosshair" }) }) }))] }), jsxRuntime.jsx("div", { className: "adjustment-instructions", children: jsxRuntime.jsx("div", { className: "instruction-text", children: "Drag corners to adjust document edges" }) }), jsxRuntime.jsxs("div", { className: "adjustment-controls", children: [jsxRuntime.jsx("button", { onClick: cancelAdjustment, className: "adjustment-button cancel-button", children: "Cancel" }), jsxRuntime.jsx("button", { onClick: confirmAdjustedDocument, className: "adjustment-button confirm-button", disabled: !imageLoaded, children: "Save" })] })] })) })) }));
};

exports.VisionScanner = VisionScanner;
//# sourceMappingURL=index.js.map
