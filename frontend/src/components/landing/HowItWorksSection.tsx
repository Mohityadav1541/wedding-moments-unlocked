import { steps } from "@/data/landingData";
import qrScanImage from "@/assets/qr-scan-feature.jpg";
import aiMatchImage from "@/assets/ai-match-feature.jpg";

const HowItWorksSection = () => {
  return (
    <section className="py-20 md:py-32 bg-background">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block text-primary font-body text-sm font-semibold tracking-wider uppercase mb-4">
            How It Works
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            Simple Steps to Your Photos
          </h2>
          <p className="font-body text-lg text-muted-foreground">
            Get your wedding photos in four simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
          {/* Steps List */}
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="flex gap-6 group"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 rounded-full bg-secondary text-secondary-foreground font-display text-xl font-bold flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                    {step.step}
                  </div>
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                    {step.title}
                  </h3>
                  <p className="font-body text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Images */}
          <div className="relative">
            <div className="relative z-10">
              <img
                src={qrScanImage}
                alt="Scanning QR code at wedding"
                className="w-full max-w-md mx-auto rounded-2xl shadow-elegant-md"
              />
            </div>
            <div className="absolute -bottom-8 -right-8 w-48 h-48 z-20 hidden md:block">
              <img
                src={aiMatchImage}
                alt="AI face matching technology"
                className="w-full h-full object-cover rounded-xl shadow-elegant-md border-4 border-background"
              />
            </div>
            {/* Decorative */}
            <div className="absolute -top-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-xl" />
            <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-sage/10 rounded-full blur-xl" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
