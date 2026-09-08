import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X, Calendar, Search } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
const Payments = () => {
  const userRole = JSON.parse(localStorage.getItem("user") || "{}").role || "admin";
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    fetchRequests();
  }, []);
  const fetchRequests = async () => {
    try {
      const { data } = await api.get("/unlock/photographer");
      setRequests(data);
    } catch (error) {
      console.error("Fetch requests error", error);
    } finally {
      setLoading(false);
    }
  };
  const handleStatusUpdate = async (id, newStatus) => {
    setProcessingId(id);
    try {
      await api.put(`/unlock/${id}/status`, { status: newStatus });
      setRequests((prev) => prev.map(
        (req) => req._id === id ? { ...req, status: newStatus } : req
      ));
      toast.success(`Request ${newStatus} successfully!`);
    } catch (error) {
      console.error("Update status error", error);
      toast.error("Failed to update status");
    } finally {
      setProcessingId(null);
    }
  };
  const filteredRequests = requests.filter(
    (req) => req.transactionId?.toLowerCase().includes(searchTerm.toLowerCase()) || req.guestEmail?.toLowerCase().includes(searchTerm.toLowerCase()) || req.event?.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );
  if (loading) {
    return <DashboardLayout userRole={userRole}><div className="flex justify-center items-center h-[50vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div></DashboardLayout>;
  }
  return <DashboardLayout userRole={userRole}><div className="p-6 lg:p-8"><div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8"><div><h1 className="font-display text-2xl font-bold">Payment Requests</h1><p className="text-muted-foreground">Verify and approve guest payments (UPI) to unlock photos.</p></div></div>{
    /* Filter / Search */
  }<div className="flex gap-4 mb-6"><div className="relative max-w-sm w-full"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    placeholder="Search by ID or Email..."
    className="pl-9"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
  /></div></div><div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden"><Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Event</TableHead><TableHead>Guest</TableHead><TableHead>Transaction</TableHead><TableHead>Amount</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{filteredRequests.length === 0 ? <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                        No requests found.
                                    </TableCell></TableRow> : filteredRequests.map((req) => <TableRow key={req._id}><TableCell className="whitespace-nowrap"><div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-muted-foreground" />{new Date(req.createdAt).toLocaleDateString()}</div></TableCell><TableCell className="font-medium">{req.event?.name || "Unknown"}</TableCell><TableCell><div className="flex flex-col"><span className="text-sm">{req.guestEmail || "No Email"}</span></div></TableCell><TableCell><code className="bg-muted px-2 py-1 rounded text-xs">{req.transactionId}</code></TableCell><TableCell><span className="font-bold text-primary">₹{req.totalAmount}</span><span className="text-muted-foreground text-xs ml-1">({req.photos.length} photos)</span></TableCell><TableCell><Badge variant={req.status === "approved" ? "default" : req.status === "rejected" ? "destructive" : "secondary"} className={req.status === "approved" ? "bg-green-500 hover:bg-green-600" : ""}>{req.status.charAt(0).toUpperCase() + req.status.slice(1)}</Badge></TableCell><TableCell className="text-right">{req.status === "pending" && <div className="flex justify-end gap-2"><Button
    size="sm"
    className="h-8 w-8 p-0 bg-green-500 hover:bg-green-600"
    onClick={() => handleStatusUpdate(req._id, "approved")}
    disabled={processingId === req._id}
    title="Approve"
  >{processingId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}</Button><Button
    size="sm"
    variant="destructive"
    className="h-8 w-8 p-0"
    onClick={() => handleStatusUpdate(req._id, "rejected")}
    disabled={processingId === req._id}
    title="Reject"
  >{processingId === req._id ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}</Button></div>}</TableCell></TableRow>)}</TableBody></Table></div></div></DashboardLayout>;
};
var stdin_default = Payments;
export {
  stdin_default as default
};
