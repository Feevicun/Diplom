import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

function CustomDropdown({ options, selected, onChange, placeholder, error }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    onChange(option);
    setOpen(false);
  };

  return (
    <div className="form-group" style={{ position: 'relative' }}>
      <div
        className={`custom-dropdown mainpage-input ${error ? 'input-error' : ''}`}
        ref={dropdownRef}
        onClick={() => setOpen(!open)}
        tabIndex={0}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{ padding: '10px', cursor: 'pointer' }}
      >
        <div className="selected-option">{selected || placeholder}</div>
        {open && (
          <div className="dropdown-options" role="listbox">
            {options.map((opt, i) => (
              <div
                key={i}
                onClick={() => handleOptionClick(opt)}
                role="option"
                aria-selected={selected === opt}
              >
                {opt}
              </div>
            ))}
          </div>
        )}
      </div>
      {error && <div className="error-tooltip">{error}</div>}
    </div>
  );
}

export default function RegistrationForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [surname, setSurname] = useState('');
  const [firstName, setFirstName] = useState('');
  const [course, setCourse] = useState('');
  const [group, setGroup] = useState('');
  const [faculty, setFaculty] = useState('');
  const [department, setDepartment] = useState('');
  const [email] = useState('');
  const [registrationMessage, setRegistrationMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  const facultiesWithDepartments = {
    "Біологічний факультет": [
      "біофізики та біоінформатики",
      "біохімії",
      "ботаніки",
      "генетики та біотехнології",
      "екології",
      "зоології",
      "мікробіології",
    ],
    "Географічний факультет": [
      "Географії України",
      "Геоекології і фізичної географії",
      "Геоморфології i палеогеографії",
      "Готельно-ресторанної справи та харчових технологій",
      "Туризму"
    ],
    "Геологічний факультет": [
      "геології корисних копалин і геофізики",
      "екологічної та інженерної геології і гідрогеології",
      "загальної та історичної геології і палеонтології",
      "мінералогії, петрографії і геохімії"
    ],
    "Економічний факультет": [
      "Аналітичної економії та міжнародної економіки",
      "Економіки підприємства",
      "Економічної кібернетики",
      "Маркетингу",
      "Менеджменту",
      "Обліку і аудиту",
      "Статистики"
    ],
    "Факультет електроніки та комп'ютерних технологій": [
      "оптоелектроніки та інформаційних технологій",
      "радіоелектронних і комп'ютерних систем",
      "радіофізики та комп'ютерних технологій",
      "системного проектування"
    ],
    "Факультет журналістики": [
      "Зарубiжної преси та iнформацiї",
      "Мови засобiв масової iнформації",
      "Української преси"
    ],
    "Факультет іноземних мов": [
      "англійської філології",
      "класичної філології",
      "німецької філології",
      "світової літератури",
      "французької та іспанської філологій",
      "міжкультурної комунікації та перекладу"
    ],
    "Історичний факультет": [
      "Cоціології",
      "Етнології",
      "Світової історії модерного часу",
      "Давньої історії України та спеціальних галузей історичної науки",
      "Історичного краєзнавства"
    ],
    "Факультет культури і мистецтв": [
      "Музичного мистецтва",
      "Режисури та хореографії",
      "Соціокультурного менеджменту",
      "Театрознавства та акторської майстерності"
    ],
    "Механіко-математичний факультет": [
      "Вищої математики",
      "Математичної статистики і диференціальних рівнянь",
      "Механіки",
      "Теорії функцій і функціонального аналізу",
      "Алгебри, топології та основ математики"
    ],
    "Факультет міжнародних відносин": [
      "європейського права",
      "міжнародних відносин і дипломатичної служби",
      "міжнародних економічних відносин",
      "міжнародного права",
      "міжнародної безпеки та стратегічних студій"
    ],
    "Факультет педагогічної освіти": [
      "загальної педагогіки та педагогіки вищої школи",
      "початкової та дошкільної освіти",
      "соціальної педагогіки та соціальної роботи"
    ],
    "Факультет прикладної математики та інформатики": [
      "Дискретного аналізу та інтелектуальних систем",
      "Інформаційних систем",
      "Кібербезпеки",
      "Прикладної математики",
      "Програмування"
    ],
    "Факультет управління фінансами та бізнесу": [
      "Економіки та публічного управління",
      "Обліку, аналізу і контролю",
      "Фінансових технологій та консалтингу",
      "Фінансового менеджменту",
      "Цифрової економіки та бізнес-аналітики"
    ],
    "Фізичний факультет": [
      "Астрофізики",
      "Експериментальної фізики",
      "Загальної фізики",
      "Фізики металів"
    ],
    "Філологічний факультет": [
      "загального мовознавства",
      "польської філології",
      "слов'янської філології",
      "сходознавства",
      "української літератури"
    ],
    "Філософський факультет": [
      "Історії філософії",
      "Політології",
      "Психології",
      "Теорії та історії культури",
      "Філософії"
    ],
    "Хімічний факультет": [
      "Аналітичної хімії",
      "Органічної хімії",
      "Неорганічної хімії"
    ],
    "Юридичний факультет": [
      "Адміністративного та фінансового права",
      "Конституційного права",
      "Кримінального процесу і криміналістики",
      "Соціального права",
      "Цивільного права та процесу"
    ]
  };

   const validate = () => {
    const errors = {};
    if (!surname) errors.surname = t("registration.errors.surname");
    if (!firstName) errors.firstName = t("registration.errors.firstName");
    if (!course) errors.course = t("registration.errors.course");
    if (!group) errors.group = t("registration.errors.group");
    if (!faculty) errors.faculty = t("registration.errors.faculty");
    if (!department) errors.department = t("registration.errors.department");
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setRegistrationMessage('');

    if (!validate()) return;

    const registrationData = {
      surname,
      firstName,
      course,
      group,
      faculty,
      department,
      email,
    };

    localStorage.setItem('registrationData', JSON.stringify(registrationData));
    setRegistrationMessage(t("registration.successMessage", { firstName, surname }));
    setFieldErrors({});
    navigate('/home');
  };

  return (
    <div className="mainpage-container">
      <form onSubmit={handleSubmit} className="mainpage-form">
        <h2 className="mainpage-title">{t("registration.title")}</h2>

        <div className="mainpage-form-group mainpage-split-inputs">
          <div className="form-group" style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder={t("registration.placeholders.surname")}
              value={surname}
              onChange={(e) => {
                setSurname(e.target.value);
                setFieldErrors((prev) => ({ ...prev, surname: '' }));
              }}
              className={`mainpage-input ${fieldErrors.surname ? 'input-error' : ''}`}
            />
            {fieldErrors.surname && <div className="error-tooltip">{fieldErrors.surname}</div>}
          </div>

          <div className="form-group" style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder={t("registration.placeholders.firstName")}
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFieldErrors((prev) => ({ ...prev, firstName: '' }));
              }}
              className={`mainpage-input ${fieldErrors.firstName ? 'input-error' : ''}`}
            />
            {fieldErrors.firstName && <div className="error-tooltip">{fieldErrors.firstName}</div>}
          </div>
        </div>

        <label className="mainpage-label">{t("registration.placeholders.faculty")}</label>
        <CustomDropdown
          options={Object.keys(facultiesWithDepartments)}
          selected={faculty}
          onChange={(value) => {
            setFaculty(value);
            setDepartment('');
            setFieldErrors((prev) => ({ ...prev, faculty: '' }));
          }}
          placeholder={t("registration.placeholders.chooseFaculty")}
          error={fieldErrors.faculty}
        />

        {faculty && (
          <>
            <label className="mainpage-label">{t("registration.placeholders.department")}</label>
            <CustomDropdown
              options={facultiesWithDepartments[faculty]}
              selected={department}
              onChange={(value) => {
                setDepartment(value);
                setFieldErrors((prev) => ({ ...prev, department: '' }));
              }}
              placeholder={t("registration.placeholders.chooseDepartment")}
              error={fieldErrors.department}
            />
          </>
        )}

        <div className="mainpage-form-group mainpage-split-inputs">
          <div className="form-group" style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder={t("registration.placeholders.course")}
              value={course}
              onChange={(e) => {
                setCourse(e.target.value);
                setFieldErrors((prev) => ({ ...prev, course: '' }));
              }}
              className={`mainpage-input ${fieldErrors.course ? 'input-error' : ''}`}
            />
            {fieldErrors.course && <div className="error-tooltip">{fieldErrors.course}</div>}
          </div>

          <div className="form-group" style={{ position: 'relative', flex: 1 }}>
            <input
              type="text"
              placeholder={t("registration.placeholders.group")}
              value={group}
              onChange={(e) => {
                setGroup(e.target.value);
                setFieldErrors((prev) => ({ ...prev, group: '' }));
              }}
              className={`mainpage-input ${fieldErrors.group ? 'input-error' : ''}`}
            />
            {fieldErrors.group && <div className="error-tooltip">{fieldErrors.group}</div>}
          </div>
        </div>

        <button type="submit" className="mainpage-button">{t("registration.button")}</button>

        {registrationMessage && (
          <div className="registration-message">{registrationMessage}</div>
        )}
      </form>
    </div>
  );
}