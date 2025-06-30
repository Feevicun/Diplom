import React, { useState, useEffect } from 'react';
import { User, BookOpen, FileText, BarChart, Trash2, Edit } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Іван Коваль', email: 'ivan@example.com', role: 'Student' },
  { id: 2, name: 'Олена Дорошенко', email: 'olena@example.com', role: 'Teacher' },
];

const mockAnalytics = {
  registrations: [5, 12, 9, 7, 14, 10, 6],
  materialViews: 80,
  downloads: 45,
};

const categories = ['Програмування', 'Методологія', 'Оформлення', 'Ресурси', 'Захист', 'Перевірка'];
const types = ['PDF', 'Відео', 'DOCX', 'PPTX', 'Посилання'];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [filter, setFilter] = useState('');
  const [animated, setAnimated] = useState(false);

  // Форма додавання матеріалу
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [author, setAuthor] = useState('');
  const [authorAvatar, setAuthorAvatar] = useState('');
  const [category, setCategory] = useState(categories[0]);
  const [type, setType] = useState(types[0]);
  const [uploadDate, setUploadDate] = useState(new Date().toISOString().slice(0, 10));
  const [tags, setTags] = useState('');
  const [size, setSize] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [rating, setRating] = useState(5);
  const [downloads, setDownloads] = useState(0);

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  useEffect(() => {
    // Завантажити матеріали з бекенда
    fetch('/api/materials')
      .then(res => res.json())
      .then(data => setMaterials(data))
      .catch(err => console.error('Помилка завантаження матеріалів:', err));
  }, []);

  useEffect(() => {
    if (activeTab === 'analytics') {
      setTimeout(() => setAnimated(true), 100);
    } else {
      setAnimated(false);
    }
  }, [activeTab]);

  const handleDeleteUser = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFileUrl(URL.createObjectURL(file));
    setSize(`${(file.size / 1024 / 1024).toFixed(2)} MB`);
  };

  // Оновлений додавання матеріалу: POST на сервер
  const handleAddMaterial = async () => {
    if (!title || !fileUrl) {
      alert('Вкажіть назву та завантажте файл!');
      return;
    }

    const newMaterial = {
      title,
      description,
      author,
      authorAvatar,
      category,
      type,
      uploadDate,
      tags: tags.split(',').map(t => t.trim()).filter(Boolean),
      size,
      fileUrl,
      rating,
      downloads,
    };

    try {
      const response = await fetch('/api/materials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newMaterial),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert('Помилка додавання матеріалу: ' + errorData.message);
        return;
      }

      const result = await response.json();

      // Оновити локальний стейт матеріалів
      setMaterials(prev => [result.material, ...prev]);

      // Очистити форму
      setTitle('');
      setDescription('');
      setAuthor('');
      setAuthorAvatar('');
      setCategory(categories[0]);
      setType(types[0]);
      setUploadDate(new Date().toISOString().slice(0, 10));
      setTags('');
      setSize('');
      setFileUrl('');
      setRating(5);
      setDownloads(0);
    } catch (error) {
      alert('Помилка мережі або сервера: ' + error.message);
    }
  };

  // Оновлений видалення матеріалу: DELETE на сервер
  const handleDeleteMaterial = async (id) => {
    if (window.confirm('Видалити цей матеріал?')) {
      try {
        const response = await fetch(`/api/materials/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          const errorData = await response.json();
          alert('Помилка видалення матеріалу: ' + errorData.message);
          return;
        }
        setMaterials(prev => prev.filter(mat => mat.id !== id));
      } catch (error) {
        alert('Помилка мережі або сервера: ' + error.message);
      }
    }
  };

  const renderUsersTab = () => (
    <div>
      <h2 className="admin-subtitle">Користувачі системи</h2>
      <table className="admin-table">
        <thead>
          <tr>
            <th>Ім'я</th>
            <th>Email</th>
            <th>Роль</th>
            <th>Дії</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.name}</td>
              <td>{user.email}</td>
              <td>{user.role}</td>
              <td>
                <button className="edit-btn" onClick={() => alert('Редагувати')}>
                  <Edit size={14} /> Редагувати
                </button>
                <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>
                  <Trash2 size={14} /> Видалити
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const renderMaterialsTab = () => {
    const filteredMaterials = materials.filter((mat) =>
      mat.title.toLowerCase().includes(filter.toLowerCase())
    );

    return (
      <div>
        <h2 className="admin-subtitle">Матеріали</h2>

        <div style={{ marginBottom: 16 }}>
          <input type="file" onChange={handleFileChange} />
        </div>

        <input
          type="text"
          placeholder="Пошук за назвою..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            marginBottom: 16,
            width: '100%',
            maxWidth: 300,
          }}
        />

        {/* Форма додавання матеріалу */}
        <div style={{ marginBottom: 24, maxWidth: 600 }}>
          <input
            type="text"
            placeholder="Назва"
            value={title}
            onChange={e => setTitle(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <textarea
            placeholder="Опис"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            type="text"
            placeholder="Автор"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            type="text"
            placeholder="Посилання на аватар автора"
            value={authorAvatar}
            onChange={e => setAuthorAvatar(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <label>Категорія:</label>
          <select
            value={category}
            onChange={e => setCategory(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          >
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <label>Тип:</label>
          <select
            value={type}
            onChange={e => setType(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          >
            {types.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <label>Дата завантаження:</label>
          <input
            type="date"
            value={uploadDate}
            onChange={e => setUploadDate(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <input
            type="text"
            placeholder="Теги через кому"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ width: '100%', marginBottom: 10, padding: 8 }}
          />
          <label>Рейтинг (1-5):</label>
          <input
            type="number"
            min="1"
            max="5"
            value={rating}
            onChange={e => setRating(Number(e.target.value))}
            style={{ width: 60, marginBottom: 10, padding: 8 }}
          />
          <label>Завантажень:</label>
          <input
            type="number"
            min="0"
            value={downloads}
            onChange={e => setDownloads(Number(e.target.value))}
            style={{ width: 100, marginBottom: 10, padding: 8 }}
          />

          {size && <div>Розмір файлу: {size}</div>}

          <button
            onClick={handleAddMaterial}
            style={{ padding: '10px 20px', cursor: 'pointer', marginTop: 10 }}
          >
            Додати матеріал
          </button>
        </div>

        {filteredMaterials.length === 0 ? (
          <p>Немає матеріалів.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Назва</th>
                <th>Автор</th>
                <th>Категорія</th>
                <th>Тип</th>
                <th>Дата</th>
                <th>Рейтинг</th>
                <th>Завантажень</th>
                <th>Дії</th>
              </tr>
            </thead>
            <tbody>
              {filteredMaterials.map((mat) => (
                <tr key={mat.id}>
                  <td>{mat.title}</td>
                  <td>{mat.author}</td>
                  <td>{mat.category}</td>
                  <td>{mat.type}</td>
                  <td>{mat.uploadDate}</td>
                  <td>{mat.rating}</td>
                  <td>{mat.downloads}</td>
                  <td>
                    <a
                      href={mat.fileUrl}
                      download={mat.title}
                      className="edit-btn"
                      style={{ marginRight: 8 }}
                    >
                      Завантажити
                    </a>
                    <button className="delete-btn" onClick={() => handleDeleteMaterial(mat.id)}>
                      Видалити
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const renderHistoryTab = () => (
    <div>
      <h2 className="admin-subtitle">Журнал дій</h2>
      <p>Тут буде журнал активностей: входи, перегляди, завантаження.</p>
    </div>
  );

  const renderAnalyticsTab = () => {
    const maxValue = Math.max(...mockAnalytics.registrations);
    const days = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];

    return (
      <div className={animated ? 'fade-in' : ''}>
        <h2 className="admin-subtitle">Аналітика</h2>

        <div className="stats-grid">
          <div className={`stat-card ${animated ? 'animate' : ''}`}>
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{mockAnalytics.materialViews}</h3>
              <p style={{ color: 'var(--text-color)' }}>Переглядів матеріалів</p>
            </div>
          </div>
          <div className={`stat-card ${animated ? 'animate' : ''}`}>
            <div className="stat-icon">⬇️</div>
            <div className="stat-content">
              <h3>{mockAnalytics.downloads}</h3>
              <p style={{ color: 'var(--text-color)' }}>Завантажень</p>
            </div>
          </div>
          <div className={`stat-card ${animated ? 'animate' : ''}`}>
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{mockAnalytics.registrations.reduce((a, b) => a + b, 0)}</h3>
              <p style={{ color: 'var(--text-color)' }}>Реєстрацій за тиждень</p>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 24 }}>
          <h3>Реєстрації за останній тиждень</h3>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: 200, gap: 12 }}>
            {mockAnalytics.registrations.map((value, idx) => {
              const heightPercent = (value / maxValue) * 100;
              return (
                <div key={idx} style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      height: `${heightPercent}%`,
                      width: 30,
                      backgroundColor: 'var(--primary-color)',
                      borderRadius: 4,
                      transition: 'height 0.5s',
                    }}
                  />
                  <div style={{ marginTop: 6 }}>{days[idx]}</div>
                  <div style={{ fontSize: 12 }}>{value}</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="admin-panel" style={{ backgroundColor: '#fff', color: '#000', padding: 24 }}>
      <h1 className="admin-title">Адмін панель курсів</h1>

      <nav className="admin-tabs" style={{ marginBottom: 24, display: 'flex', gap: 20 }}>
        <button
          className={activeTab === 'users' ? 'active' : ''}
          onClick={() => setActiveTab('users')}
          style={{ cursor: 'pointer' }}
        >
          Користувачі
        </button>
        <button
          className={activeTab === 'materials' ? 'active' : ''}
          onClick={() => setActiveTab('materials')}
          style={{ cursor: 'pointer' }}
        >
          Матеріали
        </button>
        <button
          className={activeTab === 'history' ? 'active' : ''}
          onClick={() => setActiveTab('history')}
          style={{ cursor: 'pointer' }}
        >
          Журнал дій
        </button>
        <button
          className={activeTab === 'analytics' ? 'active' : ''}
          onClick={() => setActiveTab('analytics')}
          style={{ cursor: 'pointer' }}
        >
          Аналітика
        </button>
      </nav>

      <section className="admin-content">
        {activeTab === 'users' && renderUsersTab()}
        {activeTab === 'materials' && renderMaterialsTab()}
        {activeTab === 'history' && renderHistoryTab()}
        {activeTab === 'analytics' && renderAnalyticsTab()}
      </section>
    </main>
  );
}
