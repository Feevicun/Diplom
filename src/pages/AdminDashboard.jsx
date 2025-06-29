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

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    setUsers(mockUsers);
  }, []);

  const handleDeleteUser = (id) => {
    if (window.confirm('Ви впевнені, що хочете видалити цього користувача?')) {
      setUsers(users.filter((u) => u.id !== id));
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

  const renderMaterialsTab = () => (
    <div>
      <h2 className="admin-subtitle">Матеріали</h2>
      <p>Тут буде таблиця матеріалів з кнопками для завантаження, видалення тощо.</p>
    </div>
  );

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
      <div>
        <h2 className="admin-subtitle">Аналітика</h2>
        
        {/* Статистичні картки */}
        <div className="stats-grid">
          <div className="stat-card stat-blue">
            <div className="stat-icon">📊</div>
            <div className="stat-content">
              <h3>{mockAnalytics.materialViews}</h3>
              <p>Переглядів матеріалів</p>
            </div>
          </div>
          <div className="stat-card stat-green">
            <div className="stat-icon">⬇️</div>
            <div className="stat-content">
              <h3>{mockAnalytics.downloads}</h3>
              <p>Завантажень</p>
            </div>
          </div>
          <div className="stat-card stat-purple">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>{mockAnalytics.registrations.reduce((a, b) => a + b, 0)}</h3>
              <p>Реєстрацій за тиждень</p>
            </div>
          </div>
        </div>

        {/* Графік реєстрацій */}
        <div className="chart-container">
          <h3 className="chart-title">Реєстрації за останній тиждень</h3>
          <div className="chart-wrapper">
            <div className="chart-bars">
              {mockAnalytics.registrations.map((value, idx) => (
                <div key={idx} className="bar-wrapper">
                  <div 
                    className="chart-bar"
                    style={{ 
                      height: `${(value / maxValue) * 100}%`,
                      backgroundColor: `hsl(${210 + idx * 10}, 70%, 50%)`
                    }}
                    title={`${days[idx]}: ${value} реєстрацій`}
                  >
                    <span className="bar-value">{value}</span>
                  </div>
                  <span className="bar-label">{days[idx]}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Додаткова аналітика */}
        <div className="additional-stats">
          <div className="progress-item">
            <div className="progress-header">
              <span>Активність користувачів</span>
              <span>75%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '75%'}}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-header">
              <span>Популярність матеріалів</span>
              <span>60%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '60%'}}></div>
            </div>
          </div>
          <div className="progress-item">
            <div className="progress-header">
              <span>Завершеність курсів</span>
              <span>40%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-fill" style={{width: '40%'}}></div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users': return renderUsersTab();
      case 'materials': return renderMaterialsTab();
      case 'history': return renderHistoryTab();
      case 'analytics': return renderAnalyticsTab();
      default: return null;
    }
  };

  const tabs = [
    { id: 'users', label: 'Користувачі', icon: <User size={16} /> },
    { id: 'materials', label: 'Матеріали', icon: <BookOpen size={16} /> },
    { id: 'history', label: 'Історія', icon: <FileText size={16} /> },
    { id: 'analytics', label: 'Аналітика', icon: <BarChart size={16} /> },
  ];

  return (
    <div className="admin-container">
      <h1 className="admin-title">Панель адміністратора</h1>
      <div className="admin-tabs">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`tab-button ${activeTab === id ? 'active' : ''}`}
          >
            {icon} <span>{label}</span>
          </button>
        ))}
      </div>
      <div className="admin-content">{renderTabContent()}</div>
      
      <style jsx>{`
        /* Статистичні картки */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .stat-card {
          background: white;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          display: flex;
          align-items: center;
          gap: 15px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        
        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.15);
        }
        
        .stat-blue { border-left: 5px solid #4285f4; }
        .stat-green { border-left: 5px solid #34a853; }
        .stat-purple { border-left: 5px solid #9c27b0; }
        
        .stat-icon {
          font-size: 2.5rem;
          opacity: 0.8;
        }
        
        .stat-content h3 {
          font-size: 2rem;
          font-weight: bold;
          margin: 0;
          color: #333;
        }
        
        .stat-content p {
          margin: 5px 0 0 0;
          color: #666;
          font-size: 0.9rem;
        }
        
        /* Графік */
        .chart-container {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }
        
        .chart-title {
          font-size: 1.2rem;
          font-weight: 600;
          color: #333;
          margin: 0 0 20px 0;
        }
        
        .chart-wrapper {
          background: #f8f9fa;
          border-radius: 8px;
          padding: 20px;
          border: 1px solid #e9ecef;
        }
        
        .chart-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-around;
          height: 200px;
          gap: 10px;
        }
        
        .bar-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex: 1;
          max-width: 60px;
        }
        
        .chart-bar {
          width: 100%;
          min-height: 20px;
          border-radius: 4px 4px 0 0;
          position: relative;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          padding-bottom: 5px;
        }
        
        .chart-bar:hover {
          opacity: 0.8;
          transform: scale(1.05);
        }
        
        .bar-value {
          color: white;
          font-size: 0.8rem;
          font-weight: bold;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }
        
        .bar-label {
          margin-top: 8px;
          font-size: 0.85rem;
          color: #666;
          font-weight: 500;
        }
        
        /* Додаткова аналітика */
        .additional-stats {
          background: white;
          border-radius: 12px;
          padding: 25px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        
        .progress-item {
          margin-bottom: 20px;
        }
        
        .progress-item:last-child {
          margin-bottom: 0;
        }
        
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
          font-size: 0.9rem;
        }
        
        .progress-header span:first-child {
          color: #333;
          font-weight: 500;
        }
        
        .progress-header span:last-child {
          color: #4285f4;
          font-weight: bold;
        }
        
        .progress-bar {
          height: 8px;
          background: #e9ecef;
          border-radius: 4px;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4, #34a853);
          border-radius: 4px;
          transition: width 0.8s ease;
        }
      `}</style>
    </div>
  );
}