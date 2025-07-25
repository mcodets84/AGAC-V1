import { GoogleGenAI, GenerateContentResponse, Part } from "@google/genai";
import { ProductInfo, GeneratedContent, InputSourceType, LanguageStyle, VideoDuration, GroundingChunk, GroundingChunkWeb, HookType } from '../types';
import { GEMINI_TEXT_MODEL } from '../constants';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

const parseJsonFromText = <T,>(text: string): T | null => {
  let jsonStr = text.trim();
  
  // Strategy 1: Find a JSON markdown block.
  const fenceRegex = /```(json)?\s*\n?(\{[\s\S]*\})\s*\n?```/s;
  const match = jsonStr.match(fenceRegex);

  if (match && match[2]) {
    jsonStr = match[2].trim();
  } else {
    // Strategy 2: If no fence, find the first '{' and last '}' as a fallback.
    const firstBrace = jsonStr.indexOf('{');
    const lastBrace = jsonStr.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace > firstBrace) {
      jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
    }
  }

  try {
    // Try to parse the cleaned-up string.
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Failed to parse JSON response:", e, "Raw text:", text);
    return null;
  }
};


const fileToGenerativePart = async (file: File): Promise<Part> => {
  const base64EncodedDataPromise = new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (reader.result) {
        resolve((reader.result as string).split(',')[1]);
      } else {
        reject(new Error("Failed to read file."));
      }
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
  
  try {
    const data = await base64EncodedDataPromise;
    return {
      inlineData: {
        data,
        mimeType: file.type,
      },
    };
  } catch (error) {
    console.error("Error converting file to base64:", error);
    throw error; // Re-throw to be caught by the caller
  }
};


export const fetchProductDetails = async (
  sourceType: InputSourceType,
  data: string | File
): Promise<ProductInfo | null> => {
  let promptContent: string | Part[];
  const systemInstruction = "Anda adalah asisten AI yang sangat efisien yang bertugas mengekstrak informasi produk. Output Anda HARUS berupa objek JSON tunggal yang valid. Jangan pernah menambahkan teks, penjelasan, atau markdown (seperti ```json) di luar objek JSON itu sendiri.";

  const commonJsonFormatInstruction = `Tugas Anda adalah menganalisis input dan mengembalikan HANYA sebuah objek JSON. Objek JSON harus memiliki struktur berikut:
{
  "name": "string // Nama produk yang jelas dan deskriptif. Jika input adalah gambar, buat nama yang sesuai.",
  "fungsi": "string // Fungsi utama atau deskripsi singkat produk.",
  "nomorBPOM": "string // Nomor registrasi BPOM. Isi 'Tidak Ditemukan' jika pencarian Google Search gagal menemukannya, atau 'Tidak Relevan' jika produk tidak memerlukan BPOM."
}`;

  if ((sourceType === InputSourceType.IMAGE_UPLOAD || sourceType === InputSourceType.CAMERA) && data instanceof File) {
    try {
      const imagePart = await fileToGenerativePart(data);
      const textPart = { 
        text: `Analisis gambar produk ini. Gunakan Google Search untuk menemukan detailnya (terutama nomor BPOM dari situs \`cekbpom.pom.go.id\`).\n${commonJsonFormatInstruction}`
      };
      promptContent = [imagePart, textPart];
    } catch (error) {
       console.error("Error processing image for Gemini:", error);
       throw error;
    }
  } else if (typeof data === 'string') {
    let specificPrompt = "";
    if (sourceType === InputSourceType.PRODUCT_NAME) {
      specificPrompt = `Cari detail produk untuk: "${data}". Gunakan Google Search untuk menemukan informasi akurat (terutama nomor BPOM dari \`cekbpom.pom.go.id\`).\n${commonJsonFormatInstruction}`;
    } else if (sourceType === InputSourceType.URL) {
      specificPrompt = `Analisis URL produk ini: "${data}". Gunakan Google Search untuk menemukan detailnya (terutama nomor BPOM dari \`cekbpom.pom.go.id\`).\n${commonJsonFormatInstruction}`;
    }
    promptContent = specificPrompt;
  } else {
    console.error("Invalid data type for fetchProductDetails:", data);
    return null;
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: typeof promptContent === 'string' ? { parts: [{text: promptContent}]} : { parts: promptContent as Part[] },
      config: {
        systemInstruction: systemInstruction,
        tools: [{googleSearch: {}}], // Use Google Search grounding
        temperature: 0.2, // Lower temperature for more factual responses
      },
    });
    
    const productInfo = parseJsonFromText<ProductInfo>(response.text);
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
    const webSources = groundingMetadata?.groundingChunks
        ?.map(chunk => chunk.web)
        .filter((web): web is GroundingChunkWeb => web !== undefined) || [];

    if (productInfo && productInfo.name && productInfo.fungsi) {
      return {
        name: productInfo.name,
        fungsi: productInfo.fungsi,
        nomorBPOM: productInfo.nomorBPOM || "Tidak Ditemukan",
        sources: webSources,
      };
    }
    console.error("Received invalid product info structure:", response.text);
    return null;
  } catch (error) {
    console.error(`Error fetching product details from Gemini for sourceType ${sourceType}:`, error);
    throw error;
  }
};

export const generateAffiliateContentInternal = async (
  productInfo: ProductInfo,
  languageStyle: LanguageStyle,
  voiceOverLanguageStyle: LanguageStyle,
  videoDuration: VideoDuration,
  hookType: HookType
): Promise<GeneratedContent | null> => {

  const hookInstruction = hookType !== HookType.TIDAK_ADA 
    ? `\n- **Jenis Hook Spesifik:** Anda HARUS membuat hook ('hook' dan 'hookNegative') secara spesifik menggunakan tipe '${hookType}'. Abaikan tipe hook lain dan fokus pada ini.`
    : `\n- **Jenis Hook Spesifik:** Tidak ada. Anda bebas berkreasi untuk membuat hook yang paling menarik.`;

  const prompt = `
    Anda adalah seorang social media strategist jenius dan ahli marketing afiliasi yang sangat update dengan tren viral terkini di platform media sosial berbasis video pendek (seperti TikTok, Reels, Shopee Video).
    Tugas Anda adalah membuat satu set lengkap materi konten yang sangat engaging dan dioptimalkan untuk konversi (penjualan) untuk produk berikut, **dengan KETAT mengikuti semua kriteria yang diberikan.**

    **Informasi Produk:**
    - Nama Produk: ${productInfo.name}
    - Fungsi Produk: ${productInfo.fungsi}
    - Nomor Izin BPOM: ${productInfo.nomorBPOM}

    **Kriteria Konten WAJIB DIPATUHI:**
    - Target Durasi Video: ${videoDuration}
    - **Gaya Bahasa Umum:** ${languageStyle} (Ini harus diterapkan pada: caption, judulThumbnail, saranTextOverlay, hook, hookNegative, problem, solusi, callToAction).
    - **Gaya Bahasa VoiceOver:** ${voiceOverLanguageStyle} (Ini HANYA untuk naskah 'narasiVoiceOver').${hookInstruction}

    Buatlah konten afiliasi dalam format JSON object. Pastikan semua string tidak kosong, relevan, dan **sepenuhnya mematuhi gaya bahasa yang ditentukan untuk setiap bagian.**

    **Struktur JSON yang WAJIB Diikuti:**
    {
      "caption": "Buat caption singkat dan padat yang memancing interaksi. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'.",
      "narasiSubtitle": "Versi teks bersih dari 'narasiVoiceOver', kata per kata, tanpa penanda adegan. Gayanya otomatis mengikuti 'narasiVoiceOver'.",
      "hashtags": "Sediakan TEPAT 5 hashtag yang paling relevan untuk platform video pendek, campurkan antara hashtag umum, niche produk, dan yang mungkin sedang tren.",
      "judulThumbnail": [
        "Berikan 3-4 alternatif judul thumbnail yang sangat clickbait. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'.",
        "Contoh: JANGAN BELI INI SEBELUM NONTON! ⚠️"
      ],
      "saranTextOverlay": [
        "Berikan 3-4 alternatif teks singkat dan kuat untuk overlay di dalam video. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'.",
        "Contoh: 'Cek Keranjang Kuning Sekarang!'"
      ],
      "hook": [
        "Berikan 3-4 alternatif hook video yang berbeda untuk 3 detik pertama. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'. Jika 'Jenis Hook Spesifik' diberikan, hook WAJIB mengikuti jenis tersebut.",
        "Contoh: 'POV: Kamu nemu rahasia kulit mulus.'"
      ],
      "hookNegative": "Satu hook negatif yang kuat. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'. Jika 'Jenis Hook Spesifik' diberikan, hook ini juga harus mengikuti jenis tersebut jika memungkinkan.",
      "problem": "Jelaskan masalah audiens dengan gaya 'Ini gue banget!'. Buat masalahnya terasa personal dan mendesak. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'. Contoh: 'Udah capek banget kan liat muka kusam tiap ngaca?'",
      "solusi": "Tawarkan produk ini sebagai JALAN KELUAR yang cerdas dan unik, bukan 'produk bagus'. Fokus pada bagaimana produk ini menyelesaikan masalah. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'. Contoh: 'Nah, ini dia jalan pintasnya. Daripada buang duit...'",
      "callToAction": "Buat CTA yang sangat jelas, mendesak, dan berorientasi pada keuntungan. WAJIB menggunakan Gaya Bahasa Umum: '${languageStyle}'. Contoh: 'Jangan sampai nyesel kehabisan! Klik keranjang kuning SEKARANG JUGA!'",
      "narasiVoiceOver": "Naskah voice-over LENGKAP sesuai durasi video '${videoDuration}'. BAGI naskah menjadi adegan dengan penanda seperti \`[Scene: ...]\`. Naskah harus terasa natural. WAJIB menggunakan Gaya Bahasa VoiceOver: '${voiceOverLanguageStyle}' dan akhiri dengan CTA.",
      "saranMusik": "Rekomendasikan 1-2 judul lagu atau sound yang sedang TREN KERAS di platform video pendek (seperti TikTok) yang sangat cocok dengan mood video dan Gaya Bahasa VoiceOver. Berikan alasan singkat. Contoh: 'Gunakan sound 'Espresso - Sabrina Carpenter' untuk vibe yang ceria dan aesthetic'."
    }

    Pastikan output HANYA JSON object saja, tanpa teks tambahan sebelum atau sesudah JSON, dan tanpa markdown (seperti \`\`\`json).
    `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_TEXT_MODEL,
      contents: { parts: [{ text: prompt }] },
      config: {
        temperature: 0.8,
        topP: 0.95,
        responseMimeType: "application/json",
      },
    });

    const generatedContent = parseJsonFromText<GeneratedContent>(response.text);

    if (
      generatedContent &&
      generatedContent.caption &&
      generatedContent.narasiSubtitle &&
      generatedContent.hashtags &&
      generatedContent.hook && generatedContent.hook.length > 0 &&
      generatedContent.judulThumbnail && generatedContent.judulThumbnail.length > 0
    ) {
      return generatedContent;
    }
    
    console.error("Received invalid generated content structure:", response.text);
    return generatedContent || null;

  } catch (error) {
    console.error(`Error generating affiliate content from Gemini:`, error);
    throw error;
  }
};