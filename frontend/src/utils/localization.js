import i18n from '../i18n';

const DEPARTMENT_TRANSLATIONS = {
  eau: { ar: 'الماء', fr: 'Eau' },
  water: { ar: 'الماء', fr: 'Eau' },
  electricite: { ar: 'الكهرباء', fr: 'Electricite' },
  électricité: { ar: 'الكهرباء', fr: 'Electricite' },
  electricité: { ar: 'الكهرباء', fr: 'Electricite' },
  assainissement: { ar: 'التطهير', fr: 'Assainissement' },
  voirie: { ar: 'الطرق', fr: 'Voirie' },
  urbanisme: { ar: 'التعمير', fr: 'Urbanisme' },
  support: { ar: 'الدعم', fr: 'Support' },
  rh: { ar: 'الموارد البشرية', fr: 'RH' },
  'ressources humaines': { ar: 'الموارد البشرية', fr: 'Ressources humaines' },
  finance: { ar: 'المالية', fr: 'Finance' },
  finances: { ar: 'المالية', fr: 'Finances' },
  proprete: { ar: 'النظافة', fr: 'Proprete' },
  propreté: { ar: 'النظافة', fr: 'Proprete' },
  jardinage: { ar: 'المساحات الخضراء', fr: 'Jardinage' },
  espacesverts: { ar: 'المساحات الخضراء', fr: 'Espaces verts' },
  'espaces verts': { ar: 'المساحات الخضراء', fr: 'Espaces verts' },
};

function normalizeKey(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();
}

export function getCurrentLanguage() {
  return i18n.language === 'ar' ? 'ar' : 'fr';
}

export function isArabicLanguage(language = getCurrentLanguage()) {
  return language === 'ar';
}

export function translateDepartmentName(name, language = getCurrentLanguage()) {
  if (!name) return '';
  const key = normalizeKey(name);
  const translated = DEPARTMENT_TRANSLATIONS[key];
  return translated?.[language] || name;
}

export function formatLocalizedDate(value, language = getCurrentLanguage(), options = {}) {
  const locale = language === 'ar' ? 'ar-MA' : 'fr-FR';
  return new Date(value).toLocaleDateString(locale, options);
}

export function getLocalizedText(translations, language = getCurrentLanguage()) {
  return translations[language] || translations.fr || '';
}
