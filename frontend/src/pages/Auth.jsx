import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Logo from "@/components/Logo";
import { Eye, EyeOff, Mail, Lock, User, Phone, LogOut } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultTab = searchParams.get("mode") === "signup" ? "signup" : "signin";
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setCurrentUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem("user");
      }
    }
  }, []);
  const handleSignOut = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
    toast.success("Signed out successfully.");
  };
  const handleSignIn = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const formData = new FormData(e.target);
    const email = String(formData.get("email") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.post("/auth/login", { email, password });
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Welcome back! Redirecting...");
      if (data.role === "superadmin") {
        navigate("/super-admin");
      } else if (data.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsLoading(false);
    }
  };
  const handleSignUp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const form = e.target;
    const name = form.querySelector("#name")?.value?.trim();
    const phone = form.querySelector("#phone")?.value?.trim();
    const studioName = form.querySelector("#business")?.value?.trim();
    const email = form.querySelector("#signup-email")?.value?.trim().toLowerCase();
    const password = form.querySelector("#signup-password")?.value;
    if (!name || !email || !password) {
      toast.error("Please fill in all required fields.");
      setIsLoading(false);
      return;
    }
    try {
      const { data } = await api.post("/auth/register", {
        name,
        email,
        password,
        role: "admin",
        studioName,
        phone
      });
      localStorage.setItem("user", JSON.stringify(data));
      toast.success("Account created successfully!");
      if (data.role === "superadmin") {
        navigate("/super-admin");
      } else {
        navigate("/dashboard");
      }
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  return <div className="min-h-screen bg-gradient-hero flex">{
    /* Left Side - Form */
  }<div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12"><div className="mx-auto w-full max-w-md"><div className="mb-8"><Logo /></div>{currentUser && <div className="mb-6 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between"><div><p className="font-display font-bold text-sm text-foreground">Active Session: {currentUser.name || currentUser.email}</p><p className="font-body text-xs text-muted-foreground capitalize">Role: {currentUser.role}</p></div><div className="flex gap-2"><Button size="sm" className="bg-primary hover:bg-primary-dark text-white text-xs" onClick={() => navigate(currentUser.role === "superadmin" ? "/super-admin" : "/dashboard")}>
                  Dashboard
                </Button><Button size="sm" variant="outline" onClick={handleSignOut} title="Sign Out" className="text-xs"><LogOut className="h-3.5 w-3.5" /></Button></div></div>}<Tabs defaultValue={defaultTab} className="w-full"><TabsList className="grid w-full grid-cols-2 mb-8"><TabsTrigger value="signin" className="font-body">Sign In</TabsTrigger><TabsTrigger value="signup" className="font-body">Sign Up</TabsTrigger></TabsList>{
    /* Sign In */
  }<TabsContent value="signin"><div className="bg-card rounded-2xl p-6 md:p-8 shadow-elegant border border-border/50"><h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Welcome Back
                </h2><p className="font-body text-muted-foreground mb-6">
                  Sign in to access your dashboard
                </p><form onSubmit={handleSignIn} className="space-y-4"><div className="space-y-2"><Label htmlFor="email" className="font-body">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    name="email"
    id="email"
    type="email"
    placeholder="your@email.com"
    className="pl-10"
    required
  /></div></div><div className="space-y-2"><Label htmlFor="password" className="font-body">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    name="password"
    id="password"
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    className="pl-10 pr-10"
    required
  /><button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><div className="flex justify-end"><a href="#" className="text-sm text-primary hover:underline font-body">
                      Forgot password?
                    </a></div><Button variant="rose" className="w-full" size="lg" disabled={isLoading}>{isLoading ? "Signing in..." : "Sign In"}</Button></form></div></TabsContent>{
    /* Sign Up */
  }<TabsContent value="signup"><div className="bg-card rounded-2xl p-6 md:p-8 shadow-elegant border border-border/50"><h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Create Account
                </h2><p className="font-body text-muted-foreground mb-6">
                  Join as a photographer to start uploading events
                </p><form onSubmit={handleSignUp} className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label htmlFor="name" className="font-body">Full Name</Label><div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    id="name"
    placeholder="John Doe"
    className="pl-10"
    required
  /></div></div><div className="space-y-2"><Label htmlFor="phone" className="font-body">Phone</Label><div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    id="phone"
    placeholder="+91 98765 43210"
    className="pl-10"
    required
  /></div></div></div><div className="space-y-2"><Label htmlFor="business" className="font-body">Business Name</Label><Input
    id="business"
    placeholder="Your Studio Name"
    required
  /></div><div className="space-y-2"><Label htmlFor="signup-email" className="font-body">Email</Label><div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    id="signup-email"
    type="email"
    placeholder="your@email.com"
    className="pl-10"
    required
  /></div></div><div className="space-y-2"><Label htmlFor="signup-password" className="font-body">Password</Label><div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input
    id="signup-password"
    type={showPassword ? "text" : "password"}
    placeholder="••••••••"
    className="pl-10 pr-10"
    required
  /><button
    type="button"
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
  >{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button></div></div><Button variant="rose" className="w-full" size="lg" disabled={isLoading}>{isLoading ? "Creating account..." : "Create Account"}</Button><p className="text-center text-sm text-muted-foreground font-body">
                    By signing up, you agree to our{" "}<a href="#" className="text-primary hover:underline">Terms</a>{" "}and{" "}<a href="#" className="text-primary hover:underline">Privacy Policy</a></p></form></div></TabsContent></Tabs><p className="text-center mt-6 text-muted-foreground font-body"><Link to="/" className="text-primary hover:underline">
              ← Back to Home
            </Link></p></div></div>{
    /* Right Side - Visual */
  }<div className="hidden lg:flex lg:flex-1 bg-foreground items-center justify-center p-12 relative overflow-hidden"><div className="absolute inset-0 opacity-10"><div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary rounded-full blur-3xl" /><div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-sage rounded-full blur-3xl" /></div><div className="relative text-center max-w-md"><h2 className="font-display text-4xl font-bold text-background mb-6">
            Capture Every Precious Moment
          </h2><p className="font-body text-lg text-background/70 mb-8">
            Join our platform to deliver wedding photos instantly with AI-powered face recognition.
          </p><div className="flex justify-center gap-8"><div className="text-center"><p className="font-display text-3xl font-bold text-primary">500+</p><p className="font-body text-sm text-background/60">Events</p></div><div className="text-center"><p className="font-display text-3xl font-bold text-primary">50K+</p><p className="font-body text-sm text-background/60">Photos</p></div><div className="text-center"><p className="font-display text-3xl font-bold text-primary">98%</p><p className="font-body text-sm text-background/60">Accuracy</p></div></div></div></div></div>;
};
var stdin_default = Auth;
export {
  stdin_default as default
};
