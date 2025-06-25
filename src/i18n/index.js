import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en.json';
import ua from './locales/ua.json';

i18n
  .use(LanguageDetector) // автоматичне визначення мови
  .use(initReactI18next) // підключення до React
  .init({
    resources: {
      en: { translation: en },
      ua: { translation: ua }
    },
    fallbackLng: 'ua',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
