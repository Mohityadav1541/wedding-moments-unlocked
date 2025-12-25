import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Calendar, MapPin, User, CheckCircle, Clock, XCircle } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const AllEvents = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchEvents();
    }, []);

    const fetchEvents = async () => {
        try {
            const { data } = await api.get("/events");
            setEvents(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load events");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string, adminConfirmed: boolean) => {
        if (adminConfirmed) {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"><CheckCircle className="h-3 w-3" /> Confirmed</span>;
        }
        if (status === 'paid') {
            return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"><Clock className="h-3 w-3" /> Verification Pending</span>;
        }
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="h-3 w-3" /> Pending Payment</span>;
    };

    return (
        <DashboardLayout userRole="superadmin">
            <div className="p-6 lg:p-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="font-display text-2xl font-bold text-foreground">
                            All Events
                        </h1>
                        <p className="font-body text-muted-foreground">
                            Overview of all events created by photographers
                        </p>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Event Details</th>
                                    <th className="px-6 py-4">Photographer</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={5} className="p-6 text-center">Loading...</td></tr>
                                ) : events.length === 0 ? (
                                    <tr><td colSpan={5} className="p-6 text-center">No events found.</td></tr>
                                ) : (
                                    events.map((event: any) => (
                                        <tr key={event._id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="h-10 w-10 rounded bg-muted flex items-center justify-center overflow-hidden">
                                                        {event.coverImage ? (
                                                            <img src={event.coverImage} className="w-full h-full object-cover" alt="" />
                                                        ) : (
                                                            <Calendar className="h-5 w-5 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-foreground">{event.name}</p>
                                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {new Date(event.date).toLocaleDateString()}</span>
                                                            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {event.location}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                    <div className="text-sm">
                                                        <p className="font-medium">{event.user?.name || "Unknown"}</p>
                                                        <p className="text-xs text-muted-foreground">{event.user?.email}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-xs font-semibold">
                                                    {event.package}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {getStatusBadge(event.paymentStatus, event.superAdminConfirmed)}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button variant="ghost" size="sm" asChild>
                                                    <Link to={`/super-admin/events/${event._id}`}>
                                                        View Details
                                                    </Link>
                                                </Button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default AllEvents;
