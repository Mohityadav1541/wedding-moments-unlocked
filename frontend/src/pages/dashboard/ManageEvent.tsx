import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Image, Upload, Trash2 } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const ManageEvent = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [photos, setPhotos] = useState([]);
    const [photosLoading, setPhotosLoading] = useState(true);

    useEffect(() => {
        fetchEventDetails();
        if (eventId) {
            fetchPhotos();
        }
    }, [eventId]);

    const fetchPhotos = async () => {
        try {
            setPhotosLoading(true);
            const { data } = await api.get(`/photos/${eventId}`);
            setPhotos(data);
        } catch (error) {
            console.error("Error fetching photos:", error);
        } finally {
            setPhotosLoading(false);
        }
    };

    const fetchEventDetails = async () => {
        try {
            // Re-using the public event endpoint for now, but ideally should be a protected one
            const { data } = await api.get(`/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const handleMarkPaid = async () => {
        console.log("handleMarkPaid clicked");
        if (!screenshot) {
            console.log("No screenshot selected");
            toast.error("Please upload a payment screenshot");
            return;
        }

        try {
            console.log("Sending payment request...");
            if (confirm("Confirm that you have sent the payment? The Super Admin will verify it.")) {
                const formData = new FormData();
                formData.append('screenshot', screenshot);

                // Use post/put depending on how axios handles it, but formData is key here
                // Note: axios automatically sets Content-Type to multipart/form-data when data is FormData
                const res = await api.put(`/events/${eventId}/pay`, formData);
                console.log("Payment response:", res);

                toast.success("Payment marked! Waiting for confirmation.");
                // Immediately update local state to reflect change pending server refresh
                setEvent((prev: any) => ({
                    ...prev,
                    paymentStatus: 'paid'
                }));
                fetchEventDetails(); // Refresh to show new status
            } else {
                console.log("User cancelled confirmation");
            }
        } catch (error: any) {
            console.error("Payment Error:", error);
            toast.error(error.response?.data?.message || "Failed to update status");
        }
    };

    if (loading) return <DashboardLayout userRole="admin"><div className="p-8">Loading...</div></DashboardLayout>;
    if (!event) return <DashboardLayout userRole="admin"><div className="p-8">Event not found</div></DashboardLayout>;

    return (
        <DashboardLayout userRole="admin">
            <div className="p-6 lg:p-8">
                <Button variant="ghost" asChild className="mb-6 -ml-4 gap-2">
                    <Link to="/dashboard/events">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Events
                    </Link>
                </Button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                    <div>
                        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
                            {event.name}
                        </h1>
                        <div className="flex flex-wrap gap-4 text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {new Date(event.date).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4" />
                                {event.location || "No location set"}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" asChild>
                            <Link to={`/event/${eventId}`} target="_blank">
                                View Public Page
                            </Link>
                        </Button>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            id="photo-upload"
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (files && files.length > 0) {
                                    const totalFiles = files.length;
                                    let uploadedCount = 0;
                                    toast.info(`Starting upload of ${totalFiles} photos...`);

                                    for (let i = 0; i < totalFiles; i++) {
                                        const formData = new FormData();
                                        formData.append('eventId', event._id);
                                        formData.append('image', files[i]);

                                        try {
                                            await api.post('/photos', formData);
                                            uploadedCount++;
                                            if (uploadedCount % 3 === 0) {
                                                toast.info(`Uploaded ${uploadedCount}/${totalFiles}...`);
                                            }
                                        } catch (error) {
                                            console.error(`Failed to upload file ${i + 1}:`, error);
                                            toast.error(`Failed to upload image ${i + 1}`);
                                        }
                                    }

                                    toast.success(`Upload complete! ${uploadedCount}/${totalFiles} photos uploaded.`);
                                    fetchPhotos();
                                }
                            }}
                        />
                        <Button variant="rose" className="gap-2" onClick={() => document.getElementById('photo-upload')?.click()}>
                            <Upload className="h-4 w-4" />
                            Upload Photos
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
                        <h3 className="font-display text-lg font-semibold mb-4">Event Status</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Package</span>
                                <span className="font-bold text-primary">{event.package} (₹{event.price})</span>
                            </div>

                            <div className="p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Payment Status</div>
                                <div className={`font-bold capitalize ${event.paymentStatus === 'confirmed' ? 'text-green-600' :
                                    event.paymentStatus === 'paid' ? 'text-orange-500' : 'text-red-500'
                                    }`}>
                                    {event.paymentStatus === 'confirmed' ? 'Active & Confirmed' :
                                        event.paymentStatus === 'paid' ? 'Waiting Admin Approval' : 'Payment Pending'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* QR Code / Payment Area */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card md:col-span-2">
                        {event.paymentStatus === 'confirmed' ? (
                            <>
                                <h3 className="font-display text-lg font-semibold mb-4">Event QR Code</h3>
                                <div className="flex items-center gap-4">
                                    <div className="w-32 h-32 bg-white p-2 rounded border border-border">
                                        <img
                                            src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`${window.location.origin}/event/${eventId}`)}`}
                                            alt="Event QR"
                                            className="w-full h-full object-contain"
                                        />
                                    </div>
                                    <div>
                                        <p className="text-sm text-green-600 font-medium mb-1">
                                            Event Active!
                                        </p>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            Share this QR code with guests.
                                        </p>
                                        <Button variant="outline" size="sm" onClick={async () => {
                                            try {
                                                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=1000x1000&data=${encodeURIComponent(`${window.location.origin}/event/${eventId}`)}`;
                                                const response = await fetch(qrUrl);
                                                const blob = await response.blob();
                                                const url = window.URL.createObjectURL(blob);
                                                const a = document.createElement('a');
                                                a.href = url;
                                                a.download = `event-qr-${eventId}.png`;
                                                document.body.appendChild(a);
                                                a.click();
                                                document.body.removeChild(a);
                                                window.URL.revokeObjectURL(url);
                                                toast.success("QR Code downloaded!");
                                            } catch (error) {
                                                console.error("Download failed:", error);
                                                toast.error("Failed to download QR code");
                                            }
                                        }}>Download QR</Button>
                                    </div>
                                </div>
                            </>
                        ) : event.paymentStatus === 'paid' ? (
                            <div className="text-center py-8">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Calendar className="h-8 w-8 text-orange-500" />
                                </div>
                                <h3 className="font-display text-xl font-bold mb-2">Payment Under Review</h3>
                                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                                    Thank you! We have received your request. The Super Admin will verify your payment and activate your event shortly.
                                </p>
                                <Button variant="outline" disabled>Waiting for Confirmation...</Button>
                            </div>
                        ) : (
                            <div>
                                <h3 className="font-display text-lg font-semibold mb-4 text-red-500">Action Required: Complete Payment</h3>
                                <div className="bg-red-50 border border-red-100 rounded-xl p-6 mb-6">
                                    <p className="text-sm text-red-800 mb-4 font-medium">
                                        To activate "{event.name}" and get the QR code, please complete the payment for the <strong>{event.package} Plan</strong>.
                                    </p>
                                    <div className="flex flex-col sm:flex-row gap-8 mb-6">
                                        <div>
                                            <p className="text-xs text-muted-foreground uppercase mb-1">Amount to Pay</p>
                                            <p className="text-3xl font-bold text-foreground">₹{event.price}</p>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase mb-1">Send to UPI</p>
                                                <p className="text-lg font-medium font-mono bg-white px-2 py-1 rounded border">yadavboy1540@okicici</p>
                                            </div>
                                            <div>
                                                <p className="text-xs text-muted-foreground uppercase mb-1">Or Pay via Mobile</p>
                                                <div className="font-medium font-mono bg-white px-2 py-1 rounded border">
                                                    <p>63671 39566</p>
                                                    <p className="text-xs text-green-600 font-sans mt-1 flex items-center gap-1">
                                                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
                                                        Verify Name: Mohit Yadav
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Upload Payment Screenshot</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={(e) => {
                                                console.log("File selected:", e.target.files?.[0]);
                                                setScreenshot(e.target.files?.[0] || null);
                                            }}
                                            className="block w-full text-sm text-slate-500
                                                file:mr-4 file:py-2 file:px-4
                                                file:rounded-full file:border-0
                                                file:text-sm file:font-semibold
                                                file:bg-red-100 file:text-red-700
                                                hover:file:bg-red-200
                                            "
                                        />
                                        <p className="text-xs text-muted-foreground">Required for verification.</p>
                                    </div>
                                </div>
                                <Button
                                    className="w-full sm:w-auto"
                                    onClick={handleMarkPaid}
                                    disabled={!screenshot}
                                >
                                    I have made the payment
                                </Button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Photos Management Section */}
                <div className="mt-8">
                    <h2 className="font-display text-xl font-bold mb-4">Event Photos</h2>

                    {photosLoading ? (
                        <div className="text-muted-foreground">Loading photos...</div>
                    ) : photos.length === 0 ? (
                        <div className="text-muted-foreground p-8 border border-dashed rounded-xl text-center">
                            No photos uploaded yet. Use the upload button above.
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {photos.map((photo: any) => (
                                <div key={photo._id} className="group relative aspect-square bg-muted rounded-lg overflow-hidden border border-border">
                                    <img
                                        src={photo.url}
                                        alt="Event photo"
                                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                    />
                                    {/* Overlay with Delete Button */}
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                        <a
                                            href={photo.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-full backdrop-blur-sm"
                                            title="View Full"
                                        >
                                            <Image className="h-4 w-4" />
                                        </a>
                                        <button
                                            onClick={async () => {
                                                if (confirm("Delete this photo? It will be removed from the cloud.")) {
                                                    try {
                                                        await api.delete(`/photos/${photo._id}`);
                                                        toast.success("Photo deleted");
                                                        fetchPhotos(); // Refresh list
                                                    } catch (error) {
                                                        console.error(error);
                                                        toast.error("Failed to delete photo");
                                                    }
                                                }
                                            }}
                                            className="p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full backdrop-blur-sm transition-colors"
                                            title="Delete Photo"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                    {/* Watermark Indicator (Optional visualization) */}
                                    {photo.url.includes('layer_apply') && (
                                        <div className="absolute bottom-1 right-1 text-[10px] text-white/50 bg-black/30 px-1 rounded">
                                            Watermarked
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageEvent;
