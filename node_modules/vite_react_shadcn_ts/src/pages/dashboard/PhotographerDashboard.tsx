import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import QRCodeDisplay from "@/components/dashboard/QRCodeDisplay";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Image,
  Download,
  TrendingUp,
  Plus,
  ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import api from "@/lib/api";

interface Event {
  _id: string;
  name: string;
  date: string;
  photos?: any[];
  photoCount?: number; // Added from backend
  downloads?: number;
}

const PhotographerDashboard = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data } = await api.get('/events');
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate stats from real data
  const totalEvents = events.length;
  // Use photoCount if available, fallback to photos.length array if that exists
  const totalPhotos = events.reduce((acc, curr) => acc + (curr.photoCount || curr.photos?.length || 0), 0);
  const totalDownloads = 0; // Placeholder until backend tracks downloads
  const revenue = 0; // Placeholder

  const stats = [
    { icon: Calendar, label: "Active Events", value: totalEvents.toString(), trend: "Total events" },
    { icon: Image, label: "Total Photos", value: totalPhotos.toString(), trend: "Across all events" },
    { icon: Download, label: "Downloads", value: totalDownloads.toString(), trend: "Total downloads" },
    { icon: TrendingUp, label: "Revenue", value: `₹${revenue}`, trend: "Total revenue" },
  ];

  return (
    <DashboardLayout userRole="admin">
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0] || 'Photographer'}!
            </h1>
            <p className="font-body text-muted-foreground">
              Here's what's happening with your events
            </p>
          </div>
          <Button variant="rose" className="gap-2" asChild>
            <Link to="/dashboard/events/new">
              <Plus className="h-4 w-4" />
              Create Event
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Events */}
          <div className="lg:col-span-2 bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
            <div className="p-5 border-b border-border flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground">
                Recent Events
              </h2>
              {events.length > 0 && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/dashboard/events" className="gap-2">
                    View All
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
            </div>
            <div className="divide-y divide-border">
              {isLoading ? (
                <div className="p-8 text-center text-muted-foreground">Loading events...</div>
              ) : events.length > 0 ? (
                events.slice(0, 5).map((event) => (
                  <div key={event._id} className="p-5 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-display font-semibold text-foreground">
                          {event.name}
                        </p>
                        <p className="font-body text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-body text-sm text-foreground">
                          {event.photoCount || event.photos?.length || 0} photos
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  No events found. Create your first event to get started!
                </div>
              )}
            </div>
          </div>

          {/* Quick QR Code - Show most recent event or placeholder */}
          <div>
            {events.length > 0 ? (
              <QRCodeDisplay
                eventId={events[0]._id}
                eventName={events[0].name}
                size={180}
              />
            ) : (
              <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card text-center text-muted-foreground">
                <p>Create an event to generate a QR code</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PhotographerDashboard;
