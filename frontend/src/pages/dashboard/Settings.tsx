import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { LogOut, Save, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

const Settings = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form States
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        studioName: ""
    });

    const userRole = JSON.parse(localStorage.getItem('user') || '{}').role || 'admin';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const { data } = await api.get('/users/profile');
            setUser(data);
            setFormData({
                name: data.name || "",
                email: data.email || "",
                phone: data.phone || "",
                studioName: data.studioName || ""
            });
        } catch (error) {
            console.error("Fetch profile error", error);
            toast.error("Failed to load profile");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                name: formData.name,
                email: formData.email,
                phone: formData.phone,
                studioName: formData.studioName,
                // We don't send paymentDetails anymore, backend should handle partial updates or ignore missing
            };

            const { data } = await api.put('/users/profile', payload);

            const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
            localStorage.setItem('user', JSON.stringify({ ...currentUser, ...data }));

            toast.success("Profile updated successfully");
            setUser(data);
        } catch (error: any) {
            console.error("Update profile error", error);
            toast.error(error.response?.data?.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout userRole={userRole}>
                <div className="flex justify-center p-10">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout userRole={userRole}>
            <div className="p-6 lg:p-8 max-w-4xl mx-auto">
                <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Public Profile */}
                    <div className="bg-card rounded-xl border border-border/50 shadow-card p-6 space-y-4">
                        <h3 className="font-display text-lg font-bold">Public Profile</h3>
                        <p className="text-sm text-muted-foreground">These details appear on your event pages.</p>
                        <Separator />

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Your Name</Label>
                                <Input id="name" name="name" value={formData.name} onChange={handleChange} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Contact Phone</Label>
                                <Input id="phone" name="phone" value={formData.phone} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="studioName">Studio Name (Watermark Text)</Label>
                                <Input id="studioName" name="studioName" value={formData.studioName} onChange={handleChange} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email (Read Only)</Label>
                                <Input id="email" value={formData.email} disabled className="bg-muted" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button type="submit" variant="hero" disabled={saving} className="gap-2">
                            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                            Save Changes
                        </Button>
                    </div>
                </form>

                {/* Account Actions */}
                <div className="mt-8 pt-8 border-t">
                    <h3 className="font-display text-lg font-bold mb-4">Account Actions</h3>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            localStorage.removeItem('user');
                            window.location.href = '/';
                        }}
                        className="gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
