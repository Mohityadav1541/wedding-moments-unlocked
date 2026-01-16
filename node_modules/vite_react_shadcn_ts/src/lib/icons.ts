
import { Camera, QrCode, Sparkles, Download, Shield, CreditCard, Check, Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";

export const iconMap: Record<string, any> = {
    Camera,
    QrCode,
    Sparkles,
    Download,
    Shield,
    CreditCard,
    Check,
    Heart,
    Mail,
    Phone,
    MapPin,
    Instagram,
    Facebook,
    Twitter
};

export const getIcon = (name: string) => {
    return iconMap[name] || Sparkles; // Default fallback
};
