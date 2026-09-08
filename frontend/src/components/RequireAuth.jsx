import { Navigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
const RequireAuth = ({ children, allowedRoles }) => {
  const location = useLocation();
  let user = null;
  try {
    const userStr = localStorage.getItem("user");
    user = userStr ? JSON.parse(userStr) : null;
  } catch {
    localStorage.removeItem("user");
  }
  if (!user || !user.token) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30 p-4 text-center"><div className="bg-card p-8 rounded-xl border border-border shadow-card max-w-md w-full"><h1 className="text-2xl font-bold text-red-600 mb-2">Access Denied</h1><p className="text-muted-foreground mb-4">
                        You do not have permission to view this page.
                    </p><div className="bg-secondary/20 p-4 rounded-lg mb-6 text-sm text-left"><p><strong>Current Role:</strong> {user.role}</p><p><strong>Required Role:</strong> {allowedRoles.join(", ")}</p></div><div className="flex gap-4 justify-center"><Button onClick={() => window.location.href = user.role === "superadmin" ? "/super-admin" : "/"}>
                            Go to Dashboard
                        </Button><Button
      variant="outline"
      onClick={() => {
        localStorage.removeItem("user");
        window.location.href = "/auth";
      }}
    >
                            Sign Out / Switch Account
                        </Button></div></div></div>;
  }
  return children;
};
var stdin_default = RequireAuth;
export {
  stdin_default as default
};
