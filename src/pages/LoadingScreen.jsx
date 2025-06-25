import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function LoadingScreen() {
  const navigate = useNavigate();
  const [showSecond, setShowSecond] = useState(false);

  useEffect(() => {
    const firstTimer = setTimeout(() => setShowSecond(true), 3000);
    const navTimer = setTimeout(() => navigate('/authorization'), 10000);

    return () => {
      clearTimeout(firstTimer);
      clearTimeout(navTimer);
    };
  }, [navigate]);

  return (
    <div className="meme-loading-container">
      <div className="meme-text fade-in">
        Що роблять студенти перед дедлайном?
      </div>
      {showSecond && (
        <div className="meme-text fade-in delay">
          Завантажують додаток...
        </div>
      )}

      {/* Optional: funny meme GIF */}
      {showSecond && (
        <img
          className="meme-gif fade-in delay"
          src="https://media.giphy.com/media/3o7btPCcdNniyf0ArS/giphy.gif"
          alt="student meme"
        />
      )}
    </div>
  );
}
