import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../styles/DeleteAccount.css';

function DeleteAccount() {
  const { t } = useTranslation();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const navigate = useNavigate();

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const handleRoleSelect = (value) => {
    setRole(value);
    setDropdownOpen(false);
    setFieldErrors((prev) => ({ ...prev, role: '' }));
  };

  const validate = () => {
    const errors = {};
    if (!email) {
      errors.email = t('deleteAccount.errors.emailRequired');
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = t('deleteAccount.errors.emailInvalid');
    }
    if (!role) {
      errors.role = t('deleteAccount.errors.roleRequired');
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    if (!validate()) return;

    setSuccessMessage(
      t('deleteAccount.successMessage', {
        email,
        role: t(`deleteAccount.roles.${role}`)
      })
    );

    setFieldErrors({});
    setEmail('');
    setRole('');
  };

  return (
    <div className="delete-account-container">
      {successMessage && <div className="message-success"><p>{successMessage}</p></div>}
      {errorMessage && <div className="message-error"><p>{errorMessage}</p></div>}

      <h2>{t('deleteAccount.title')}</h2>

      <form className="delete-account-form" onSubmit={handleSubmit}>
        {/* Email */}
        <div className="form-group" style={{ position: 'relative' }}>
          <input
            type="email"
            className={fieldErrors.email ? 'input-error' : ''}
            placeholder={t('deleteAccount.emailPlaceholder')}
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors((prev) => ({ ...prev, email: '' }));
            }}
          />
          {fieldErrors.email && <div className="error-tooltip">{fieldErrors.email}</div>}
        </div>

        {/* Dropdown */}
        <div className="form-group" style={{ position: 'relative' }}>
          <div
            className={`custom-dropdown ${fieldErrors.role ? 'input-error' : ''}`}
            onClick={toggleDropdown}
          >
            <div className="selected-option">
              {role ? t(`deleteAccount.roles.${role}`) : t('deleteAccount.selectRole')}
            </div>
            {dropdownOpen && (
              <div className="dropdown-options">
                <div onClick={() => handleRoleSelect('teacher')}>
                  {t('deleteAccount.roles.teacher')}
                </div>
                <div onClick={() => handleRoleSelect('student')}>
                  {t('deleteAccount.roles.student')}
                </div>
              </div>
            )}
          </div>
          {fieldErrors.role && <div className="error-tooltip">{fieldErrors.role}</div>}
        </div>

        <button type="submit" className="delete-account-button">
          {t('deleteAccount.button')}
        </button>
      </form>

      <p className="back-text">
        {t('deleteAccount.backText')}{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            navigate('/authorization');
          }}
          className="link"
        >
          {t('deleteAccount.authPage')}
        </a>
      </p>
    </div>
  );
}

export default DeleteAccount;
