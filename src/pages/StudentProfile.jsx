import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const StudentProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const containerRef = useRef(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const storedData = JSON.parse(localStorage.getItem("registrationData")) || {};
  const storedAvatar = localStorage.getItem("avatar");
  const storedEmail = localStorage.getItem("studentEmail") || storedData.email || "";

  const [email, setEmail] = useState(storedEmail);
  const [avatar, setAvatar] = useState(storedAvatar || null);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [name, setName] = useState(storedData.firstName || "");
  const [surname, setSurname] = useState(storedData.surname || "");
  const [faculty, setFaculty] = useState(storedData.faculty || "");
  const [department, setDepartment] = useState(storedData.department || "");
  const [course, setCourse] = useState(storedData.course || "");
  const [group, setGroup] = useState(storedData.group || "");

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.style.filter = isModalOpen ? "blur(4px)" : "none";
      containerRef.current.style.transition = "filter 0.3s ease";
    }
  }, [isModalOpen]);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatar(reader.result);
        localStorage.setItem("avatar", reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = () => {
    const updatedData = {
      firstName: name,
      surname: surname,
      email: email,
      faculty,
      department,
      course,
      group,
    };

    localStorage.setItem("registrationData", JSON.stringify(updatedData));
    localStorage.setItem("studentEmail", email);
    alert(t("studentProfile.alerts.profileSaved"));
  };

  const handleChangePassword = () => {
    setIsModalOpen(true);
  };

  const handleSubmitPasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      alert(t("studentProfile.alerts.fillAllFields"));
      return;
    }

    if (newPassword !== confirmPassword) {
      alert(t("studentProfile.alerts.newPasswordMismatch"));
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          oldPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setIsModalOpen(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error("Помилка зміни пароля:", error);
      alert(t("studentProfile.alerts.passwordChangeError"));
    }
  };

  const handleLogout = () => {
    alert(t("studentProfile.alerts.logoutMessage"));
    localStorage.removeItem("registrationData");
    localStorage.removeItem("avatar");
    navigate("/authorization");
  };

  return (
    <>
      <div className="back-arrow" onClick={() => navigate("/home")}>
        {t("studentProfile.backArrow")}
      </div>

      <div className="student-profile-container" ref={containerRef}>
        <h2>{t("studentProfile.title")}</h2>

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

        <div className="form-columns">
          <div className="column">
            <div className="field">
              <label className="label">{t("studentProfile.labels.name")}</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" />
            </div>

            <div className="field">
              <label className="label">{t("studentProfile.labels.surname")}</label>
              <input type="text" value={surname} onChange={(e) => setSurname(e.target.value)} className="input" />
            </div>

            <div className="field">
              <label className="label">{t("studentProfile.labels.email")}</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" />
            </div>
          </div>

          <div className="column">
            <div className="field">
              <label className="label">{t("studentProfile.labels.course")}</label>
              <input type="text" value={course} onChange={(e) => setCourse(e.target.value)} className="input" />
            </div>

            <div className="field">
              <label className="label">{t("studentProfile.labels.group")}</label>
              <input type="text" value={group} onChange={(e) => setGroup(e.target.value)} className="input" />
            </div>

            <div className="field">
              <label className="label">{t("studentProfile.labels.faculty")}</label>
              <input type="text" value={faculty} onChange={(e) => setFaculty(e.target.value)} className="input" />
            </div>

            <div className="field">
              <label className="label">{t("studentProfile.labels.department")}</label>
              <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="input" />
            </div>
          </div>
        </div>

        <div className="buttons-row">
          <button onClick={handleSaveProfile} className="save-btn">
            {t("studentProfile.buttons.saveProfile")}
          </button>
          <button onClick={handleChangePassword} className="pass-btn">
            {t("studentProfile.buttons.changePassword")}
          </button>
          <button onClick={handleLogout} className="logout-btn">
            {t("studentProfile.buttons.logout")}
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t("studentProfile.modalTitle")}</h3>

            <div className="modal-field">
              <label>{t("studentProfile.labels.oldPassword")}</label>
              <input type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} />
            </div>

            <div className="modal-field">
              <label>{t("studentProfile.labels.newPassword")}</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="modal-field">
              <label>{t("studentProfile.labels.confirmPassword")}</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            </div>

            <div className="modal-buttons">
              <button onClick={handleSubmitPasswordChange} className="save-btn">
                {t("studentProfile.buttons.modalSave")}
              </button>
              <button onClick={() => setIsModalOpen(false)} className="logout-btn">
                {t("studentProfile.buttons.modalCancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StudentProfile;
