/**
 * @file src/components/Footer.tsx
 * @description Kompakt kurumsal alt bilgi çubuğu. Detaylı proje açıklamaları ve veri kaynakları Hakkında sayfasında toplanmıştır.
 */

import React from 'react';
import { Palette, ArrowUp } from 'lucide-react';
import type { NavigationSection } from '../types';

interface FooterProps {
  onNavigate: (section: NavigationSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="curatorial-footer-compact">
      <div className="container footer-compact-inner">
        <div className="footer-compact-brand">
          <button
            type="button"
            className="footer-brand-btn"
            onClick={() => onNavigate('home')}
          >
            <Palette size={17} />
            <span>ChromArchive</span>
          </button>
          <span className="footer-compact-sep">·</span>
          <span className="footer-compact-copy">
            © {new Date().getFullYear()} Açık Erişimli Görsel Renk Analizi & Dijital Arşiv
          </span>
        </div>

        <div className="footer-compact-actions">
          <button
            type="button"
            className="footer-compact-link"
            onClick={() => onNavigate('help')}
          >
            Yardım &amp; Kullanım Rehberi
          </button>
          <span className="footer-compact-sep" aria-hidden="true">·</span>
          <button
            type="button"
            className="footer-compact-link"
            onClick={() => onNavigate('about')}
          >
            Hakkında, Metodoloji &amp; Veri Kaynakları
          </button>
          <button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            title="Sayfanın Başına Dön"
          >
            <ArrowUp size={15} />
            <span>Başa Dön</span>
          </button>
        </div>
      </div>
    </footer>
  );
};
