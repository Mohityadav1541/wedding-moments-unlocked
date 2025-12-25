import { useState, useRef } from "react";
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

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Could not access camera. Please allow camera permissions.");
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
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Mirror the image to match video preview
        ctx.translate(canvas.width, 0);
        ctx.scale(-1, 1);
        ctx.drawImage(videoRef.current, 0, 0);

        const imageUrl = canvas.toDataURL("image/png");
        onCapture(imageUrl);
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCapture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onCapture(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
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
        <div className="space-y-4 flex flex-col items-center">
          <div className="relative rounded-2xl overflow-hidden border-2 border-primary shadow-elegant w-full max-w-sm bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-auto object-cover transform -scale-x-100"
              style={{ maxHeight: '400px' }}
            />
          </div>
          <div className="flex gap-4">
            <Button variant="destructive" onClick={stopCamera}>Cancel</Button>
            <Button variant="rose" onClick={capturePhoto} className="gap-2">
              <Camera className="h-4 w-4" /> Capture
            </Button>
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
