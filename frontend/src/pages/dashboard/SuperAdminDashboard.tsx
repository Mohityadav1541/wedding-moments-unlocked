import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import {
    Users,
    Building,
    TrendingUp,
    Settings
} from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const SuperAdminDashboard = () => {
    const [events, setEvents] = useState([]);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get('/events'); // This endpoint needs to return all events for SuperAdmin
            setEvents(data);
        } catch (error) {
            console.error("Error fetching events:", error);
        }
    };

    const handleApprovePayment = async (eventId: string) => {
        try {
            await api.put(`/events/${eventId}/confirm`);
            toast.success("Event approved and activated!");
            fetchEvents();
        } catch (error) {
            toast.error("Failed to approve event");
        }
    };

    // Filter for events waiting for approval
    const pendingPayments = events.filter((e: any) => e.paymentStatus === 'paid' && !e.superAdminConfirmed);

    // Demo data for Super Admin
    const stats = [
        { icon: Users, label: "Total Users", value: "1,234", trend: "+12% this month" },
        { icon: Building, label: "Total Events", value: events.length.toString(), trend: "+8% this week" },
        { icon: TrendingUp, label: "Platform Revenue", value: "₹1,24,500", trend: "+15% this month" },
        { icon: Settings, label: "System Status", value: "Healthy", trend: "All services online" },
    ];

    return (
        <DashboardLayout userRole="superadmin">
            <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                            Super Admin Dashboard
                        </h1>
                        <p className="font-body text-muted-foreground">
                            Overview of platform performance and users
                        </p>
                    </div>
                    <Button asChild>
                        <Link to="/super-admin/settings">System Settings</Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className="bg-card rounded-xl p-5 border border-border/50 shadow-card"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                    <stat.icon className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <p className="font-display text-2xl font-bold text-foreground mb-1">
                                {stat.value}
                            </p>
                            <p className="font-body text-sm text-muted-foreground">
                                {stat.label}
                            </p>
                            <p className="font-body text-xs text-sage-dark mt-2">
                                {stat.trend}
                            </p>
                        </div>
                    ))}
                </div>

                {/* Pending Payments Section */}
                <div className="mb-8">
                    <h2 className="font-display text-xl font-bold mb-4">Pending Payment Approvals</h2>
                    {pendingPayments.length === 0 ? (
                        <div className="bg-card rounded-xl p-8 border border-border/50 text-center text-muted-foreground">
                            No pending payments to review.
                        </div>
                    ) : (
                        <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Event Name</th>
                                            <th className="px-6 py-4">Date</th>
                                            <th className="px-6 py-4">Package/Amount</th>
                                            <th className="px-6 py-4">Proof</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {pendingPayments.map((event: any) => (
                                            <tr key={event._id} className="hover:bg-muted/30">
                                                <td className="px-6 py-4 font-medium text-foreground">{event.name}</td>
                                                <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                                                <td className="px-6 py-4">
                                                    <div>{event.package}</div>
                                                    <div className="font-bold">₹{event.price}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    {event.paymentScreenshot ? (
                                                        <a
                                                            href={event.paymentScreenshot.startsWith('http') ? event.paymentScreenshot : `${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${event.paymentScreenshot.replace(/\\/g, "/")}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-blue-600 hover:underline text-xs"
                                                        >
                                                            View Screenshot
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted-foreground text-xs">No screenshot</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700 text-white"
                                                        onClick={() => handleApprovePayment(event._id)}
                                                    >
                                                        Approve
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
                {/* All Events Section */}
                <div className="mb-8">
                    <h2 className="font-display text-xl font-bold mb-4">All Events Management</h2>
                    <div className="bg-card rounded-xl border border-border/50 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Event Name</th>
                                        <th className="px-6 py-4">Photographer</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {events.map((event: any) => (
                                        <tr key={event._id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 font-medium text-foreground">{event.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">
                                                {event.user?.name || "Unknown"}
                                            </td>
                                            <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${event.superAdminConfirmed ? 'bg-green-100 text-green-700' :
                                                    event.paymentStatus === 'paid' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                    }`}>
                                                    {event.superAdminConfirmed ? 'Active' :
                                                        event.paymentStatus === 'paid' ? 'Reviewing' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    size="sm"
                                                    variant="destructive"
                                                    onClick={async () => {
                                                        if (confirm(`Are you sure you want to delete "${event.name}"? This will delete ALL photos associated with it from the Cloud.`)) {
                                                            try {
                                                                await api.delete(`/events/${event._id}`);
                                                                toast.success("Event and photos deleted successfully");
                                                                fetchEvents();
                                                            } catch (error) {
                                                                console.error(error);
                                                                toast.error("Failed to delete event");
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Delete
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default SuperAdminDashboard;
