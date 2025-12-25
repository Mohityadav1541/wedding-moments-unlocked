import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import api from "@/lib/api";
import { format } from "date-fns";
import { CheckCircle, Clock } from "lucide-react";

const Payments = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            // Re-using events endpoint since it contains payment status
            const { data } = await api.get('/events');
            // Filter only events that have a relevant payment status
            const paidEvents = data.filter((event: any) =>
                event.paymentStatus === 'paid' || event.paymentStatus === 'confirmed'
            );
            setPayments(paidEvents);
        } catch (error) {
            console.error("Error fetching payments:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <DashboardLayout userRole="admin">
            <div className="p-6 lg:p-8">
                <h1 className="font-display text-2xl font-bold mb-6">Payment History</h1>

                {loading ? (
                    <div>Loading payments...</div>
                ) : payments.length === 0 ? (
                    <div className="text-center p-8 bg-muted/20 rounded-xl border border-dashed">
                        <p className="text-muted-foreground">No payment history found.</p>
                    </div>
                ) : (
                    <div className="bg-card rounded-xl border border-border/50 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                    <tr>
                                        <th className="px-6 py-4">Event</th>
                                        <th className="px-6 py-4">Date</th>
                                        <th className="px-6 py-4">Plan</th>
                                        <th className="px-6 py-4">Amount</th>
                                        <th className="px-6 py-4">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {payments.map((event: any) => (
                                        <tr key={event._id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 font-medium text-foreground">
                                                {event.name}
                                            </td>
                                            <td className="px-6 py-4">
                                                {format(new Date(event.date), 'MMM d, yyyy')}
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.package}
                                            </td>
                                            <td className="px-6 py-4 font-bold">
                                                ₹{event.price}
                                            </td>
                                            <td className="px-6 py-4">
                                                {event.paymentStatus === 'confirmed' ? (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                        <CheckCircle className="w-3 h-3" />
                                                        Confirmed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                        <Clock className="w-3 h-3" />
                                                        Pending
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default Payments;
