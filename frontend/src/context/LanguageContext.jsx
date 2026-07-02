import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

const STORAGE_KEY = 'merc_lang';

function resolve(dict, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return str.replace(/{{(.*?)}}/g, (_, key) => (vars[key.trim()] !== undefined ? vars[key.trim()] : ''));
}

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'ru';
    } catch {
      return 'ru';
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  const toggleLang = () => setLang(l => (l === 'ru' ? 'en' : 'ru'));

  // t('shop.product', { count: n }) picks a pluralized key for RU (product_one/_few/_many)
  // and falls back to the plain key when no count-based variant exists.
  const t = useCallback((path, vars) => {
    let key = path;
    if (vars && typeof vars.count === 'number') {
      const n = vars.count;
      const pluralKey = lang === 'ru'
        ? (n % 10 === 1 && n % 100 !== 11 ? `${path}_one` : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? `${path}_few` : `${path}_many`)
        : (n === 1 ? `${path}_one` : `${path}_many`);
      if (resolve(translations[lang], pluralKey) !== undefined) key = pluralKey;
    }
    const value = resolve(translations[lang], key);
    if (value === undefined) return path;
    return typeof value === 'string' ? interpolate(value, vars) : value;
  }, [lang]);

  // Picks the field matching current language, falling back to the other one.
  const localize = useCallback((obj, baseField, ruField) => {
    if (!obj) return '';
    if (lang === 'ru') return obj[ruField] || obj[baseField] || '';
    return obj[baseField] || obj[ruField] || '';
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, t, localize }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
