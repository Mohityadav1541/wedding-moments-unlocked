const addWatermark = async (imageUrl, text) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Could not get canvas context"));
        return;
      }
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      const fontSize = Math.max(24, Math.floor(img.height * 0.04));
      const padding = Math.floor(fontSize * 0.5);
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.textBaseline = "bottom";
      const textMetrics = ctx.measureText(text);
      const textWidth = textMetrics.width;
      const x = canvas.width - textWidth - padding - 10;
      const y = canvas.height - padding;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(x - 10, y - fontSize, textWidth + 20, fontSize + 10);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(text, x, y);
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Canvas export failed"));
        }
      }, "image/jpeg", 0.95);
    };
    img.onerror = (err) => {
      fetch(imageUrl).then((res) => res.blob()).then((blob) => {
        img.src = URL.createObjectURL(blob);
      }).catch((e) => reject(e));
    };
    img.src = imageUrl;
  });
};
export {
  addWatermark
};
