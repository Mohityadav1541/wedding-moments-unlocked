import { Camera, QrCode, Sparkles, Download, Shield, CreditCard } from "lucide-react";
const features = [
  {
    icon: QrCode,
    title: "Scan & Discover",
    description: "Simply scan the event QR code at your wedding venue to instantly access the photo gallery."
  },
  {
    icon: Camera,
    title: "Upload Your Selfie",
    description: "Take a quick selfie and our AI will find all photos featuring you from the event."
  },
  {
    icon: Sparkles,
    title: "AI Face Matching",
    description: "Advanced facial recognition technology identifies you across hundreds of photos in seconds."
  },
  {
    icon: Download,
    title: "1-Click ZIP Download",
    description: "Download all your matched wedding photos together in a single high-resolution ZIP file instantly."
  },
  {
    icon: Shield,
    title: "Secure & Private",
    description: "Your photos are encrypted and private, accessible only via QR code or selfie verification."
  },
  {
    icon: CreditCard,
    title: "Easy Event Packages",
    description: "Flexible packages for photography studios and couples with zero hidden fees."
  }
];
const steps = [
  {
    step: 1,
    title: "Scan QR Code",
    description: "Find the QR code at your event venue and scan it with your phone camera"
  },
  {
    step: 2,
    title: "Upload Selfie",
    description: "Take a clear selfie or upload an existing photo of yourself"
  },
  {
    step: 3,
    title: "View Matches",
    description: "Our AI finds all photos featuring you from the event gallery"
  },
  {
    step: 4,
    title: "Download ZIP Archive",
    description: "Download your personal photo collection instantly with 1-click ZIP archive"
  }
];
const testimonials = [
  {
    name: "Priya & Rahul",
    role: "Newlyweds",
    content: "We got 500+ photos from our wedding and our guests could find their photos instantly! Amazing experience.",
    avatar: "PR"
  },
  {
    name: "Rajesh Kumar",
    role: "Wedding Photographer",
    content: "This platform has transformed how I deliver photos. My clients love the instant access and I get more referrals!",
    avatar: "RK"
  },
  {
    name: "Meera Sharma",
    role: "Wedding Guest",
    content: "I found all 23 photos of myself in under 30 seconds. The AI is incredibly accurate!",
    avatar: "MS"
  }
];
export {
  features,
  steps,
  testimonials
};
