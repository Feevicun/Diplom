import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';

export default function Authorization() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [errors, setErrors] = useState({});
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  

  const navigate = useNavigate();
  const { login } = useAuth();


  const switchToLogin = () => {
    setActiveTab('login');
    setErrors({});
  };

  const switchToRegister = () => {
    setActiveTab('register');
    setErrors({});
  };

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const selectRole = (role) => {
    setSelectedRole(role);
    setDropdownOpen(false);
  };

const handleLogin = async () => {
  let newErrors = {};

  if (!selectedRole) newErrors.role = t('authorization.errors.role');
  if (!loginEmail.trim()) newErrors.loginEmail = t('authorization.errors.loginEmail');
  if (!loginPassword.trim()) newErrors.loginPassword = t('authorization.errors.loginPassword');

  setErrors(newErrors);
  if (Object.keys(newErrors).length > 0) return;

  try {
    const response = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: loginEmail,
        password: loginPassword,
        role: selectedRole,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      login({
        email: loginEmail,
        name: data.name,
        role: selectedRole,
      });
      navigate(selectedRole === 'Student' ? '/home' : '/sthome');
    } else {
      alert(data.message);
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong.");
  }
};


  const handleRegister = async () => {
    let newErrors = {};

    if (!selectedRole) newErrors.role = t('authorization.errors.role');
    if (!registerName.trim()) newErrors.registerName = t('authorization.errors.registerName');
    if (!registerEmail.trim()) newErrors.registerEmail = t('authorization.errors.registerEmail');
    else if (!/\S+@\S+\.\S+/.test(registerEmail)) newErrors.registerEmail = t('authorization.errors.registerEmailFormat');
    if (!registerPassword.trim()) newErrors.registerPassword = t('authorization.errors.registerPassword');
    else if (registerPassword.length < 6) newErrors.registerPassword = t('authorization.errors.registerPasswordLength');

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      const response = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: selectedRole,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Check your email for verification.");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Registration error:", error);
      alert("Something went wrong.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form">
        <h2>{t('authorization.title')}</h2>

        {/* Dropdown */}
        <div className="form-group" style={{ position: 'relative' }}>
          <p>{t('authorization.selectRole')}</p>
          <div className={`custom-dropdown ${errors.role ? 'input-error' : ''}`} onClick={toggleDropdown}>
            <div className="selected-option">
              {selectedRole ? t(`authorization.roles.${selectedRole.toLowerCase()}`) : t('authorization.selectPlaceholder')}
            </div>
            {dropdownOpen && (
              <div className="dropdown-options">
                <div onClick={() => selectRole('Student')}>{t('authorization.roles.student')}</div>
                <div onClick={() => selectRole('Teacher')}>{t('authorization.roles.teacher')}</div>
              </div>
            )}
          </div>
          {errors.role && <div className="error-tooltip">{errors.role}</div>}
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button className={activeTab === 'login' ? 'active' : ''} onClick={switchToLogin}>
            {t('authorization.tabs.login')}
          </button>
          <button className={activeTab === 'register' ? 'active' : ''} onClick={switchToRegister}>
            {t('authorization.tabs.register')}
          </button>
          <div className="bar" style={{ left: activeTab === 'login' ? '0' : '50%' }} />
        </div>

        <div className="form-content">
          {/* Login Form */}
          <div className={`form login-form ${activeTab === 'login' ? 'active' : ''}`}>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="email"
                className={errors.loginEmail ? 'input-error' : ''}
                placeholder={t('authorization.login.emailPlaceholder')}
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
              />
              {errors.loginEmail && <div className="error-tooltip">{errors.loginEmail}</div>}
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="password"
                className={errors.loginPassword ? 'input-error' : ''}
                placeholder={t('authorization.login.passwordPlaceholder')}
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
              />
              {errors.loginPassword && <div className="error-tooltip">{errors.loginPassword}</div>}
            </div>
            <button type="submit" onClick={handleLogin}>
              {t('authorization.login.button')}
            </button>
            <p>
              {t('authorization.login.noAccount')}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchToRegister(); }}>
                {t('authorization.login.registerLink')}
              </a>
            </p>
            <p>
              {t('authorization.login.forgetPassword')}{' '}
              <a href="#" onClick={(e) => {
                e.preventDefault();
                navigate('/delete');
              }}>
                {t('authorization.login.resetLink')}
              </a>
            </p>
          </div>

          {/* Register Form */}
          <div className={`form register-form ${activeTab === 'register' ? 'active' : ''}`}>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="text"
                className={errors.registerName ? 'input-error' : ''}
                placeholder={t('authorization.register.namePlaceholder')}
                value={registerName}
                onChange={(e) => setRegisterName(e.target.value)}
              />
              {errors.registerName && <div className="error-tooltip">{errors.registerName}</div>}
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="email"
                className={errors.registerEmail ? 'input-error' : ''}
                placeholder={t('authorization.register.emailPlaceholder')}
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
              />
              {errors.registerEmail && <div className="error-tooltip">{errors.registerEmail}</div>}
            </div>
            <div className="form-group" style={{ position: 'relative' }}>
              <input
                type="password"
                className={errors.registerPassword ? 'input-error' : ''}
                placeholder={t('authorization.register.passwordPlaceholder')}
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
              />
              {errors.registerPassword && <div className="error-tooltip">{errors.registerPassword}</div>}
            </div>
            <button type="submit" onClick={handleRegister}>
              {t('authorization.register.button')}
            </button>
            <p>
              {t('authorization.register.haveAccount')}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); switchToLogin(); }}>
                {t('authorization.register.loginLink')}
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
