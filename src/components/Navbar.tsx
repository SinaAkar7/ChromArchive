/**
 * @file src/components/Navbar.tsx
 * @description Üst menü navigasyon bileşeni (Top Bar Contract: 3 Zone).
 */

import React, { useState } from 'react';
import { NavigationSection } from '../types';

interface NavbarProps {
  activeSection: NavigationSection;
  onNavigate: (section: NavigationSection) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSection,
  onNavigate,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLinkClick = (section: NavigationSection) => {
    onNavigate(section);
    setMobileMenuOpen(false);
  };

  return (
    <header className="site-header">
      <div className="container header-container">
        {/* Bölge 1: Marka Wordmark */}
        <a
          href="#home"
          className="brand-link"
          onClick={(e) => {
            e.preventDefault();
            handleLinkClick('home');
          }}
        >
          <svg
            className="brand-icon"
            viewBox="0 0 28 28"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="9" cy="9" r="6" fill="#1E3A5F" />
            <circle cx="19" cy="9" r="6" fill="#D8A838" />
            <circle cx="14" cy="18" r="6" fill="#8C3B24" />
            <circle cx="14" cy="12" r="3" fill="#FBF9F5" />
          </svg>
          <span>ChromArchive</span>
        </a>

        {/* Bölge 2: Navigasyon Bağlantıları */}
        <nav
          className={`main-nav ${mobileMenuOpen ? 'mobile-active' : ''}`}
          id="mainNav"
        >
          <button
            type="button"
            className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
            onClick={() => handleLinkClick('home')}
          >
            Ana Sayfa
          </button>
          <button
            type="button"
            className={`nav-link ${
              activeSection === 'analyzer' ? 'active' : ''
            }`}
            onClick={() => handleLinkClick('analyzer')}
          >
            Görsel Analizi
          </button>
          <button
            type="button"
            className={`nav-link ${
              activeSection === 'archive' ? 'active' : ''
            }`}
            onClick={() => handleLinkClick('archive')}
          >
            Dijital Arşiv
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === 'search' ? 'active' : ''}`}
            onClick={() => handleLinkClick('search')}
          >
            Renk Arama
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === 'stats' ? 'active' : ''}`}
            onClick={() => handleLinkClick('stats')}
          >
            İstatistikler
          </button>
          <button
            type="button"
            className={`nav-link ${activeSection === 'about' ? 'active' : ''}`}
            onClick={() => handleLinkClick('about')}
          >
            Proje Hakkında
          </button>
        </nav>

        {/* Bölge 3: Birincil Aksiyon Butonu */}
        <div className="header-actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleLinkClick('analyzer')}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
            </svg>
            <span>Görsel Analiz Et</span>
          </button>

          <button
            type="button"
            className="mobile-menu-toggle"
            id="mobileMenuToggle"
            aria-label="Menüyü Aç/Kapat"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};
