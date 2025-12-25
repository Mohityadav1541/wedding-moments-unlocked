import { useState } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import api from "@/lib/api";
import { toast } from "sonner";

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: formData.get("name"),
            date: formData.get("date"),
            location: formData.get("location"),
            selectedPackage: formData.get("selectedPackage"),
        };
        console.log("Submitting Event Data:", data);

        try {
            const res = await api.post("/events", data);
            toast.success("Event created! Please complete payment.");
            navigate(`/dashboard/events/${res.data._id}`); // Redirect to manage page for payment
        } catch (error: any) {
            console.error("Full Event Creation Error:", error);
            if (error.response) {
                console.error("Error Response Data:", error.response.data);
                console.error("Error Response Status:", error.response.status);
            }
            toast.error(error.response?.data?.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userRole="admin">
            <div className="p-6 lg:p-8 max-w-2xl mx-auto">
                <Button variant="ghost" asChild className="mb-6 -ml-4 gap-2">
                    <Link to="/dashboard/events">
                        <ArrowLeft className="h-4 w-4" />
                        Back to Events
                    </Link>
                </Button>

                <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                    <h1 className="font-display text-2xl font-bold mb-6">Create New Event</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Event Name</Label>
                            <Input id="name" name="name" placeholder="e.g. Priya & Rahul Wedding" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="date">Event Date</Label>
                            <Input id="date" name="date" type="date" required />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="location">Location</Label>
                            <Input id="location" name="location" placeholder="e.g. Grand Hotel, Mumbai" />
                        </div>

                        <div className="space-y-4">
                            <Label>Select Package</Label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <label className="cursor-pointer relative">
                                    <input type="radio" name="selectedPackage" value="Standard" className="peer sr-only" defaultChecked />
                                    <div className="p-4 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 transition-all">
                                        <div className="font-display font-bold text-lg mb-1">Standard Wedding</div>
                                        <div className="font-body text-primary font-bold mb-2">₹1499</div>
                                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                            <li>15 GB Storage</li>
                                            <li>Photographer Watermark</li>
                                        </ul>
                                    </div>
                                </label>
                                <label className="cursor-pointer relative">
                                    <input type="radio" name="selectedPackage" value="Premium" className="peer sr-only" />
                                    <div className="p-4 rounded-xl border-2 border-border peer-checked:border-primary peer-checked:bg-primary/5 hover:border-primary/50 transition-all">
                                        <div className="font-display font-bold text-lg mb-1">Premium Wedding</div>
                                        <div className="font-body text-primary font-bold mb-2">₹2999</div>
                                        <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                                            <li>25 GB Storage</li>
                                            <li>Photographer Watermark</li>
                                        </ul>
                                    </div>
                                </label>
                            </div>
                        </div>

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Event & Proceed to Payment"}
                        </Button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
