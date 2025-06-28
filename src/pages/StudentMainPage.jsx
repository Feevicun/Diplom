import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { User, Clock, LogOut, Bell, BookOpen, FolderOpen } from "lucide-react";


const logHistoryEvent = async ({ userEmail, type, description, meta = {} }) => {
  try {
    await fetch("/api/history", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userEmail, type, description, meta }),
    });
  } catch (error) {
    console.error("Failed to log history event:", error);
  }
};


const departmentTeachers = [
  { id: 1, name: "Іван Петренко", description: "Штучний інтелект, Java, алгоритми" },
  { id: 2, name: "Олена Коваленко", description: "Бази даних, SQL, хмарні технології" },
  { id: 3, name: "Наталія Бондаренко", description: "Веброзробка, JavaScript, React" },
  { id: 4, name: "Сергій Дяченко", description: "Операційні системи, Linux, C++" },
  { id: 5, name: "Марія Левченко", description: "Машинне навчання, Python, Matplotlib" },
  { id: 6, name: "Наталія Бондаренко", description: "Веброзробка, JavaScript, React" },
  { id: 7, name: "Сергій Дяченко", description: "Операційні системи, Linux, C++" },
  { id: 8, name: "Марія Левченко", description: "Машинне навчання, Python, Matplotlib" },
];

const StudentDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [courseIdea, setCourseIdea] = useState("");
  const [avatar, setAvatar] = useState(null);
  const [studentName, setStudentName] = useState(""); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [matchingTeachers, setMatchingTeachers] = useState([]);
  const [showCourseTopic, setShowCourseTopic] = useState(false);
  const [generatedTopic, setGeneratedTopic] = useState("");
  const [notificationsCount, setNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationMode, setNotificationMode] = useState("slider");
  const [currentNotification, setCurrentNotification] = useState(0);
  const [studentEmail, setStudentEmail] = useState("");

useEffect(() => {
  const storedData = JSON.parse(localStorage.getItem("registrationData")) || {};
  if (storedData.firstName) setStudentName(storedData.firstName);
  if (storedData.email) setStudentEmail(storedData.email);
  const storedAvatar = localStorage.getItem("avatar");
  if (storedAvatar) setAvatar(storedAvatar);
}, []);



const [notifications, setNotifications] = useState([
  { id: 1, read: false },
  { id: 2, read: false },
  { id: 3, read: true },
]);

  const [isClosing, setIsClosing] = useState(false);

const handleCloseDrawer = () => {
  setIsClosing(true);
  setTimeout(() => {
    setShowNotifications(false);
    setIsClosing(false);
  }, 400); // має збігатися з анімацією CSS (0.4s)
};



  // Автопрокрутка для carousel режиму
  useEffect(() => {
    if (notificationMode === "carousel" && notifications.length > 1) {
      const interval = setInterval(() => {
        setCurrentNotification((prev) => (prev + 1) % notifications.length);
      }, 4000); // кожні 4 секунди

      return () => clearInterval(interval);
    }
  }, [notificationMode, notifications]);

  // Оновлення лічильника непрочитаних
  useEffect(() => {
    const unreadCount = notifications.filter((n) => !n.read).length;
    setNotificationsCount(unreadCount);
  }, [notifications]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem("registrationData")) || {};
    if (storedData.firstName) setStudentName(storedData.firstName);
    const storedAvatar = localStorage.getItem("avatar");
    if (storedAvatar) setAvatar(storedAvatar);
  }, []);


  
const handleAvatarChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onloadend = () => {
      setAvatar(reader.result);
      localStorage.setItem("avatar", reader.result);

      // Логування зміни аватара
      logHistoryEvent({
        userEmail: studentEmail,
        type: "avatar_change",
        description: "Користувач змінив аватар",
      });
    };
    reader.readAsDataURL(file);
  }
};


  const handleTeacherClick = (teacher) => {
    setSelectedTeacher(teacher);
  };

  const handleConfirmBooking = () => {
    alert(`${t("studentDashboard.modal.book")} ${selectedTeacher.name}`);
    logHistoryEvent({
  userEmail: studentEmail,
  type: "book_teacher",
  description: `Студент забронював викладача ${selectedTeacher.name}`,
  meta: { teacher: selectedTeacher.name, topic: generatedTopic }
});

    setSelectedTeacher(null);
  };

  const handleCancelBooking = () => {
    setSelectedTeacher(null);
  };

  const handleMatchTeachers = async () => {
    try {
      const response = await fetch('/api/generate-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idea: courseIdea }),
      });

      const data = await response.json();
      setGeneratedTopic(data.topic || "Курсова робота");

      logHistoryEvent({
  userEmail: studentEmail,
  type: "generate_topic",
  description: "Студент згенерував тему курсової",
  meta: { courseIdea, generatedTopic: data.topic, recommendedTeachers: data.recommendedTeachers }
});


      const filtered = departmentTeachers.filter(t =>
        data.recommendedTeachers?.includes(t.id)
      );

      setMatchingTeachers(filtered);
      setShowCourseTopic(true);
    } catch (error) {
      console.error("Error generating topic:", error);
      setGeneratedTopic("Курсова робота");
      setMatchingTeachers([]);
      setShowCourseTopic(true);
    }
  };

  // Позначити сповіщення як прочитане
  const handleMarkAsRead = (id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Перемикання сповіщень в слайдері
  const handlePrev = () => {
    setCurrentNotification((prev) => (prev === 0 ? notifications.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setCurrentNotification((prev) => (prev + 1) % notifications.length);
  };

  return (
    <div className="student-dashboard" style={{ padding: "20px" }}>
      {/* Header */}
      <div className="student-header" style={{ marginBottom: "20px" }}>

<div style={{ display: "flex", alignItems: "center" }}>
  {/* Іконка сповіщень */}
  <div
    className="notifications-icon"
    style={{ position: "relative", cursor: "pointer" }}
    onClick={() => setShowNotifications(true)}
  >
    <Bell size={24} color="currentColor" />
    {notificationsCount > 0 && (
      <span className="notification-badge">{notificationsCount}</span>
    )}
  </div>

<div className="student-profile-wrapper" style={{ position: "relative", display: "inline-block" }}>
  {/* Профіль */}
  <div
    className="student-profile"
    onClick={() => setShowDropdown(!showDropdown)}
    style={{
      display: "flex",
      alignItems: "center",
      cursor: "pointer",
      flexWrap: "nowrap",
      minWidth: 0,
    }}
  >
    <label htmlFor="avatar-upload" className="avatar-wrapper" style={{ cursor: "pointer" }}>
      {avatar ? (
        <img src={avatar} alt="Avatar" className="avatar-img" />
      ) : (
        <div style={{
          width: "100px",
          height: "100px",
          border: "2px dashed #ccc",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#888",
          flexShrink: 0,
        }}>
          {t("studentDashboard.header.uploadPhoto")}
        </div>
      )}
      <input
        type="file"
        id="avatar-upload"
        style={{ display: "none" }}
        onChange={handleAvatarChange}
      />
    </label>

    <span
      className="student-name"
      style={{
        fontWeight: "bold",
        marginLeft: "10px",
        whiteSpace: "nowrap",
        textOverflow: "ellipsis",
        overflow: "hidden",
        maxWidth: "160px",
        transition: "all 0.3s ease",
      }}
    >
      {studentName || t("studentDashboard.header.defaultName")}
    </span>
    <span className="arrow" style={{ marginLeft: "5px" }}>&#9662;</span>
  </div>
</div>

  {/* Dropdown */}
{/* Dropdown */}
{showDropdown && (
  <div className="student-dropdown">
    <div
      className="dropdown-item"
      onClick={() => {
        logHistoryEvent({
          userEmail: studentEmail,
          type: "navigate",
          description: "Перехід до профілю",
        });
        navigate("/profile");
      }}
    >
      <User size={16} style={{ marginRight: 8 }} />
      {t("studentDashboard.header.profileDropdown.profile")}
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        logHistoryEvent({
          userEmail: studentEmail,
          type: "navigate",
          description: "Перехід до бібліотеки",
        });
        navigate("/library");
      }}
    >
      <BookOpen size={18} style={{ marginRight: 8 }} />
      {t("studentDashboard.header.profileDropdown.library")}
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        logHistoryEvent({
          userEmail: studentEmail,
          type: "navigate",
          description: "Перехід до методичних матеріалів",
        });
        navigate("/materials");
      }}
    >
      <FolderOpen size={24} style={{ marginRight: 8 }} />
      {t("studentDashboard.header.profileDropdown.materials")}
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        logHistoryEvent({
          userEmail: studentEmail,
          type: "navigate",
          description: "Перехід до історії подій",
        });
        navigate("/history");
      }}
    >
      <Clock size={16} style={{ marginRight: 8 }} />
      {t("studentDashboard.header.profileDropdown.history")}
    </div>

    <div
      className="dropdown-item"
      onClick={() => {
        logHistoryEvent({
          userEmail: studentEmail,
          type: "navigate",
          description: "Вихід з акаунта",
        });
        navigate("/authorization");
      }}
    >
      <LogOut size={16} style={{ marginRight: 8 }} />
      {t("studentDashboard.header.profileDropdown.logout")}
    </div>
  </div>
)}

</div>
</div>

      {/* Основна частина */}
      <div className="dashboard-container" style={{ display: "flex", gap: "40px", minHeight: "80vh", alignItems: "flex-start" }}>
        {/* Sidebar */}
        <div
          className="teacher-sidebar"
          style={{
            width: "250px",
            maxHeight: "90vh",
            overflowY: "auto",
            borderRight: "1px solid #ccc",
            paddingRight: "10px",
            position: "relative",
            left: "-40px", 
          }}
        >
          <h3>{t("studentDashboard.sidebar.title")}</h3>
          {departmentTeachers.map((teacher) => (
            <div
              key={teacher.id}
              className="teacher-card"
              onClick={() => handleTeacherClick(teacher)}
              style={{
                cursor: "pointer",
                border: "1px solid #ccc",
                padding: "10px",
                marginBottom: "10px",
              }}
            >
              <h4>{teacher.name}</h4>
            </div>
          ))}
        </div>

        {/* Main Content */}
        <div className="dashboard-main" style={{ flex: 1 }}>
          <h2>{t("studentDashboard.main.instruction")}</h2>
          <textarea
            className="course-input"
            value={courseIdea}
            onChange={(e) => setCourseIdea(e.target.value)}
            placeholder={t("studentDashboard.main.textareaPlaceholder")}
            style={{ width: "100%", height: "100px", marginBottom: "10px" }}
          />

          <button
            type="button"
            className="match-button"
            onClick={handleMatchTeachers}
          >
            {t("studentDashboard.main.matchButton")}
          </button>

          {showCourseTopic && generatedTopic && (
            <div style={{ marginTop: "10px", marginBottom: "20px" }}>
              <p style={{ fontWeight: "bold", marginBottom: "5px" }}>
                {t("studentDashboard.main.topicLabel")}
              </p>
              <textarea
                value={generatedTopic}
                readOnly
                style={{
                  background: "none",
                  color: "inherit",
                  border: "none",
                  opacity: 1,
                  padding: "0",
                  width: "100%",
                  fontStyle: "italic",
                  pointerEvents: "none",
                  resize: "none",
                  height: "70px",
                  lineHeight: "1",
                  overflow: "hidden",
                }}
              />
            </div>
          )}

          {matchingTeachers.length > 0 && (
            <div className="matching-results">
              <h3>{t("studentDashboard.sidebar.title")}</h3>
              {matchingTeachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="teacher-match-card"
                  onClick={() => handleTeacherClick(teacher)}
                >
                  <strong>{teacher.name}</strong>
                  <p>{teacher.description}</p>
                </div>
              ))}
            </div>
          )}

          {matchingTeachers.length === 0 && courseIdea.length > 3 && (
            <p className="no-matches">{t("studentDashboard.main.noMatches")}</p>
          )}
        </div>
      </div>

      {/* Modal for booking teacher */}
      {selectedTeacher && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{selectedTeacher.name}</h3>
            <p>{selectedTeacher.description}</p>
            <div className="modal-buttons">
              <button className="confirm-btn" onClick={handleConfirmBooking}>
                {t("studentDashboard.modal.book")}
              </button>
              <button className="cancel-btn" onClick={handleCancelBooking}>
                {t("studentDashboard.modal.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification mode selector */}
{showNotifications && (
  <div className="notification-drawer-overlay" onClick={() => setShowNotifications(false)}>
    <div
      className={`notification-drawer ${isClosing ? "closing" : ""}`}
      onClick={(e) => e.stopPropagation()}
    >
      <h3 className="drawer-title">{t("studentDashboard.notification.title")}</h3>

      <div className="notification-mode-switcher-inside">
        <label htmlFor="mode">{t("studentDashboard.notification.modeLabel")}</label>
        <select
          id="mode"
          value={notificationMode}
          onChange={(e) => setNotificationMode(e.target.value)}
        >
          <option value="slider">{t("studentDashboard.notification.modeOptions.slider")}</option>
          <option value="scroll">{t("studentDashboard.notification.modeOptions.scroll")}</option>
          <option value="carousel">{t("studentDashboard.notification.modeOptions.carousel")}</option>
        </select>
      </div>

      <div className="drawer-body">
        {notifications.length > 0 ? (
          <>
            {notificationMode === "slider" && (
              <div className="drawer-content">
                <button className="arrow-btn left" onClick={handlePrev}>←</button>
                <div className="drawer-message">
                  {t(`studentDashboard.notification.messages.${notifications[currentNotification].id}`)}
                </div>
                <button className="arrow-btn right" onClick={handleNext}>→</button>
              </div>
            )}

            {notificationMode === "scroll" && (
              <div className="drawer-scroll-list">
                {notifications.map((msg) => (
                  <div
                    key={msg.id}
                    className={`notification-item ${msg.read ? "read" : ""}`}
                    onClick={() => handleMarkAsRead(msg.id)}
                  >
                    {t(`studentDashboard.notification.messages.${msg.id}`)}
                  </div>
                ))}
              </div>
            )}

            {notificationMode === "carousel" && (
              <div className="drawer-carousel">
                {t(`studentDashboard.notification.messages.${notifications[currentNotification].id}`)}
              </div>
            )}
          </>
        ) : (
          <p className="notification-empty">{t("studentDashboard.notification.empty")}</p>
        )}
      </div>

      <div className="drawer-footer">
        <button className="drawer-close" onClick={handleCloseDrawer}>
          {t("studentDashboard.notification.close")}
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
};

export default StudentDashboard;
