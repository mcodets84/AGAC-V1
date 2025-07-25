import { ProductInfo, GeneratedContent } from './types';

export const GEMINI_TEXT_MODEL = "gemini-2.5-flash";
// No image generation model used in this version.
// export const GEMINI_IMAGE_MODEL = "imagen-3.0-generate-002"; 

export const APP_TITLE = "Auto Generate Affiliate Konten";
export const APP_SUBTITLE = "By Iqbalzcodets";

// INPUT_SOURCE_OPTIONS is removed as Tabs will be used.

export const LANGUAGE_STYLE_OPTIONS = [
  { value: "SANTAI", label: "Santai (Casual)" },
  { value: "PROFESIONAL", label: "Profesional" },
  { value: "PERSUASIF", label: "Persuasif & Menjual" },
  { value: "KREATIF", label: "Kreatif & Unik" },
  { value: "ROASTING", label: "Roasting" },
  { value: "SARKAS", label: "Sarkas" },
];

export const HOOK_TYPE_OPTIONS = [
  { value: "TIDAK_ADA", label: "Tidak Ada (Default AI)" },
  { value: "KONTROVERSIAL", label: "Kontroversial" },
  { value: "PERTANYAAN_RETORIS", label: "Pertanyaan Retoris" },
  { value: "KUTIPAN_RELATABLE", label: "Kutipan Relatable" },
  { value: "FAKTA_MENGEJUTKAN", label: "Fakta Mengejutkan" },
  { value: "MASALAH_DAN_SOLUSI", label: "Masalah dan Solusi (AIDA)" },
  { value: "BEFORE_AFTER", label: "Before After" },
  { value: "X_DIBANDING_Y", label: "X dibanding Y" },
  { value: "TESTIMONI_REVIEW", label: "Testimoni/Review" },
  { value: "FIRST_IMPRESSION_UNBOXING", label: "First Impression / Unboxing" },
];

export const VOICEOVER_LANGUAGE_STYLE_OPTIONS = [
  { value: "NATIVE_STORYTELLING_HUMOR", label: "Native Ads + Storytelling Humor" },
  ...LANGUAGE_STYLE_OPTIONS,
];


export const VIDEO_DURATION_OPTIONS = [
  { value: "SEC_15", label: "15 Detik" },
  { value: "SEC_30", label: "30 Detik" },
  { value: "SEC_45", label: "45 Detik" },
  { value: "SEC_60", label: "60 Detik (1 Menit)" },
];

export const INITIAL_PRODUCT_INFO_STATE: ProductInfo = {
  name: "",
  fungsi: "",
  nomorBPOM: "",
  sources: [],
};

export const INITIAL_GENERATED_CONTENT_STATE: GeneratedContent = {
  caption: "",
  narasiSubtitle: "",
  hashtags: "",
  judulThumbnail: [],
  saranTextOverlay: [],
  hook: [],
  hookNegative: "",
  problem: "",
  solusi: "",
  callToAction: "",
  narasiVoiceOver: "",
  saranMusik: "",
};