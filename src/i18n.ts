// src/i18n.ts
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import translationUA from './locales/ua/translation.json';
import translationEN from './locales/en/translation.json';

const resources = {
  ua: { translation: translationUA },
  en: { translation: translationEN },
};

i18n
  .use(LanguageDetector) // авто-визначення мови браузера
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'ua',
    interpolation: {
      escapeValue: false, // React сам екранує
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  });

export default i18n;
