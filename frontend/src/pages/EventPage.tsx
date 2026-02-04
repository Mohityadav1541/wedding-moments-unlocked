import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import PhotoGallery from "@/components/event/PhotoGallery";
import SelfieUpload from "@/components/event/SelfieUpload";
import { Camera, ArrowRight, Calendar, MapPin, User, Loader2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";


interface EventData {
  _id: string;
  name: string;
  date: string;
  location: string;
  coverImage?: string;
  photos?: any[];
  photoCount?: number;

  price?: number; // Package Price
  pricePerPhoto?: number; // Download Price
  user?: {
    name: string;
    studioName?: string;
    paymentDetails?: {
      upiId: string;
      mobileNumber: string;
      name: string;
    };
  };
  features?: {
    watermarkEnabled: boolean;
    watermarkText: string;
  };
}

const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"welcome" | "selfie" | "results">("welcome");
  const [selfies, setSelfies] = useState<{ front?: string }>({});
  const [matchedPhotos, setMatchedPhotos] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Manual Redirect for "Rahul weds Madhu" static QR code
    // Checks for both the new QR code (696...) and keeping the old one (67a...) just in case, 
    // or replacing it if the user strictly wants "change". 
    // User said "change this event qr code with this qr code", so I'll prioritize the new one.
    if (eventId === '696a42244c2a844f930b695e' || eventId === '67a11695e6a42244c2a844f930b6') {
      navigate('/event/698213d3125b63571ec76f07', { replace: true });
      return;
    }

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  const fetchEventDetails = async () => {
    try {
      // Use the public endpoint to avoid authentication requirement
      const { data } = await api.get(`/events/public/${eventId}`);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Event not found");
    } finally {
      setLoading(false);
    }
  };

  const handleSelfieCapture = (side: "front") => (imageUrl: string) => {
    setSelfies((prev) => ({ ...prev, [side]: imageUrl }));
  };



  useEffect(() => {
    // Load models when component mounts
    const loadFaceApi = async () => {
      const { loadModels } = await import("@/services/FaceDetectionService");
      await loadModels();
    };
    loadFaceApi();
  }, []);

  const handleFindPhotos = async () => {
    // Only Front is strictly required, but having more is better
    if (!selfies.front || !event) {
      toast.error("Please provide at least the Front View selfie!");
      return;
    }

    setIsProcessing(true);
    toast.info("Analyzing your selfies...");

    try {
      const { detectAndCropFace } = await import("@/services/FaceDetectionService");
      const formData = new FormData();
      formData.append("eventId", event._id);

      // Helper to process and append generic blob/string using Face API
      const processAndAppend = async (url: string) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });

        // Use Client-Side Face Detection & Cropping
        console.log("Detecting face in client...");
        const croppedBlob = await detectAndCropFace(file);

        if (croppedBlob) {
          console.log("Face detected and cropped!", croppedBlob.size);
          formData.append("images", croppedBlob, "face_crop.jpg");
        } else {
          console.warn("No face detected in this selfie, skipping.");
          // Optional: You could still upload the original if you want to rely on server backend as fallback, 
          // but strict requirements say "Upload only the cropped face image"
          // So we skip or notify user.
          toast.warning("No face detected in one of the selfies.");
        }
      };

      // Process Front (Required)
      await processAndAppend(selfies.front);

      // Check if we actually have any valid faces to send
      // FormData entries iterator check
      // @ts-ignore
      const entries = [...formData.entries()];
      const hasImages = entries.some(e => e[0] === 'images');

      if (!hasImages) {
        toast.error("No valid faces detected in your selfies. Please try again with better lighting.");
        setIsProcessing(false);
        return;
      }

      // 3. Send to Server for AI Search
      const searchResponse = await api.post("/photos/search", formData);
      const data = searchResponse.data;

      // Fix: Handle case where backend returns object with matches array (e.g. "No face detected")
      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data.matches) {
        if (data.message && data.message.includes("No face detected")) {
          // Should be rare now with client check
          toast.error("No face found! Please take a closer selfie with good lighting.");
          setStep('welcome'); // Reset to start
          return;
        }
        results = data.matches;
      }

      if (results.length === 0) {
        toast.info(data.message || "No matching photos found.");
      } else {
        toast.success(`Found ${results.length} photos!`);
      }

      setMatchedPhotos(results);
      // toast.info("No matching photos found with high confidence.");
      setStep("results");
    } catch (error: any) {
      console.error("AI Search Failed:", error);
      if (error.response?.status === 500) {
        const serverMessage = error.response.data?.message;
        toast.error(serverMessage || "Server error. Please try again in 1 minute.");
      } else {
        toast.error(error.message || "Failed to find photos. Please try again.");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl font-bold">Event not found</h1>
        <p className="text-muted-foreground">The event you are looking for does not exist.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Header */}
      <header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Logo />
          <div className="text-right">
            <p className="font-display text-lg font-semibold text-foreground">{event.name}</p>
            <p className="font-body text-sm text-muted-foreground">Wedding Moment AI</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Event Info Card */}
        <div className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 mb-8">
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="font-body text-sm">
                {new Date(event.date).toLocaleDateString('en-IN', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-body text-sm">{event.location || "Location not specified"}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Camera className="h-4 w-4 text-primary" />
              <span className="font-body text-sm">{event.photoCount || 0} Photos</span>
            </div>
          </div>
        </div>

        {/* Step Content */}
        {step === "welcome" && (
          <div className="max-w-xl mx-auto text-center animate-fade-up">
            <div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border/50">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <User className="h-10 w-10 text-primary" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Find Your Photos
              </h1>
              <p className="font-body text-lg text-muted-foreground mb-8">
                Upload a selfie and our AI will find all photos featuring you from this event.
              </p>
              <Button variant="hero" size="xl" onClick={() => setStep("selfie")} className="gap-2">
                <Camera className="h-5 w-5" />
                Upload Selfie
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </div>
        )}

        {step === "selfie" && (
          <div className="max-w-xl mx-auto animate-fade-up">
            <div className="flex justify-center mb-8">
              <div className="w-full max-w-sm">
                <SelfieUpload
                  label="Upload Your Selfie"
                  onCapture={handleSelfieCapture('front')}
                  selfieUrl={selfies.front}
                />
              </div>
            </div>
            {selfies.front && (
              <div className="mt-6 text-center">
                <Button
                  variant="hero"
                  size="xl"
                  onClick={handleFindPhotos}
                  disabled={isProcessing}
                  className="gap-2"
                >
                  {isProcessing ? (
                    <>
                      <div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Finding Your Photos...
                    </>
                  ) : (
                    <>
                      Find My Photos
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            )}
          </div>
        )}

        {step === "results" && (
          <div className="animate-fade-up">
            <div className="text-center mb-8">
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                We Found {matchedPhotos.length} Photos of You!
              </h2>
              <p className="font-body text-muted-foreground">
                Download your photos below
              </p>
            </div>
            <PhotoGallery
              photos={matchedPhotos}
              photoPrice={event.pricePerPhoto || 0}
              photographerName={event.features?.watermarkText || event.user?.studioName || event.user?.name || "Wedding Moment AI"}
              paymentDetails={event.user?.paymentDetails}
              watermarkEnabled={event.features?.watermarkEnabled ?? true}
              eventId={event._id}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EventPage;
