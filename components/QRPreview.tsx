import React, { useEffect, useRef, useState } from 'react';
import QRCodeStyling from 'qr-code-styling';
import { Download, Share2 } from 'lucide-react';
import { Button } from './ui/Button';
import { QRConfig } from '../types';

interface QRPreviewProps {
  config: QRConfig;
}

export const QRPreview: React.FC<QRPreviewProps> = ({ config }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [qrCode] = useState<QRCodeStyling>(new QRCodeStyling({ ...config, width: 300, height: 300 }));
  const [isDownloading, setIsDownloading] = useState(false);

  // Update preview instance
  useEffect(() => {
    // For preview, we use transparent background in the QR library
    // and handle the background/border in the container div
    const previewConfig = {
      ...config,
      width: 300,
      height: 300,
      backgroundOptions: {
        color: 'transparent',
      }
    };
    qrCode.update(previewConfig);
  }, [config, qrCode]);

  // Render preview
  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = '';
      qrCode.append(ref.current);
    }
  }, [qrCode]);

  const handleDownload = async (format: 'png' | 'svg') => {
    setIsDownloading(true);
    try {
        const resolution = config.downloadOptions.resolution || 2048;
        const borderWidth = config.frameOptions.width;
        // Scale settings relative to resolution vs preview size (assumed 300 for preview logic, but inputs are usually pixel based or ratio based).
        // Let's assume the user inputs are relative to a "standard" size (e.g. 300px) or absolute pixels.
        // If absolute pixels, they might look tiny on 2048px.
        // Let's treat the inputs as "Points" where 300 points = standard view.
        // So we scale them up.
        const scale = resolution / 300;
        
        const scaledBorderWidth = borderWidth * scale;
        const scaledRadius = config.frameOptions.radius * scale;
        // The margin in QR config is the "quiet zone". It should scale too?
        // qr-code-styling handles margin inside width/height. We don't need to scale it manually if we pass bigger width/height.
        // However, if we want an outer border, we need to subtract that from available space for the QR.
        
        // available size for QR code (including its own margin)
        // If border is 10px, it draws outside? Or inside?
        // Let's draw background/border as the container, and QR centered inside.
        // The QR size should be: resolution - (scaledBorderWidth * 2)
        // Note: Border usually has 1/2 outside 1/2 inside stroke. We want full border inside to avoid clipping?
        // Let's assume border is inside.
        const qrSize = resolution - (scaledBorderWidth * 2);

        // Temp QR instance for high-res generation
        const tempQr = new QRCodeStyling({
            ...config,
            width: qrSize,
            height: qrSize,
            backgroundOptions: { color: 'transparent' }, // Essential for layering
            // margin is handled by the lib relative to size, so we pass raw margin value? 
            // The lib's margin is in pixels. If we increase size, we should probably increase margin too if we want proportional look.
            // But usually margin 10px is 10px. Let's scale margin too to keep proportions.
            margin: config.margin * scale 
        });

        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `FreeQR-${timestamp}`;

        if (format === 'png') {
            const rawBlob = await tempQr.getRawData('png');
            if (!rawBlob) throw new Error("Failed to generate QR blob");
            
            const imgBitmap = await createImageBitmap(rawBlob);
            
            const canvas = document.createElement('canvas');
            canvas.width = resolution;
            canvas.height = resolution;
            const ctx = canvas.getContext('2d');
            if (!ctx) throw new Error("Canvas context failed");

            // 1. Draw Background & Rounded Container
            ctx.fillStyle = config.backgroundOptions.color;
            ctx.beginPath();
            // Helper for rounded rect path
            const x = 0, y = 0, w = resolution, h = resolution, r = scaledRadius;
            ctx.moveTo(x + r, y);
            ctx.arcTo(x + w, y, x + w, y + h, r);
            ctx.arcTo(x + w, y + h, x, y + h, r);
            ctx.arcTo(x, y + h, x, y, r);
            ctx.arcTo(x, y, x + w, y, r);
            ctx.closePath();
            ctx.fill();

            // 2. Draw Border (if exists)
            if (scaledBorderWidth > 0) {
                ctx.lineWidth = scaledBorderWidth;
                ctx.strokeStyle = config.frameOptions.color;
                // Inset path by half stroke width to keep it inside? 
                // Or just stroke the edge. Standard stroke is centered on path.
                // If we clip to the rounded rect, the outer half of stroke is lost.
                // Better to inset the path by half width for the stroke.
                const offset = scaledBorderWidth / 2;
                const r2 = Math.max(0, scaledRadius - offset); // Adjust radius
                
                ctx.beginPath();
                ctx.moveTo(offset + r2, offset);
                ctx.arcTo(resolution - offset, offset, resolution - offset, resolution - offset, r2);
                ctx.arcTo(resolution - offset, resolution - offset, offset, resolution - offset, r2);
                ctx.arcTo(offset, resolution - offset, offset, offset, r2);
                ctx.arcTo(offset, offset, resolution - offset, offset, r2);
                ctx.closePath();
                ctx.stroke();
            }

            // 3. Draw QR Code Centered
            // Calculate position to center the QR image
            const qrX = (resolution - qrSize) / 2;
            const qrY = (resolution - qrSize) / 2;
            ctx.drawImage(imgBitmap, qrX, qrY, qrSize, qrSize);

            // 4. Download
            const dataUrl = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = `${fileName}.png`;
            link.click();
        } 
        else if (format === 'svg') {
            const rawSvgBlob = await tempQr.getRawData('svg');
            if (!rawSvgBlob) throw new Error("Failed to generate SVG blob");
            const rawSvgText = await rawSvgBlob.text();
            
            // Extract inner content of SVG or inject it
            // Simple parsing to find the opening <svg ...> tag and get the content might be risky.
            // Better: Embed the QR SVG as a nested SVG node.
            
            // We need to parse the raw SVG to remove the width/height attributes from root 
            // or just use x, y, width, height on the nested svg tag.
            // However, rawSvgText is a full XML document.
            // Let's strip the <?xml ...?> and <svg ...> wrapper roughly or use DOMParser.
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(rawSvgText, "image/svg+xml");
            const svgElement = doc.documentElement;
            // Get inner content
            const innerContent = svgElement.innerHTML;
            const viewBox = svgElement.getAttribute('viewBox') || `0 0 ${qrSize} ${qrSize}`;

            const finalSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${resolution}" height="${resolution}" viewBox="0 0 ${resolution} ${resolution}">
  <rect x="0" y="0" width="${resolution}" height="${resolution}" rx="${scaledRadius}" ry="${scaledRadius}" fill="${config.backgroundOptions.color}" />
  ${scaledBorderWidth > 0 ? `<rect x="${scaledBorderWidth/2}" y="${scaledBorderWidth/2}" width="${resolution - scaledBorderWidth}" height="${resolution - scaledBorderWidth}" rx="${Math.max(0, scaledRadius - scaledBorderWidth/2)}" ry="${Math.max(0, scaledRadius - scaledBorderWidth/2)}" fill="none" stroke="${config.frameOptions.color}" stroke-width="${scaledBorderWidth}" />` : ''}
  <svg x="${(resolution - qrSize) / 2}" y="${(resolution - qrSize) / 2}" width="${qrSize}" height="${qrSize}" viewBox="${viewBox}">
    ${innerContent}
  </svg>
</svg>
            `;
            
            const blob = new Blob([finalSvg], { type: 'image/svg+xml' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${fileName}.svg`;
            link.click();
            URL.revokeObjectURL(url);
        }

    } catch (err) {
        console.error("Download failed", err);
        alert("Failed to generate high-quality download. Please try again.");
    } finally {
        setIsDownloading(false);
    }
  };

  // Border visual styles for preview
  const containerStyle = {
    backgroundColor: config.backgroundOptions.color,
    borderRadius: `${config.frameOptions.radius}px`,
    border: config.frameOptions.width > 0 ? `${config.frameOptions.width}px solid ${config.frameOptions.color}` : 'none',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' // slight shadow for card effect
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Preview Card */}
      <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 p-8 flex flex-col items-center justify-center min-h-[400px] relative overflow-hidden">
        <div className="absolute inset-0 bg-brand-50/30 pattern-grid opacity-50 pointer-events-none" />
        
        <div className="relative z-10 transition-all duration-300 ease-in-out" style={containerStyle}>
            {/* The QR container inside needs to be clean. The margin is inside the QR. */}
            <div ref={ref} className="qr-container" />
        </div>

        <p className="relative z-10 mt-6 text-sm text-slate-400 font-medium">
            Live Preview ({config.width}x{config.height}px)
        </p>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-4">
        <Button 
            onClick={() => handleDownload('png')} 
            variant="primary" 
            size="lg"
            className="w-full gap-2"
            isLoading={isDownloading}
        >
            <Download size={18} />
            Download PNG
        </Button>
        <Button 
            onClick={() => handleDownload('svg')} 
            variant="secondary" 
            size="lg"
            className="w-full gap-2"
            isLoading={isDownloading}
        >
            <Share2 size={18} />
            Download SVG
        </Button>
      </div>
      
      <p className="text-center text-xs text-slate-400">
        Output Resolution: {config.downloadOptions.resolution}px • Vector & HD
      </p>
    </div>
  );
};