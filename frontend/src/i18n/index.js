import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import enTranslations from './locales/en.json';
import ruTranslations from './locales/ru.json';
import deTranslations from './locales/de.json';
import zhTranslations from './locales/zh.json';
import koTranslations from './locales/ko.json';
import frTranslations from './locales/fr.json';
import esTranslations from './locales/es.json';
import jaTranslations from './locales/ja.json';

const resources = {
  en: {
    translation: enTranslations
  },
  ru: {
    translation: ruTranslations
  },
  de: {
    translation: deTranslations
  },
  zh: {
    translation: zhTranslations
  },
  ko: {
    translation: koTranslations
  },
  fr: {
    translation: frTranslations
  },
  es: {
    translation: esTranslations
  },
  ja: {
    translation: jaTranslations
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: localStorage.getItem('user-language') || 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    debug: process.env.NODE_ENV === 'development'
  });

export default i18n;