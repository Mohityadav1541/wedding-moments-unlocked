import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import EventPage from "./pages/EventPage";
import PhotographerDashboard from "./pages/dashboard/PhotographerDashboard";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard";
import Events from "./pages/dashboard/Events";
import CreateEvent from "./pages/dashboard/CreateEvent";
import ManageEvent from "./pages/dashboard/ManageEvent";
import Photos from "./pages/dashboard/Photos";
import Payments from "./pages/dashboard/Payments";
import Settings from "./pages/dashboard/Settings";
import Photographers from "./pages/dashboard/Photographers";
import Revenue from "./pages/dashboard/Revenue";
import AllEvents from "./pages/dashboard/AllEvents";
import SuperAdminEventDetails from "./pages/dashboard/SuperAdminEventDetails";
import NotFound from "./pages/NotFound";
import RequireAuth from "./components/RequireAuth";
import Packages from "./pages/Packages";

const queryClient = new QueryClient();

import ScrollToHash from "./components/ScrollToHash";

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <ScrollToHash />
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/packages" element={<Packages />} />
          <Route path="/event/:eventId" element={<EventPage />} />
          <Route
            path="/dashboard"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <PhotographerDashboard />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/events"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Events />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/events/new"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <CreateEvent />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/events/:eventId"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <ManageEvent />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/photos"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Photos />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/payments"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Payments />
              </RequireAuth>
            }
          />
          <Route
            path="/dashboard/settings"
            element={
              <RequireAuth allowedRoles={['admin']}>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/photographers"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <Photographers />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/events"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <AllEvents />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/events/:eventId"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <SuperAdminEventDetails />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/revenue"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <Revenue />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin/settings"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <Settings />
              </RequireAuth>
            }
          />
          <Route
            path="/super-admin"
            element={
              <RequireAuth allowedRoles={['superadmin']}>
                <SuperAdminDashboard />
              </RequireAuth>
            }
          />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
