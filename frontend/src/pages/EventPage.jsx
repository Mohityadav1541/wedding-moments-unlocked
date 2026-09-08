import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import PhotoGallery from "@/components/event/PhotoGallery";
import SelfieUpload from "@/components/event/SelfieUpload";
import { Camera, ArrowRight, Calendar, MapPin, User, Loader2, Download, Share2, Users, UserCheck, Lock, KeyRound } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import JSZip from "jszip";
import { saveAs } from "file-saver";
const EventPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState("welcome");
  const [selfies, setSelfies] = useState({});
  const [matchedPhotos, setMatchedPhotos] = useState([]);
  const [isZipping, setIsZipping] = useState(false);
  const [filterCategory, setFilterCategory] = useState("all");
  const [pinInput, setPinInput] = useState("");
  const [isPinUnlocked, setIsPinUnlocked] = useState(false);
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const handleVerifyPin = async (e) => {
    e.preventDefault();
    if (!pinInput || pinInput.length < 4) {
      toast.error("Please enter a valid 4-digit PIN.");
      return;
    }
    setIsVerifyingPin(true);
    try {
      const { data } = await api.post("/events/verify-pin", { eventId, pin: pinInput });
      if (data.success) {
        setIsPinUnlocked(true);
        toast.success("Event unlocked!");
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Incorrect PIN. Please try again.");
    } finally {
      setIsVerifyingPin(false);
    }
  };
  const handleDownloadAllZip = async () => {
    if (matchedPhotos.length === 0) return;
    setIsZipping(true);
    toast.info("Preparing ZIP archive of your photos... Please wait.");
    try {
      const zip = new JSZip();
      const folderName = `${event?.name || "Wedding"}_Photos`.replace(/[^a-zA-Z0-9_-]/g, "_");
      const folder = zip.folder(folderName);
      for (let i = 0; i < matchedPhotos.length; i++) {
        const p = matchedPhotos[i];
        const imgUrl = p.downloadUrl || p.url;
        try {
          const response = await fetch(imgUrl);
          const blob = await response.blob();
          folder?.file(`photo_${i + 1}.jpg`, blob);
        } catch (err) {
          console.warn(`Failed to fetch photo ${i + 1} for zip:`, err);
        }
      }
      const content = await zip.generateAsync({ type: "blob" });
      saveAs(content, `${folderName}.zip`);
      toast.success("ZIP download started!");
    } catch (error) {
      console.error("ZIP creation failed:", error);
      toast.error("Failed to create ZIP. You can still download photos individually.");
    } finally {
      setIsZipping(false);
    }
  };
  const handleShareAlbum = () => {
    if (navigator.share) {
      navigator.share({
        title: `${event?.name || "Event"} Matched Photos`,
        text: `Check out my photos from ${event?.name || "the event"}!`,
        url: window.location.href
      }).catch((e) => console.log("Share dismissed:", e));
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Album link copied to clipboard!");
    }
  };
  useEffect(() => {
    if (eventId === "696a42244c2a844f930b695e" || eventId === "67a11695e6a42244c2a844f930b6") {
      navigate("/event/698213d3125b63571ec76f07", { replace: true });
      return;
    }
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);
  const fetchEventDetails = async () => {
    try {
      const { data } = await api.get(`/events/public/${eventId}`);
      setEvent(data);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast.error("Event not found");
    } finally {
      setLoading(false);
    }
  };
  const handleSelfieCapture = (side) => (imageUrl) => {
    setSelfies((prev) => ({ ...prev, [side]: imageUrl }));
  };
  const handleFindPhotos = async () => {
    if (!selfies.front || !event) {
      toast.error("Please provide at least the Front View selfie!");
      return;
    }
    setIsProcessing(true);
    toast.info("Analyzing your selfies...");
    try {
      const formData = new FormData();
      formData.append("eventId", event._id);
      const processAndAppend = async (url) => {
        const res = await fetch(url);
        const blob = await res.blob();
        const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
        console.log("Adding selfie to payload (Raw)...");
        formData.append("images", blob, "selfie_original.jpg");
      };
      await processAndAppend(selfies.front);
      const entries = [...formData.entries()];
      const hasImages = entries.some((e) => e[0] === "images");
      if (!hasImages) {
        toast.error("No valid faces detected in your selfies. Please try again with better lighting.");
        setIsProcessing(false);
        return;
      }
      const searchResponse = await api.post("/photos/search", formData);
      const data = searchResponse.data;
      let results = [];
      if (Array.isArray(data)) {
        results = data;
      } else if (data.matches) {
        if (data.message && data.message.includes("No face detected")) {
          toast.error("No face found! Please take a closer selfie with good lighting.");
          setStep("welcome");
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
      setStep("results");
    } catch (error) {
      console.error("AI Search Failed:", error);
      if (error.response) {
        console.error("Error Response Data:", error.response.data);
        console.error("Error Status:", error.response.status);
      }
      if (error.response?.status === 500) {
        const serverMessage = error.response.data?.message;
        toast.error(`Server Error: ${serverMessage || "Unknown"}`);
      } else if (error.message && error.message.includes("timeout")) {
        toast.error("Request timed out. Please try again with a smaller selfie.");
      } else {
        toast.error(`Error: ${error.message || "Failed to find photos."}`);
      }
    } finally {
      setIsProcessing(false);
    }
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  if (!event) {
    return <div className="min-h-screen flex items-center justify-center flex-col gap-4"><h1 className="text-2xl font-bold">Event not found</h1><p className="text-muted-foreground">The event you are looking for does not exist.</p></div>;
  }
  return <div className="min-h-screen bg-gradient-hero">{
    /* Header */
  }<header className="bg-background/80 backdrop-blur-md border-b border-border/50 sticky top-0 z-50"><div className="container mx-auto px-4 py-4 flex items-center justify-between"><Logo /><div className="text-right"><p className="font-display text-lg font-semibold text-foreground">{event.name}</p><p className="font-body text-sm text-muted-foreground">Wedding Moment AI</p></div></div></header><main className="container mx-auto px-4 py-8">{
    /* Event Info Card */
  }<div className="bg-card rounded-2xl p-6 shadow-elegant border border-border/50 mb-8"><div className="flex flex-wrap items-center gap-6"><div className="flex items-center gap-2 text-muted-foreground"><Calendar className="h-4 w-4 text-primary" /><span className="font-body text-sm">{new Date(event.date).toLocaleDateString("en-IN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric"
  })}</span></div><div className="flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4 text-primary" /><span className="font-body text-sm">{event.location || "Location not specified"}</span></div><div className="flex items-center gap-2 text-muted-foreground"><Camera className="h-4 w-4 text-primary" /><span className="font-body text-sm">{event.photoCount || 0} Photos</span></div></div></div>{
    /* PIN Protection Gate */
  }{event.isPinProtected && !isPinUnlocked ? <div className="max-w-md mx-auto text-center animate-fade-up"><div className="bg-card rounded-2xl p-8 shadow-elegant border border-border/50"><div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4"><Lock className="h-8 w-8 text-primary" /></div><h2 className="font-display text-2xl font-bold text-foreground mb-2">
                Private Event Protected
              </h2><p className="font-body text-sm text-muted-foreground mb-6">
                Please enter the 4-digit PIN provided by the photographer to search photos.
              </p><form onSubmit={handleVerifyPin} className="space-y-4"><div className="relative"><KeyRound className="absolute left-3.5 top-3 h-5 w-5 text-muted-foreground" /><input
    type="password"
    maxLength={4}
    placeholder="Enter 4-digit PIN"
    value={pinInput}
    onChange={(e) => setPinInput(e.target.value)}
    className="w-full pl-11 pr-4 py-2.5 bg-background border border-border rounded-xl font-mono text-center tracking-widest text-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
  /></div><Button
    type="submit"
    variant="hero"
    size="lg"
    disabled={isVerifyingPin || pinInput.length < 4}
    className="w-full gap-2"
  >{isVerifyingPin ? <><Loader2 className="h-4 w-4 animate-spin" /> Verifying...
                    </> : <>
                      Unlock Event Access <ArrowRight className="h-4 w-4" /></>}</Button></form></div></div> : <>{
    /* Step Content */
  }{step === "welcome" && <div className="max-w-xl mx-auto text-center animate-fade-up"><div className="bg-card rounded-2xl p-8 md:p-12 shadow-elegant border border-border/50"><div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6"><User className="h-10 w-10 text-primary" /></div><h1 className="font-display text-3xl font-bold text-foreground mb-4">
                Find Your Photos
              </h1><p className="font-body text-lg text-muted-foreground mb-8">
                Upload a selfie and our AI will find all photos featuring you from this event.
              </p><Button variant="hero" size="xl" onClick={() => setStep("selfie")} className="gap-2"><Camera className="h-5 w-5" />
                Upload Selfie
                <ArrowRight className="h-5 w-5" /></Button></div></div>}{step === "selfie" && <div className="max-w-xl mx-auto animate-fade-up"><div className="flex justify-center mb-8"><div className="w-full max-w-sm"><SelfieUpload
    label="Upload Your Selfie"
    onCapture={handleSelfieCapture("front")}
    selfieUrl={selfies.front}
  /></div></div>{selfies.front && <div className="mt-6 text-center"><Button
    variant="hero"
    size="xl"
    onClick={handleFindPhotos}
    disabled={isProcessing}
    className="gap-2"
  >{isProcessing ? <><div className="h-5 w-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
                      Finding Your Photos...
                    </> : <>
                      Find My Photos
                      <ArrowRight className="h-5 w-5" /></>}</Button></div>}</div>}{step === "results" && <div className="animate-fade-up"><div className="text-center mb-6"><h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                We Found {matchedPhotos.length} Photos of You!
              </h2><p className="font-body text-muted-foreground mb-6">
                Filter or download your photos in one click
              </p>{
    /* Action Toolbar */
  }<div className="flex flex-wrap items-center justify-center gap-3 mb-6"><Button
    variant="hero"
    size="default"
    onClick={handleDownloadAllZip}
    disabled={isZipping || matchedPhotos.length === 0}
    className="gap-2 shadow-lg"
  >{isZipping ? <><Loader2 className="h-4 w-4 animate-spin" /> Packaging ZIP...
                    </> : <><Download className="h-4 w-4" /> Download All (ZIP)
                    </>}</Button><Button
    variant="outline"
    size="default"
    onClick={handleShareAlbum}
    className="gap-2"
  ><Share2 className="h-4 w-4 text-primary" /> Share Album
                </Button></div>{
    /* Category Filter Tabs */
  }<div className="inline-flex flex-wrap items-center justify-center gap-2 p-1.5 bg-muted/60 rounded-xl border border-border/40"><Button
    variant={filterCategory === "all" ? "default" : "ghost"}
    size="sm"
    onClick={() => setFilterCategory("all")}
    className="rounded-lg text-xs md:text-sm"
  >
                  All ({matchedPhotos.length})
                </Button><Button
    variant={filterCategory === "solo" ? "default" : "ghost"}
    size="sm"
    onClick={() => setFilterCategory("solo")}
    className="rounded-lg text-xs md:text-sm gap-1"
  ><UserCheck className="h-3.5 w-3.5" /> Solo ({matchedPhotos.filter((p) => p.faceCount === 1).length})
                </Button><Button
    variant={filterCategory === "couple" ? "default" : "ghost"}
    size="sm"
    onClick={() => setFilterCategory("couple")}
    className="rounded-lg text-xs md:text-sm gap-1"
  ><Users className="h-3.5 w-3.5" /> Couple ({matchedPhotos.filter((p) => p.faceCount === 2).length})
                </Button><Button
    variant={filterCategory === "group" ? "default" : "ghost"}
    size="sm"
    onClick={() => setFilterCategory("group")}
    className="rounded-lg text-xs md:text-sm gap-1"
  ><Users className="h-3.5 w-3.5 text-primary" /> Group ({matchedPhotos.filter((p) => p.faceCount >= 3).length})
                </Button></div></div><PhotoGallery
    photos={matchedPhotos.filter((p) => {
      if (filterCategory === "solo") return p.faceCount === 1;
      if (filterCategory === "couple") return p.faceCount === 2;
      if (filterCategory === "group") return p.faceCount >= 3;
      return true;
    })}
    photoPrice={event.pricePerPhoto || 0}
    photographerName={event.features?.watermarkText && event.features.watermarkText !== "Wedding Moments" && event.features.watermarkText !== "Wedding Moments AI" ? event.features.watermarkText : event.user?.studioName || event.user?.name || "Wedding Moments AI"}
    paymentDetails={event.user?.paymentDetails}
    watermarkEnabled={event.features?.watermarkEnabled ?? true}
    eventId={event._id}
  /></div>}</>}</main></div>;
};
var stdin_default = EventPage;
export {
  stdin_default as default
};
