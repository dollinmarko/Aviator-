import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, AVAILABLE_LANGUAGES } from '../i18n/LanguageContext.tsx';
import { Language } from '../types.ts';
import { Globe, Check, ChevronDown } from 'lucide-react';

interface LanguageSelectorProps {
  variant?: 'navbar' | 'compact' | 'inline';
  showLabel?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'navbar',
  showLabel = true,
}) => {
  const { language, setLanguage, t, currentLanguageOption } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  if (variant === 'inline') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
        {AVAILABLE_LANGUAGES.map((opt) => {
          const isSelected = opt.code === language;
          return (
            <button
              key={opt.code}
              type="button"
              id={`lang-select-inline-${opt.code}`}
              onClick={() => handleSelect(opt.code)}
              className={`flex items-center justify-between p-4 rounded-lg border text-left transition-all ${
                isSelected
                  ? 'bg-[#1a1a1a] border-[#c21807] text-white ring-1 ring-[#c21807]'
                  : 'bg-[#151515] border-[#2a2a2a] text-[#e2e2d5]/80 hover:border-[#3a3a3a] hover:bg-[#1a1a1a]'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl" role="img" aria-label={opt.name}>
                  {opt.flag}
                </span>
                <div>
                  <div className="font-serif italic text-base flex items-center gap-2">
                    {opt.nativeName}
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#2a2a2a] text-[#e2e2d5]/70 border border-[#3a3a3a]">
                      {opt.short}
                    </span>
                  </div>
                  <div className="text-[11px] uppercase tracking-widest text-[#e2e2d5]/50 mt-0.5">
                    {opt.name}
                  </div>
                </div>
              </div>
              {isSelected && (
                <div className="w-5 h-5 rounded-full bg-[#c21807] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        id="language-selector-button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        className="flex items-center gap-2 px-4 py-2 border border-[#3a3a3a] rounded-full text-xs font-semibold tracking-widest text-[#e2e2d5] hover:bg-[#e2e2d5] hover:text-[#0c0c0c] transition-colors focus:outline-none"
      >
        <span>🌐</span>
        <span className="text-[10px] uppercase tracking-widest">
          {showLabel ? `${t('nav.language')}: ` : ''}
          {currentLanguageOption.flag} {currentLanguageOption.short}
        </span>
        <ChevronDown
          className={`w-3 h-3 opacity-60 transition-transform duration-200 ${
            isOpen ? 'rotate-180 opacity-100' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div
          id="language-selector-menu"
          role="menu"
          className="absolute right-0 mt-2 w-52 bg-[#1a1a1a] border border-[#3a3a3a] shadow-2xl rounded-lg z-50 overflow-hidden divide-y divide-[#2a2a2a] animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="px-4 py-3 text-[10px] uppercase tracking-[0.25em] text-[#e2e2d5]/50">
            {t('nav.language')}
          </div>

          <div className="p-1 space-y-0.5">
            {AVAILABLE_LANGUAGES.map((opt) => {
              const isSelected = opt.code === language;
              return (
                <button
                  key={opt.code}
                  id={`lang-option-${opt.code}`}
                  role="menuitem"
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded text-left transition-colors ${
                    isSelected
                      ? 'bg-[#2a2a2a] text-white font-medium'
                      : 'text-[#e2e2d5]/80 hover:bg-[#2a2a2a] hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-base" role="img" aria-label={opt.name}>
                      {opt.flag}
                    </span>
                    <div>
                      <span className="block text-xs font-serif italic tracking-wide">
                        {opt.nativeName}
                      </span>
                      <span className="block text-[10px] uppercase tracking-widest text-[#e2e2d5]/50">
                        {opt.name}
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#c21807]" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
