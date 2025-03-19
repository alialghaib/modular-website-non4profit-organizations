
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import { Elements } from "@stripe/react-stripe-js";
import { stripePromise } from "@/lib/stripe";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import Hikes from "./pages/Hikes";
import HikeDetail from "./pages/HikeDetail";
import About from "./pages/About";
import Donate from "./pages/Donate";
import JoinUs from "./pages/JoinUs";
import Profile from "./pages/Profile";
import MyHikes from "./pages/hiker/MyHikes";

// Role-based dashboard pages
import AdminDashboard from "./pages/admin/Dashboard";
import GuideDashboard from "./pages/guide/Dashboard";
import HikerDashboard from "./pages/hiker/Dashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Elements stripe={stripePromise}>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Index />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/hikes" element={<Hikes />} />
              <Route path="/hike/:hikeId" element={<HikeDetail />} />
              <Route path="/about" element={<About />} />
              <Route path="/donate" element={<Donate />} />
              <Route path="/join-us" element={<JoinUs />} />
              <Route path="/profile" element={<Profile />} />
              
              {/* Admin-only routes */}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/guides" element={<NotFound />} />
                <Route path="/admin/schedule" element={<NotFound />} />
                <Route path="/admin/locations" element={<NotFound />} />
                <Route path="/admin/reports" element={<NotFound />} />
                <Route path="/admin/settings" element={<NotFound />} />
              </Route>
              
              {/* Guide-only routes */}
              <Route element={<ProtectedRoute allowedRoles={['guide']} />}>
                <Route path="/guide/dashboard" element={<GuideDashboard />} />
                <Route path="/guide/calendar" element={<NotFound />} />
                <Route path="/guide/hike/:hikeId" element={<NotFound />} />
                <Route path="/guide/hike/:hikeId/waivers" element={<NotFound />} />
                <Route path="/guide/messages" element={<NotFound />} />
                <Route path="/guide/documents" element={<NotFound />} />
              </Route>
              
              {/* Hiker-only routes */}
              <Route element={<ProtectedRoute allowedRoles={['hiker']} />}>
                <Route path="/hiker/dashboard" element={<HikerDashboard />} />
                <Route path="/hiker/my-hikes" element={<MyHikes />} />
                <Route path="/hiker/bookings" element={<NotFound />} />
                <Route path="/hiker/booking/:bookingId" element={<NotFound />} />
                <Route path="/hiker/booking/:bookingId/waiver" element={<NotFound />} />
                <Route path="/hiker/waivers" element={<NotFound />} />
                <Route path="/hiker/payments" element={<NotFound />} />
              </Route>
              
              {/* Catch-all route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </Elements>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
