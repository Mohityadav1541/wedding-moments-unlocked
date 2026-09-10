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

                {loading ? (
                    <div className="text-center py-12">Loading...</div>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 border rounded-xl bg-card">No events found.</div>
                ) : (
                    <>
                        {/* Mobile Card View */}
                        <div className="md:hidden space-y-4">
                            {events.map((event: any) => (
                                <div key={event._id} className="bg-card p-4 rounded-xl border border-border/50 shadow-sm">
                                    <div className="flex items-start gap-4 mb-3">
                                        <div className="h-16 w-16 rounded bg-muted flex-shrink-0 flex items-center justify-center overflow-hidden">
                                            {event.coverImage ? (
                                                <img src={event.coverImage} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <Calendar className="h-6 w-6 text-muted-foreground" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-semibold text-foreground truncate">{event.name}</h3>
                                            <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                                                <User className="h-3 w-3" />
                                                {event.user?.name || "Unknown"}
                                            </div>
                                            <div className="mt-1">
                                                {getStatusBadge(event.paymentStatus, event.superAdminConfirmed)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Calendar className="h-3 w-3" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2 text-muted-foreground truncate">
                                            <MapPin className="h-3 w-3" />
                                            {event.location}
                                        </div>
                                    </div>

                                    <Button variant="outline" size="sm" className="w-full" asChild>
                                        <Link to={`/super-admin/events/${event._id}`}>
                                            View Details
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Table View */}
                        <div className="hidden md:block bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
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
                                        {events.map((event: any) => (
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
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </DashboardLayout>
    );
};

export default AllEvents;
