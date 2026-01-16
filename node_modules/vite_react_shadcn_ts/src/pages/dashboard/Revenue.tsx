import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getRevenueStats } from "@/lib/api";
import { toast } from "sonner";
import { TrendingUp, CreditCard } from "lucide-react";

const Revenue = () => {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getRevenueStats();
            setStats(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load revenue stats");
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <DashboardLayout userRole="superadmin"><div className="p-8">Loading Revenue Data...</div></DashboardLayout>;

    return (
        <DashboardLayout userRole="superadmin">
            <div className="p-6 lg:p-8">
                <h1 className="font-display text-2xl font-bold mb-6">Revenue & Analytics</h1>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-card">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center text-green-600">
                                <TrendingUp className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-muted-foreground">Total Revenue</h3>
                        </div>
                        <p className="text-3xl font-bold">₹{stats?.totalRevenue.toLocaleString()}</p>
                    </div>

                    <div className="bg-card p-6 rounded-xl border border-border/50 shadow-card">
                        <div className="flex items-center gap-4 mb-2">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                                <CreditCard className="h-5 w-5" />
                            </div>
                            <h3 className="font-semibold text-muted-foreground">Total Paid Events</h3>
                        </div>
                        <p className="text-3xl font-bold">{stats?.totalEvents}</p>
                    </div>
                </div>

                <h2 className="text-lg font-bold mb-4">Recent Transactions</h2>
                <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Event</th>
                                    <th className="px-6 py-4">Date</th>
                                    <th className="px-6 py-4">Package</th>
                                    <th className="px-6 py-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {stats?.recentTransactions?.map((event: any) => (
                                    <tr key={event._id} className="hover:bg-muted/30">
                                        <td className="px-6 py-4 font-medium">{event.name}</td>
                                        <td className="px-6 py-4">{new Date(event.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">{event.package}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-600">+₹{event.price}</td>
                                    </tr>
                                ))}
                                {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                                    <tr>
                                        <td colSpan={4} className="p-6 text-center text-muted-foreground">No recent transactions.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Revenue;
