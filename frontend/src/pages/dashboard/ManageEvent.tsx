import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QRCodeDisplay from "@/components/dashboard/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, Calendar, MapPin, Image, Upload, Trash2, X, Settings, Edit } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import api from "@/lib/api";
import { toast } from "sonner";
import { compressImage } from "@/utils/imageCompression";

const ManageEvent = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [screenshot, setScreenshot] = useState<File | null>(null);
    const [photos, setPhotos] = useState<any[]>([]);
    const [photosLoading, setPhotosLoading] = useState(true);
    const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
    const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);
    const [uploadError, setUploadError] = useState<any>(null);
    const [editOpen, setEditOpen] = useState(false);
    const [updating, setUpdating] = useState(false);

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

    const handleBulkDelete = async () => {
        if (!selectedPhotos.length) return;
        if (confirm(`Delete ${selectedPhotos.length} photos? This cannot be undone.`)) {
            try {
                await api.post('/photos/delete-batch', { photoIds: selectedPhotos });
                toast.success(`${selectedPhotos.length} photos deleted`);
                setSelectedPhotos([]);
                fetchPhotos();
            } catch (error) {
                console.error("Bulk delete failed:", error);
                toast.error("Failed to delete photos");
            }
        }
    };

    const handleUpdateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setUpdating(true);
        const formData = new FormData(e.currentTarget);
        const updates = {
            name: formData.get('name'),
            date: formData.get('date'),
            location: formData.get('location'),
            pricePerPhoto: Number(formData.get('pricePerPhoto'))
        };

        try {
            await api.put(`/events/${eventId}`, updates);
            toast.success("Event updated successfully");
            setEditOpen(false);
            fetchEventDetails();
        } catch (error: any) {
            console.error("Update failed:", error);
            toast.error(error.response?.data?.message || "Failed to update event");
        } finally {
            setUpdating(false);
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedPhotos(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedPhotos.length === photos.length) {
            setSelectedPhotos([]);
        } else {
            setSelectedPhotos(photos.map((p: any) => p._id));
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
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="font-display text-3xl font-bold text-foreground">
                                {event.name}
                            </h1>
                            <Dialog open={editOpen} onOpenChange={setEditOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Edit Event Details</DialogTitle>
                                        <DialogDescription>
                                            Update the event information and settings.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <form onSubmit={handleUpdateEvent} className="space-y-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Event Name</Label>
                                            <Input id="name" name="name" defaultValue={event.name} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="date">Date</Label>
                                            <Input id="date" name="date" type="date" defaultValue={event.date ? new Date(event.date).toISOString().split('T')[0] : ''} required />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="location">Location</Label>
                                            <Input id="location" name="location" defaultValue={event.location} />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="pricePerPhoto">Price Per Photo (₹)</Label>
                                            <Input
                                                id="pricePerPhoto"
                                                name="pricePerPhoto"
                                                type="number"
                                                min="0"
                                                defaultValue={event.pricePerPhoto || 0}
                                            />
                                            <p className="text-xs text-muted-foreground">0 = Free Downloads. &gt;0 = Paid, Watermarked.</p>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={updating}>{updating ? 'Saving...' : 'Save Changes'}</Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
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
                                if (!files || files.length === 0) return;
                                const totalFiles = files.length;
                                let uploadedCount = 0;
                                toast.info(`Starting upload of ${totalFiles} photos...`);

                                const BATCH_SIZE = 3;
                                const fileArray = Array.from(files);

                                for (let i = 0; i < fileArray.length; i += BATCH_SIZE) {
                                    const batch = fileArray.slice(i, i + BATCH_SIZE);
                                    await Promise.all(batch.map(async (file, index) => {
                                        try {
                                            const compressedFile = await compressImage(file, 0.95, 1080); // 1080px limit, High Quality (relaxed size)
                                            const formData = new FormData();
                                            formData.append('eventId', event._id);
                                            formData.append('image', compressedFile);

                                            await api.post('/photos', formData);
                                            uploadedCount++;
                                            setUploadProgress({ current: uploadedCount, total: totalFiles });
                                        } catch (error: any) {
                                            console.error(`Failed to upload file ${file.name}:`, error);
                                            const serverMsg = error.response?.data?.message || "Upload timed out or failed";
                                            setUploadError({
                                                file: file.name,
                                                msg: serverMsg,
                                                fullError: error.response?.data || error
                                            });
                                            toast.error(`Image ${file.name}: ${serverMsg}`);
                                        }
                                    }));
                                }

                                toast.success(`Upload complete! ${uploadedCount}/${totalFiles} photos uploaded.`);
                                fetchPhotos();
                            }}
                        />
                        <Button variant="rose" className="gap-2" onClick={() => document.getElementById('photo-upload')?.click()} disabled={uploadProgress.total > 0 && uploadProgress.current < uploadProgress.total}>
                            <Upload className="h-4 w-4" />
                            {uploadProgress.total > 0 && uploadProgress.current < uploadProgress.total
                                ? "Uploading..."
                                : "Upload Photos"}
                        </Button>
                    </div>
                </div>

                {/* Upload Progress Bar */}
                {uploadProgress.total > 0 && uploadProgress.current < uploadProgress.total && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-2">
                        <div className="flex justify-between text-sm mb-2">
                            <span className="font-medium">Uploading Photos...</span>
                            <span className="text-muted-foreground">{uploadProgress.current} uploaded out of {uploadProgress.total}</span>
                        </div>
                        <div className="h-2 w-full bg-secondary/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-primary transition-all duration-300 ease-out"
                                style={{ width: `${(uploadProgress.current / uploadProgress.total) * 100}%` }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-3 p-3 bg-primary/5 rounded-lg border border-primary/10">
                            <div>
                                <p className="text-xs text-muted-foreground mb-1">Total Photos in Event</p>
                                <p className="text-lg font-bold text-primary">
                                    {photos.length + uploadProgress.current} / {event.photoLimit || '∞'}
                                </p>
                            </div>
                            {event.photoLimit && (
                                <div className="text-right">
                                    <p className="text-xs text-muted-foreground mb-1">Remaining After Upload</p>
                                    <p className="text-lg font-semibold text-green-600">
                                        {Math.max(0, event.photoLimit - (photos.length + uploadProgress.current))} photos
                                    </p>
                                </div>
                            )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            Please keep this page open until all photos are uploaded.
                        </p>
                    </div>
                )}

                {/* Bulk Actions Header */}
                {selectedPhotos.length > 0 && (
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 flex items-center justify-between animate-in fade-in slide-in-from-top-2">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-primary">{selectedPhotos.length} photos selected</span>
                            <Button variant="ghost" size="sm" onClick={() => setSelectedPhotos([])} className="h-auto p-1 text-muted-foreground">
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                        <Button variant="destructive" size="sm" onClick={handleBulkDelete} className="gap-2">
                            <Trash2 className="h-4 w-4" />
                            Delete Selected
                        </Button>
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Stats Card */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
                        <h3 className="font-display text-lg font-semibold mb-4">Event Status</h3>

                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Package</span>
                                <span className="font-bold text-primary">{event.package} (₹{event.price})</span>
                            </div>

                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Price Per Photo</span>
                                <span className="font-bold text-primary">
                                    {event.pricePerPhoto > 0 ? `₹${event.pricePerPhoto}` : 'Free'}
                                </span>
                            </div>

                            {/* Photo Upload Counter */}
                            <div className="flex justify-between items-center">
                                <span className="text-muted-foreground">Photos Uploaded</span>
                                <span className="font-bold text-primary">
                                    {photos.length + (uploadProgress.current || 0)} / {event.photoLimit || '∞'}
                                </span>
                            </div>

                            {event.photoLimit && (photos.length + (uploadProgress.current || 0)) < event.photoLimit && (
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Remaining</span>
                                    <span className="font-semibold text-green-600">
                                        {Math.max(0, event.photoLimit - (photos.length + (uploadProgress.current || 0)))} photos
                                    </span>
                                </div>
                            )}

                            {event.photoLimit && (photos.length + (uploadProgress.current || 0)) >= event.photoLimit && (
                                <div className="p-2 rounded-lg bg-orange-50 border border-orange-200">
                                    <p className="text-xs text-orange-700 font-medium">
                                        ⚠️ Photo limit reached
                                    </p>
                                </div>
                            )}

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
                                <div className="flex flex-col items-center gap-6">
                                    <QRCodeDisplay
                                        eventId={eventId!}
                                        eventName={event.name}
                                        size={200}
                                    />
                                    <div className="text-center">
                                        <p className="text-sm text-green-600 font-medium mb-1">
                                            Event Active!
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            Guests can scan this to find their photos.
                                        </p>
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

                {/* Debug Error Box */}
                {uploadError && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded text-red-800 text-xs font-mono overflow-auto max-h-40">
                        <p className="font-bold">Last Upload Error:</p>
                        <p>File: {uploadError.file}</p>
                        <p>Message: {uploadError.msg}</p>
                        <pre>{JSON.stringify(uploadError.fullError, null, 2)}</pre>
                    </div>
                )}

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
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Checkbox
                                    checked={photos.length > 0 && selectedPhotos.length === photos.length}
                                    onCheckedChange={toggleSelectAll}
                                />
                                <span className="text-sm text-muted-foreground">Select All</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {photos.map((photo: any) => (
                                    <div key={photo._id} className={`group relative aspect-square bg-muted rounded-lg overflow-hidden border ${selectedPhotos.includes(photo._id) ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
                                        <div className="absolute top-2 left-2 z-10">
                                            <Checkbox
                                                checked={selectedPhotos.includes(photo._id)}
                                                onCheckedChange={() => toggleSelection(photo._id)}
                                                className="bg-white/80 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                                            />
                                        </div>
                                        <img
                                            src={photo.url}
                                            alt="Event photo"
                                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                                            onClick={() => toggleSelection(photo._id)} // Click image to select
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
                        </div>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
};

export default ManageEvent;
