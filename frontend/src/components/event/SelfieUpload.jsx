import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RefreshCw, Check } from "lucide-react";
const SelfieUpload = ({ onCapture, selfieUrl, label }) => {
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stream, setStream] = useState(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  const startCamera = async () => {
    setIsCameraReady(false);
    try {
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please check permissions.");
    }
  };
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
      setIsCameraReady(false);
    }
  };
  const capturePhoto = () => {
    if (videoRef.current && isCameraReady) {
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        alert("Camera is not ready yet. Please wait a moment and try again.");
        console.error("Capture failed: Video dimensions are 0");
        return;
      }
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);
        try {
          const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
          if (imageUrl.length > 1e3) {
            onCapture(imageUrl);
            stopCamera();
          } else {
            console.error("Capture failed: Image data too short", imageUrl);
            alert("Camera capture failed (Empty Image). Please try again.");
          }
        } catch (e) {
          console.error("Canvas error", e);
          alert("Capture Error: " + e.message);
        }
      }
    }
  };
  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        const MAX_SIZE = 800;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > MAX_SIZE) {
            height = Math.round(height * MAX_SIZE / width);
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width = Math.round(width * MAX_SIZE / height);
            height = MAX_SIZE;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedUrl = canvas.toDataURL("image/jpeg", 0.85);
          onCapture(compressedUrl);
        } else {
          const reader = new FileReader();
          reader.onload = (e) => onCapture(e.target.result);
          reader.readAsDataURL(file);
        }
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        const reader = new FileReader();
        reader.onload = (e) => onCapture(e.target.result);
        reader.readAsDataURL(file);
      };
      img.src = url;
    } else {
      alert("Please upload a valid image file.");
    }
  };
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };
  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  return <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elegant border border-border/50"><h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">{label || "Upload Your Selfie"}</h2>{selfieUrl ? <div className="space-y-4"><div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden shadow-elegant"><img
    src={selfieUrl}
    alt="Your selfie"
    className="w-full h-full object-cover"
  /><div className="absolute bottom-3 right-3 bg-sage text-sage-dark p-2 rounded-full"><Check className="h-5 w-5" /></div></div><div className="text-center"><Button
    variant="outline"
    onClick={() => {
      onCapture("");
      setStream(null);
    }}
    className="gap-2"
  ><RefreshCw className="h-4 w-4" />
              Change Photo
            </Button></div></div> : stream ? <div className="space-y-4 flex flex-col items-center animate-in fade-in zoom-in duration-300">{
    /* Mobile Debug Info - Temporary */
  }<div className="text-xs text-muted-foreground w-full text-center bg-gray-100 p-2 rounded">
            Status: {isDragging ? "Dragging" : "Camera Active"} | Stream: {stream.active ? "Yes" : "No"} ({stream.getTracks().length} tracks)
          </div><div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl w-full max-w-sm bg-black aspect-[3/4] md:aspect-video relative group"><video
    ref={videoRef}
    autoPlay
    playsInline
    muted
    onLoadedMetadata={() => {
      console.log("Video metadata loaded");
      if (videoRef.current) {
        videoRef.current.play().then(() => console.log("Video playing")).catch((e) => {
          console.error("Play error:", e);
        });
      }
    }}
    onCanPlay={() => {
      console.log("Video can play");
      setIsCameraReady(true);
    }}
    onError={(e) => {
      console.error("Video Error:", e);
      alert("Video Error: " + (e.currentTarget.error?.message || "Unknown"));
    }}
    onSuspend={() => console.log("Video suspended")}
    className="w-full h-full object-cover transform -scale-x-100 bg-black z-10"
  />{
    /* Overlay Grid/Frame to show it's working */
  }<div className="absolute inset-0 border-2 border-white/20 pointer-events-none z-20 m-4 rounded-xl" /></div><div className="flex flex-col gap-3 w-full max-w-xs"><Button
    variant="rose"
    size="lg"
    onClick={capturePhoto}
    disabled={!isCameraReady}
    className="gap-2 w-full transition-all"
  >{isCameraReady ? <><Camera className="h-5 w-5" /> Capture Photo
                </> : "Loading Camera..."}</Button><div className="flex gap-2"><Button variant="outline" onClick={stopCamera} className="flex-1 bg-white hover:bg-gray-100 text-black border-gray-200">
                Cancel
              </Button><Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1"><Upload className="h-4 w-4 mr-2" /> Upload
              </Button></div></div></div> : <div
    className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}
    onDrop={handleDrop}
    onDragOver={handleDragOver}
    onDragLeave={handleDragLeave}
  ><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Camera className="h-8 w-8 text-primary" /></div><p className="font-display text-lg font-semibold text-foreground mb-2">
            Drop your selfie here
          </p><p className="font-body text-muted-foreground mb-6">
            or click to browse from your device
          </p><div className="flex flex-col sm:flex-row gap-3 justify-center"><Button
    variant="outline"
    onClick={startCamera}
    className="gap-2"
  ><Camera className="h-4 w-4" />
              Use Camera
            </Button><Button
    variant="rose"
    onClick={() => fileInputRef.current?.click()}
    className="gap-2"
  ><Upload className="h-4 w-4" />
              Upload Photo
            </Button></div><p className="font-body text-xs text-muted-foreground mt-4">
            Supported: JPG, PNG, HEIC • Max 10MB
          </p></div>}<input
    type="file"
    ref={fileInputRef}
    accept="image/*"
    capture="user"
    className="hidden"
    onChange={handleFileSelect}
  /><div className="mt-6 p-4 bg-muted/50 rounded-xl"><p className="font-body text-sm text-muted-foreground text-center"><strong className="text-foreground">Pro tip:</strong> Use a clear, front-facing photo with good lighting for best results.
        </p></div></div>;
};
var stdin_default = SelfieUpload;
export {
  stdin_default as default
};
