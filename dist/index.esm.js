import { jsxs, jsx } from 'react/jsx-runtime';
import { useRef, useEffect } from 'react';

var VisionScanner = function (_a) {
    var onCapture = _a.onCapture, _b = _a.facingMode, facingMode = _b === void 0 ? "environment" : _b;
    var videoRef = useRef(null);
    var canvasRef = useRef(null);
    useEffect(function () {
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
    return (jsxs("div", { className: "vision-scanner", children: [jsx("video", { ref: videoRef, className: "vision-scanner-video" }), jsx("canvas", { ref: canvasRef, className: "vision-scanner-canvas" }), jsx("button", { onClick: capture, className: "vision-scanner-capture", children: "Scan" })] }));
};

export { VisionScanner };
//# sourceMappingURL=index.esm.js.map
