import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('lang') || i18n.language || 'ua');

  const toggleLanguage = () => {
    const newLang = language === 'ua' ? 'en' : 'ua';
    setLanguage(newLang);
    localStorage.setItem('lang', newLang);
    i18n.changeLanguage(newLang);
  };

  useEffect(() => {
    document.documentElement.lang = language;
    // Якщо хочеш, щоб i18n відслідковував зміну і синхронізувався
    if (i18n.language !== language) {
      i18n.changeLanguage(language);
    }
  }, [language, i18n]);

  const styles = {
    container: {
      position: 'fixed',
      bottom: '17px',
      right: '80px',
      zIndex: 999,
    },
    button: {
      background: 'transparent',
      border: 'none',
      fontSize: '20px',
      cursor: 'pointer',
      padding: '8px',
      borderRadius: '50%',
      transition: 'background-color 0.3s ease',
    },
  };

  return (
    <div style={styles.container}>
      <button
        style={styles.button}
        onClick={toggleLanguage}
        title={language === 'ua' ? 'Змінити мову на English' : 'Change language to Ukrainian'}
      >
        {language === 'ua' ? '🇺🇦' : '🇬🇧'}
      </button>
    </div>
  );
}
