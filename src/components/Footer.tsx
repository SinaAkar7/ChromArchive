/**
 * @file Footer.tsx
 * @description Curatorial footer for ChromArchive digital museum system.
 */

import React from 'react';
import { Palette, Github, Heart, ShieldCheck, ArrowUp } from 'lucide-react';
import type { NavigationSection } from '../types';

interface FooterProps {
  onNavigate: (section: NavigationSection) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="curatorial-footer">
      <div className="footer-main-container">
        <div className="footer-brand-col">
          <div className="footer-logo-row" onClick={() => onNavigate('archive')}>
            <span className="logo-icon-box">
              <Palette size={20} className="text-secondary" />
            </span>
            <span className="footer-brand-title">ChromArchive</span>
          </div>
          <p className="footer-tagline">
            Yapay zekâ ve bilgisayarlı görü algoritmalarıyla açık erişimli görsel koleksiyonlarının
            renk analizini yapan ve aranabilir dijital arşiv sunan araştırma platformu.
          </p>
          <div className="footer-license-note">
            <ShieldCheck size={14} className="inline-icon text-success" />
            <span>Açık Erişim (Open Access / CC0) Uyumlu</span>
          </div>
        </div>

        <div className="footer-nav-col">
          <h4 className="footer-col-title">Modüller</h4>
          <ul className="footer-links-list">
            <li>
              <button type="button" onClick={() => onNavigate('archive')} className="footer-link-btn">
                Dijital Koleksiyon
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('analyzer')} className="footer-link-btn">
                Görsel Renk Analizörü
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('search')} className="footer-link-btn">
                Kromatik Arama
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('stats')} className="footer-link-btn">
                Koleksiyon Metrikleri
              </button>
            </li>
            <li>
              <button type="button" onClick={() => onNavigate('about')} className="footer-link-btn">
                Hakkında & Metodoloji
              </button>
            </li>
          </ul>
        </div>

        <div className="footer-nav-col">
          <h4 className="footer-col-title">Teknolojiler</h4>
          <ul className="footer-tech-list">
            <li>React 19 & TypeScript Strict</li>
            <li>HTML5 Canvas API (Pixel Sampling)</li>
            <li>K-Means++ Clustering</li>
            <li>Vite 8 & Vercel SPA Ready</li>
            <li>The Met Open Access Data Model</li>
          </ul>
        </div>

        <div className="footer-action-col">
          <h4 className="footer-col-title">Hızlı İşlemler</h4>
          <button
            type="button"
            className="footer-upload-cta"
            onClick={() => onNavigate('analyzer')}
          >
            <Palette size={16} />
            <span>Kendi Görselini Analiz Et</span>
          </button>

          <button
            type="button"
            className="scroll-top-btn"
            onClick={scrollToTop}
            title="Sayfanın Başına Dön"
          >
            <ArrowUp size={16} />
            <span>Başa Dön</span>
          </button>
        </div>
      </div>

      <div className="footer-bottom-bar">
        <div className="footer-bottom-inner">
          <p className="copyright-text">
            © {new Date().getFullYear()} ChromArchive. Dijital Sanat & Renk Analizi Sistemi.
          </p>
          <p className="academic-note">
            Kültürel Miras ve Açık Erişim Araştırmaları için Geliştirilmiştir.
          </p>
        </div>
      </div>
    </footer>
  );
};
