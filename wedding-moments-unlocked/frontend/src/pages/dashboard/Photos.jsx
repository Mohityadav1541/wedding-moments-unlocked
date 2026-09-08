import DashboardLayout from "@/components/dashboard/DashboardLayout";
const Photos = () => {
  return <DashboardLayout userRole="admin"><div className="p-6 lg:p-8"><h1 className="font-display text-2xl font-bold mb-6">All Photos</h1><p className="text-muted-foreground">Select an event to view photos.</p>{
    /* Logic to list all photos or group by event can go here */
  }</div></DashboardLayout>;
};
var stdin_default = Photos;
export {
  stdin_default as default
};
