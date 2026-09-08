import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import { Download, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
const QRCodeDisplay = ({ eventId, eventName, size = 200 }) => {
  const eventUrl = `${window.location.origin}/event/${eventId}`;
  const copyLink = () => {
    navigator.clipboard.writeText(eventUrl);
    toast.success("Link copied to clipboard!");
  };
  const downloadQR = () => {
    const svg = document.getElementById(`qr-${eventId}`);
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.onload = () => {
        const scale = 5;
        const renderSize = size * scale;
        canvas.width = renderSize;
        canvas.height = renderSize;
        if (ctx) {
          ctx.fillStyle = "#FFFFFF";
          ctx.fillRect(0, 0, renderSize, renderSize);
          ctx.drawImage(img, 0, 0, renderSize, renderSize);
        }
        const pngFile = canvas.toDataURL("image/png");
        const downloadLink = document.createElement("a");
        downloadLink.download = `${eventName.replace(/\s+/g, "-").toLowerCase()}-qr.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      };
      img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }
    toast.success("QR code downloaded!");
  };
  return <div className="bg-card rounded-xl p-6 border border-border/50 shadow-card text-center"><h3 className="font-display text-lg font-semibold text-foreground mb-4">{eventName}</h3><div className="bg-background p-4 rounded-xl inline-block mb-4"><QRCodeSVG
    id={`qr-${eventId}`}
    value={eventUrl}
    size={size}
    level="H"
    includeMargin
    fgColor="hsl(20, 10%, 15%)"
    bgColor="transparent"
  /></div><p className="font-body text-sm text-muted-foreground mb-4 break-all">{eventUrl}</p><div className="flex gap-2 justify-center"><Button variant="outline" size="sm" onClick={copyLink} className="gap-2"><Copy className="h-4 w-4" />
          Copy Link
        </Button><Button variant="outline" size="sm" onClick={downloadQR} className="gap-2"><Download className="h-4 w-4" />
          Download QR
        </Button><Button variant="ghost" size="sm" asChild><a href={eventUrl} target="_blank" rel="noopener noreferrer"><ExternalLink className="h-4 w-4" /></a></Button></div></div>;
};
var stdin_default = QRCodeDisplay;
export {
  stdin_default as default
};
