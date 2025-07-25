import React, { useState, useCallback, useRef, useEffect } from 'react';
import { InputSourceType } from '../types';
import Button from './Button';
import { TextInput } from './TextInput';
import Card from './Card';
import { MagnifyingGlassIcon, DocumentTextIcon, PhotoIcon, LinkIcon, CameraIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

interface InputSectionProps {
  onFetchProductInfo: (sourceType: InputSourceType, data: string | File) => void;
  isLoading: boolean;
  initialSourceType?: InputSourceType;
  initialQuery?: string;
}

const TABS = [
  { type: InputSourceType.PRODUCT_NAME, label: "Nama Produk", icon: <DocumentTextIcon className="h-5 w-5" /> },
  { type: InputSourceType.IMAGE_UPLOAD, label: "Upload", icon: <PhotoIcon className="h-5 w-5" /> },
  { type: InputSourceType.URL, label: "URL Web", icon: <LinkIcon className="h-5 w-5" /> },
  { type: InputSourceType.CAMERA, label: "Kamera", icon: <CameraIcon className="h-5 w-5" /> },
];

const InputSection: React.FC<InputSectionProps> = ({ 
  onFetchProductInfo, 
  isLoading,
  initialSourceType = InputSourceType.PRODUCT_NAME,
  initialQuery = ""
}) => {
  const [activeTab, setActiveTab] = useState<InputSourceType>(initialSourceType);
  const [productNameQuery, setProductNameQuery] = useState<string>(activeTab === InputSourceType.PRODUCT_NAME ? initialQuery : "");
  const [urlQuery, setUrlQuery] = useState<string>(activeTab === InputSourceType.URL ? initialQuery : "");
  
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState<number>(Date.now()); 

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // --- FETCHING LOGIC ---
  const handleSearch = () => {
    if (isLoading) return;

    switch (activeTab) {
        case InputSourceType.PRODUCT_NAME:
            const productName = productNameQuery.trim();
            if (productName) {
                onFetchProductInfo(activeTab, productName);
            }
            break;
        case InputSourceType.URL:
            const url = urlQuery.trim();
            if (url) {
                onFetchProductInfo(activeTab, url);
            }
            break;
        case InputSourceType.IMAGE_UPLOAD:
        case InputSourceType.CAMERA:
            if (imageFile) {
                onFetchProductInfo(activeTab, imageFile);
            }
            break;
    }
  };
  
  const stopCameraStream = useCallback(() => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setIsCameraActive(false);
    }
    if (videoRef.current) {
        videoRef.current.srcObject = null;
    }
  }, [cameraStream]);

  useEffect(() => {
    // Cleanup camera stream when component unmounts or tab changes from camera
    return () => {
      stopCameraStream();
    };
  }, [stopCameraStream]);
  
  const handleTabChange = (tabType: InputSourceType) => {
    setActiveTab(tabType);
    if (tabType !== InputSourceType.PRODUCT_NAME) setProductNameQuery("");
    if (tabType !== InputSourceType.URL) setUrlQuery("");
    
    setImageFile(null);
    setImagePreviewUrl(null);
    setCameraError(null);

    if (tabType !== InputSourceType.IMAGE_UPLOAD) {
      setFileInputKey(Date.now());
    }
    if (tabType !== InputSourceType.CAMERA) {
      stopCameraStream();
    }
  };
  
  const handleImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreviewUrl(null);
    }
  };

  const startCamera = async () => {
    stopCameraStream();
    setCameraError(null);
    setImageFile(null);
    setImagePreviewUrl(null);

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        setCameraStream(stream);
        setIsCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (err instanceof Error) {
            if (err.name === "NotAllowedError") {
                setCameraError("Akses kamera ditolak. Izinkan akses kamera di pengaturan browser Anda.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setCameraError("Kamera tidak ditemukan. Pastikan kamera terhubung dan tidak digunakan aplikasi lain.");
            } else {
                setCameraError("Tidak dapat memulai kamera. Silakan coba lagi.");
            }
        } else {
             setCameraError("Terjadi kesalahan tidak dikenal saat mengakses kamera.");
        }
        setIsCameraActive(false);
      }
    } else {
      setCameraError("Browser Anda tidak mendukung akses kamera.");
      setIsCameraActive(false);
    }
  };

  const captureImageFromCamera = () => {
    if (videoRef.current && canvasRef.current && cameraStream) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            const captured = new File([blob], `capture-${Date.now()}.png`, { type: 'image/png' });
            setImageFile(captured);
            setImagePreviewUrl(URL.createObjectURL(captured));
            stopCameraStream();
          }
        }, 'image/png');
      }
    } else {
        setCameraError("Gagal mengambil gambar. Stream kamera tidak aktif.");
    }
  };
  
  const resetCameraCapture = () => {
    stopCameraStream();
    setImageFile(null);
    setImagePreviewUrl(null);
    setCameraError(null);
  };

  const renderActiveInput = () => {
    switch (activeTab) {
      case InputSourceType.PRODUCT_NAME:
      case InputSourceType.URL: {
        const isUrlTab = activeTab === InputSourceType.URL;
        const query = isUrlTab ? urlQuery : productNameQuery;
        const setQuery = isUrlTab ? setUrlQuery : setProductNameQuery;
        
        const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                handleSearch();
            }
        };

        return (
            <div className="space-y-4">
                <TextInput
                    label={isUrlTab ? "Masukkan URL Web Produk" : "Ketik Nama Produk yang Diinginkan"}
                    type={isUrlTab ? 'url' : 'text'}
                    id={isUrlTab ? 'urlQuery' : 'productNameQuery'}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={isUrlTab ? "cth: 'https://shopee.co.id/iphone-15-pro' atau query pencarian" : "cth: 'iPhone 15 Pro', 'Baju Tidur Satin Mewah'"}
                    required
                    aria-label={isUrlTab ? "URL Web Produk atau Query Pencarian" : "Nama Produk"}
                    onKeyDown={handleKeyDown}
                />
                 <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    disabled={isLoading || query.trim().length === 0}
                    className="w-full"
                    leftIcon={!isLoading && <MagnifyingGlassIcon className="h-5 w-5" />}
                >
                    {isLoading ? "Mencari..." : "Cari Informasi Produk"}
                </Button>
            </div>
        );
      }
      case InputSourceType.IMAGE_UPLOAD:
        return (
          <div className="space-y-4">
            <div>
              <label htmlFor="imageUpload" className="block text-sm font-medium text-[var(--text-secondary)] mb-1">Upload Gambar Produk</label>
              <input
                key={fileInputKey} 
                type="file"
                id="imageUpload"
                accept="image/*"
                onChange={handleImageUploadChange}
                className={`block w-full text-sm text-[var(--text-tertiary)]
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-md file:border-0
                          file:text-sm file:font-semibold
                          file:bg-[var(--button-primary-bg)] file:text-[var(--button-primary-text)]
                          hover:file:bg-[var(--button-primary-hover-bg)] 
                          focus:outline-none focus:ring-2 focus:ring-[var(--border-focus-color)] focus:border-[var(--border-focus-color)]`}
                aria-label="Upload Gambar Produk"
              />
              {imagePreviewUrl && (
                <div className="mt-4">
                  <img src={imagePreviewUrl} alt="Pratinjau Gambar Unggahan" className="max-w-xs max-h-48 rounded-md shadow-md border border-[var(--border-color)]" />
                </div>
              )}
              {!imageFile && <p className="mt-2 text-xs text-[var(--text-tertiary)]">Pilih file gambar (JPG, PNG, GIF, WebP).</p>}
            </div>
             <Button
                onClick={handleSearch}
                isLoading={isLoading}
                disabled={isLoading || !imageFile}
                className="w-full"
                leftIcon={!isLoading && <MagnifyingGlassIcon className="h-5 w-5" />}
              >
                {isLoading ? "Mencari..." : "Cari Informasi Produk"}
            </Button>
          </div>
        );
      case InputSourceType.CAMERA:
        return (
          <div className="space-y-4">
            {cameraError && <p className="text-sm text-[var(--danger-text)] bg-[var(--danger-bg)]/[0.2] border border-[var(--danger-border)] p-3 rounded-md">{cameraError}</p>}
            
            {!isCameraActive && !imagePreviewUrl && (
              <Button onClick={startCamera} type="button" variant="secondary" leftIcon={<CameraIcon className="h-5 w-5"/>}>
                Buka Kamera
              </Button>
            )}

            {isCameraActive && !imagePreviewUrl && (
              <div className="relative">
                <video 
                    ref={videoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full max-w-md h-auto rounded-md border border-[var(--border-color)] bg-black"
                    aria-label="Live camera feed"
                />
                <Button 
                    onClick={captureImageFromCamera} 
                    type="button" 
                    variant="primary" 
                    className="absolute bottom-4 left-1/2 -translate-x-1/2"
                    leftIcon={<CameraIcon className="h-5 w-5" />}
                >
                    Ambil Foto
                </Button>
              </div>
            )}
            
            <canvas ref={canvasRef} style={{ display: 'none' }} aria-hidden="true"></canvas>

            {imagePreviewUrl && (
              <div className="mt-4 space-y-4">
                <div>
                  <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">Pratinjau Foto:</p>
                  <img src={imagePreviewUrl} alt="Foto yang Diambil" className="max-w-xs max-h-48 rounded-md shadow-md border border-[var(--border-color)]" />
                </div>
                <div className="flex space-x-3">
                    <Button onClick={resetCameraCapture} type="button" variant="secondary" size="sm" leftIcon={<ArrowPathIcon className="h-4 w-4"/>}>
                        Foto Ulang
                    </Button>
                     <Button onClick={() => { setImageFile(null); setImagePreviewUrl(null); if (cameraStream) stopCameraStream(); }} type="button" variant="danger" size="sm" >
                        Hapus Foto
                    </Button>
                </div>
                 <Button
                    onClick={handleSearch}
                    isLoading={isLoading}
                    disabled={isLoading || !imageFile}
                    className="w-full"
                    leftIcon={!isLoading && <MagnifyingGlassIcon className="h-5 w-5" />}
                >
                    {isLoading ? "Mencari..." : "Cari Informasi Produk"}
                </Button>
              </div>
            )}
             {!imageFile && !isCameraActive && !cameraError && (
                <p className="text-xs text-[var(--text-tertiary)]">
                    Klik "Buka Kamera" untuk mengaktifkan kamera Anda dan mengambil foto produk. Pastikan Anda telah memberikan izin akses kamera.
                </p>
            )}
          </div>
        );
      default:
        return null;
    }
  };
  
  const helperText = () => {
    switch (activeTab) {
      case InputSourceType.PRODUCT_NAME:
      case InputSourceType.URL:
        return 'Ketik input Anda lalu klik tombol "Cari Informasi Produk" atau tekan Enter.';
      case InputSourceType.IMAGE_UPLOAD:
        return 'Pilih file gambar, lalu klik "Cari Informasi Produk".';
      case InputSourceType.CAMERA:
        return 'Ambil foto produk, lalu klik "Cari Informasi Produk".';
      default:
        return 'Sediakan informasi produk lalu klik tombol pencarian.';
    }
  };

  return (
    <Card 
        title="1. Sumber Informasi & Detail Produk" 
        icon={<MagnifyingGlassIcon className="h-6 w-6" />} 
        className="mb-8"
    >
      <div className="mb-6 flex flex-wrap justify-center border-b border-[var(--border-color)] -mx-1">
        {TABS.map(tab => (
          <button
            key={tab.type}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.type}
            aria-controls={`tabpanel-${tab.type}`}
            id={`tab-${tab.type}`}
            className={`flex items-center justify-center py-3 px-4 -mb-px font-medium text-sm focus:outline-none focus:ring-2 focus:ring-[var(--border-focus-color)] focus:ring-offset-2 focus:ring-offset-[var(--bg-card)] rounded-t-md transition-all duration-150 ease-in-out
              ${activeTab === tab.type
                ? 'border-[var(--link-color)] border-b-2 text-[var(--link-color)]'
                : 'border-transparent text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:border-[var(--border-color)]'
            }`}
            onClick={() => handleTabChange(tab.type)}
            title={tab.label}
          >
            <div className="sm:mr-2">{tab.icon}</div>
            <span className="hidden sm:inline-block">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="space-y-4">
        <div 
            id={`tabpanel-${activeTab}`}
            role="tabpanel"
            aria-labelledby={`tab-${activeTab}`}
        >
            {renderActiveInput()}
        </div>
        
        <p className="pt-2 text-xs text-center text-[var(--text-tertiary)]">
          {helperText()}
        </p>
      </div>
    </Card>
  );
};

export default InputSection;