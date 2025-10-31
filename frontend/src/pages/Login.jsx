import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useTranslation } from 'react-i18next';
import api from "../api/axios";


function Login() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!formData.username || !formData.password ) {
      setError(t('validation.not_all_fields'));
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/auth/login", formData);
      const { access, refresh } = res.data;
      await login({ access, refresh });
      navigate("/");
    } catch (err) {
      let msg = t('error.login');
      if (err.response?.data?.localization_key) {
        const localizationKey = err.response.data.localization_key;
        msg = t(localizationKey);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleSubmit(e);
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
        <span>{t('header.login')}</span>
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
                  <input name="username"
                    type="text"
                    value={formData.username}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('password')}</td>
                <td>
                  <input
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    onKeyDown={handleKeyDown}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className='message'>
          {error && <div className="error">{error}</div>}
          {loading && <div className="loading">{t('loading')}</div>}
        </div>
      </div>
      <div className='page-bottom'>
        <div className="buttons">
          <button
            className="button-big button-inverted"
            onClick={() => navigate("/register")}
          >
            {t('register')}
          </button>
          <button
            className="button-big"
            onClick={handleSubmit}
            disabled={loading || !formData.username || !formData.password}
          >
            {t('login')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;