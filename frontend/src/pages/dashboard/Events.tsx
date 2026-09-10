import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Plus, Calendar, MapPin } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";

const Events = () => {
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

    return (
        <DashboardLayout userRole="admin">
            <div className="p-6 lg:p-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div>
                        <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
                            My Events
                        </h1>
                        <p className="font-body text-muted-foreground">
                            Manage your wedding events
                        </p>
                    </div>
                    <Button variant="rose" className="gap-2" asChild>
                        <Link to="/dashboard/events/new">
                            <Plus className="h-4 w-4" />
                            Create Event
                        </Link>
                    </Button>
                </div>

                {loading ? (
                    <p>Loading events...</p>
                ) : events.length === 0 ? (
                    <div className="text-center py-12 bg-card rounded-xl border border-border/50">
                        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                        <h3 className="text-lg font-semibold mb-2">No events found</h3>
                        <p className="text-muted-foreground mb-4">Start by creating your first event</p>
                        <Button variant="rose" asChild>
                            <Link to="/dashboard/events/new">Create Event</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {events.map((event: any) => (
                            <div key={event._id} className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden hover:shadow-lg transition-shadow">
                                <div className="h-48 bg-muted flex items-center justify-center">
                                    {event.coverImage ? (
                                        <img src={event.coverImage} alt={event.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <Calendar className="h-12 w-12 text-muted-foreground" />
                                    )}
                                </div>
                                <div className="p-5">
                                    <h3 className="font-display text-lg font-bold mb-2">{event.name}</h3>
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(event.date).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="h-4 w-4" />
                                            {event.location || "No location"}
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-between items-center">
                                        <Link to={`/dashboard/events/${event._id}`} className="text-primary text-sm font-medium hover:underline">
                                            Manage Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Events;
