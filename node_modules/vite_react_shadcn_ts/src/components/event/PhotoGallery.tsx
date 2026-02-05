import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Download, Check, X as XIcon } from "lucide-react";
import { toast } from "sonner";
import { addWatermark } from "@/utils/watermark";

interface Photo {
  _id: string;
  id?: string;
  url: string;
  downloadUrl?: string; // High-res or original URL
  confidence: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  photoPrice: number; // meaningful only if we wanted to show value, but now ignored
  photographerName: string;
  watermarkEnabled: boolean;
  paymentDetails?: any; // Ignored
  eventId: string;
}

const PhotoGallery = ({ photos, photographerName, watermarkEnabled }: PhotoGalleryProps) => {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [previewPhoto, setPreviewPhoto] = useState<Photo | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const toggleSelect = (photoId: string) => {
    const newSelected = new Set(selectedPhotos);
    if (newSelected.has(photoId)) {
      newSelected.delete(photoId);
    } else {
      newSelected.add(photoId);
    }
    setSelectedPhotos(newSelected);
  };

  const selectAll = () => {
    if (selectedPhotos.size === photos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(photos.map(p => p._id || p.id || "")));
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    const photosToDownload = photos.filter(p => selectedPhotos.has(p._id || p.id || ""));
    let successCount = 0;

    toast.info(`Preparing ${photosToDownload.length} photos with watermark...`);

    for (const photo of photosToDownload) {
      // Prioritize downloadUrl (original/high-res), fallback to url (display)
      const targetUrl = photo.downloadUrl || photo.url;

      if (targetUrl) {
        try {
          // If watermark enabled, burn it. Else just blob it.
          // Note: "watermarkEnabled" prop comes from Event features. 
          // If user turned it on, we use it.
          // Optimization:
          // The 'targetUrl' (downloadUrl) usually comes from Backend with watermark ALREADY APPLIED (via Cloudinary).
          // We DO NOT want to add a second watermark here (which was causing the double-watermark bug).
          // So we simply download the blob.

          let blob: Blob;
          const response = await fetch(targetUrl);
          blob = await response.blob();

          // Legacy Code Removed:
          // if (watermarkEnabled) { blob = await addWatermark(...) } 
          // This was double-watermarking. Server does it better.

          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = `photo-${photo._id || Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          successCount++;
        } catch (err) {
          console.error("Download failed", err);
          // Fallback to direct open if canvas fails
          window.open(targetUrl, '_blank');
        }
      }
    }
    setIsDownloading(false);
    if (successCount > 0) toast.success(`${successCount} photos downloaded!`);
  };

  return (
    <div>
      {/* Actions Bar */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 mb-6 sticky top-20 z-40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={selectAll}>
              {selectedPhotos.size === photos.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="font-body text-sm text-muted-foreground">
              {selectedPhotos.size} of {photos.length} selected
            </span>
          </div>

          {selectedPhotos.size > 0 && (
            <Button
              variant="default" // Changed from sage/gold to default/primary
              onClick={handleDownload}
              disabled={isDownloading}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {isDownloading ? (
                <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {selectedPhotos.size > 1 ? `Download All (${selectedPhotos.size})` : "Download Photo"}
            </Button>
          )}
        </div>
      </div>

      {/* Photo Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {photos.map((photo) => {
          const id = photo._id || photo.id || "unknown";
          return (
            <div
              key={id}
              className={`relative group rounded-xl overflow-hidden shadow-card border-2 transition-all cursor-pointer ${selectedPhotos.has(id)
                ? "border-primary ring-2 ring-primary/30"
                : "border-transparent hover:border-primary/50"
                }`}
            >
              <div className="aspect-square" onClick={() => setPreviewPhoto(photo)}>
                <img
                  src={photo.url}
                  alt="Wedding photo"
                  className="w-full h-full object-cover"
                />

                {/* Optional: We can still show watermark on thumbnail if desired, 
                    but since it's "Free Download", clean preview is usually better.
                    I will remove the watermark overlay for cleaner UI as requested. 
                */}

                <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="text-xs font-medium text-white">
                    {photo.confidence}% match
                  </span>
                </div>

                {/* Bottom Watermark - Visual Only */}
                {watermarkEnabled && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 pt-6 flex justify-end">
                    <span className="text-xs text-white/90 font-medium bg-black/40 px-2 py-0.5 rounded">
                      {photographerName}
                    </span>
                  </div>
                )}
              </div>

              <button
                className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPhotos.has(id)
                  ? "bg-primary border-primary text-white"
                  : "bg-black/40 border-white/50 hover:border-primary hover:bg-primary/20"
                  }`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleSelect(id);
                }}
              >
                {selectedPhotos.has(id) && <Check className="h-4 w-4" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Preview Dialog */}
      <Dialog open={!!previewPhoto} onOpenChange={() => setPreviewPhoto(null)}>
        <DialogContent className="max-w-3xl p-0 overflow-hidden bg-black/90 border-none">
          {previewPhoto && (
            <>
              <div className="relative w-full flex items-center justify-center bg-black/50 min-h-[50vh]">
                <img
                  src={previewPhoto.url}
                  alt="Preview"
                  className="max-h-[85vh] w-auto max-w-full object-contain"
                />

                {/* Close Button overlay */}
                <button
                  onClick={() => setPreviewPhoto(null)}
                  className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white rounded-full p-2 backdrop-blur-sm z-50"
                >
                  <XIcon className="h-6 w-6" />
                </button>
              </div>

              <div className="p-4 bg-background flex justify-between items-center">
                <span className="text-sm font-medium">
                  {previewPhoto.confidence}% Match Confidence
                </span>
                <div className="flex gap-2">
                  <Button
                    variant={selectedPhotos.has(previewPhoto._id || "") ? "destructive" : "default"}
                    onClick={() => {
                      toggleSelect(previewPhoto._id || previewPhoto.id || "");
                      setPreviewPhoto(null);
                    }}
                  >
                    {selectedPhotos.has(previewPhoto._id || "") ? "Remove Selection" : "Select for Download"}
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PhotoGallery;
