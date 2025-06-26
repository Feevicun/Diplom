import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import './i18n';
import './styles/authorization.css';
import './styles/DeleteAccount.css';
import './styles/loadingscreen.css';
import './styles/StudentMainPage.css';
import './styles/registration.css';
import './styles/ThemeSwitcher.css';
import './styles/TeacherMainPage.css';
import './styles/profile.css';
import './styles/MethodicalMaterials.css';
import './styles/CourseworkLibrary.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
