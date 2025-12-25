import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { Link } from "react-router-dom";

const Settings = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const role = user.role || 'admin';

    return (
        <DashboardLayout userRole={role}>
            <div className="p-6 lg:p-8">
                <h1 className="font-display text-2xl font-bold mb-6">Settings</h1>
                <p className="text-muted-foreground mb-8">Manage your account and studio settings.</p>

                <div className="bg-card rounded-xl border border-border/50 shadow-card p-6">
                    <h3 className="font-display text-lg font-bold mb-4">Account Actions</h3>
                    <Button
                        variant="destructive"
                        asChild
                        className="w-full sm:w-auto gap-2"
                    >
                        <span
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => {
                                localStorage.removeItem('user');
                                window.location.href = '/';
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </span>
                    </Button>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Settings;
