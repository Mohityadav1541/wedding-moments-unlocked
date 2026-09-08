import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, Camera, Star } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import api from "@/lib/api";
const Packages = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    mobile: "",
    upiTransactionId: "",
    screenshot: ""
    // Placeholder, maybe file upload later if needed
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const handleSubscribe = (plan) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const amount = parseInt(selectedPlan.price.replace(/[^0-9]/g, ""));
      const response = await api.post("/transactions", {
        plan: selectedPlan.name,
        amount,
        upiTransactionId: formData.upiTransactionId
      });
      toast.success("Payment request submitted! Admin will verify and approve shortly.");
      setIsPaymentModalOpen(false);
      setFormData({ mobile: "", upiTransactionId: "", screenshot: "" });
      navigate("/dashboard");
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error(error.response?.data?.message || "Payment submission failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  const plans = [
    {
      name: "Basic",
      price: "\u20B9999",
      period: "/event",
      description: "Perfect for small events and parties",
      features: [
        "Up to 2,000 Photos",
        "60 Days Storage",
        "Unlimited Guest Scans",
        "Standard Support",
        "Instant ZIP Downloads",
        "Basic Analytics"
      ],
      icon: Shield,
      popular: false
    },
    {
      name: "Standard",
      price: "\u20B91,499",
      period: "/event",
      description: "Ideal for weddings and receptions",
      features: [
        "Up to 5,000 Photos",
        "120 Days Storage",
        "Unlimited Guest Scans",
        "Priority Support",
        "Instant ZIP Downloads",
        "Advanced Analytics"
      ],
      icon: Zap,
      popular: true
    },
    {
      name: "Premium",
      price: "\u20B91,999",
      period: "/event",
      description: "For grand weddings with maximum coverage",
      features: [
        "Up to 10,000 Photos",
        "1 Year Storage",
        "Unlimited Guest Scans",
        "Premium Support",
        "Custom Branding",
        "AI Face Recognition"
      ],
      icon: Crown,
      popular: false
    },
    {
      name: "Studio Monthly",
      price: "\u20B91,999",
      period: "/month",
      description: "For busy studios managing multiple events",
      features: [
        "Unlimited Photos",
        "1 Year Storage",
        "Unlimited Guest Scans",
        "Priority Support",
        "Multiple Events",
        "Studio Branding"
      ],
      icon: Camera,
      popular: false
    },
    {
      name: "Studio Yearly",
      price: "\u20B917,999",
      period: "/year",
      description: "Best value for professional photography businesses",
      features: [
        "Unlimited Photos",
        "1 Year Storage",
        "Unlimited Guest Scans",
        "VIP Support",
        "Multiple Events",
        "Studio Branding"
      ],
      icon: Star,
      popular: false
    }
  ];
  return <div className="min-h-screen bg-background flex flex-col"><Header /><main className="flex-1 pt-24 pb-20">{
    /* ... (Keep existing Header/Intro) ... */
  }<div className="container mx-auto px-4">{
    /* ... (Keep existing Intro Text) ... */
  }<div className="text-center max-w-2xl mx-auto mb-16"><span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
                            Pricing Plans
                        </span><h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Choose Your Package
                        </h1><p className="font-body text-lg text-muted-foreground">
                            Select the best plan to grow your photography business and delight your clients.
                        </p></div><div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">{plans.map((plan, index) => <div
    key={index}
    className={`relative bg-card rounded-2xl p-8 border ${plan.popular ? "border-primary shadow-elegant-lg transform scale-105 z-10" : "border-border/50 shadow-card"} transition-all duration-300 hover:translate-y-[-5px]`}
  >{
    /* ... (Keep existing Card Content) ... */
  }{plan.popular && <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>}<div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6"><plan.icon className="h-6 w-6 text-primary" /></div><h3 className="font-display text-2xl font-bold text-foreground mb-2">{plan.name}</h3><p className="font-body text-muted-foreground text-sm mb-6 h-10">{plan.description}</p><div className="mb-8"><span className="font-display text-4xl font-bold text-foreground">{plan.price}</span><span className="font-body text-muted-foreground">{plan.period}</span></div><ul className="space-y-4 mb-8">{plan.features.map((feature, i) => <li key={i} className="flex items-start gap-3"><div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"><Check className="h-3 w-3 text-green-600" /></div><span className="font-body text-sm text-foreground">{feature}</span></li>)}</ul><Button
    className={`w-full ${plan.popular ? "bg-primary hover:bg-primary-dark text-white" : "bg-secondary hover:bg-secondary-dark text-secondary-foreground"}`}
    size="lg"
    onClick={() => handleSubscribe(plan)}
  >{plan.price === "\u20B90" ? "Get Started" : "Choose Plan"}</Button></div>)}</div></div></main><Footer />{
    /* Payment Modal */
  }{isPaymentModalOpen && selectedPlan && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"><div className="bg-card w-full max-w-md max-h-[90vh] flex flex-col rounded-2xl shadow-2xl border border-border"><div className="p-6 border-b border-border bg-muted/30 flex-shrink-0"><h3 className="font-display text-xl font-bold">Complete Your Purchase</h3><p className="text-sm text-muted-foreground mt-1">
                                You selected existing <strong>{selectedPlan.name}</strong> plan for <strong>{selectedPlan.price}</strong>.
                            </p></div><div className="p-6 space-y-6 overflow-y-auto">{
    /* UPI Details */
  }{
    /* UPI Details */
  }<div className="bg-primary/5 p-4 rounded-lg border border-primary/20 flex flex-col items-center text-center"><p className="text-sm font-medium text-primary mb-4">Scan to Pay:</p><div className="bg-white p-2 rounded-lg border border-border shadow-sm mb-4"><img
    src="/payment-qr.jpg"
    alt="Payment QR Code"
    className="w-48 h-48 object-contain"
  /></div><div className="flex items-center gap-2 mt-2"><code className="text-xs font-mono text-muted-foreground">yadavboy1540@okicici</code><Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
    navigator.clipboard.writeText("yadavboy1540@okicici");
    toast.success("UPI ID copied!");
  }}><span className="sr-only">Copy</span><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2" /><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" /></svg></Button></div><p className="text-xs text-muted-foreground mt-2">
                                    Name: Mohit Yadav
                                </p></div><form onSubmit={handlePaymentSubmit} className="space-y-4"><div className="space-y-2"><label className="text-sm font-medium">Your Mobile Number</label><input
    type="tel"
    required
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
    placeholder="Enter registered mobile number"
    value={formData.mobile}
    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
  /></div><div className="space-y-2"><label className="text-sm font-medium">UPI Transaction ID / UTR</label><input
    type="text"
    required
    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
    placeholder="e.g. 123456789012"
    value={formData.upiTransactionId}
    onChange={(e) => setFormData({ ...formData, upiTransactionId: e.target.value })}
  /><p className="text-xs text-muted-foreground">
                                        Enter the 12-digit transaction ID from your payment app.
                                    </p></div><div className="flex gap-3 pt-4"><Button
    type="button"
    variant="outline"
    className="flex-1"
    onClick={() => setIsPaymentModalOpen(false)}
  >
                                        Cancel
                                    </Button><Button
    type="submit"
    className="flex-1 bg-green-600 hover:bg-green-700 text-white"
    disabled={isSubmitting}
  >{isSubmitting ? "Verifying..." : "Submit Payment"}</Button></div></form></div></div></div>}</div>;
};
var stdin_default = Packages;
export {
  stdin_default as default
};
