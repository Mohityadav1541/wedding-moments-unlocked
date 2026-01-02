import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Check, Crown, Zap, Shield, Camera, Star } from "lucide-react";
import { toast } from "sonner";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const Packages = () => {
    const navigate = useNavigate();

    const handleSubscribe = (plan: string) => {
        toast.success(`You selected the ${plan} plan!`);
        // In a real app, integrate payment gateway here
        setTimeout(() => {
            navigate('/dashboard'); // Go to dashboard after "payment"
        }, 1500);
    };

    const plans = [
        {
            name: "Basic",
            price: "₹999",
            period: "/event",
            description: "Perfect for small events and parties",
            features: [
                "Up to 2,000 Photos",
                "60 Days Storage",
                "Unlimited Guest Scans",
                "Standard Support",
                "Watermarked Downloads",
                "Basic Analytics"
            ],
            icon: Shield,
            popular: false
        },
        {
            name: "Standard",
            price: "₹1,499",
            period: "/event",
            description: "Ideal for weddings and receptions",
            features: [
                "Up to 5,000 Photos",
                "120 Days Storage",
                "Unlimited Guest Scans",
                "Priority Support",
                "Watermarked Downloads",
                "Advanced Analytics"
            ],
            icon: Zap,
            popular: true
        },
        {
            name: "Premium",
            price: "₹1,999",
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
            price: "₹1,999",
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
            price: "₹17,999",
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
            icon: Star, // Need to import Star
            popular: false
        }
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 pt-24 pb-20">
                <div className="container mx-auto px-4">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
                            Pricing Plans
                        </span>
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
                            Choose Your Package
                        </h1>
                        <p className="font-body text-lg text-muted-foreground">
                            Select the best plan to grow your photography business and delight your clients.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {plans.map((plan, index) => (
                            <div
                                key={index}
                                className={`relative bg-card rounded-2xl p-8 border ${plan.popular ? 'border-primary shadow-elegant-lg transform scale-105 z-10' : 'border-border/50 shadow-card'} transition-all duration-300 hover:translate-y-[-5px]`}
                            >
                                {plan.popular && (
                                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                        Most Popular
                                    </div>
                                )}

                                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                                    <plan.icon className="h-6 w-6 text-primary" />
                                </div>

                                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                                    {plan.name}
                                </h3>
                                <p className="font-body text-muted-foreground text-sm mb-6 h-10">
                                    {plan.description}
                                </p>

                                <div className="mb-8">
                                    <span className="font-display text-4xl font-bold text-foreground">{plan.price}</span>
                                    <span className="font-body text-muted-foreground">{plan.period}</span>
                                </div>

                                <ul className="space-y-4 mb-8">
                                    {plan.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-3">
                                            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                <Check className="h-3 w-3 text-green-600" />
                                            </div>
                                            <span className="font-body text-sm text-foreground">{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <Button
                                    className={`w-full ${plan.popular ? 'bg-primary hover:bg-primary-dark text-white' : 'bg-secondary hover:bg-secondary-dark text-secondary-foreground'}`}
                                    size="lg"
                                    onClick={() => handleSubscribe(plan.name)}
                                >
                                    {plan.price === "₹0" ? "Get Started" : "Choose Plan"}
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Packages;
