import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TeacherProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(null);
  const [name, setName] = useState("Вікторія");
  const [surname, setSurname] = useState("Іванова");
  const [email, setEmail] = useState("viktoria@example.com");
  const [faculty, setFaculty] = useState("Факультет електроніки");
  const [department, setDepartment] = useState("Кафедра комп’ютерних технологій");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.filter = isModalOpen ? "blur(4px)" : "none";
    }
  }, [isModalOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    alert(t("teacherProfile.alerts.profileSaved"));
  };

  const handleChangePassword = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPasswordChange = () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert(t("teacherProfile.alerts.fillAllFields"));
      return;
    }

    if (oldPassword !== "123456") {
      alert(t("teacherProfile.alerts.oldPasswordIncorrect"));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t("teacherProfile.alerts.passwordMismatch"));
      return;
    }

    alert(t("teacherProfile.alerts.passwordChanged"));
    setIsModalOpen(false);
    setOldPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleLogout = () => {
    alert(t("teacherProfile.alerts.logoutMessage"));
    navigate("/authorization");
  };

  return (
    <>
      <div className="back-arrow" onClick={() => navigate("/home")}>
        {t("teacherProfile.backArrow")}
      </div>

      <div className="teacher-profile-container" ref={containerRef}>
        <h2>{t("teacherProfile.title")}</h2>

        <div className="avatar-wrapper">
          <label htmlFor="avatar-upload">
            <img
              src={avatar || "/default-avatar.png"}
              alt="Avatar"
              className="avatar-img"
            />
            <input
              id="avatar-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>

        <div className="form-grid">
          <div className="column">
            <div className="field">
              <label>{t("teacherProfile.fields.name")}</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("teacherProfile.fields.surname")}</label>
              <input
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("teacherProfile.fields.email")}</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="column">
            <div className="field">
              <label>{t("teacherProfile.fields.faculty")}</label>
              <input
                type="text"
                value={faculty}
                onChange={(e) => setFaculty(e.target.value)}
              />
            </div>
            <div className="field">
              <label>{t("teacherProfile.fields.department")}</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="buttons-row">
          <button onClick={handleSaveProfile}>
            {t("teacherProfile.buttons.saveProfile")}
          </button>
          <button onClick={handleChangePassword}>
            {t("teacherProfile.buttons.changePassword")}
          </button>
          <button onClick={handleLogout}>
            {t("teacherProfile.buttons.logout")}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t("teacherProfile.modal.title")}</h3>
            <div className="modal-field">
              <label>{t("teacherProfile.modal.oldPassword")}</label>
              <input
                type="password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>{t("teacherProfile.modal.newPassword")}</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
            <div className="modal-field">
              <label>{t("teacherProfile.modal.confirmPassword")}</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>
            <div className="modal-buttons">
              <button onClick={handleSubmitPasswordChange}>
                {t("teacherProfile.buttons.modalSave")}
              </button>
              <button onClick={() => setIsModalOpen(false)}>
                {t("teacherProfile.buttons.modalCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default TeacherProfile;
