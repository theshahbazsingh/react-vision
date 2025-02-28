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
    var videoRef = react.useRef(null);
    var canvasRef = react.useRef(null);
    var _d = react.useState(false), isCameraReady = _d[0], setIsCameraReady = _d[1];
    var _e = react.useState(0), cameraCount = _e[0], setCameraCount = _e[1];
    var _f = react.useState(facingMode), currentFacingMode = _f[0], setCurrentFacingMode = _f[1];
    var _g = react.useState(false), hasTorch = _g[0], setHasTorch = _g[1];
    var _h = react.useState(false), torchOn = _h[0], setTorchOn = _h[1];
    var _j = react.useState(null), stream = _j[0], setStream = _j[1];
    // Stop the camera stream when unmounting or switching
    var stopStream = function () {
        if (stream) {
            stream.getTracks().forEach(function (track) { return track.stop(); });
            setStream(null);
            setIsCameraReady(false);
        }
    };
    react.useEffect(function () {
        var initCamera = function () { return __awaiter(void 0, void 0, void 0, function () {
            var errorMsg, devices, videoDevices, newStream_1, err_1, errorMsg;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // Verify camera API support
                        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
                            errorMsg = "Camera not supported on this device.";
                            onError === null || onError === void 0 ? void 0 : onError(errorMsg);
                            console.error(errorMsg);
                            return [2 /*return*/];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, navigator.mediaDevices.enumerateDevices()];
                    case 2:
                        devices = _a.sent();
                        videoDevices = devices.filter(function (device) { return device.kind === "videoinput"; });
                        setCameraCount(videoDevices.length);
                        return [4 /*yield*/, navigator.mediaDevices.getUserMedia({
                                video: {
                                    facingMode: currentFacingMode,
                                    width: { ideal: resolution.width },
                                    height: { ideal: resolution.height },
                                },
                            })];
                    case 3:
                        newStream_1 = _a.sent();
                        setStream(newStream_1);
                        if (videoRef.current) {
                            videoRef.current.srcObject = newStream_1;
                            videoRef.current.onloadedmetadata = function () {
                                var _a;
                                (_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.play().catch(function (err) {
                                    onError === null || onError === void 0 ? void 0 : onError("Failed to start video: ".concat(err.message));
                                    console.error(err);
                                });
                                setIsCameraReady(true);
                                // Check for torch support
                                var track = newStream_1.getVideoTracks()[0];
                                var capabilities = track.getCapabilities();
                                if (capabilities && "torch" in capabilities) {
                                    setHasTorch(true);
                                }
                            };
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        errorMsg = "Camera error: ".concat(err_1.message);
                        onError === null || onError === void 0 ? void 0 : onError(errorMsg);
                        console.error(errorMsg);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); };
        initCamera();
        // Cleanup on unmount or facingMode change
        return function () { return stopStream(); };
    }, [currentFacingMode, resolution.width, resolution.height, onError]);
    // Switch between front and back cameras
    var switchCamera = function () {
        stopStream();
        setCurrentFacingMode(function (prev) { return (prev === "environment" ? "user" : "environment"); });
    };
    // Toggle torch on/off
    var toggleTorch = function () {
        if (hasTorch && stream) {
            var track = stream.getVideoTracks()[0];
            var newTorchState_1 = !torchOn;
            track.applyConstraints({ advanced: [{ torch: newTorchState_1 }] })
                .then(function () { return setTorchOn(newTorchState_1); })
                .catch(function (err) {
                onError === null || onError === void 0 ? void 0 : onError("Torch toggle failed: ".concat(err.message));
                console.error(err);
            });
        }
    };
    // Capture image from video feed
    var capture = function () {
        if (!isCameraReady || !videoRef.current || !canvasRef.current) {
            var errorMsg = "Camera not ready.";
            onError === null || onError === void 0 ? void 0 : onError(errorMsg);
            console.error(errorMsg);
            return;
        }
        var video = videoRef.current;
        var canvas = canvasRef.current;
        canvas.width = video.videoWidth || resolution.width;
        canvas.height = video.videoHeight || resolution.height;
        var context = canvas.getContext("2d");
        if (!context) {
            var errorMsg = "Failed to get canvas context.";
            onError === null || onError === void 0 ? void 0 : onError(errorMsg);
            console.error(errorMsg);
            return;
        }
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        var image = canvas.toDataURL("image/jpeg");
        onCapture(image);
    };
    return (jsxRuntime.jsxs("div", { className: "vision-scanner", children: [jsxRuntime.jsx("video", { ref: videoRef, playsInline: true, className: "vision-scanner-video" }), jsxRuntime.jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas" }), jsxRuntime.jsxs("div", { className: "vision-scanner-controls", children: [jsxRuntime.jsx("button", { onClick: capture, disabled: !isCameraReady, children: "Scan" }), cameraCount > 1 && (jsxRuntime.jsx("button", { onClick: switchCamera, children: "Flip Camera" })), hasTorch && (jsxRuntime.jsx("button", { onClick: toggleTorch, children: torchOn ? "Torch Off" : "Torch On" }))] })] }));
};

exports.VisionScanner = VisionScanner;
//# sourceMappingURL=index.js.map
