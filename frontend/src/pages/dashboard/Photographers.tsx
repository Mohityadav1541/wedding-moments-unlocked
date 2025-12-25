import { useState, useEffect } from "react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { getPhotographers, updateUserStatus, deleteUser } from "@/lib/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Photographers = () => {
    const [photographers, setPhotographers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPhotographers();
    }, []);

    const fetchPhotographers = async () => {
        try {
            const data = await getPhotographers();
            setPhotographers(data);
        } catch (error) {
            console.error(error);
            toast.error("Failed to load photographers");
        } finally {
            setLoading(false);
        }
    };

    const handleToggleBlock = async (user: any) => {
        const action = user.isBlocked ? "Unblock" : "Block";
        if (confirm(`Are you sure you want to ${action} ${user.name}?`)) {
            try {
                await updateUserStatus(user._id, !user.isBlocked);
                toast.success(`User ${action}ed successfully`);
                fetchPhotographers();
            } catch (error) {
                console.error(error);
                toast.error(`Failed to ${action} user`);
            }
        }
    };

    const handleDelete = async (user: any) => {
        if (confirm(`Are you sure you want to DELETE ${user.name}? This action cannot be undone.`)) {
            try {
                await deleteUser(user._id);
                toast.success("User deleted successfully");
                fetchPhotographers();
            } catch (error) {
                console.error(error);
                toast.error("Failed to delete user");
            }
        }
    };

    return (
        <DashboardLayout userRole="superadmin">
            <div className="p-6 lg:p-8">
                <h1 className="font-display text-2xl font-bold mb-6">Photographers</h1>
                <p className="text-muted-foreground mb-8">Manage registered photographers here.</p>

                <div className="bg-card rounded-xl border border-border/50 shadow-card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="bg-muted/50 text-muted-foreground font-medium uppercase text-xs">
                                <tr>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4 text-center">Total Events</th>
                                    <th className="px-6 py-4 text-center">Active</th>
                                    <th className="px-6 py-4 text-center">Inactive</th>
                                    <th className="px-6 py-4">Joined On</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {loading ? (
                                    <tr><td colSpan={8} className="p-6 text-center">Loading...</td></tr>
                                ) : photographers.length === 0 ? (
                                    <tr><td colSpan={8} className="p-6 text-center">No photographers found.</td></tr>
                                ) : (
                                    photographers.map((user: any) => (
                                        <tr key={user._id} className="hover:bg-muted/30">
                                            <td className="px-6 py-4 font-medium text-foreground">{user.name}</td>
                                            <td className="px-6 py-4 text-muted-foreground">{user.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isBlocked
                                                    ? "bg-red-100 text-red-800"
                                                    : "bg-green-100 text-green-800"
                                                    }`}>
                                                    {user.isBlocked ? "Blocked" : "Active"}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center font-medium">{user.totalEvents || 0}</td>
                                            <td className="px-6 py-4 text-center text-green-600">{user.activeEvents || 0}</td>
                                            <td className="px-6 py-4 text-center text-yellow-600">{user.inactiveEvents || 0}</td>
                                            <td className="px-6 py-4">{new Date(user.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Button
                                                    size="sm"
                                                    variant={user.isBlocked ? "outline" : "destructive"}
                                                    onClick={() => handleToggleBlock(user)}
                                                    className={user.isBlocked ? "text-green-600 hover:text-green-700 hover:bg-green-50" : ""}
                                                >
                                                    {user.isBlocked ? "Unblock" : "Block"}
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="ghost"
                                                    className="text-muted-foreground hover:text-red-600"
                                                    onClick={() => handleDelete(user)}
                                                >
                                                    Delete
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

export default Photographers;
