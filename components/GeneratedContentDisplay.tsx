import React, { useState } from 'react';
import { GeneratedContent } from '../types';
import Card from './Card';
import { 
    DocumentTextIcon, 
    CheckCircleIcon, 
    LightBulbIcon, 
    ClipboardDocumentIcon, 
    ArrowDownTrayIcon, 
    CheckIcon as CheckIconOutline,
    MusicalNoteIcon,
    MicrophoneIcon
} from '@heroicons/react/24/outline'; 
import Button from './Button'; 

interface GeneratedContentDisplayProps {
  content: GeneratedContent;
}

const sanitizeFilename = (name: string) => {
  return name.replace(/[^a-zA-Z0-9_-\s]/g, '').replace(/\s+/g, '_');
};

const drawWrappedTextHelper = (
  context: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  font?: string, 
  fillStyle?: string 
): number => { 
  if (font) context.font = font;
  if (fillStyle) context.fillStyle = fillStyle;
  
  if (!text || !text.trim()) {
    // Even for empty text, we advance the line
    return y + lineHeight; 
  }

  let currentY = y;
  const paragraphs = text.split('\n'); // Handle manual newlines
  
  for (const paragraph of paragraphs) {
    if (!paragraph.trim()) {
      currentY += lineHeight;
      continue;
    }
    
    const words = paragraph.split(' ');
    let line = '';

    for (const word of words) {
      // Use the current line and add the new word, with a space if line is not empty
      const testLine = line ? `${line} ${word}` : word;
      const metrics = context.measureText(testLine);

      if (metrics.width > maxWidth && line) {
        context.fillText(line, x, currentY);
        currentY += lineHeight;
        line = word;
      } else {
        line = testLine;
      }
    }
    context.fillText(line, x, currentY); // Draw the last line of the paragraph
    currentY += lineHeight; // Move to the next line for the next paragraph
  }
  return currentY; // Return the final Y position for the next element
};


const ContentBlock: React.FC<{ title: string; text: string; preWrap?: boolean }> = ({ title, text, preWrap = false }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    } catch (err) {
      console.error('Failed to copy text: ', err);
      alert('Gagal menyalin teks.');
    }
  };

  const handleDownloadJPG = () => {
    if (!text && !title) {
        alert('Tidak ada konten untuk diunduh.');
        return;
    }
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Gagal membuat gambar: Tidak bisa mendapatkan konteks canvas.');
      return;
    }

    const PADDING = 20;
    const TITLE_FONT_SIZE = 22;
    const TEXT_FONT_SIZE = 16;
    const LINE_HEIGHT_RATIO = 1.4;
    const titleLineHeight = TITLE_FONT_SIZE * LINE_HEIGHT_RATIO;
    const textLineHeight = TEXT_FONT_SIZE * LINE_HEIGHT_RATIO;
    const CONTENT_WIDTH = 700; 
    canvas.width = CONTENT_WIDTH + 2 * PADDING;

    const tempCanvasMeasure = document.createElement('canvas');
    const tempCtxMeasure = tempCanvasMeasure.getContext('2d');
    if(!tempCtxMeasure) { 
        alert('Gagal inisialisasi pengukuran gambar.');
        return;
    }
    tempCanvasMeasure.width = canvas.width;

    let currentHeight = PADDING;
    if (title) {
        const titleEndY = drawWrappedTextHelper(tempCtxMeasure, title, PADDING, PADDING, CONTENT_WIDTH, titleLineHeight, `bold ${TITLE_FONT_SIZE}px Inter, sans-serif`);
        currentHeight = titleEndY;
        currentHeight += 10;
    }
    if (text) {
        const textStartY = title ? currentHeight : PADDING;
        const textEndY = drawWrappedTextHelper(tempCtxMeasure, text, PADDING, textStartY, CONTENT_WIDTH, textLineHeight, `${TEXT_FONT_SIZE}px Inter, sans-serif`);
        currentHeight = textEndY; 
    }
    currentHeight += PADDING - titleLineHeight; // Adjust for final line's extra height from helper
    canvas.height = Math.max(currentHeight, 100); 

    ctx.fillStyle = '#FFFFFF'; 
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.textBaseline = 'top'; 

    let drawY = PADDING;
    if (title) {
        drawY = drawWrappedTextHelper(ctx, title, PADDING, drawY, CONTENT_WIDTH, titleLineHeight, `bold ${TITLE_FONT_SIZE}px Inter, sans-serif`, '#374151'); 
        drawY += 10 - titleLineHeight; // Adjust position for text, removing helper's advance
    }
    
    if (text) {
        drawWrappedTextHelper(ctx, text, PADDING, drawY, CONTENT_WIDTH, textLineHeight, `${TEXT_FONT_SIZE}px Inter, sans-serif`, '#111827'); 
    }

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `${sanitizeFilename(title || 'Konten')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating JPG for content block:", e);
      alert("Gagal membuat file JPG. Browser Anda mungkin tidak mendukung operasi ini atau konten terlalu besar.");
    }
  };

  return (
    <div className="mb-6 p-4 bg-[var(--bg-card-secondary)] rounded-lg shadow">
      <div className="flex justify-between items-center mb-2">
        <h4 className="text-md font-semibold text-[var(--link-color)]">{title}</h4>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            disabled={!text}
            title={isCopied ? "Teks disalin!" : (text ? "Salin Teks" : "Tidak ada teks untuk disalin")}
            className={`p-1.5 text-[var(--text-secondary)] hover:text-[var(--link-color)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus-color)] focus:ring-opacity-50 rounded-md transition-colors ${(!text) ? 'opacity-50 cursor-not-allowed text-[var(--icon-neutral-color)]' : ''}`}
            aria-label={isCopied ? "Teks berhasil disalin" : "Salin teks ke clipboard"}
          >
            {isCopied ? <CheckIconOutline className="h-5 w-5 text-[var(--icon-success-color)]" /> : <ClipboardDocumentIcon className="h-5 w-5" />}
          </button>
          <button
            onClick={handleDownloadJPG}
            disabled={!text && !title}
            title={text || title ? "Unduh sebagai JPG" : "Tidak ada konten untuk diunduh"}
            className={`p-1.5 text-[var(--text-secondary)] hover:text-[var(--link-color)] focus:outline-none focus:ring-2 focus:ring-[var(--border-focus-color)] focus:ring-opacity-50 rounded-md transition-colors ${(!text && !title) ? 'opacity-50 cursor-not-allowed text-[var(--icon-neutral-color)]' : ''}`}
            aria-label="Unduh konten sebagai gambar JPG"
          >
            <ArrowDownTrayIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      <p className={`text-[var(--text-primary)] text-sm ${preWrap ? 'whitespace-pre-wrap' : ''} ${!text ? 'italic text-[var(--text-tertiary)]':''}`}>
        {text || "Konten tidak tersedia."}
      </p>
    </div>
  );
};

const GeneratedContentDisplay: React.FC<GeneratedContentDisplayProps> = ({ content }) => {
  if (!content.caption) { 
    return null;
  }

  const handleDownloadAllAsJPG = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      alert('Gagal membuat gambar: Tidak bisa mendapatkan konteks canvas.');
      return;
    }

    const PADDING = 30;
    const CONTENT_WIDTH = 800;
    canvas.width = CONTENT_WIDTH + 2 * PADDING;

    const PRIMARY_TEXT_COLOR_JPG = '#1E293B'; 
    const BLOCK_TITLE_COLOR_JPG = '#4338CA'; 
    const SECTION_TITLE_COLOR_JPG = '#374151'; 

    const SECTION_TITLE_FONT = 'bold 22px Inter, sans-serif';
    const BLOCK_TITLE_FONT = 'semibold 18px Inter, sans-serif';
    const TEXT_FONT = '15px Inter, sans-serif';

    const LINE_HEIGHT_RATIO = 1.5;
    const SECTION_TITLE_LINE_HEIGHT = 22 * LINE_HEIGHT_RATIO;
    const BLOCK_TITLE_LINE_HEIGHT = 18 * LINE_HEIGHT_RATIO;
    const TEXT_LINE_HEIGHT = 15 * LINE_HEIGHT_RATIO;
    
    const INTER_BLOCK_SPACING = 10; 
    const BLOCK_TEXT_SPACING = 5; 
    const SECTION_SPACING = 25; 
    
    ctx.textBaseline = 'top';

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    if(!tempCtx) return; 

    const calculateTextBlockHeight = (text: string, font: string, lineHeight: number, maxWidth: number): number => {
        if (!tempCtx) return 0;
        tempCtx.font = font;
        if (!text || !text.trim()) return lineHeight;

        let totalHeight = 0;
        const paragraphs = text.split('\n');

        for (const paragraph of paragraphs) {
            if (!paragraph.trim()) {
                totalHeight += lineHeight;
                continue;
            }
            const words = paragraph.split(' ');
            let line = '';
            for (const word of words) {
                const testLine = line ? `${line} ${word}` : word;
                const metrics = tempCtx.measureText(testLine);
                if (metrics.width > maxWidth && line) {
                    totalHeight += lineHeight;
                    line = word;
                } else {
                    line = testLine;
                }
            }
            totalHeight += lineHeight;
        }
        return totalHeight;
    };
    
    let totalEstimatedHeight = PADDING;

    const sections = [
        { 
            title: "Saran untuk Postingan & Video", 
            blocks: [
                { title: "Narasi Subtitle", text: content.narasiSubtitle },
                { title: "Caption", text: content.caption },
                { title: "Hashtag", text: content.hashtags },
                { title: "Judul Thumbnail", text: content.judulThumbnail.map((item, index) => `${index + 1}. ${item}`).join("\n") },
                { title: "Saran Teks Overlay Video", text: content.saranTextOverlay.map((item, index) => `${index + 1}. ${item}`).join("\n") },
                { title: "Saran Musik", text: content.saranMusik },
            ]
        },
        {
            title: "Struktur Konten Video/Postingan",
            blocks: [
                { title: "Hook (Pembuka)", text: content.hook.map((item, index) => `${index + 1}. ${item}`).join("\n") },
                { title: "Hook Negatif (Alternatif Pembuka)", text: content.hookNegative },
                { title: "Problem (Masalah Audiens)", text: content.problem },
                { title: "Solusi (Produk Sebagai Jawaban)", text: content.solusi },
                { title: "Call To Action (Ajakan Bertindak)", text: content.callToAction },
            ]
        },
        {
            title: "Narasi VoiceOver",
            blocks: [
                { title: "Naskah Lengkap", text: content.narasiVoiceOver }
            ]
        }
    ];

    sections.forEach((section, sectionIndex) => {
        totalEstimatedHeight += calculateTextBlockHeight(section.title, SECTION_TITLE_FONT, SECTION_TITLE_LINE_HEIGHT, CONTENT_WIDTH);
        section.blocks.forEach(block => {
            totalEstimatedHeight += calculateTextBlockHeight(block.title, BLOCK_TITLE_FONT, BLOCK_TITLE_LINE_HEIGHT, CONTENT_WIDTH);
            totalEstimatedHeight += BLOCK_TEXT_SPACING;
            totalEstimatedHeight += calculateTextBlockHeight(block.text, TEXT_FONT, TEXT_LINE_HEIGHT, CONTENT_WIDTH);
            totalEstimatedHeight += INTER_BLOCK_SPACING;
        });
        totalEstimatedHeight -= INTER_BLOCK_SPACING; 
        if (sectionIndex < sections.length - 1) {
            totalEstimatedHeight += SECTION_SPACING;
        }
    });
    totalEstimatedHeight += PADDING; 
    canvas.height = totalEstimatedHeight;

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    let currentY = PADDING;

    sections.forEach((section, sectionIndex) => {
        currentY = drawWrappedTextHelper(ctx, section.title, PADDING, currentY, CONTENT_WIDTH, SECTION_TITLE_LINE_HEIGHT, SECTION_TITLE_FONT, SECTION_TITLE_COLOR_JPG);
        section.blocks.forEach(block => {
            currentY = drawWrappedTextHelper(ctx, block.title, PADDING, currentY, CONTENT_WIDTH, BLOCK_TITLE_LINE_HEIGHT, BLOCK_TITLE_FONT, BLOCK_TITLE_COLOR_JPG);
            currentY -= BLOCK_TITLE_LINE_HEIGHT; // Rewind Y to start text right after title
            currentY += BLOCK_TEXT_SPACING;
            currentY = drawWrappedTextHelper(ctx, block.text || "-", PADDING, currentY, CONTENT_WIDTH, TEXT_LINE_HEIGHT, TEXT_FONT, PRIMARY_TEXT_COLOR_JPG);
            currentY += INTER_BLOCK_SPACING - TEXT_LINE_HEIGHT; // Adjust for next block
        });
        currentY -= INTER_BLOCK_SPACING; 
        if (sectionIndex < sections.length - 1) {
             currentY += SECTION_SPACING;
        }
    });

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `Seluruh_Konten_Afiliasi_${sanitizeFilename(content.caption || 'Generated')}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error("Error generating combined JPG:", e);
      alert("Gagal membuat file JPG gabungan. Browser Anda mungkin tidak mendukung operasi ini atau konten terlalu besar.");
    }
  };
  
  const cardHeaderActions = (
    <Button
      onClick={handleDownloadAllAsJPG}
      variant="secondary"
      size="sm"
      title="Unduh semua konten sebagai satu gambar JPG"
      leftIcon={<ArrowDownTrayIcon className="h-4 w-4" />}
    >
      Unduh Semua (JPG)
    </Button>
  );

  return (
    <Card 
        title="3. Hasil Generate Konten Afiliasi" 
        icon={<CheckCircleIcon className="h-6 w-6 text-[var(--icon-success-color)]"/>}
        headerActions={cardHeaderActions} 
    >
      <div className="space-y-4">
        <Card title="Saran untuk Postingan & Video" icon={<LightBulbIcon className="h-5 w-5"/>} className="bg-[var(--bg-card-tertiary)]">
            <ContentBlock title="Narasi Subtitle" text={content.narasiSubtitle} preWrap />
            <ContentBlock title="Caption" text={content.caption} />
            <ContentBlock title="Hashtag" text={content.hashtags} />
            <ContentBlock title="Judul Thumbnail" text={content.judulThumbnail.map((item, index) => `${index + 1}. ${item}`).join("\n")} preWrap />
            <ContentBlock title="Saran Teks Overlay Video" text={content.saranTextOverlay.map((item, index) => `${index + 1}. ${item}`).join("\n")} preWrap />
            <ContentBlock title="Saran Musik" text={content.saranMusik} preWrap />
        </Card>

        <Card title="Struktur Konten Video/Postingan" icon={<DocumentTextIcon className="h-5 w-5"/>} className="bg-[var(--bg-card-tertiary)]">
            <ContentBlock title="Hook (Pembuka)" text={content.hook.map((item, index) => `${index + 1}. ${item}`).join("\n")} preWrap />
            <ContentBlock title="Hook Negatif (Alternatif Pembuka)" text={content.hookNegative} />
            <ContentBlock title="Problem (Masalah Audiens)" text={content.problem} preWrap />
            <ContentBlock title="Solusi (Produk Sebagai Jawaban)" text={content.solusi} preWrap />
            <ContentBlock title="Call To Action (Ajakan Bertindak)" text={content.callToAction} />
        </Card>
        
        <Card 
            title="Narasi VoiceOver" 
            icon={
              <div className="flex items-center space-x-1.5">
                <MicrophoneIcon className="h-5 w-5" />
                <MusicalNoteIcon className="h-5 w-5" />
              </div>
            } 
            className="bg-[var(--bg-card-tertiary)]">
           <ContentBlock title="Naskah Lengkap" text={content.narasiVoiceOver} preWrap />
        </Card>
      </div>
       <p className="mt-6 text-xs text-[var(--text-tertiary)] text-center">
        * Konten ini dihasilkan oleh AI. Sesuaikan dan review kembali sebelum dipublikasikan. Gambar JPG adalah representasi teks.
      </p>
    </Card>
  );
};

export default GeneratedContentDisplay;