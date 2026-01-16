/**
 * Adds a text watermark to the bottom of an image.
 * @param imageUrl - The source image URL.
 * @param text - The watermark text (e.g., photographer name).
 * @returns Promise<Blob> - The watermarked image as a Blob.
 */
export const addWatermark = async (imageUrl: string, text: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous"; // Required for manipulating external images

        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Could not get canvas context"));
                return;
            }

            // Set canvas size to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw original image
            ctx.drawImage(img, 0, 0);

            // Watermark Configuration
            const fontSize = Math.max(24, Math.floor(img.height * 0.04)); // Responsive font size (~4% of height)
            const padding = Math.floor(fontSize * 0.5);

            ctx.font = `bold ${fontSize}px sans-serif`;
            ctx.textBaseline = 'bottom';

            // Measure text
            const textMetrics = ctx.measureText(text);
            const textWidth = textMetrics.width;

            // Position: Bottom Right (with some padding)
            const x = canvas.width - textWidth - padding - 10;
            const y = canvas.height - padding;

            // Add semi-transparent background for readability
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(x - 10, y - fontSize, textWidth + 20, fontSize + 10);

            // Draw Text
            ctx.fillStyle = '#ffffff';
            ctx.fillText(text, x, y);

            // Export
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(blob);
                } else {
                    reject(new Error("Canvas export failed"));
                }
            }, 'image/jpeg', 0.95); // High quality JPEG
        };

        img.onerror = (err) => {
            // Fallback: try to fetch as blob first if direct load fails (CORS retry)
            fetch(imageUrl)
                .then(res => res.blob())
                .then(blob => {
                    img.src = URL.createObjectURL(blob);
                })
                .catch(e => reject(e));
        };

        img.src = imageUrl;
    });
};
