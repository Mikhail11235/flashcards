import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import api from "../api/axios";


function Register() {
  const [formData, setFormData] = useState({ username: "", email: "", password1: "", password2: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    const { username, email, password1, password2 } = formData;
    e.preventDefault();
    const color = localStorage.getItem("user-color");
    const language = localStorage.getItem("user-language");
    setError("");
    setLoading(true);

    if (!username || !email || !password1 || !password2) {
      setError(t('validation.not_all_fields'));
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(t('validation.email'));
      setLoading(false);
      return;
    }

    if (password1 !== password2) {
      setError(t('validation.passwords'));
      setLoading(false);
      return;
    }

    if (password1.length < 6) {
      setError(t('validation.password_short'));
      setLoading(false);
      return;
    }

    try {
      await api.post("/api/auth/register", {
        username: username,
        email: email,
        password: password1,
        color: color === "yellow" ? null : color,
        language: language === "language" ? null : language,
      })
      navigate("/login");
    } catch (err) {
      let msg = t('error.register');
      if (err.response?.data?.localization_key) {
        const localizationKey = err.response.data.localization_key;
        msg = t(localizationKey);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='page-inner'>
      <div className='page-top'>
        <div className='buttons-top'>
          <button
            className='button-small'
            onClick={() => navigate("/")}
          >
            ✕
          </button>
        </div>
        <span>{t('header.register')}</span>
      </div>
      <div className='page-content'>
        <div className="data-entry">
          <table style={{ tableLayout: "unset" }}>
            <colgroup>
              <col style={{ width: "60px" }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td>{t('username')}</td>
                <td>
                  <input
                    name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('email')}</td>
                <td>
                  <input
                    name="email"
                    type="text"
                    value={formData.email}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('password')}</td>
                <td>
                  <input
                    name="password1"
                    type="password"
                    value={formData.password1}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('password')}</td>
                <td>
                  <input
                    name="password2"
                    type="password"
                    value={formData.password2}
                    onChange={handleChange}
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='message'>
          {error && <div className="error-message">{error}</div>}
          {loading && <div className="loading">{t('loading')}</div>}
        </div>
      </div>
      <div className='page-bottom'>
        <div className="buttons">
          <button
            className="button-big button-inverted"
            onClick={() => navigate("/login")}
          >
            {t('login')}
          </button>
          <button
            className="button-big"
            onClick={handleSubmit}
            disabled={loading}
          >
            {t('register')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Register;