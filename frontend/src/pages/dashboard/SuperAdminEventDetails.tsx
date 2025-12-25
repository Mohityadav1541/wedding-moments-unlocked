import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, User, CheckCircle, Clock } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const SuperAdminEventDetails = () => {
    const { eventId } = useParams();
    const [event, setEvent] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    const fetchEventDetails = async () => {
        try {
            const { data } = await api.get(`/events/${eventId}`);
            setEvent(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load event details");
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async () => {
        if (confirm("Are you sure you want to verify this payment and ACTIVATE the event?")) {
            try {
                await api.put(`/events/${eventId}/confirm`);
                toast.success("Event Activated Successfully!");
                fetchEventDetails();
            } catch (error) {
                console.error(error);
                toast.error("Failed to confirm payment");
            }
        }
    };

    if (loading) return <DashboardLayout userRole="superadmin"><div className="p-8">Loading...</div></DashboardLayout>;
    if (!event) return <DashboardLayout userRole="superadmin"><div className="p-8">Event not found</div></DashboardLayout>;

    return (
        <DashboardLayout userRole="superadmin">
            <div className="p-6 lg:p-8">
                <Button variant="ghost" asChild className="mb-6 -ml-4 gap-2">
                    <Link to="/super-admin/events">
                        <ArrowLeft className="h-4 w-4" />
                        Back to All Events
                    </Link>
                </Button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Left Column: Event Details */}
                    <div className="space-y-6">
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
                                    {event.location}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
                            <h3 className="font-display text-lg font-semibold mb-4">Photographer Details</h3>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center">
                                    <User className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <div>
                                    <p className="font-medium">Photographer: {event.user?.name || "Unknown"}</p>
                                    <p className="text-sm text-muted-foreground">Email: {event.user?.email || "Unknown"}</p>
                                    <p className="text-xs text-muted-foreground">ID: {event.user?._id || "Unknown"}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card">
                            <h3 className="font-display text-lg font-semibold mb-4">Package & Payment</h3>
                            <div className="flex justify-between items-center mb-4 border-b pb-4">
                                <span className="text-muted-foreground">Package</span>
                                <span className="font-bold text-lg">{event.package}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6">
                                <span className="text-muted-foreground">Amount</span>
                                <span className="font-bold text-2xl text-primary">₹{event.price}</span>
                            </div>

                            <div className="p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Current Status</div>
                                {event.superAdminConfirmed ? (
                                    <div className="flex items-center gap-2 text-green-600 font-bold">
                                        <CheckCircle className="h-5 w-5" />
                                        Payment Verified & Active
                                    </div>
                                ) : event.paymentStatus === 'paid' ? (
                                    <div className="flex items-center gap-2 text-orange-600 font-bold">
                                        <Clock className="h-5 w-5" />
                                        Payment Submitted - Pending Review
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-red-500 font-bold">
                                        <Clock className="h-5 w-5" />
                                        Payment Pending (Not submitted yet)
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Screenshot & Actions */}
                    <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card h-fit">
                        <h3 className="font-display text-lg font-semibold mb-4">Payment Verification</h3>

                        {event.paymentScreenshot ? (
                            <div className="mb-6">
                                <p className="text-sm text-muted-foreground mb-2">Uploaded Screenshot:</p>
                                <div className="border rounded-lg overflow-hidden bg-muted/50 p-2">
                                    <a href={`http://localhost:5000/${event.paymentScreenshot.replace(/\\/g, "/")}`} target="_blank" rel="noopener noreferrer">
                                        <img
                                            src={`http://localhost:5000/${event.paymentScreenshot.replace(/\\/g, "/")}`}
                                            alt="Payment Screenshot"
                                            className="w-full object-contain max-h-[400px]"
                                        />
                                    </a>
                                </div>
                            </div>
                        ) : (
                            <div className="mb-6 p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground uppercase text-xs tracking-wider">
                                No screenshot uploaded yet
                            </div>
                        )}

                        {!event.superAdminConfirmed && (
                            <Button
                                className="w-full"
                                size="lg"
                                onClick={handleConfirmPayment}
                                disabled={!event.paymentScreenshot}
                            >
                                <CheckCircle className="mr-2 h-4 w-4" />
                                Verify Payment & Activate Event
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminEventDetails;
