// MethodicalMaterials.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Eye, Star, Filter,
  Calendar, BookOpen, FileText, Video, Link, ExternalLink
} from 'lucide-react';

// Імпортуйте ваші PDF файли
import Requirements from '../documents/Content_requirements.pdf';
import Title from '../documents/Requirements_title.pdf';
import Design from '../documents/design.pdf';

const MethodicalMaterials = () => {
    const navigate = useNavigate();
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  

const mockMaterials = [
  {
    id: 1,
    title: "Методичні рекомендації з написання курсових робіт",
    description: "Детальний посібник для студентів з кроками написання якісної курсової роботи, вимогами до оформлення та критеріями оцінювання.",
    author: "Викладач кафедри",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    category: "Програмування",
    type: "PDF",
    uploadDate: "2024-03-15",
    downloads: 245,
    rating: 4.8,
    size: "2.3 MB",
    tags: ["курсові", "методичка", "програмування", "оформлення"],
    fileUrl: Requirements 
  },
  {
    id: 2,
    title: "Шаблон оформлення курсової роботи",
    description: "Готовий шаблон у форматі PDF з правильним форматуванням, стилями заголовків та списку літератури.",
    author: "Викладач кафедри",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "Оформлення",
    type: "PDF",
    uploadDate: "2024-03-08",
    downloads: 412,
    rating: 4.7,
    size: "1.8 MB",
    tags: ["шаблон", "оформлення", "pdf"],
    fileUrl: Title 
  },
  {
    id: 3,
    title: "Основи академічного письма",
    description: "Посібник з правил написання наукових текстів, структурування думок та використання джерел.",
    author: "PhD - Наталя Шліхта",
    authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c88c?w=40&h=40&fit=crop&crop=face",
    category: "Методологія",
    type: "PDF",
    uploadDate: "2024-03-12",
    downloads: 328,
    rating: 4.9,
    size: "3.1 MB",
    tags: ["письмо", "методологія", "наукова робота"],
    fileUrl: "https://naqa.gov.ua/wp-content/uploads/2019/05/Academic_Writing_Course.pdf" // Демо PDF
  },
  {
    id: 4,
    title: "Відеолекція: Планування наукового дослідження",
    description: "45-хвилинна лекція про етапи проведення дослідження, від постановки проблеми до аналізу результатів.",
    author: "Доц. Петренко С.В.",
    authorAvatar: "https://images.unsplash.com/photo-1507125524815-d4c5c0b3c9f8?w=40&h=40&fit=crop&crop=face",
    category: "Методологія", 
    type: "Відео",
    uploadDate: "2024-03-10",
    downloads: 189,
    rating: 4.8,
    size: "156 MB",
    tags: ["дослідження", "планування", "відео", "лекція"],
    fileUrl: "https://www.youtube.com/watch?v=D-vpAQ4fvNE" // Приклад YouTube відео
  },
  {
    id: 5,
    title: "Презентація: Захист курсової роботи",
    description: "Шаблон презентації PowerPoint для успішного захисту курсової роботи з прикладами слайдів.",
    author: "Доц. Сидоренко А.П.",
    authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
    category: "Захист",
    type: "PPTX",
    uploadDate: "2024-03-05",
    downloads: 278,
    rating: 4.6,
    size: "4.2 MB",
    tags: ["презентація", "захист", "шаблон"],
    fileUrl: "https://www.slideshare.net/slideshow/ss-255093740/255093740"
  },
  {
    id: 6,
    title: "Чек-лист перевірки курсової роботи",
    description: "Детальний список пунктів для самоперевірки роботи перед здачею викладачу.",
    author: "Асист. Мельник О.В.",
    authorAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=40&h=40&fit=crop&crop=face",
    category: "Перевірка",
    type: "DOCX",
    uploadDate: "2024-03-01",
    downloads: 156,
    rating: 4.7,
    size: "0.8 MB",
    tags: ["чек-лист", "перевірка", "самоконтроль"],
    fileUrl: "https://pedagogy.lnu.edu.ua/wp-content/uploads/2023/01/REKOMENDATSIYI-shchodo-perevirky-kursovykh-robit-1.docx"
  },
  {
    id: 7,
    title: "Онлайн-ресурси для дослідження",
    description: "Підібрана колекція найкращих онлайн-бібліотек, баз даних та інструментів для написання курсових робіт.",
    author: "Біб. Іваненко Л.С.",
    authorAvatar: "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=40&h=40&fit=crop&crop=face",
    category: "Ресурси",
    type: "Посилання",
    uploadDate: "2024-02-28",
    downloads: 445,
    rating: 4.9,
    size: "-",
    tags: ["ресурси", "онлайн", "бібліотеки", "бази даних"],
    fileUrl: "https://scholar.google.com"
  },
  {
    id: 8,
    title: "ГОСТ 7.1-2003: Бібліографічний опис",
    description: "Офіційний стандарт оформлення списку літератури та бібліографічних посилань.",
    author: "Держстандарт України",
    authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
    category: "Оформлення",
    type: "PDF",
    uploadDate: "2024-02-25",
    downloads: 567,
    rating: 4.5,
    size: "1.2 MB",
    tags: ["ГОСТ", "бібліографія", "стандарт", "оформлення"],
    fileUrl: "https://dnpb.gov.ua/wp-content/uploads/2015/12/DSTU-7.1-2006_2010.pdf" // Демо PDF
  },
  {
    id: 9,
    title: "Інструменти перевірки на плагіат",
    description: "Огляд популярних сервісів для перевірки унікальності тексту та запобігання плагіату.",
    author: "Доц. Ткаченко В.М.",
    authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
    category: "Перевірка",
    type: "Посилання",
    uploadDate: "2024-02-20",
    downloads: 334,
    rating: 4.8,
    size: "-",
    tags: ["плагіат", "перевірка", "унікальність"],
    fileUrl: "https://www.grammarly.com"
  },
  {
    id: 10,
    title: "Приклади успішних курсових робіт",
    description: "Збірка зразків відмінних курсових робіт різних спеціальностей з коментарями викладачів.",
    author: "Кафедра загальної підготовки",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    category: "Програмування",
    type: "Посилання",
    uploadDate: "2024-02-15",
    downloads: 678,
    rating: 4.9,
    size: "5.7 MB",
    tags: ["приклади", "зразки", "курсові роботи"],
    fileUrl: "https://kursovye-raboty.kiev.ua/priklad-zrazok-kursovoyi-roboti/" 
  },
    {
    id: 11,
    title: "Загальними вимогами до тексту пояснювальної записки",
    description: "Збірка зразків відмінних курсових робіт різних спеціальностей з коментарями викладачів.",
    author: "Кафедра загальної підготовки",
    authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
    category: "Програмування",
    type: "PDF",
    uploadDate: "2024-02-15",
    downloads: 678,
    rating: 4.7,
    size: "5.7 MB",
    tags: ["приклади", "зразки", "курсові роботи"],
    fileUrl: Design
  }
];

  const categories = ['all', 'Програмування', 'Методологія', 'Оформлення', 'Ресурси', 'Захист', 'Перевірка'];
  const types = ['all', 'PDF', 'Відео', 'DOCX', 'PPTX', 'Посилання'];

  useEffect(() => {
    setTimeout(() => {
      setMaterials(mockMaterials);
      setFilteredMaterials(mockMaterials);
      setLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = materials;
    if (searchTerm) {
      filtered = filtered.filter(material =>
        material.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        material.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(material => material.category === selectedCategory);
    }
    if (selectedType !== 'all') {
      filtered = filtered.filter(material => material.type === selectedType);
    }
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        break;
      case 'popular':
        filtered.sort((a, b) => b.downloads - a.downloads);
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
    }
    setFilteredMaterials(filtered);
  }, [materials, searchTerm, selectedCategory, selectedType, sortBy]);

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF': return <FileText className="icon pdf" />;
      case 'Відео': return <Video className="icon video" />;
      case 'DOCX': return <FileText className="icon docx" />;
      case 'PPTX': return <FileText className="icon pptx" />;
      case 'Посилання': return <Link className="icon link" />;
      default: return <FileText className="icon default" />;
    }
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('uk-UA', {
    year: 'numeric', month: 'long', day: 'numeric'
  });

  // Функція для завантаження файлу
  const handleDownload = (material) => {
    console.log('Завантаження:', material.title);
    
    if (material.fileUrl) {
      const link = document.createElement('a');
      link.href = material.fileUrl;
      link.download = `${material.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Оновлюємо лічильник завантажень (в реальному проекті це буде API запит)
      setMaterials(prev => prev.map(m => 
        m.id === material.id ? { ...m, downloads: m.downloads + 1 } : m
      ));
    } else {
      alert('Файл недоступний для завантаження');
    }
  };

  // Функція для попереднього перегляду PDF
  const handlePreview = (material) => {
    console.log('Перегляд:', material.title);
    
    if (material.fileUrl) {
      // Відкрити в новій вкладці
      window.open(material.fileUrl, '_blank');
    } else {
      alert('Файл недоступний для перегляду');
    }
  };

  // Функція для закриття попереднього перегляду
  const closePreview = () => {
    setShowPreview(false);
    setPreviewUrl(null);
  };

  if (loading) return (
    <div className="loader-wrapper">
      <div className="loader"></div>
      <p className="loader-text">Завантаження матеріалів...</p>
    </div>
  );

  return (
    <div className="materials-page">
      {/* Стрілка назад */}
      <div 
        className="back-arrow" 
        onClick={() => navigate("/home")}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') navigate("/home") }}
        aria-label="Повернутися на головну"
      >
        ←
      </div>
      <div className="materials-header">
        <div className="header-left">
          <h1><BookOpen className="header-icon" /> Методичні матеріали</h1>
          <p>Корисні ресурси від викладачів для успішного написання курсових робіт</p>
        </div>
        <div className="header-right">
          Знайдено: {filteredMaterials.length} з {materials.length} матеріалів
        </div>
      </div>

      <div className="filters">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Пошук матеріалів..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="all">Всі категорії</option>
          {categories.slice(1).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>

        <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
          <option value="all">Всі типи</option>
          {types.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Найновіші</option>
          <option value="popular">Популярні</option>
          <option value="rating">За назвою</option>
          <option value="title">За рейтингом</option>
        </select>
      </div>

      <div className="materials-grid">
        {filteredMaterials.map(material => (
          <div key={material.id} className="material-card">
            <div className="card-header">
              <div className="type">
                {getTypeIcon(material.type)} <span>{material.type}</span>
              </div>
              <div className="rating">
                <Star className="star-icon" /> {material.rating}
              </div>
            </div>
            <h3 className="material-title">{material.title}</h3>
            <div className="card-body">
            <p className="material-desc">{material.description}</p>
            <div className="tags">
              {material.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
              {material.tags.length > 3 && (
                <span className="tag">+{material.tags.length - 3}</span>
              )}
            </div>
            </div>
            <div className="card-footer">
              <div className="author">
                <img src={material.authorAvatar} alt={material.author} />
                <div>
                  <p>{material.author}</p>
                  <small>{material.category}</small>
                </div>
              </div>
              <div className="stats">
                <span><Calendar className="icon-sm" /> {formatDate(material.uploadDate)}</span>
                <span><Download className="icon-sm" /> {material.downloads}</span>
                <span>{material.size}</span>
              </div>
              <div className="actions">
                <button 
                  onClick={() => handlePreview(material)} 
                  className="btn btn-light"
                  disabled={!material.fileUrl}
                >
                  <Eye className="icon-sm" /> Переглянути
                </button>
                <button 
                  onClick={() => handleDownload(material)} 
                  className="btn btn-dark"
                  disabled={!material.fileUrl}
                >
                  <Download className="icon-sm" /> Завантажити
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredMaterials.length === 0 && (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3>Матеріали не знайдено</h3>
          <p>Спробуйте змінити фільтри або пошуковий запит</p>
        </div>
      )}

      {/* Модальне вікно для попереднього перегляду PDF (опціонально) */}
      {showPreview && previewUrl && (
        <div className="modal-overlay" onClick={closePreview}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Попередній перегляд PDF</h3>
              <button onClick={closePreview} className="close-btn">×</button>
            </div>
            <div className="modal-body">
              <iframe
                src={previewUrl}
                width="100%"
                height="600px"
                title="PDF Preview"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MethodicalMaterials;