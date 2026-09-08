const compressImage = async (file, quality = 0.8, maxWidth = 1920) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith("image/")) {
      resolve(file);
      return;
    }
    const image = new Image();
    image.src = URL.createObjectURL(file);
    image.onload = () => {
      URL.revokeObjectURL(image.src);
      const canvas = document.createElement("canvas");
      let width = image.width;
      let height = image.height;
      if (width > maxWidth) {
        height = Math.round(height * maxWidth / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Canvas context not available"));
        return;
      }
      ctx.drawImage(image, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) {
          reject(new Error("Compression failed"));
          return;
        }
        const newName = file.name.replace(/\.[^/.]+$/, "") + ".jpg";
        const compressedFile = new File([blob], newName, {
          type: "image/jpeg",
          lastModified: Date.now()
        });
        resolve(compressedFile);
      }, "image/jpeg", quality);
    };
    image.onerror = (error) => {
      URL.revokeObjectURL(image.src);
      reject(error);
    };
  });
};
export {
  compressImage
};
