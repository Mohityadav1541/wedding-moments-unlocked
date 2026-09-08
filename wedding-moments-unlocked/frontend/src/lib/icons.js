import { Camera, QrCode, Sparkles, Download, Shield, CreditCard, Check, Heart, Mail, Phone, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
const iconMap = {
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
const getIcon = (name) => {
  return iconMap[name] || Sparkles;
};
export {
  getIcon,
  iconMap
};
