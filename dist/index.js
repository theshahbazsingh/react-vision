'use strict';

var jsxRuntime = require('react/jsx-runtime');
var react = require('react');

var VisionScanner = function (_a) {
    var onCapture = _a.onCapture, _b = _a.facingMode, facingMode = _b === void 0 ? "environment" : _b;
    var videoRef = react.useRef(null);
    var canvasRef = react.useRef(null);
    react.useEffect(function () {
        navigator.mediaDevices
            .getUserMedia({ video: { facingMode: facingMode } })
            .then(function (stream) {
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.play();
            }
        })
            .catch(function (err) { return console.error("Camera error:", err); });
        return function () {
            var _a;
            if ((_a = videoRef.current) === null || _a === void 0 ? void 0 : _a.srcObject) {
                videoRef.current.srcObject.getTracks().forEach(function (track) { return track.stop(); });
            }
        };
    }, [facingMode]);
    var capture = function () {
        var _a;
        if (!videoRef.current || !canvasRef.current)
            return;
        var video = videoRef.current;
        var canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        (_a = canvas.getContext("2d")) === null || _a === void 0 ? void 0 : _a.drawImage(video, 0, 0, canvas.width, canvas.height);
        var image = canvas.toDataURL("image/jpeg");
        onCapture(image);
    };
    return (jsxRuntime.jsxs("div", { className: "vision-scanner", children: [jsxRuntime.jsx("video", { ref: videoRef, className: "vision-scanner-video" }), jsxRuntime.jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas" }), jsxRuntime.jsx("button", { onClick: capture, className: "vision-scanner-capture", children: "Scan" })] }));
};

exports.VisionScanner = VisionScanner;
//# sourceMappingURL=index.js.map
