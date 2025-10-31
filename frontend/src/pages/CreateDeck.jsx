import { useState } from 'react'
import { useNavigate } from "react-router-dom";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import api from "../api/axios";


function CreateDeck() {
    const [formData, setFormData] = useState({ name: "new deck" });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
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
        if (!formData.name) {
            setError(t('validation.not_all_fields'));
            setLoading(false);
            return;
        }
        try {
            await api.post("api/decks", formData);
            navigate("/edit-decks");
        } catch (err) {
            let msg = t('error.create_deck');
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
        <ProtectedRoute>
            <div className='page-inner'>
                <div className='page-top'>
                    <div className='buttons-top'>
                        <button
                            className='button-small'
                            onClick={() => navigate("/edit-decks")}
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
                    <span>{t('header.create_deck')}</span>
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
                                    <td>{t('name')}</td>
                                    <td>
                                        <input name="name"
                                            type="text"
                                            value={formData.name}
                                            onChange={handleChange}
                                            onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
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
                            className="button-big button-single"
                            onClick={handleSubmit}
                        >
                            {t('save')}
                        </button>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}

export default CreateDeck;