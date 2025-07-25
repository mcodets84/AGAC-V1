import React from 'react';
import { ProductInfo } from '../types';
import Card from './Card';
import { InformationCircleIcon } from '@heroicons/react/24/outline';

interface ProductInfoDisplayProps {
  productInfo: ProductInfo;
}

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col sm:flex-row py-3 px-1">
        <div className="sm:w-1/3 font-semibold text-[var(--text-primary)] mb-1 sm:mb-0">
            {label}
        </div>
        <div className="sm:w-2/3 text-[var(--text-secondary)]">
            {value}
        </div>
    </div>
);


const ProductInfoDisplay: React.FC<ProductInfoDisplayProps> = ({ productInfo }) => {
  if (!productInfo || !productInfo.name) { 
    return null; 
  }

  const hasSources = productInfo.sources && productInfo.sources.length > 0;

  return (
    <Card 
        title="Informasi Produk Ditemukan" 
        icon={<InformationCircleIcon className="h-6 w-6" />}
        className="mb-8"
    >
      <div className="divide-y divide-[var(--border-color)] border-y border-[var(--border-color)] bg-[var(--bg-card-secondary)] rounded-lg -mx-1 sm:-mx-2">
            <InfoRow label="Nama Produk" value={productInfo.name} />
            <InfoRow label="Fungsi Produk" value={productInfo.fungsi} />
            <InfoRow label="Nomor Izin BPOM" value={productInfo.nomorBPOM || 'Tidak Ada'} />
      </div>

      {hasSources && (
        <div className="mt-4 pt-4 border-t border-[var(--border-color)]">
            <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-2">Sumber Informasi (dari Google Search):</h4>
            <ul className="list-disc list-inside space-y-1">
                {productInfo.sources!.map((source, index) => (
                    <li key={index} className="text-xs text-[var(--text-secondary)]">
                        <a 
                            href={source.uri} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-[var(--link-color)] hover:text-[var(--link-hover-color)] hover:underline"
                            title={source.uri}
                        >
                            {source.title || source.uri}
                        </a>
                    </li>
                ))}
            </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-[var(--text-tertiary)]">
        * Informasi produk di atas dihasilkan oleh AI berdasarkan input Anda{hasSources ? ' dan pencarian web' : ''}. Harap verifikasi keakuratannya.
      </p>
    </Card>
  );
};

export default ProductInfoDisplay;