import { cloudinary } from '../config/cloudinary.js';
import { Readable } from 'stream';

let s3ClientInstance = null;
let S3ClientClass = null;
let PutObjectCommandClass = null;
let DeleteObjectCommandClass = null;

/**
 * Lazy initialization of the S3 Client for Cloudflare R2.
 * Uses a Singleton pattern to avoid memory leaks from instantiating
 * a new client for every photo upload.
 */
const getS3Client = async () => {
    if (s3ClientInstance) return { s3: s3ClientInstance, PutObjectCommand: PutObjectCommandClass, DeleteObjectCommand: DeleteObjectCommandClass };

    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
    const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!r2AccountId || !r2AccessKey || !r2SecretKey) {
        throw new Error("Missing R2 credentials");
    }

    // Dynamic import so @aws-sdk is only loaded if R2 is actually configured
    const { S3Client, PutObjectCommand, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    
    S3ClientClass = S3Client;
    PutObjectCommandClass = PutObjectCommand;
    DeleteObjectCommandClass = DeleteObjectCommand;

    s3ClientInstance = new S3Client({
        region: 'auto',
        endpoint: `https://${r2AccountId}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: r2AccessKey,
            secretAccessKey: r2SecretKey,
        },
    });

    return { s3: s3ClientInstance, PutObjectCommand, DeleteObjectCommand };
};

/**
 * Upload an image buffer or stream to Cloudflare R2 or Cloudinary.
 * HYBRID STORAGE STRATEGY:
 * - Temporary search selfies (folder: 'temp_search') -> Always Cloudinary
 * - High-res event photos (folder: 'events') -> Cloudflare R2 (fallback to Cloudinary)
 */
export const uploadImage = async (buffer, folder = 'events', originalFilename = null) => {
    const r2Bucket = process.env.R2_BUCKET_NAME;
    const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN;
    const r2AccountId = process.env.R2_ACCOUNT_ID;
    const { randomBytes } = await import('crypto');
    const secureRandomHex = randomBytes(16).toString('hex');
    const safeFilename = originalFilename ? originalFilename.replace(/\s+/g, '_') : 'photo.jpg';

    if (folder === 'events' && r2Bucket && r2AccountId) {
        try {
            const { s3, PutObjectCommand } = await getS3Client();
            console.log(`[Storage] Uploading high-res event photo to Cloudflare R2: ${safeFilename}`);
            
            const key = `${folder}/${secureRandomHex}_${safeFilename}`;
            await s3.send(new PutObjectCommand({
                Bucket: r2Bucket,
                Key: key,
                Body: buffer,
                ContentType: 'image/jpeg',
            }));

            const url = r2PublicDomain 
                ? `${r2PublicDomain.replace(/\/$/, '')}/${key}`
                : `https://${r2Bucket}.${r2AccountId}.r2.cloudflarestorage.com/${key}`;

            return { url, publicId: key, provider: 'r2' };
        } catch (error) {
            console.warn(`[Storage] R2 upload failed, falling back to Cloudinary: ${error.message}`);
        }
    }

    // Fallback: Upload to Cloudinary
    console.log(`[Storage] Uploading image to Cloudinary (folder: ${folder})`);
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder,
                public_id: `${secureRandomHex}_${safeFilename.split('.')[0]}`,
                transformation: folder === 'temp_search' 
                    ? [{ width: 1000, crop: "limit", quality: "auto" }]
                    : undefined
            },
            (error, result) => {
                if (error) {
                    console.error("[Storage] Cloudinary Upload Error:", error);
                    reject(error);
                } else {
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        provider: 'cloudinary'
                    });
                }
            }
        );
        const stream = Readable.from(buffer);
        stream.pipe(uploadStream);
    });
};

/**
 * Delete image from storage (R2 or Cloudinary)
 */
export const deleteImage = async (publicId, provider = 'cloudinary') => {
    if (!publicId) return;

    if (provider === 'r2' && process.env.R2_BUCKET_NAME) {
        try {
            const { s3, DeleteObjectCommand } = await getS3Client();
            console.log(`[Storage] Deleting file from Cloudflare R2: ${publicId}`);
            
            await s3.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: publicId,
            }));
            return;
        } catch (e) {
            console.warn(`[Storage] Failed to delete from R2: ${e.message}`);
        }
    }

    try {
        await cloudinary.uploader.destroy(publicId);
        console.log(`[Storage] Cloudinary File deleted: ${publicId}`);
    } catch (e) {
        console.warn(`[Storage] Cloudinary Delete warning: ${e.message}`);
    }
};
