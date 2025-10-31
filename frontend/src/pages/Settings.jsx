import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { CustomDropdown } from "../components/CustomDropdown";
import { useTranslation } from 'react-i18next';
import { useAuth } from '../components/AuthContext';


function Settings() {
  const { user, updateSettings } = useAuth();
  const [formData, setFormData] = useState({
    color: user?.color || localStorage.getItem('user-color') || 'yellow',
    language: user?.language || localStorage.getItem('user-language') || 'en'
  });
  const { t } = useTranslation();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      setFormData({
        color: user.color || 'yellow',
        language: user.language || 'en'
      });
    }
  }, [user]);

  const languages = [
    { value: 'en', label: 'english' },
    { value: 'ru', label: 'русский' },
    { value: 'de', label: 'deutsch' },
    { value: 'zh', label: '한국어' },
    { value: 'es', label: 'español' },
    { value: 'fr', label: 'français' },
    { value: 'ko', label: '한국어' },
    { value: 'ja', label: '日本語' },
  ];

  const colors = [
    { value: 'yellow', label: t('yellow') },
    { value: 'green', label: t('green') },
    { value: 'pink', label: t('pink') },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await updateSettings(formData);
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
        <span>{t('header.settings')}</span>
      </div>
      <div className='page-content'>
        <button
          onClick={() => navigate("/edit-decks")}
        >
          {t('edit_decks')}
        </button>
        <div className="data-entry">
          <table>
            <colgroup>
              <col style={{ width: "60px" }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td>{t('language')}</td>
                <td style={{ padding: 0 }}>
                  <CustomDropdown
                    options={languages}
                    value={formData.language}
                    onChange={(value) => setFormData({ ...formData, language: value })}
                    placeholder={t('select_language')}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('color')}</td>
                <td style={{ padding: 0 }}>
                  <CustomDropdown
                    options={colors}
                    value={formData.color}
                    onChange={(value) => setFormData({ ...formData, color: value })}
                    placeholder={t('select_color')}
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className='page-bottom'>
        <div className="buttons">
          <button
            className="button-big button-single"
            onClick={handleSubmit}
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Settings;