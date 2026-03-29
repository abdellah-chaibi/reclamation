import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar';
import fr from './locales/fr';

const STORAGE_KEY = 'app-language';
const fallbackLng = 'fr';
const supportedLanguages = ['fr', 'ar'];

const savedLanguage = localStorage.getItem(STORAGE_KEY);
const initialLanguage = supportedLanguages.includes(savedLanguage) ? savedLanguage : fallbackLng;

function applyDocumentLanguage(language) {
  const isArabic = language === 'ar';
  document.documentElement.lang = language;
  document.documentElement.dir = isArabic ? 'rtl' : 'ltr';
  document.body.dir = isArabic ? 'rtl' : 'ltr';
}

i18n.use(initReactI18next).init({
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
  },
  lng: initialLanguage,
  fallbackLng,
  interpolation: {
    escapeValue: false,
  },
});

applyDocumentLanguage(initialLanguage);

i18n.on('languageChanged', (language) => {
  localStorage.setItem(STORAGE_KEY, language);
  applyDocumentLanguage(language);
});

export default i18n;
