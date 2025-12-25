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
  price?: number;
}

const EventPage = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<"welcome" | "selfie" | "results">("welcome");
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [matchedPhotos, setMatchedPhotos] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
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

  const handleSelfieCapture = (imageUrl: string) => {
    setSelfieUrl(imageUrl);
  };

  const handleFindPhotos = async () => {
    if (!selfieUrl || !event) return;

    setIsProcessing(true);
    // Simulate AI processing for now, or perform real match if backend supports it
    // For now keeping simple simulation to avoid breaking changes in demo flow
    setTimeout(() => {
      setMatchedPhotos([
        // Mock matches for demonstration - in real app would come from backend
        { id: "1", url: "https://images.unsplash.com/photo-1519741497674-611481863552?w=800", confidence: 98 },
        { id: "2", url: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800", confidence: 95 },
      ]);
      setIsProcessing(false);
      setStep("results");
    }, 2500);
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
              <span className="font-body text-sm">{event.photos?.length || 0} Photos</span>
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
            <SelfieUpload
              onCapture={handleSelfieCapture}
              selfieUrl={selfieUrl}
            />
            {selfieUrl && (
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
              photoPrice={event.price || 0}
              photographerName={"Wedding Moment AI"}
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default EventPage;
