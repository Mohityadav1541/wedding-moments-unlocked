export const compressImage = async (file: File, quality = 0.8, maxWidth = 1920): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Validation: If it's not an image, return original
        if (!file.type.startsWith('image/')) {
            resolve(file);
            return;
        }

        const image = new Image();
        image.src = URL.createObjectURL(file);

        image.onload = () => {
            URL.revokeObjectURL(image.src); // Clean up memory

            const canvas = document.createElement('canvas');
            let width = image.width;
            let height = image.height;

            // Maintain aspect ratio while resizing
            if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error("Canvas context not available"));
                return;
            }

            // Draw image to canvas
            ctx.drawImage(image, 0, 0, width, height);

            // Convert canvas to Blob/File
            canvas.toBlob((blob) => {
                if (!blob) {
                    reject(new Error("Compression failed"));
                    return;
                }
                // Create new file with same name but jpeg type (standardizing)
                // Note: This changes format to JPEG regardless of input, which is fine for photos
                const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
                const compressedFile = new File([blob], newName, {
                    type: 'image/jpeg',
                    lastModified: Date.now(),
                });
                resolve(compressedFile);
            }, 'image/jpeg', quality);
        };

        image.onerror = (error) => {
            URL.revokeObjectURL(image.src);
            reject(error);
        };
    });
};
