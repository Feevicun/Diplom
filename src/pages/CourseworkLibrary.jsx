import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Download, Eye, Star, Calendar, BookOpen, FileText
} from 'lucide-react';

import Example1 from '../documents/2023_ФеІ-23_Особа_В.Б._презентація.pdf';
import Example2 from '../documents/2023_ФеІ-22_Стельмащук_А.В._перезентація.pdf';

const CourseworkLibrary = () => {
  const navigate = useNavigate();
  const [examples, setExamples] = useState([]);
  const [filteredExamples, setFilteredExamples] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('year');
  const [userFaculty, setUserFaculty] = useState('');
  const [loading, setLoading] = useState(true);

  const getFacultySpecialties = (faculty) => {
    const facultySpecialties = {
      "Факультет прикладної математики та інформатики": [
        'Програмування', 'Комп. науки', 'Інформаційні системи', 'Кібербезпека', 'Прикладна математика'
      ],
      "Факультет електроніки та комп'ютерних технологій": [
        'Електроніка', 'Комп. технології', 'Радіофізика', 'Оптоелектроніка'
      ],
      "Механіко-математичний факультет": [
        'Математика', 'Механіка', 'Математична статистика', 'Функціональний аналіз'
      ],
      "Фізичний факультет": [
        'Фізика', 'Астрофізика', 'Експериментальна фізика', 'Фізика металів'
      ],
      "Хімічний факультет": [
        'Аналітична хімія', 'Органічна хімія', 'Неорганічна хімія'
      ],
      "Біологічний факультет": [
        'Біофізика', 'Біохімія', 'Ботаніка', 'Генетика', 'Екологія', 'Зоологія'
      ],
      "Економічний факультет": [
        'Економіка', 'Менеджмент', 'Маркетинг', 'Облік і аудит', 'Статистика'
      ],
      "Юридичний факультет": [
        'Адміністративне право', 'Конституційне право', 'Кримінальне право', 'Цивільне право'
      ],
      "Філологічний факультет": [
        'Українська філологія', 'Слов\'янська філологія', 'Польська філологія', 'Мовознавство'
      ],
      "Факультет іноземних мов": [
        'Англійська філологія', 'Німецька філологія', 'Французька філологія', 'Переклад'
      ],
      "Історичний факультет": [
        'Історія', 'Етнологія', 'Соціологія', 'Краєзнавство'
      ],
      "Географічний факультет": [
        'Географія', 'Екологія', 'Туризм', 'Готельно-ресторанна справа'
      ],
      "Геологічний факультет": [
        'Геологія', 'Геофізика', 'Мінералогія', 'Гідрогеологія'
      ],
      "Філософський факультет": [
        'Філософія', 'Політологія', 'Психологія', 'Культурологія'
      ],
      "Факультет журналістики": [
        'Журналістика', 'Масова інформація', 'Мова ЗМІ'
      ],
      "Факультет культури і мистецтв": [
        'Музичне мистецтво', 'Театрознавство', 'Хореографія', 'Культурний менеджмент'
      ],
      "Факультет міжнародних відносин": [
        'Міжнародні відносини', 'Міжнародне право', 'Європейське право', 'Міжнародна безпека'
      ],
      "Факультет педагогічної освіти": [
        'Педагогіка', 'Початкова освіта', 'Дошкільна освіта', 'Соціальна робота'
      ],
      "Факультет управління фінансами та бізнесу": [
        'Фінанси', 'Фінансовий менеджмент', 'Цифрова економіка', 'Бізнес-аналітика'
      ]
    };
    
    return facultySpecialties[faculty] || [];
  };

  const getAllCourseworks = () => {
    return [
      {
        id: 1,
        title: "Розробка чат-бота для консультацій студентів",
        description: "Приклад курсової роботи з розробки чат-бота на JavaScript для внутрішньої платформи університету.",
        student: "Іван Коваль",
        specialty: "Програмування",
        year: 2023,
        supervisor: "д-р. Ткаченко Л.М.",
        rating: 4.7,
        fileUrl: Example1
      },
      {
        id: 2,
        title: "Система розпізнавання облич на основі OpenCV",
        description: "Курсова з комп'ютерного зору, яка демонструє використання бібліотеки OpenCV та алгоритмів машинного навчання.",
        student: "Олена Дорошенко",
        specialty: "Комп. науки",
        year: 2022,
        supervisor: "проф. Сидоренко А.П.",
        rating: 4.9,
        fileUrl: Example2
      },
      {
        id: 13,
        title: "Розробка мікроконтролерної системи",
        description: "Проектування системи автоматизації розумного дому на основі Arduino.",
        student: "Максим Шевченко",
        specialty: "Електроніка",
        year: 2023,
        supervisor: "доц. Захарченко О.П.",
        rating: 4.6,
        fileUrl: null
      },
    ];
  };

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('registrationData'));
    const faculty = storedData?.faculty?.replace(/[’]/g, "'");
    if (faculty) {
      setUserFaculty(faculty);
      const allowedSpecialties = getFacultySpecialties(faculty);
      setTimeout(() => {
        const allCourseworks = getAllCourseworks();
        const facultyCourseworks = allCourseworks.filter(work =>
          allowedSpecialties.includes(work.specialty)
        );
        setExamples(facultyCourseworks);
        setFilteredExamples(facultyCourseworks);
        setLoading(false);
      }, 500);
    } else {
      navigate('/');
    }
  }, [navigate]);

  useEffect(() => {
    let filtered = examples;
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.student.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    switch (sortBy) {
      case 'year':
        filtered.sort((a, b) => b.year - a.year);
        break;
      case 'title':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'rating':
        filtered.sort((a, b) => b.rating - a.rating);
        break;
    }
    setFilteredExamples(filtered);
  }, [examples, searchTerm, sortBy]);

  const handleDownload = (example) => {
    if (example.fileUrl) {
      const link = document.createElement('a');
      link.href = example.fileUrl;
      link.download = `${example.title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      alert('Файл недоступний для завантаження');
    }
  };

  const handlePreview = (example) => {
    if (example.fileUrl) {
      window.open(example.fileUrl, '_blank');
    } else {
      alert('Файл недоступний для перегляду');
    }
  };

  if (loading) {
    return (
      <div className="materials-page" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <div>Завантаження...</div>
      </div>
    );
  }

  return (
    <div className="materials-page" style={{ position: 'relative' }}>
      <div className="back-arrow" onClick={() => navigate("/home")}>
        ←
      </div>

      <div className="materials-header">
        <div className="header-left">
          <h1><BookOpen className="header-icon" /> Бібліотека робіт</h1>
          <p>Курсові роботи факультету: <strong>{userFaculty}</strong></p>
        </div>
        <div className="header-right">
          Знайдено: {filteredExamples.length} з {examples.length}
        </div>
      </div>

      <div className="filters">
        <div className="search-input">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Пошук за назвою або студентом..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="year">За роком</option>
          <option value="title">За назвою</option>
          <option value="rating">За рейтингом</option>
        </select>
      </div>

      <div className="materials-grid">
        {filteredExamples.map(example => (
          <div key={example.id} className="material-card">
            <div className="card-header">
              <div className="type">
                <FileText className="icon pdf" /> <span>PDF</span>
              </div>
              <div className="rating">
                <Star className="star-icon" /> {example.rating}
              </div>
            </div>
            <h3 className="material-title">{example.title}</h3>
            <div className="card-body">
              <p className="material-desc">{example.description}</p>
              <p><strong>Студент:</strong> {example.student}</p>
              <p><strong>Спеціальність:</strong> {example.specialty}</p>
              <p><strong>Керівник:</strong> {example.supervisor}</p>
              <p><strong>Рік:</strong> {example.year}</p>
            </div>
            <div className="card-footer">
              <div className="actions">
                <button onClick={() => handlePreview(example)} className="btn btn-light">
                  <Eye className="icon-sm" /> Переглянути
                </button>
                <button onClick={() => handleDownload(example)} className="btn btn-dark">
                  <Download className="icon-sm" /> Завантажити
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExamples.length === 0 && (
        <div className="empty-state">
          <BookOpen className="empty-icon" />
          <h3>Нічого не знайдено</h3>
          <p>
            {examples.length === 0
              ? `Поки що немає курсових робіт для факультету "${userFaculty}"`
              : "Спробуйте інший пошук або змініть сортування"}
          </p>
        </div>
      )}
    </div>
  );
};

export default CourseworkLibrary;