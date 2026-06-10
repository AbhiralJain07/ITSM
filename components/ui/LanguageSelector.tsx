"use client";

import React, { useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';
import { Select } from '@/components/ui/Select';
import { useLanguage } from '@/context/LanguageContext';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export function LanguageSelector({ className }: { className?: string }) {
  const { currentLanguage, setLanguage, supportedLanguages, t, isLanguageLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const languageOptions = supportedLanguages.map(lang => ({
    value: lang.culture,
    label: lang.displayName
  }));

  const handleLanguageChange = async (newLanguage: string) => {
    await setLanguage(newLanguage as any);
    setIsOpen(false);
  };

  if (isLanguageLoading) {
    return (
      <div className={cn("flex items-center gap-2 text-muted-foreground", className)}>
        <Globe className="w-4 h-4" />
        <span className="text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <Select
        options={languageOptions}
        value={currentLanguage}
        onChange={handleLanguageChange}
        placeholder={t('language.selectLanguage')}
        className="min-w-[180px]"
      />
    </div>
  );
}

// Enhanced version with better visual design
export function EnhancedLanguageSelector({ className }: { className?: string }) {
  const { currentLanguage, setLanguage, supportedLanguages, t, isLanguageLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (isLanguageLoading) {
    return (
      <div className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5",
        "border border-primary/20 backdrop-blur-sm",
        "shadow-lg hover:shadow-xl transition-all duration-300",
        className
      )}>
        <div className="w-5 h-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <span className="text-sm font-medium text-foreground">Loading...</span>
      </div>
    );
  }

  const currentLang = supportedLanguages.find(lang => lang.culture === currentLanguage);
  const shortCode = currentLanguage.split('-')[0].toUpperCase();
  const flagEmojis: Record<string, string> = {
    'en': '🇺🇸',
    'nl': '🇳🇱', 
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'it': '🇮🇹'
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl bg-gradient-to-r from-primary/10 to-primary/5",
          "border border-primary/20 backdrop-blur-sm",
          "shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300",
          "text-foreground hover:text-primary",
          "min-w-[120px] justify-center"
        )}
      >
        <Globe className="w-5 h-5" />
        <span className="text-sm font-bold">{flagEmojis[shortCode] || '🌐'} {shortCode}</span>
        <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-3 bg-card/95 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-2xl z-50 min-w-[240px] overflow-hidden">
            <div className="px-4 py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/20">
              <p className="text-sm font-bold text-foreground flex items-center gap-2">
                <Globe className="w-4 h-4" />
                {t('language.selectLanguage')}
              </p>
            </div>
            <div className="py-2">
              {supportedLanguages.map((lang) => {
                const langShortCode = lang.culture.split('-')[0];
                return (
                  <button
                    key={lang.culture}
                    onClick={() => {
                      setLanguage(lang.culture as any);
                      setIsOpen(false);
                    }}
                    className={cn(
                      "w-full px-4 py-3 text-left transition-all duration-200",
                      "flex items-center gap-3",
                      "hover:bg-primary/10 hover:translate-x-1",
                      lang.culture === currentLanguage && "bg-primary/15 text-primary font-bold"
                    )}
                  >
                    <span className="text-xl">{flagEmojis[langShortCode] || '🌐'}</span>
                    <div className="flex-1">
                      <div className={cn(
                        "font-semibold",
                        lang.culture === currentLanguage ? "text-primary" : "text-foreground"
                      )}>
                        {lang.displayName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {langShortCode.toUpperCase()}
                      </div>
                    </div>
                    {lang.culture === currentLanguage && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <span className="text-white text-xs">✓</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
export function CompactLanguageSelector({ className }: { className?: string }) {
  const { currentLanguage, setLanguage, supportedLanguages, t, isLanguageLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  if (isLanguageLoading) {
    return (
      <button className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 backdrop-blur-md border border-border/50",
        "text-muted-foreground transition-all duration-200 min-w-[100px] justify-center",
        className
      )} disabled>
        <Globe className="w-4 h-4 animate-spin text-primary/60" />
        <span className="text-xs font-bold uppercase tracking-wider">EN</span>
      </button>
    );
  }

  const currentLang = supportedLanguages.find(lang => lang.culture === currentLanguage);
  const shortCode = currentLanguage.split('-')[0].toUpperCase();
  const flagEmojis: Record<string, string> = {
    'en': '🇺🇸',
    'nl': '🇳🇱', 
    'fr': '🇫🇷',
    'de': '🇩🇪',
    'es': '🇪🇸',
    'it': '🇮🇹'
  };

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-xl bg-card/60 backdrop-blur-md border border-border/50",
          "text-foreground/80 hover:text-primary hover:bg-primary/5 hover:border-primary/20 transition-all duration-300",
          "shadow-xs hover:shadow-md cursor-pointer",
          "min-w-[100px] justify-center font-bold"
        )}
      >
        <Globe className="w-4 h-4 text-primary" />
        <span className="text-xs uppercase tracking-wider">{flagEmojis[shortCode] || '🌐'} {shortCode}</span>
        <ChevronDown className={cn("w-3 h-3 text-muted-foreground transition-transform duration-300", isOpen && "rotate-180")} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div 
              className="fixed inset-0 z-40 bg-black/5 backdrop-blur-[1px]" 
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute right-0 top-full mt-2 bg-card/90 backdrop-blur-xl border border-border/80 rounded-2xl shadow-2xl z-50 min-w-[220px] overflow-hidden"
            >
              <div className="px-4 py-2.5 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-border/60">
                <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">{t('language.selectLanguage')}</p>
              </div>
              <div className="py-1">
                {supportedLanguages.map((lang) => {
                  const langShortCode = lang.culture.split('-')[0];
                  return (
                    <motion.button
                      whileHover={{ scale: 1.01, x: 2 }}
                      whileTap={{ scale: 0.99 }}
                      key={lang.culture}
                      onClick={() => {
                        setLanguage(lang.culture as any);
                        setIsOpen(false);
                      }}
                      className={cn(
                        "w-full px-4 py-3 text-left text-sm transition-all duration-200",
                        "flex items-center gap-3 border-none outline-none cursor-pointer",
                        "hover:bg-primary/5 hover:text-primary",
                        lang.culture === currentLanguage ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                      )}
                    >
                      <span className="text-lg">{flagEmojis[langShortCode] || '🌐'}</span>
                      <div className="flex-1">
                        <div className={cn(
                          "font-bold text-xs text-left",
                          lang.culture === currentLanguage ? "text-primary" : "text-foreground"
                        )}>
                          {lang.displayName}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-semibold text-left">
                          {langShortCode.toUpperCase()}
                        </div>
                      </div>
                      {lang.culture === currentLanguage && (
                        <span className="text-primary text-xs font-black">✓</span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
