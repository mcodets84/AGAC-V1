export enum InputSourceType {
  PRODUCT_NAME = "Nama Produk Diketik", // User will see "Ketik Nama Produk"
  IMAGE_UPLOAD = "Gambar Diunggah",    // User will see "Upload Gambar"
  URL = "URL Web",
  CAMERA = "Kamera" // User will see "Ambil Foto via Kamera"
}

export enum LanguageStyle {
  SANTAI = "Santai (Casual)",
  PROFESIONAL = "Profesional",
  PERSUASIF = "Persuasif",
  KREATIF = "Kreatif & Unik",
  ROASTING = "Roasting",
  SARKAS = "Sarkas",
  NATIVE_STORYTELLING_HUMOR = "Native Ads + Storytelling Humor"
}

export enum VideoDuration {
  SEC_15 = "15 Detik",
  SEC_30 = "30 Detik",
  SEC_45 = "45 Detik",
  SEC_60 = "60 Detik"
}

export enum HookType {
  TIDAK_ADA = "Tidak Ada",
  KONTROVERSIAL = "Kontroversial",
  PERTANYAAN_RETORIS = "Pertanyaan Retoris",
  KUTIPAN_RELATABLE = "Kutipan Relatable",
  FAKTA_MENGEJUTKAN = "Fakta Mengejutkan",
  MASALAH_DAN_SOLUSI = "Masalah dan Solusi",
  BEFORE_AFTER = "Before After",
  X_DIBANDING_Y = "X dibanding Y",
  TESTIMONI_REVIEW = "Testimoni/Review",
  FIRST_IMPRESSION_UNBOXING = "First Impression / Unboxing",
}

export interface ProductInfo {
  name: string;
  fungsi: string;
  nomorBPOM: string; // Can be "Tidak Ada" or "N/A"
  sources?: GroundingChunkWeb[];
}

export interface GeneratedContent {
  caption: string;
  narasiSubtitle: string;
  hashtags: string;
  judulThumbnail: string[];
  saranTextOverlay: string[];
  hook: string[];
  hookNegative: string;
  problem: string;
  solusi: string;
  callToAction: string;
  narasiVoiceOver: string;
  saranMusik: string;
}

export interface GroundingChunkWeb {
  uri: string;
  title: string;
}

export interface GroundingChunk {
  web?: GroundingChunkWeb;
  // Add other types of chunks if needed, e.g., retrievedPassage
}