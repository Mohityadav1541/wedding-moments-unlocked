import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Download, Lock, ShoppingCart, Check, X } from "lucide-react";
import { toast } from "sonner";

interface Photo {
  _id: string; // Backend ID
  id?: string; // Legacy/Mock ID
  url: string;
  downloadUrl?: string; // Watermarked URL
  confidence: number;
}

interface PhotoGalleryProps {
  photos: Photo[];
  photoPrice: number;
  photographerName: string;
  watermarkEnabled: boolean;
}

const PhotoGallery = ({ photos, photoPrice, photographerName, watermarkEnabled }: PhotoGalleryProps) => {
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

  const handleDownloadFree = async () => {
    setIsDownloading(true);

    // Find selected photo objects
    const photosToDownload = photos.filter(p => selectedPhotos.has(p._id || p.id || ""));

    let successCount = 0;
    for (const photo of photosToDownload) {
      const targetUrl = photo.downloadUrl || photo.url;
      if (targetUrl) {
        try {
          // Fetch blob to avoid browser opening in new tab
          const response = await fetch(targetUrl);
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          // Suggest filename
          a.download = `photo-${photo._id || Date.now()}.jpg`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          successCount++;
        } catch (err) {
          console.error("Download failed", err);
          // Fallback to opening in new tab
          window.open(targetUrl, '_blank');
        }
      }
    }

    setIsDownloading(false);
    if (successCount > 0) {
      toast.success(`${successCount} photos downloaded!`);
    } else {
      toast.error("No photos available for download.");
    }
  };

  const handleBuyPremium = () => {
    toast.info("Redirecting to payment...");
  };

  const isFree = true;

  return (
    <div>
      {/* Actions Bar */}
      <div className="bg-card rounded-xl p-4 shadow-card border border-border/50 mb-6 sticky top-20 z-40">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAll}
            >
              {selectedPhotos.size === photos.length ? "Deselect All" : "Select All"}
            </Button>
            <span className="font-body text-sm text-muted-foreground">
              {selectedPhotos.size} of {photos.length} selected
            </span>
          </div>

          {selectedPhotos.size > 0 && (
            <div className="flex gap-3">
              {isFree ? (
                <Button
                  variant="sage"
                  onClick={handleDownloadFree}
                  disabled={isDownloading}
                  className="gap-2"
                >
                  {isDownloading ? (
                    <div className="h-4 w-4 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="h-4 w-4" />
                  )}
                  {selectedPhotos.size > 1 ? `Download All (${selectedPhotos.size})` : "Download Photo"}
                </Button>
              ) : (
                <Button variant="gold" onClick={handleBuyPremium} className="gap-2">
                  <ShoppingCart className="h-4 w-4" />
                  Buy HD (₹{photoPrice * selectedPhotos.size})
                </Button>
              )}
            </div>
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
              {/* Photo */}
              <div
                className="aspect-square"
                onClick={() => setPreviewPhoto(photo)}
              >
                <img
                  src={photo.url}
                  alt="Wedding photo"
                  className="w-full h-full object-cover"
                />

                {/* Watermark Overlay */}
                {watermarkEnabled && (
                  <div className="watermark-overlay">
                    <div className="watermark-text">
                      {photographerName}
                    </div>
                  </div>
                )}

                {/* Confidence Badge */}
                <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded-full">
                  <span className="font-body text-xs font-medium text-foreground">
                    {photo.confidence}% match
                  </span>
                </div>
              </div>

              {/* Select Checkbox */}
              <button
                className={`absolute top-2 right-2 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedPhotos.has(id)
                  ? "bg-primary border-primary text-primary-foreground"
                  : "bg-background/80 border-border hover:border-primary"
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
        <DialogContent className="max-w-3xl p-0 overflow-hidden">
          {previewPhoto && (
            <>
              <div className="relative aspect-[4/3]">
                <img
                  src={previewPhoto.url}
                  alt="Wedding photo preview"
                  className="w-full h-full object-contain bg-muted"
                />
                {/* Large Watermark */}
                {watermarkEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <p className="font-display text-4xl text-foreground/20 italic rotate-[-15deg] select-none">
                      {photographerName}
                    </p>
                  </div>
                )}
              </div>
              <div className="p-4 flex justify-between items-center border-t border-border">
                <span className="font-body text-sm text-muted-foreground">
                  {previewPhoto.confidence}% match confidence
                </span>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewPhoto(null)}
                  >
                    Close
                  </Button>
                  <Button
                    variant="rose"
                    size="sm"
                    onClick={() => {
                      toggleSelect(previewPhoto._id || previewPhoto.id || "");
                      setPreviewPhoto(null);
                    }}
                    className="gap-2"
                  >
                    {selectedPhotos.has(previewPhoto._id || previewPhoto.id || "") ? (
                      <>
                        <X className="h-4 w-4" />
                        Remove from Selection
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Add to Selection
                      </>
                    )}
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
