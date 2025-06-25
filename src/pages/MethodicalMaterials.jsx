// MethodicalMaterials.jsx
import React, { useState, useEffect } from 'react';
import {
  Search, Download, Eye, Star, Filter,
  Calendar, BookOpen, FileText, Video, Link
} from 'lucide-react';

const MethodicalMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [filteredMaterials, setFilteredMaterials] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [loading, setLoading] = useState(true);

const mockMaterials = [
    {
      id: 1,
      title: "Методичні рекомендації з написання курсових робіт з програмування",
      description: "Детальний посібник для студентів з кроками написання якісної курсової роботи, вимогами до оформлення та критеріями оцінювання.",
      author: "Проф. Іваненко О.М.",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
      category: "Програмування",
      type: "PDF",
      uploadDate: "2024-03-15",
      downloads: 245,
      rating: 4.8,
      size: "2.3 MB",
      tags: ["курсові", "методичка", "програмування", "оформлення"]
    },
    {
      id: 2,
      title: "Відеолекція: Основи наукового дослідження",
      description: "Відеоматеріал про те, як правильно формулювати проблему дослідження, ставити цілі та завдання, обирати методи.",
      author: "Доц. Петренко С.В.",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b332c88c?w=40&h=40&fit=crop&crop=face",
      category: "Методологія",
      type: "Відео",
      uploadDate: "2024-03-10",
      downloads: 189,
      rating: 4.9,
      size: "156 MB",
      tags: ["дослідження", "методологія", "відео"]
    },
    {
      id: 3,
      title: "Шаблон оформлення курсової роботи",
      description: "Готовий шаблон у форматі Word з правильним форматуванням, стилями заголовків та списку літератури.",
      author: "Проф. Коваленко М.І.",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
      category: "Оформлення",
      type: "DOCX",
      uploadDate: "2024-03-08",
      downloads: 412,
      rating: 4.7,
      size: "0.5 MB",
      tags: ["шаблон", "оформлення", "word"]
    },
    {
      id: 4,
      title: "Посилання на корисні онлайн-ресурси",
      description: "Підібрана колекція найкращих онлайн-бібліотек, баз даних та інструментів для написання курсових робіт.",
      author: "Доц. Сидоренко А.П.",
      authorAvatar: "https://images.unsplash.com/photo-1507125524815-d4c5c0b3c9f8?w=40&h=40&fit=crop&crop=face",
      category: "Ресурси",
      type: "Посилання",
      uploadDate: "2024-03-05",
      downloads: 156,
      rating: 4.6,
      size: "-",
      tags: ["ресурси", "онлайн", "бібліотеки"]
    },
    {
      id: 5,
      title: "Презентація: Як захищати курсову роботу",
      description: "Поради щодо підготовки до захисту, структури презентації та відповідей на питання комісії.",
      author: "Проф. Мельник В.О.",
      authorAvatar: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=40&h=40&fit=crop&crop=face",
      category: "Захист",
      type: "PPTX",
      uploadDate: "2024-02-28",
      downloads: 298,
      rating: 4.8,
      size: "8.7 MB",
      tags: ["захист", "презентація", "поради"]
    },
    {
      id: 6,
      title: "Чек-лист перевірки курсової роботи",
      description: "Детальний список пунктів для самоперевірки роботи перед здачею викладачу.",
      author: "Доц. Борисенко Л.К.",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
      category: "Перевірка",
      type: "PDF",
      uploadDate: "2024-02-25",
      downloads: 187,
      rating: 4.9,
      size: "1.1 MB",
      tags: ["чек-лист", "перевірка", "самоконтроль"]
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

  const handleDownload = (material) => console.log('Завантаження:', material.title);
  const handlePreview = (material) => console.log('Перегляд:', material.title);

  if (loading) return (
    <div className="loader-wrapper">
      <div className="loader"></div>
      <p className="loader-text">Завантаження матеріалів...</p>
    </div>
  );

  return (
    <div className="materials-page">
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
          <option value="rating">За рейтингом</option>
          <option value="title">За назвою</option>
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
            <p className="material-desc">{material.description}</p>
            <div className="tags">
              {material.tags.slice(0, 3).map(tag => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
              {material.tags.length > 3 && (
                <span className="tag">+{material.tags.length - 3}</span>
              )}
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
                <button onClick={() => handlePreview(material)} className="btn btn-light">
                  <Eye className="icon-sm" /> Переглянути
                </button>
                <button onClick={() => handleDownload(material)} className="btn btn-dark">
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
    </div>
  );
};

export default MethodicalMaterials;