import { useState, useEffect } from 'react'
import { useNavigate } from "react-router-dom";
import { CustomDropdown } from "../components/CustomDropdown";
import api from "../api/axios";
import { useTranslation } from 'react-i18next';
import { useAuth } from "../components/AuthContext";



function Menu() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ deck: null, mode: isAuthenticated ? "unlearned" : "all" });
  const [decks, setDecks] = useState([]);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        const response = await api.get("/api/decks?show_all=1");
        const decksData = response.data;
        const formattedDecks = decksData.map(deck => ({
          value: deck.id,
          label: deck.name
        }));
        setDecks(formattedDecks);
        setFormData({ ...formData, deck: formattedDecks.length ? formattedDecks[0].value : null });
      } catch (err) {
        console.error("Failed to fetch decks");
      }
    };

    fetchDecks();
  }, []);

  const modes = isAuthenticated ? [
    { value: 'unlearned', label: t('unlearned') },
    { value: 'all', label: t('all') },
    { value: 'learned', label: t('learned') },
  ] : [
    { value: 'all', label: t('all') },
  ]

  return (
    <div className='page-inner'>
      <div className='page-top'>
        <div className='buttons-top'>
        </div>
        <span>{t('header.menu')}</span>
      </div>
      <div className='page-content'>
        <button
          onClick={() => navigate("/settings")}
        >
          {t('settings')}
        </button>
        <div className="data-entry">
          <table>
            <colgroup>
              <col style={{ width: "60px" }} />
              <col />
            </colgroup>
            <tbody>
              <tr>
                <td>{t('deck')}</td>
                <td style={{ padding: 0 }}>
                  <CustomDropdown
                    options={decks}
                    value={formData.deck}
                    onChange={(value) => setFormData({ ...formData, deck: value })}
                    placeholder={t('select_deck')}
                  />
                </td>
              </tr>
              <tr>
                <td>{t('mode')}</td>
                <td style={{ padding: 0 }}>
                  <CustomDropdown
                    options={modes}
                    value={formData.mode}
                    onChange={(value) => setFormData({ ...formData, mode: value })}
                    placeholder={t('select_mode')}
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
            onClick={() => navigate("/cards", {
              state: {
                deck_id: formData.deck,
                mode: formData.mode,
                deck_name: decks.filter((i, _) => i.value === formData.deck)[0].label
              }
            })}
          >
            {t('start')}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Menu;