import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Тимчасові дані для студентів, які забронювали місце
const mockBookings = [
  {
    id: 1,
    studentName: "Вікторія",
    courseIdea: "Інтелектуальні агенти для розпізнавання мови",
  },
  {
    id: 2,
    studentName: "Олег",
    courseIdea: "Хмарне зберігання даних та безпека",
  },
];

const TeacherDashboard = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [teacherName, setTeacherName] = useState("Олена Коваленко");
  const [avatar, setAvatar] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [students, setStudents] = useState(mockBookings);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="teacher-dashboard">
      {/* Header */}
      <div className="teacher-header">
        <div
          className="teacher-profile"
          onClick={() => setShowDropdown(!showDropdown)}
        >
          <label htmlFor="avatar-upload" className="avatar-wrapper">
            <img
              src={avatar || "/default-avatar.png"}
              alt="Avatar"
              className="avatar-img"
            />
            <input
              type="file"
              id="avatar-upload"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
          <span className="teacher-name">{teacherName}</span>
          <span className="arrow">&#9662;</span>
        </div>

        {showDropdown && (
          <div className="teacher-dropdown">
            <div
              className="dropdown-item"
              onClick={() => navigate("/profile")}
            >
              {t("teacherDashboard.profileMenu.myProfile")}
            </div>
            <div className="dropdown-item">
              {t("teacherDashboard.profileMenu.calendar")}
            </div>
            <div
              className="dropdown-item"
              onClick={() => navigate("/authorization")}
            >
              {t("teacherDashboard.profileMenu.logout")}
            </div>
          </div>
        )}
      </div>

      {/* Main content */}
      <div className="dashboard-content">
        <h2>{t("teacherDashboard.bookedStudentsTitle")}</h2>

        {students.length > 0 ? (
          students.map((student) => (
            <div
              className="student-card"
              key={student.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "6px",
                padding: "12px",
                marginBottom: "10px",
                backgroundColor: "#f9f9f9",
              }}
            >
              <h4>{t("teacherDashboard.studentCard.student", { name: student.studentName })}</h4>
              <p>
                <strong>{t("teacherDashboard.studentCard.courseIdea")}</strong>{" "}
                {student.courseIdea}
              </p>
              <div style={{ marginTop: "8px" }}>
                <button style={{ marginRight: "10px" }}>
                  {t("teacherDashboard.studentCard.accept")}
                </button>
                <button>
                  {t("teacherDashboard.studentCard.reject")}
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>{t("teacherDashboard.noBookedStudents")}</p>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard;
