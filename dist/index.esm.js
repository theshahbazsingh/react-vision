import { jsx, jsxs, Fragment } from 'react/jsx-runtime';
import { useRef, useState, useCallback, useEffect } from 'react';

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
    var onCapture = _a.onCapture, _b = _a.facingMode, facingMode = _b === void 0 ? "environment" : _b, onError = _a.onError; _a.resolution;
    // Refs
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    var edgeCanvasRef = useRef(null);
    var adjustmentCanvasRef = useRef(null);
    var cvRef = useRef(null);
    var animationFrameRef = useRef(null);
    var streamRef = useRef(null);
    var processingRef = useRef(false);
    var lastProcessTimeRef = useRef(0);
    var containerRef = useRef(null);
    var capturedImageRef = useRef(null);
    var cornerCacheRef = useRef(null);
    // State
    var _d = useState(false), isCameraReady = _d[0], setIsCameraReady = _d[1];
    var _e = useState(0), cameraCount = _e[0], setCameraCount = _e[1];
    var _f = useState(facingMode), currentFacingMode = _f[0], setCurrentFacingMode = _f[1];
    var _g = useState(false), hasTorch = _g[0], setHasTorch = _g[1];
    var _h = useState(false), torchOn = _h[0], setTorchOn = _h[1];
    var _j = useState(false), isOpenCVReady = _j[0], setIsOpenCVReady = _j[1];
    var _k = useState(true), isEdgeDetectionActive = _k[0], setIsEdgeDetectionActive = _k[1];
    var _l = useState(true), isLoading = _l[0], setIsLoading = _l[1];
    var _m = useState(true), isEmbedded = _m[0], setIsEmbedded = _m[1];
    var _o = useState(null), documentCorners = _o[0], setDocumentCorners = _o[1];
    // Edge adjustment mode - separate from the camera state
    var _p = useState(false), isAdjustmentMode = _p[0], setIsAdjustmentMode = _p[1];
    var _q = useState(null), capturedImage = _q[0], setCapturedImage = _q[1];
    var _r = useState(false), imageLoaded = _r[0], setImageLoaded = _r[1];
    var _s = useState(null), adjustedCorners = _s[0], setAdjustedCorners = _s[1];
    var _t = useState(null), activeCornerIndex = _t[0], setActiveCornerIndex = _t[1];
    var _u = useState(false), isDragging = _u[0], setIsDragging = _u[1];
    // Stop stream
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
    // Load OpenCV.js
    useEffect(function () {
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
            script.onload = function () {
                var checkInterval = setInterval(function () {
                    // @ts-ignore
                    if (window.cv) {
                        clearInterval(checkInterval);
                        // @ts-ignore
                        cvRef.current = window.cv;
                        setIsOpenCVReady(true);
                    }
                }, 100);
                setTimeout(function () { return clearInterval(checkInterval); }, 10000);
            };
            script.onerror = function () {
                onError === null || onError === void 0 ? void 0 : onError("Failed to load computer vision library");
            };
            document.body.appendChild(script);
        }
        return function () {
            stopStreamInternal();
        };
    }, [onError, stopStreamInternal]);
    // Camera management
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
    var initCamera = useCallback(function () { return __awaiter(void 0, void 0, void 0, function () {
        var constraints, newStream_1, err_2;
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
                                        onError === null || onError === void 0 ? void 0 : onError("Video playback failed: ".concat(err_3.message));
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
                    onError === null || onError === void 0 ? void 0 : onError("Camera access error: ".concat(err_2.message));
                    setIsLoading(false);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [currentFacingMode, enumerateCameras, onError, stopStreamInternal]);
    // Optimized document detection - further improved stability
    var detectDocumentCorners = useCallback(function (src, cv, width, height) {
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
            // Pre-process the image
            cv.cvtColor(src, gray, cv.COLOR_RGBA2GRAY);
            cv.GaussianBlur(gray, gray, new cv.Size(5, 5), 0);
            cv.Canny(gray, edges, 30, 200); // Adjusted thresholds for better stability
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
                // Approximate the contour - try multiple epsilon values for stability
                var epsilons = [0.02, 0.03, 0.04]; // Try multiple approximation levels
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
                        // Common document aspect ratios (A4, letter, etc.) are between 0.5 and 2.0
                        var aspectScore = (aspectRatio > 0.5 && aspectRatio < 2.0) ? 1.0 : 0.5;
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
                        // Combined score with area weight
                        var totalScore = (aspectScore * 0.3 +
                            centerScore * 0.3 +
                            (area / (width * height)) * 0.4) * area; // Weight by area to prefer larger contours
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
            // Clean up
            gray.delete();
            edges.delete();
            contours.delete();
            hierarchy.delete();
            // Update corner cache
            if (bestCorners) {
                cornerCacheRef.current = bestCorners;
            }
            return bestCorners;
        }
        catch (err) {
            console.error("Document detection error:", err);
            return cornerCacheRef.current; // Return last good corners if there's an error
        }
    }, []);
    // Process video frames - improved stability
    var processFrame = useCallback(function () {
        if (!videoRef.current || !edgeCanvasRef.current || !cvRef.current || !isCameraReady || !isOpenCVReady) {
            if (isEdgeDetectionActive) {
                animationFrameRef.current = requestAnimationFrame(processFrame);
            }
            return;
        }
        // Throttle processing - 50ms (20fps) for better stability with less flicker
        var now = performance.now();
        var timeSinceLastProcess = now - lastProcessTimeRef.current;
        if (timeSinceLastProcess < 50) {
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
            if (edgeCanvas.width !== width || edgeCanvas.height !== height) {
                edgeCanvas.width = width;
                edgeCanvas.height = height;
            }
            var ctx_1 = edgeCanvas.getContext('2d');
            if (!ctx_1)
                return;
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
    useEffect(function () {
        if (typeof window !== 'undefined') {
            initCamera();
        }
        return function () {
            stopStreamInternal();
        };
    }, [currentFacingMode, initCamera, stopStreamInternal]);
    // Handle edge detection toggle
    useEffect(function () {
        if (isEdgeDetectionActive) {
            if (!animationFrameRef.current && isOpenCVReady) {
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
        return function () {
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
                animationFrameRef.current = null;
            }
        };
    }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);
    // Set up adjustment canvas when entering adjustment mode
    useEffect(function () {
        if (isAdjustmentMode && capturedImage && adjustedCorners && adjustmentCanvasRef.current) {
            var canvas_1 = adjustmentCanvasRef.current;
            var img_1 = new Image();
            img_1.onload = function () {
                // Store the image in ref to avoid re-renders
                capturedImageRef.current = img_1;
                // Set canvas dimensions to match image
                canvas_1.width = img_1.width;
                canvas_1.height = img_1.height;
                // Draw initial image and overlay
                var ctx = canvas_1.getContext('2d');
                if (ctx) {
                    // Clear canvas
                    ctx.clearRect(0, 0, canvas_1.width, canvas_1.height);
                    // Draw image
                    ctx.drawImage(img_1, 0, 0);
                    // Draw overlay with corners
                    drawAdjustmentOverlay(ctx, adjustedCorners);
                    // Image is now loaded
                    setImageLoaded(true);
                }
            };
            img_1.src = capturedImage;
        }
    }, [isAdjustmentMode, capturedImage, adjustedCorners]);
    // Draw adjustment overlay
    var drawAdjustmentOverlay = useCallback(function (ctx, corners) {
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
    var startAdjustment = useCallback(function (imageData, corners) {
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
    var handlePointerDown = useCallback(function (e) {
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
            // Capture pointer
            canvas.setPointerCapture(e.pointerId);
        }
    }, [adjustedCorners]);
    var handlePointerMove = useCallback(function (e) {
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
        // Redraw
        var ctx = canvas.getContext('2d');
        if (ctx && capturedImageRef.current) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(capturedImageRef.current, 0, 0);
            drawAdjustmentOverlay(ctx, newCorners);
        }
    }, [isDragging, activeCornerIndex, adjustedCorners, drawAdjustmentOverlay]);
    var handlePointerUp = useCallback(function (e) {
        if (!isDragging || !adjustmentCanvasRef.current)
            return;
        setIsDragging(false);
        setActiveCornerIndex(null);
        // Release pointer
        adjustmentCanvasRef.current.releasePointerCapture(e.pointerId);
    }, [isDragging]);
    // UI action handlers
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
        setIsEdgeDetectionActive(function (prev) { return !prev; });
    }, []);
    var toggleViewMode = useCallback(function () {
        setIsEmbedded(function (prev) { return !prev; });
    }, []);
    // Save adjusted document
    var confirmAdjustedDocument = useCallback(function () {
        if (!capturedImage || !adjustedCorners || !cvRef.current || !adjustmentCanvasRef.current)
            return;
        try {
            var cv = cvRef.current;
            var canvas = adjustmentCanvasRef.current;
            // Get image data
            var ctx = canvas.getContext('2d');
            if (!ctx)
                return;
            var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
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
            var maxWidth = Math.ceil(width);
            var maxHeight = Math.ceil(height);
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
            resetAdjustmentMode();
        }
    }, [capturedImage, adjustedCorners, onCapture]);
    // Cancel adjustment and return to camera
    var cancelAdjustment = useCallback(function () {
        resetAdjustmentMode();
    }, []);
    // Reset adjustment mode state
    var resetAdjustmentMode = useCallback(function () {
        setIsAdjustmentMode(false);
        setCapturedImage(null);
        setAdjustedCorners(null);
        setImageLoaded(false);
        capturedImageRef.current = null;
        // Resume video processing
        if (isEdgeDetectionActive && isOpenCVReady) {
            animationFrameRef.current = requestAnimationFrame(processFrame);
        }
    }, [isEdgeDetectionActive, isOpenCVReady, processFrame]);
    // Capture image
    var capture = useCallback(function () {
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
    return (jsx("div", { ref: containerRef, className: "vision-scanner ".concat(isEmbedded ? 'embedded' : 'expanded'), children: !isAdjustmentMode ? (jsxs(Fragment, { children: [jsx("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "vision-scanner-video" }), jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas", style: { display: 'none' } }), jsx("canvas", { ref: edgeCanvasRef, className: "vision-scanner-edge-canvas" }), isLoading && (jsxs("div", { className: "vision-scanner-loading", children: [jsx("div", { className: "loading-spinner" }), jsx("div", { className: "loading-text", children: "Initializing camera..." })] })), isCameraReady && isOpenCVReady && isEdgeDetectionActive && !documentCorners && (jsxs("div", { className: "document-guide-overlay", children: [jsxs("div", { className: "document-guide-corners", children: [jsx("div", { className: "corner top-left" }), jsx("div", { className: "corner top-right" }), jsx("div", { className: "corner bottom-right" }), jsx("div", { className: "corner bottom-left" })] }), jsx("div", { className: "guide-text", children: "Position document within frame" })] })), jsxs("div", { className: "vision-scanner-controls", children: [jsx("button", { onClick: capture, className: "vision-scanner-capture-button ".concat(documentCorners ? 'document-ready' : ''), disabled: !isCameraReady, "aria-label": "Capture", children: jsx("span", { className: "vision-scanner-capture-button-inner" }) }), jsxs("div", { className: "vision-scanner-secondary-controls", children: [jsx("button", { onClick: toggleViewMode, className: "vision-scanner-icon-button ".concat(!isEmbedded ? 'active-button' : ''), "aria-label": isEmbedded ? "Expand Camera" : "Minimize Camera", children: isEmbedded ? (jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: jsx("path", { d: "M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" }) })) : (jsx("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: jsx("path", { d: "M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3" }) })) }), cameraCount > 1 && (jsx("button", { onClick: switchCamera, className: "vision-scanner-icon-button", "aria-label": "Switch Camera", children: jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("path", { d: "M20 16v4a2 2 0 0 1-2 2h-4" }), jsx("path", { d: "M14 14l6 6" }), jsx("path", { d: "M4 8V4a2 2 0 0 1 2-2h4" }), jsx("path", { d: "M10 10L4 4" })] }) })), hasTorch && (jsx("button", { onClick: toggleTorch, className: "vision-scanner-icon-button ".concat(torchOn ? 'active-button' : ''), "aria-label": torchOn ? "Turn Off Light" : "Turn On Light", children: jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("circle", { cx: "12", cy: "12", r: "5" }), jsx("line", { x1: "12", y1: "1", x2: "12", y2: "3" }), jsx("line", { x1: "12", y1: "21", x2: "12", y2: "23" }), jsx("line", { x1: "4.22", y1: "4.22", x2: "5.64", y2: "5.64" }), jsx("line", { x1: "18.36", y1: "18.36", x2: "19.78", y2: "19.78" }), jsx("line", { x1: "1", y1: "12", x2: "3", y2: "12" }), jsx("line", { x1: "21", y1: "12", x2: "23", y2: "12" }), jsx("line", { x1: "4.22", y1: "19.78", x2: "5.64", y2: "18.36" }), jsx("line", { x1: "18.36", y1: "5.64", x2: "19.78", y2: "4.22" })] }) })), jsx("button", { onClick: toggleEdgeDetection, disabled: !isCameraReady || !isOpenCVReady, className: "vision-scanner-icon-button ".concat(isEdgeDetectionActive ? 'active-button' : ''), "aria-label": isEdgeDetectionActive ? "Hide Document Detection" : "Show Document Detection", children: jsxs("svg", { xmlns: "http://www.w3.org/2000/svg", viewBox: "0 0 24 24", width: "24", height: "24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round", children: [jsx("rect", { x: "3", y: "3", width: "18", height: "18", rx: "2", ry: "2" }), jsx("line", { x1: "3", y1: "9", x2: "21", y2: "9" }), jsx("line", { x1: "9", y1: "21", x2: "9", y2: "9" })] }) })] })] }), !isOpenCVReady && isCameraReady && (jsx("div", { className: "vision-scanner-status", children: jsx("div", { className: "status-message", children: "Loading vision features..." }) })), documentCorners && (jsx("div", { className: "vision-scanner-document-indicator", children: jsx("div", { className: "document-ready-message", children: "Document detected" }) }))] })) : (
        /* Adjustment Mode */
        jsxs("div", { className: "vision-scanner-adjustment-mode", children: [jsxs("div", { className: "adjustment-canvas-container", children: [jsx("canvas", { ref: adjustmentCanvasRef, className: "vision-scanner-adjustment-canvas", onPointerDown: handlePointerDown, onPointerMove: handlePointerMove, onPointerUp: handlePointerUp, onPointerCancel: handlePointerUp }), !imageLoaded && (jsxs("div", { className: "loading-overlay", children: [jsx("div", { className: "loading-spinner" }), jsx("div", { className: "loading-text", children: "Preparing image..." })] }))] }), jsx("div", { className: "adjustment-instructions", children: jsx("div", { className: "instruction-text", children: "Drag corners to adjust document edges" }) }), jsxs("div", { className: "adjustment-controls", children: [jsx("button", { onClick: cancelAdjustment, className: "adjustment-button cancel-button", children: "Cancel" }), jsx("button", { onClick: confirmAdjustedDocument, className: "adjustment-button confirm-button", disabled: !imageLoaded, children: "Save" })] })] })) }));
};

export { VisionScanner };
//# sourceMappingURL=index.esm.js.map
