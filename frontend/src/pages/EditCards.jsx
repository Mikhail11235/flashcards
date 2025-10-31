import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { ProtectedRoute } from '../components/ProtectedRoute';
import { useTranslation } from 'react-i18next';
import api from "../api/axios";


function EditCards() {
    const location = useLocation();
    const { deck_id, deck_name } = location.state || {};
    const [formData, setFormData] = useState({ cards: [] });
    const [searchTerm, setSearchTerm] = useState('');
    const [activeRow, setActiveRow] = useState(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const cardsTableRef = useRef(null);
    const { t } = useTranslation();
    const navigate = useNavigate();

    const filteredCards = formData.cards.filter(card =>
        card.entry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        card.value.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const fetchCards = async () => {
        try {
            const response = await api.get(`/api/decks/${deck_id}/cards`);
            if (response?.data?.cards) {
                const cardsData = response.data.cards;
                const formattedCards = cardsData.map(card => ({
                    id: crypto.randomUUID(),
                    entry: card.entry,
                    value: card.value,
                }));
                setFormData({ cards: formattedCards });
            }
        } catch (err) {
            console.error("Failed to fetch cards");
        }
    };

    useEffect(() => {
        fetchCards();
    }, [deck_id]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (cardsTableRef.current && !cardsTableRef.current.contains(event.target)) {
                setActiveRow(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleCardChange = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            cards: prev.cards.map((card, i) =>
                i === index ? { ...card, [field]: value } : card
            )
        }));
    }

    const handleAddEmptyRow = () => {
        setFormData(prev => ({
            ...prev,
            cards: [...prev.cards, {
                id: crypto.randomUUID(),
                entry: '',
                value: ''
            }]
        }));
    };



    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const cardsToSave = formData.cards.filter(card =>
                card.entry.trim() !== '' || card.value.trim() !== ''
            );
            const entries = cardsToSave.map(card => card.entry.trim().toLowerCase());
            const uniqueEntries = new Set(entries);
            if (uniqueEntries.size !== entries.length) {
                setError(t('validation.duplicate_entry'));
                return;
            }
            const response = await api.put(`/api/decks/${deck_id}/cards`, {
                cards: cardsToSave.map(({ id, ...card }) => card)
            });
            if (response?.data?.cards) {
                const updatedCards = response.data.cards.map(card => ({
                    id: crypto.randomUUID(),
                    ...card
                }));
                setFormData({ cards: updatedCards });
            } else {
                setFormData({ cards: cardsToSave });
            }
        } catch (err) {
            setError(t('error.edit'));
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const clearSearch = () => {
        setSearchTerm('');
    };

    const handleReset = () => {
        fetchCards();
    }

    const handleRowClick = (index) => {
        setActiveRow(index);
    }

    const handleDeleteCard = (index, e) => {
        e.stopPropagation();
        setFormData(prev => ({
            ...prev,
            cards: prev.cards.filter((_, i) => i !== index)
        }));
        setActiveRow(null);
    }

    const getDuplicateEntries = () => {
        const entries = formData.cards
            .filter(card => card.entry.trim() !== '')
            .map(card => card.entry.trim().toLowerCase());

        const duplicates = entries.filter((entry, index) => entries.indexOf(entry) !== index);
        return [...new Set(duplicates)];
    };

    const isDuplicateEntry = (card) => {
        if (!card.entry.trim()) return false;
        const duplicateEntries = getDuplicateEntries();
        return duplicateEntries.includes(card.entry.trim().toLowerCase());
    };

    return (
        <ProtectedRoute>
            <div className='page-inner'>
                <div className='page-top'>
                    <div className='buttons-top'>
                        <button
                            className='button-small'
                            onClick={handleReset}
                        >
                            ↺
                        </button>
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
                    <span>{t('header.edit_cards', { deck_name: deck_name })}</span>
                </div>
                <div className='page-content'>
                    <div className="data-entry">
                        <div className="search-container">
                            <input
                                type='text'
                                placeholder={t('search_cards')}
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                            {searchTerm && (
                                <button
                                    onClick={clearSearch}
                                >
                                    ✕
                                </button>
                            )}
                        </div>
                        <div className="scroll-container">
                            <table className='scroll-table-border'>
                                <colgroup>
                                    <col width={78} />
                                    <col width={78} />
                                    <col width={20} />
                                </colgroup>
                                <tbody>
                                    <tr className='empty-row'>
                                        <td></td>
                                        <td></td>
                                        <td></td>
                                    </tr>
                                </tbody>
                            </table>
                            {filteredCards.length ?
                                <table
                                    className='cards-table'
                                    ref={cardsTableRef}
                                >
                                    <colgroup>
                                        <col width={78} />
                                        <col width={78} />
                                        <col width={20} />
                                    </colgroup>
                                    <tbody>
                                        {filteredCards.map((card, index) => {
                                            return (
                                                <tr
                                                    key={card.id}
                                                    onClick={() => handleRowClick(index)}
                                                    className={activeRow === index ? 'active' : ''}
                                                >
                                                    <td>
                                                        <input
                                                            type="text"
                                                            value={card.entry}
                                                            onChange={(e) => handleCardChange(index, 'entry', e.target.value)}
                                                            className={isDuplicateEntry(card) ? 'error' : ''}
                                                        />
                                                    </td>
                                                    <td style={{ borderRight: "none" }}>
                                                        <input
                                                            type="text"
                                                            value={card.value}
                                                            onChange={(e) => handleCardChange(index, 'value', e.target.value)}
                                                            className={isDuplicateEntry(card) ? 'error' : ''}
                                                        />
                                                    </td>
                                                    <td
                                                        className={`card-action ${activeRow === index ? 'show' : ''}`}
                                                        style={{ padding: "0", borderLeft: "none" }}
                                                    >
                                                        <button
                                                            className="button-action"
                                                            onClick={(e) => handleDeleteCard(index, e)}
                                                        >
                                                            ✕
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                                : <span>{t('no_cards')}</span>}
                        </div>
                        <button
                            onClick={handleAddEmptyRow}
                            disabled={loading}
                        >
                            {t('add_card')}
                        </button>
                        <div className='message'>
                            {error && <div className="error">{error}</div>}
                            {loading && <div className="loading">{t('loading')}</div>}
                        </div>
                    </div>
                </div>
                <div className='page-bottom'>
                    <div className="buttons">
                        <button
                            className="button-big button-single"
                            disabled={loading}
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

export default EditCards;