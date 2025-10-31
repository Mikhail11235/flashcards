import { useState, useEffect, useRef } from 'react'
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from "../components/ProtectedRoute"
import { CustomDropdown } from "../components/CustomDropdown";
import { useTranslation } from 'react-i18next';
import { ConfirmModal } from '../components/ConfirmModal';
import api from "../api/axios";


function EditDecks() {
  const [formData, setFormData] = useState({ deck: "1" });
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const fetchDecks = async () => {
    try {
      const response = await api.get("/api/decks");
      const decksData = response.data;
      const formattedDecks = decksData.map(deck => ({
        value: deck.id.toString(),
        label: deck.name
      }));
      setDecks(formattedDecks);
    } catch (err) {
      console.error("Failed to fetch decks");
    }
  };

  useEffect(() => {
    fetchDecks();
  }, []);

  const handleExport = async (deck_id, deck_name) => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get(`/api/decks/${deck_id}/export`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${deck_name}_cards.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      let msg = t('error.export_failed');
      if (err.response?.data?.localization_key) {
        const localizationKey = err.response.data.localization_key;
        msg = t(localizationKey);
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setError(t('error.only_excel'));
      return;
    }
    setLoading(true);
    setError('');
    try {
      const newFormData = new FormData();
      newFormData.append('file', file);
      await api.post(`/api/decks/${formData.deck}/import`, newFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
    } catch (err) {
      let msg = t('error.import_failed');
      if (err.response?.data?.localization_key) {
        const localizationKey = err.response.data.localization_key;
        msg = t(localizationKey);
      }
      setError(msg);
    } finally {
      setLoading(false);
      event.target.value = '';
    }
  };

  const handleDeleteDeck = async () => {
    setLoading(true);
    try {
      await api.delete(`/api/decks/${formData.deck}`);
    } catch (err) {
      let msg = '';
      if (err.response?.data?.localization_key) {
        const localizationKey = err.response.data.localization_key;
        msg = t(localizationKey);
      }
    } finally {
      await fetchDecks();
      setLoading(false);
      setShowConfirmModal(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className='page-inner'>
        {showConfirmModal && (
          <ConfirmModal
            onClose={() => setShowConfirmModal(false)}
            onConfirm={handleDeleteDeck}
            message={t('confirm_delete_deck', { deck_name: decks.filter((i, _) => i.value === formData.deck)[0].label })}
            confirmText={t('delete')}
            cancelText={t('cancel')}
          />
        )}
        <div className='page-top'>
          <div className='buttons-top'>
            <button
              className='button-small'
              onClick={() => navigate("/settings")}
            >
              ←
            </button>
            <button
              className='button-small'
              onClick={() => navigate("/")}
            >
              ✕
            </button>
          </div>
          <span>{t('header.edit_decks')}</span>
        </div>
        <div className='page-content'>
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
                      onChange={(value) => setFormData({ deck: value })}
                      placeholder={t('select_deck')}
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className='buttons-stack'>
            <button
              onClick={() => navigate("/edit-deck", {
                state: {
                  deck_id: formData.deck,
                  current_name: decks.filter((i, _) => i.value === formData.deck)[0].label,
                }
              })}
            >
              {t('edit_deck')}
            </button>
            <button onClick={() => navigate("/create-deck")}>
              {t('create_deck')}
            </button>
            <button onClick={() => navigate("/edit-cards", {
              state: {
                deck_id: formData.deck,
                deck_name: decks.filter((i, _) => i.value === formData.deck)[0].label,
              }
            })}
            >
              {t('edit_cards')}
            </button>
            <button
              onClick={handleImport}
              disabled={loading}
            >
              {t('import_cards')}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
            />
            <button
              onClick={() => handleExport(
                formData.deck,
                decks.filter((i, _) => i.value === formData.deck)[0].label
              )}
            >
              {t('export_cards')}
            </button>
            <button onClick={() => setShowConfirmModal(true)}
            >
              {t('delete_deck')}
            </button>
          </div>
          <div className='message'>
            {error && <div className="error">{error}</div>}
            {loading && <div className="loading">{t('loading')}</div>}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default EditDecks;