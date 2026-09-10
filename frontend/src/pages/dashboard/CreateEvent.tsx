import React, { useState, useEffect } from "react";
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
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [fetchingProfile, setFetchingProfile] = useState(true);
    const [loading, setLoading] = useState(false);

    // Fetch latest profile to ensure quota is up to date
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await api.get('/users/profile');
                setUser(prev => ({ ...prev, ...data }));
                localStorage.setItem('user', JSON.stringify({ ...user, ...data }));
            } catch (error) {
                console.error("Failed to fetch fresh profile", error);
            } finally {
                setFetchingProfile(false);
            }
        };
        fetchProfile();
    }, []);

    // Check quota logic
    const isPlanActive = user.subscription?.status === 'active';
    // If expiresAt is null (per-event plan), it's considered not expired.
    const isNotExpired = !user.subscription?.expiresAt || new Date(user.subscription?.expiresAt) > new Date();

    const hasActiveSubscription = isPlanActive && isNotExpired;
    const hasQuota = (user.subscription?.quota || 0) > 0;

    // Superadmin bypass
    const canCreate = user.role === 'superadmin' || hasActiveSubscription || hasQuota;

    if (fetchingProfile) {
        return (
            <DashboardLayout userRole="admin">
                <div className="flex h-[50vh] items-center justify-center">
                    <p className="text-muted-foreground animate-pulse">Checking subscription status...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!canCreate) {
        return (
            <DashboardLayout userRole="admin">
                <div className="p-8 max-w-2xl mx-auto text-center">
                    <h2 className="text-2xl font-bold mb-4">Subscription Required</h2>
                    <p className="text-muted-foreground mb-6">
                        You do not have an active subscription or event quota. Please purchase a package to create new events.
                    </p>
                    <Button onClick={() => navigate('/packages')}>
                        View Packages
                    </Button>

                </div>
            </DashboardLayout>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget as HTMLFormElement);
        const data = {
            name: formData.get("name"),
            date: formData.get("date"),
            location: formData.get("location"),
            pricePerPhoto: Number(formData.get("pricePerPhoto")) || 0,
            // Package is now determined by user subscription on backend
        };

        try {
            const res = await api.post("/events", data);
            toast.success("Event created successfully!");

            // Update local storage quota if not unlimited
            if (user.role !== 'superadmin' && !hasActiveSubscription && hasQuota) {
                const updatedUser = { ...user, subscription: { ...user.subscription, quota: user.subscription.quota - 1 } };
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }

            navigate(`/dashboard/events/${res.data._id}`);
        } catch (error: any) {
            // ... error handling
            console.error("Full Event Creation Error:", error);
            if (error.response?.data?.code === 'SUBSCRIPTION_REQUIRED') {
                toast.error("Quota exceeded. Please upgrade.");
                navigate('/packages');
            } else {
                toast.error(error.response?.data?.message || "Failed to create event");
            }
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

                    {/* Quota Info */}
                    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-6 flex justify-between items-center">
                        <span className="text-sm font-medium text-primary">
                            Current Plan: {user.subscription?.plan || 'None'}
                        </span>
                        <span className="text-xs bg-primary text-white px-2 py-1 rounded-full">
                            {hasActiveSubscription ? 'Unlimited Events' : `Events Left: ${user.subscription?.quota || 0}`}
                        </span>
                    </div>

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

                        <div className="space-y-2">
                            <Label htmlFor="pricePerPhoto">Price Per Photo (₹)</Label>
                            <Input
                                id="pricePerPhoto"
                                name="pricePerPhoto"
                                type="number"
                                min="0"
                                defaultValue="0"
                                placeholder="0 for Free Downloads"
                            />
                            <p className="text-xs text-muted-foreground">
                                Set to 0 for Free Downloads (No Watermark). Set amount for Paid Downloads (Watermarked).
                            </p>
                        </div>

                        {/* Package selection removed as it's subscription based now */}

                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? "Creating..." : "Create Event"}
                        </Button>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateEvent;
