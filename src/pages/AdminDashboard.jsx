import React, { useState, useEffect } from 'react';
import { User, BookOpen, FileText, BarChart, Trash2, Edit } from 'lucide-react';

const mockUsers = [
  { id: 1, name: 'Іван Коваль', email: 'ivan@example.com', role: 'Student' },
  { id: 2, name: 'Олена Дорошенко', email: 'olena@example.com', role: 'Teacher' },
];

const mockAnalytics = {
  registrations: [5, 12, 9, 7, 14, 10, 6], // щоденні реєстрації за тиждень
  materialViews: 80,
  downloads: 45,
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users');
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Симуляція завантаження користувачів
    setUsers(mockUsers);
  }, []);

  const handleDeleteUser = (id) => {
    const confirmed = window.confirm('Ви впевнені, що хочете видалити цього користувача?');
    if (confirmed) {
      setUsers(users.filter((u) => u.id !== id));
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'users':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Користувачі системи</h2>
            <table className="w-full border text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 text-left">Ім'я</th>
                  <th className="p-2 text-left">Email</th>
                  <th className="p-2 text-left">Роль</th>
                  <th className="p-2 text-left">Дії</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-t">
                    <td className="p-2">{user.name}</td>
                    <td className="p-2">{user.email}</td>
                    <td className="p-2">{user.role}</td>
                    <td className="p-2 flex gap-2">
                      <button
                        className="text-blue-600 hover:underline flex items-center gap-1"
                        onClick={() => alert('Редагувати')}
                      >
                        <Edit size={14} /> Редагувати
                      </button>
                      <button
                        className="text-red-600 hover:underline flex items-center gap-1"
                        onClick={() => handleDeleteUser(user.id)}
                      >
                        <Trash2 size={14} /> Видалити
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'materials':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Матеріали</h2>
            <p>Тут буде таблиця матеріалів з кнопками для завантаження, видалення тощо.</p>
          </div>
        );
      case 'history':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Журнал дій</h2>
            <p>Тут можна буде бачити лог активностей користувачів, таких як входи, перегляди, завантаження.</p>
          </div>
        );
      case 'analytics':
        return (
          <div>
            <h2 className="text-xl font-semibold mb-4">Аналітика</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-100 rounded shadow">
                <p className="text-sm text-gray-700">Переглядів матеріалів</p>
                <p className="text-2xl font-bold">{mockAnalytics.materialViews}</p>
              </div>
              <div className="p-4 bg-green-100 rounded shadow">
                <p className="text-sm text-gray-700">Завантажень</p>
                <p className="text-2xl font-bold">{mockAnalytics.downloads}</p>
              </div>
              <div className="p-4 bg-purple-100 rounded shadow">
                <p className="text-sm text-gray-700">Реєстрації за тиждень</p>
                <p className="text-2xl font-bold">
                  {mockAnalytics.registrations.reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </div>
            <div className="mt-6">
              <p className="mb-2 font-medium">Реєстрації за останній тиждень</p>
              <div className="flex gap-2 items-end h-32">
                {mockAnalytics.registrations.map((value, idx) => (
                  <div
                    key={idx}
                    className="bg-blue-500 w-6 rounded"
                    style={{ height: `${value * 6}px` }}
                    title={`День ${idx + 1}: ${value}`}
                  />
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const tabs = [
    { id: 'users', label: 'Користувачі', icon: <User size={16} /> },
    { id: 'materials', label: 'Матеріали', icon: <BookOpen size={16} /> },
    { id: 'history', label: 'Історія', icon: <FileText size={16} /> },
    { id: 'analytics', label: 'Аналітика', icon: <BarChart size={16} /> },
  ];

  return (
    <div className="admin-dashboard p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Панель адміністратора</h1>

      <div className="tabs flex flex-wrap gap-3 mb-6">
        {tabs.map(({ id, label, icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded transition ${
              activeTab === id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      <div className="bg-white p-5 rounded shadow border">{renderTabContent()}</div>
    </div>
  );
}
