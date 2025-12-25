export interface User {
  id: string;
  email: string;
  role: 'superadmin' | 'admin' | 'user';
  name: string;
  phone?: string;
  avatar?: string;
  createdAt: Date;
}

export interface Photographer {
  id: string;
  userId: string;
  businessName: string;
  logo?: string;
  watermarkText?: string;
  watermarkLogo?: string;
  upiId?: string;
  isActive: boolean;
  packageLimit: number;
  photoCount: number;
  commission: number;
}

export interface Event {
  id: string;
  photographerId: string;
  name: string;
  venue: string;
  date: Date;
  qrCode: string;
  photoPrice: number; // 0 for free, > 0 for paid
  isActive: boolean;
  totalPhotos: number;
  totalDownloads: number;
  createdAt: Date;
}

export interface Photo {
  id: string;
  eventId: string;
  url: string;
  thumbnailUrl: string;
  watermarkedUrl?: string;
  faceEmbeddings?: number[];
  isProcessed: boolean;
  downloadCount: number;
  createdAt: Date;
}

export interface PhotoMatch {
  photoId: string;
  confidence: number;
  photo: Photo;
}

export interface Payment {
  id: string;
  eventId: string;
  photoIds: string[];
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  upiTransactionId?: string;
  guestPhone?: string;
  createdAt: Date;
}
