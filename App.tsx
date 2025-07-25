import React, { useState, useCallback, useEffect } from 'react';
import { ArrowPathIcon } from '@heroicons/react/24/outline';
import { InputSourceType, LanguageStyle, VideoDuration, ProductInfo, GeneratedContent, HookType } from './types';
import { INITIAL_PRODUCT_INFO_STATE, INITIAL_GENERATED_CONTENT_STATE } from './constants';
import { fetchProductDetails, generateAffiliateContentInternal } from './services/geminiService';
import Header from './components/Header';
import Footer from './components/Footer';
import InputSection from './components/InputSection';
import ProductInfoDisplay from './components/ProductInfoDisplay';
import FeatureSelection from './components/FeatureSelection';
import GeneratedContentDisplay from './components/GeneratedContentDisplay';
import LoadingSpinner from './components/LoadingSpinner';

export type Theme = 'dark' | 'light';

const App: React.FC = () => {
  const [initialInputData, setInitialInputData] = useState<{sourceType: InputSourceType, query: string}>({
    sourceType: InputSourceType.PRODUCT_NAME,
    query: ""
  });

  const [productInfo, setProductInfo] = useState<ProductInfo | null>(null); // Initialize as null
  const [languageStyle, setLanguageStyle] = useState<LanguageStyle>(LanguageStyle.SANTAI);
  const [hookType, setHookType] = useState<HookType>(HookType.TIDAK_ADA);
  const [voiceOverLanguageStyle, setVoiceOverLanguageStyle] = useState<LanguageStyle>(LanguageStyle.NATIVE_STORYTELLING_HUMOR);
  const [videoDuration, setVideoDuration] = useState<VideoDuration>(VideoDuration.SEC_30);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null); // Initialize as null

  const [isLoadingProductInfo, setIsLoadingProductInfo] = useState<boolean>(false);
  const [isLoadingContent, setIsLoadingContent] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem('appTheme') as Theme | null;
    if (storedTheme) return storedTheme;
    return 'dark'; 
  });

  useEffect(() => {
    localStorage.setItem('appTheme', theme);
    if (theme === 'light') {
      document.body.classList.add('theme-light');
    } else {
      document.body.classList.remove('theme-light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleFetchProductInfo = useCallback(async (sourceType: InputSourceType, data: string | File) => {
    setIsLoadingProductInfo(true);
    setError(null);
    setProductInfo(null); 
    setGeneratedContent(null); 

    if (typeof data === 'string') {
      setInitialInputData({ sourceType, query: data });
    } else { 
      setInitialInputData({ sourceType, query: data.name }); 
    }

    try {
      const details = await fetchProductDetails(sourceType, data);
      if (details) {
        setProductInfo(details);
      } else {
        setError("Tidak dapat mengambil informasi produk. AI tidak dapat memproses permintaan Anda atau formatnya tidak sesuai.");
        setProductInfo(INITIAL_PRODUCT_INFO_STATE); // Set to initial non-null but empty state on error
      }
    } catch (err) {
      console.error(err);
      let errorMessage = "Terjadi kesalahan saat mengambil informasi produk.";
      if (err instanceof Error && err.message.includes("Failed to read file")) {
        errorMessage = "Gagal memproses file gambar. Pastikan file valid.";
      } else if (err instanceof Error && err.message.includes("converting file to base64")){
         errorMessage = "Gagal mengkonversi file gambar. Silakan coba lagi.";
      }
      setError(errorMessage + " Periksa konsol untuk detail.");
      setProductInfo(INITIAL_PRODUCT_INFO_STATE); // Set to initial non-null but empty state on error
    } finally {
      setIsLoadingProductInfo(false);
    }
  }, []);

  const handleGenerateContent = useCallback(async () => {
    if (!productInfo || !productInfo.name) {
      setError("Informasi produk tidak tersedia. Harap lengkapi langkah 'Dapatkan Info Produk' terlebih dahulu.");
      return;
    }
    setIsLoadingContent(true);
    setError(null);
    setGeneratedContent(null);

    try {
      const content = await generateAffiliateContentInternal(productInfo, languageStyle, voiceOverLanguageStyle, videoDuration, hookType);
      if (content) {
        setGeneratedContent(content);
      } else {
         setError("Tidak dapat menghasilkan konten. AI tidak dapat memproses permintaan Anda atau formatnya tidak sesuai.");
         setGeneratedContent(INITIAL_GENERATED_CONTENT_STATE); // Set to initial non-null but empty state on error
      }
    } catch (err) {
      console.error(err);
      setError("Terjadi kesalahan saat menghasilkan konten. Periksa konsol untuk detail.");
      setGeneratedContent(INITIAL_GENERATED_CONTENT_STATE); // Set to initial non-null but empty state on error
    } finally {
      setIsLoadingContent(false);
    }
  }, [productInfo, languageStyle, voiceOverLanguageStyle, videoDuration, hookType]);

  const handleReset = () => {
    setInitialInputData({ sourceType: InputSourceType.PRODUCT_NAME, query: "" });
    setProductInfo(null);
    setLanguageStyle(LanguageStyle.SANTAI);
    setHookType(HookType.TIDAK_ADA);
    setVoiceOverLanguageStyle(LanguageStyle.NATIVE_STORYTELLING_HUMOR);
    setVideoDuration(VideoDuration.SEC_30);
    setGeneratedContent(null);
    setIsLoadingProductInfo(false);
    setIsLoadingContent(false);
    setError(null);
  };


  return (
    <div className="min-h-screen flex flex-col">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="container mx-auto px-4 py-4 sm:py-8 flex-grow">
        {error && (
          <div 
            className="mb-6 p-4 bg-[var(--danger-bg)] border border-[var(--danger-border)] text-[var(--danger-text)] rounded-md shadow-lg" 
            role="alert"
          >
            <div className="flex">
              <div className="py-1"><svg className="fill-current h-6 w-6 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.829a1 1 0 0 0-1.414-1.414L10 8.586 7.172 5.757a1 1 0 0 0-1.414 1.414L8.586 10l-2.829 2.829a1 1 0 1 0 1.414 1.414L10 11.414l2.829 2.829a1 1 0 0 0 1.414-1.414L11.414 10z"/></svg></div>
              <div>
                <p className="font-bold">Oops! Terjadi Kesalahan:</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <InputSection 
          onFetchProductInfo={handleFetchProductInfo} 
          isLoading={isLoadingProductInfo}
          initialSourceType={initialInputData.sourceType}
          initialQuery={initialInputData.query}
        />
        
        {isLoadingProductInfo && <LoadingSpinner text="Mencari info produk..." />}

        {productInfo && productInfo.name && !isLoadingProductInfo && (
          <ProductInfoDisplay productInfo={productInfo} />
        )}
        
        {/* FeatureSelection is always rendered, but its button is conditionally enabled */}
        <FeatureSelection
          languageStyle={languageStyle}
          onLanguageStyleChange={setLanguageStyle}
          hookType={hookType}
          onHookTypeChange={setHookType}
          voiceOverLanguageStyle={voiceOverLanguageStyle}
          onVoiceOverLanguageStyleChange={setVoiceOverLanguageStyle}
          videoDuration={videoDuration}
          onVideoDurationChange={setVideoDuration}
          onGenerateContent={handleGenerateContent}
          isLoading={isLoadingContent}
          isProductInfoAvailable={!!(productInfo && productInfo.name)}
        />

        {isLoadingContent && <LoadingSpinner text="Menghasilkan konten afiliasi..." />}
        
        {generatedContent && generatedContent.caption && !isLoadingContent && productInfo && productInfo.name && (
          <GeneratedContentDisplay content={generatedContent} />
        )}
        
        {(productInfo?.name || generatedContent?.caption || error) && (
            <div className="mt-8 text-center">
                <button 
                    onClick={handleReset}
                    className="text-[var(--link-color)] hover:text-[var(--link-hover-color)] transition-colors duration-150 text-sm font-medium px-4 py-2 rounded-md hover:bg-[var(--bg-card-secondary)] inline-flex items-center"
                >
                    <ArrowPathIcon className="h-4 w-4 mr-2" />
                    Mulai Lagi / Reset Form
                </button>
            </div>
        )}

      </main>
      <Footer />
    </div>
  );
};

export default App;