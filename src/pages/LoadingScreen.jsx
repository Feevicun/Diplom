import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const firstTimer = setTimeout(() => setShowSecond(true), 5000);
    const navTimer = setTimeout(() => navigate('/authorization'), 10000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="meme-loading-container">
      <div className="meme-text fade-in">
        {t('loadingScreen.firstText')}
      </div>
      {showSecond && (
        <div className="meme-text fade-in delay">
          {t('loadingScreen.secondText')}
        </div>
      )}

      {showSecond && (
        <img
          className="meme-gif fade-in delay"
          src="https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
          alt={t('loadingScreen.imageAlt')}
        />
      )}
    </div>
  );
}
