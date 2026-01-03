import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Upload, RefreshCw, Check } from "lucide-react";

interface SelfieUploadProps {
  onCapture: (imageUrl: string) => void;
  selfieUrl: string | null;
}

const SelfieUpload = ({ onCapture, selfieUrl }: SelfieUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);

  // Fix: Attach stream to video element whenever stream state changes
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      // Constraints for mobile facing camera check
      const constraints = {
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      // Video srcObject set by effect
    } catch (err) {
      console.error("Error accessing camera:", err);
      // Fallback for permissions or device issues
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
        alert("Camera is not ready yet. Please wait a moment and try again.");
        console.error("Capture failed: Video dimensions are 0");
        return;
      }

      const canvas = document.createElement("canvas");
      // Use actual video dimensions
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the image to match video preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);

        try {
          const imageUrl = canvas.toDataURL("image/jpeg", 0.8);
          // console.log("Captured image length:", imageUrl.length); // Debug
          if (imageUrl.length > 1000) { // Increased threshold slightly to be sure
            onCapture(imageUrl);
            stopCamera();
          } else {
            console.error("Capture failed: Image data too short", imageUrl);
            alert("Camera capture failed (Empty Image). Please try again.");
          }
        } catch (e: any) {
          console.error("Canvas error", e);
          alert("Capture Error: " + e.message);
        }
      }
    }
  };

  const processFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result;
        if (typeof result === "string" && result.startsWith("data:image")) {
          onCapture(result);
        } else {
          alert("Invalid image file. Please try another.");
        }
      };
      reader.onerror = () => alert("Error reading file");
      reader.readAsDataURL(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="bg-card rounded-2xl p-6 md:p-8 shadow-elegant border border-border/50">
      <h2 className="font-display text-2xl font-bold text-foreground text-center mb-6">
        Upload Your Selfie
      </h2>

      {selfieUrl ? (
        <div className="space-y-4">
          <div className="relative aspect-square max-w-xs mx-auto rounded-2xl overflow-hidden shadow-elegant">
            <img
              src={selfieUrl}
              alt="Your selfie"
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 right-3 bg-sage text-sage-dark p-2 rounded-full">
              <Check className="h-5 w-5" />
            </div>
          </div>
          <div className="text-center">
            <Button
              variant="outline"
              onClick={() => {
                onCapture(""); // Clear photo
                setStream(null); // Reset stream state if any
              }}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Change Photo
            </Button>
          </div>
        </div>
      ) : stream ? (
        <div className="space-y-4 flex flex-col items-center animate-in fade-in zoom-in duration-300">
          {/* Mobile Debug Info - Temporary */}
          <div className="text-xs text-muted-foreground w-full text-center bg-gray-100 p-2 rounded">
            Status: {isDragging ? "Dragging" : "Camera Active"} | Stream: {stream.active ? "Yes" : "No"} ({stream.getTracks().length} tracks)
          </div>

          <div className="relative rounded-2xl overflow-hidden border-4 border-white shadow-2xl w-full max-w-sm bg-black aspect-[3/4] md:aspect-video relative group">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => {
                console.log("Video metadata loaded");
                if (videoRef.current) {
                  videoRef.current.play()
                    .then(() => console.log("Video playing"))
                    .catch(e => {
                      console.error("Play error:", e);
                      alert("Camera play failed: " + e.message);
                    });
                }
              }}
              onError={(e) => {
                console.error("Video Error:", e);
                alert("Video Error: " + (e.currentTarget.error?.message || "Unknown"));
              }}
              onSuspend={() => console.log("Video suspended")}
              className="w-full h-full object-cover transform -scale-x-100 bg-black z-10"
            />

            {/* Overlay Grid/Frame to show it's working */}
            <div className="absolute inset-0 border-2 border-white/20 pointer-events-none z-20 m-4 rounded-xl"></div>
          </div>

          <div className="flex flex-col gap-3 w-full max-w-xs">
            <Button variant="rose" size="lg" onClick={capturePhoto} className="gap-2 w-full">
              <Camera className="h-5 w-5" /> Capture Photo
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" onClick={stopCamera} className="flex-1 bg-white hover:bg-gray-100 text-black border-gray-200">
                Cancel
              </Button>
              <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="flex-1">
                <Upload className="h-4 w-4 mr-2" /> Upload
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-8 md:p-12 text-center transition-all ${isDragging
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
            }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="h-8 w-8 text-primary" />
          </div>
          <p className="font-display text-lg font-semibold text-foreground mb-2">
            Drop your selfie here
          </p>
          <p className="font-body text-muted-foreground mb-6">
            or click to browse from your device
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="outline"
              onClick={startCamera}
              className="gap-2"
            >
              <Camera className="h-4 w-4" />
              Use Camera
            </Button>
            <Button
              variant="rose"
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <Upload className="h-4 w-4" />
              Upload Photo
            </Button>
          </div>
          <p className="font-body text-xs text-muted-foreground mt-4">
            Supported: JPG, PNG, HEIC • Max 10MB
          </p>
        </div>
      )}

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        className="hidden"
        onChange={handleFileSelect}
      />

      <div className="mt-6 p-4 bg-muted/50 rounded-xl">
        <p className="font-body text-sm text-muted-foreground text-center">
          <strong className="text-foreground">Pro tip:</strong> Use a clear, front-facing photo with good lighting for best results.
        </p>
      </div>
    </div>
  );
};

export default SelfieUpload;
