/**
 * @file src/components/ImageUploader.tsx
 * @description Görsel yükleme, sürükle-bırak, hazır başyapıt örnekleri ve canlı önizleme bileşeni.
 */

import React, { useRef, useState } from 'react';
import { ArtworkMetadata, SampleArtworkPreset } from '../types';

const SAMPLE_PRESETS: SampleArtworkPreset[] = [
  {
    id: 'vermeer',
    src: 'images/vermeer.jpg',
    name: 'Vermeer',
    title: 'Süt Döken Kadın (The Milkmaid)',
    artist: 'Johannes Vermeer',
    period: 'Hollanda Baroğu',
  },
  {
    id: 'hokusai',
    src: 'images/hokusai.jpg',
    name: 'Hokusai',
    title: 'Kanagawa Açıklarında Büyük Dalga',
    artist: 'Katsushika Hokusai',
    period: 'Edo Ukiyo-e',
  },
  {
    id: 'monet',
    src: 'images/monet.jpg',
    name: 'Monet',
    title: 'Nilüferler ve Japon Köprüsü',
    artist: 'Claude Monet',
    period: 'İzlenimcilik',
  },
  {
    id: 'cezanne',
    src: 'images/cezanne.jpg',
    name: 'Cézanne',
    title: 'Elmalı Natürmort',
    artist: 'Paul Cézanne',
    period: 'Post-İzlenimcilik',
  },
  {
    id: 'monalisa',
    src: 'images/monalisa.jpg',
    name: 'Mona Lisa',
    title: 'Mona Lisa (La Gioconda)',
    artist: 'Leonardo da Vinci',
    period: 'Yüksek Rönesans',
  },
];

interface ImageUploaderProps {
  onImageSelected: (src: string, meta: Partial<ArtworkMetadata>) => void;
  currentPreviewSrc: string | null;
  currentMetaStrip: string | null;
  isLoading: boolean;
  onShowToast: (message: string) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onImageSelected,
  currentPreviewSrc,
  currentMetaStrip,
  isLoading,
  onShowToast,
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [activePresetId, setActivePresetId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type.toLowerCase())) {
      onShowToast('Hata: Yalnızca JPG, PNG veya WEBP formatları desteklenmektedir.');
      return;
    }

    if (file.size > 25 * 1024 * 1024) {
      onShowToast('Hata: Dosya boyutu çok büyük (Maksimum 25MB).');
      return;
    }

    setActivePresetId(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        onImageSelected(dataUrl, {
          title: file.name.replace(/\.[^/.]+$/, ''),
          fileFormat: file.type.split('/')[1]?.toUpperCase() || 'JPEG',
          isCustom: true,
        });
      }
    };
    reader.onerror = () => {
      onShowToast('Dosya okunurken bir hata oluştu.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handlePresetClick = (preset: SampleArtworkPreset) => {
    setActivePresetId(preset.id);
    onImageSelected(preset.src, {
      title: preset.title,
      artist: preset.artist,
      period: preset.period,
      fileFormat: 'JPEG',
      isCustom: false,
    });
  };

  return (
    <div className="upload-panel">
      {/* Sürükle Bırak Alanı */}
      <div
        className={`drop-zone ${dragOver ? 'dragover' : ''}`}
        id="imageDropZone"
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setDragOver(false);
        }}
        onDrop={handleDrop}
        role="button"
        tabIndex={0}
      >
        <svg
          className="drop-zone-icon"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
        >
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
        <div className="drop-zone-title">Görseli Buraya Sürükleyin veya Tıklayın</div>
        <div className="drop-zone-subtext">
          JPG, JPEG, PNG veya WEBP formatları desteklenir (Max 25MB)
        </div>
        <input
          type="file"
          ref={fileInputRef}
          id="imageFileInput"
          accept=".jpg,.jpeg,.png,.webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />
      </div>

      {/* Hızlı Örnek Eser Seçici */}
      <div className="samples-selector">
        <span className="samples-label">Veya Örnek Eserle Test Edin</span>
        <div className="sample-buttons-row">
          {SAMPLE_PRESETS.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={`sample-thumbnail-btn ${
                activePresetId === preset.id ? 'active' : ''
              }`}
              onClick={() => handlePresetClick(preset)}
              title={`${preset.title} - ${preset.artist}`}
            >
              <img
                src={preset.src}
                alt={preset.name}
                className="sample-thumb-img"
                loading="lazy"
              />
              <span className="sample-thumb-name">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Yüklenme Göstergesi */}
      {isLoading && (
        <div className="analysis-loading-state" id="analysisLoadingState">
          <div className="analysis-spinner"></div>
          <div className="analysis-loading-text">
            Piksel Verileri Canvas API ile Analiz Ediliyor...
          </div>
          <div className="analysis-loading-subtext">
            K-Means++ kümeleme algoritması çalıştırılıyor, renk merkezleri hesaplanıyor.
          </div>
        </div>
      )}

      {/* Canlı Önizleme Çerçevesi */}
      {currentPreviewSrc && (
        <div className="preview-container active" id="previewContainer">
          <div className="image-preview-wrapper">
            <img
              src={currentPreviewSrc}
              id="analysisPreviewImg"
              className="image-preview"
              alt="Analiz Önizlemesi"
            />
          </div>
          {currentMetaStrip && (
            <div className="image-meta-strip" id="previewMetaStrip">
              <span>{currentMetaStrip}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
