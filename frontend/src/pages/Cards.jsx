import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from "react-router-dom";
import { useScramble } from 'use-scramble';
import { useEncoder } from '../components/Encoder'
import { RulesModal } from '../components/RulesModal'
import { ConfirmModal } from '../components/ConfirmModal';
import { RestartModal } from '../components/RestartModal'
import { useTranslation } from 'react-i18next';
import { useAuth } from "../components/AuthContext";
import api from "../api/axios";


function Cards() {
  const { isAuthenticated } = useAuth();
  const [inited, setInited] = useState(false);
  const location = useLocation();
  const { deck_id, mode, deck_name } = location.state || {};
  const [cardData, setCardData] = useState({ entry: '', value: '', id: 0, 'learned': false });
  const [seenCards, setSeenCards] = useState(new Set());
  const [answer, setAnswer] = useState('');
  const encodedValue = useEncoder(cardData.value);
  const [stats, setStats] = useState({ learned: 0, total: 0, remain: 0 });
  const [isWrong, setIsWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const [valueShown, setValueShown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showTranslation, setShowTranslation] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showRestartModal, setShowRestartModal] = useState(false);
  const [showNoLearnedModal, setShowNoLearnedModal] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  const mountedRef = useRef(false);
  const { ref } = useScramble({
    text: showTranslation ? cardData.value : encodedValue,
    speed: 1,
    scramble: 10,
    step: 1,
    overdrive: false,
  });

  const fetchCard = async (excludeIds = null) => {
    setLoading(true);
    try {
      const response = await api.post(`/api/decks/${deck_id}/next-card`, {
        mode: mode,
        exclude: excludeIds || Array.from(seenCards)
      })
      if (response?.data?.card?.id) {
        setCardData(response?.data?.card);
        setSeenCards(prev => new Set([...prev, response.data.card.id]));
      } else if (response?.data?.card === null) {
        if (mode === "learned" && stats.learned === 0) {
          setShowNoLearnedModal(true);
        } else {
          setShowRestartModal(true);
        }
      }
      if (response?.data?.stats) {
        setStats(response.data.stats);
      }
      setAnswer('');
      setSolved(false);
      setValueShown(false);
      setShowTranslation(false);
    } catch (err) {
      console.error("Failed to fetch card");
    } finally {
      setLoading(false);
      if (!inited) setInited(true);
    }
  };


  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    fetchCard();
  }, [deck_id, mode]);

  const handleToggleLearned = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const response = await api.patch(`/api/decks/${deck_id}/toggle_learned`, {
        card_id: cardData.id
      })
      if (response?.data?.learned !== undefined) {
        setCardData((prev) => ({ ...prev, learned: response.data.learned }));
      }
      if (response?.data?.stats) {
        setStats((prev) => ({ ...prev, total: response.data.stats.total, learned: response.data.stats.learned }));
      }
    } catch (err) {
      console.error("Failed to toggle learned");
    } finally {
      setLoading(false);
    }
  }

  const handleCardClick = () => {
    !valueShown && setShowTranslation(!showTranslation);
    setValueShown(true);
  };

  const handleAnswerChange = (e) => {
    setAnswer(e.target.value);
  };

  const handleCheckAnswer = (e) => {
    if (answer.toLowerCase() === cardData.value.toLowerCase()) {
      handleCardClick();
      setSolved(true);
    } else {
      setIsWrong(true);
      setTimeout(() => {
        setIsWrong(false);
      }, 500);
    }
  }

  const handleModalRestart = async () => {
    try {
      setSeenCards(new Set());
      await fetchCard([]);
    } catch (err) {
      console.error("Failed to restart");
    } finally {
      setShowRestartModal(false);
    }
  }

  const handleModalReset = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await api.delete(`/api/decks/${deck_id}/reset`);
      setSeenCards(new Set());
      await fetchCard([]);
    } catch (err) {
      console.error("Failed to reset progress");
    } finally {
      if (mode === "learned") {
        setShowNoLearnedModal(true);
      }
      setShowResetModal(false);
      setShowRestartModal(false);
      setLoading(false);
    }
  }

  return (
    <div className='page-inner'>
      {showRulesModal && (<RulesModal onClose={() => setShowRulesModal(false)} />)}
      {showNoLearnedModal && (
        <RestartModal
          hideRestart={true}
          onReset={() => navigate("/")}
          message={t('finish_no_learned')}
          resetText={t('change')}
        />
      )}
      {showResetModal && (
        <ConfirmModal
          onClose={() => setShowResetModal(false)}
          onConfirm={handleModalReset}
          message={t('confirm_reset', { deck_name: deck_name })}
          confirmText={t('reset')}
          cancelText={t('cancel')}
        />
      )}
      {showRestartModal && isAuthenticated && (
        <RestartModal
          hideRestart={mode === "unlearned" && stats.learned === stats.total}
          onReset={handleModalReset}
          onRestart={handleModalRestart}
          message={mode === "unlearned" && stats.learned === stats.total ? t('finish_reset', { deck_name: deck_name }) : t('finish_restart', { deck_name: deck_name })}
          resetText={t('reset')}
          restartText={t('restart')}
        />
      )}
      {showRestartModal && !isAuthenticated && (
        <RestartModal
          hideRestart={true}
          onReset={handleModalRestart}
          message={t('finish_guest', { deck_name: deck_name })}
          resetText={t('restart')}
        />
      )}
      {inited && (<>
        <div className='page-top'>
          <div className='buttons-top'>
            <div className='deck-info'>
              <span>{t('learned')}: {stats.learned}/{stats.total}</span>
              <span>{t('remain')}: {stats.remain}</span>
            </div>
            <button
              className='button-small'
              onClick={() => setShowRulesModal(true)}
            >
              &#8505;
            </button>
            <button
              className='button-small'
              onClick={() => setShowResetModal(true)}
              disabled={loading}
            >
              ↺
            </button>
            <button
              className='button-small'
              onClick={() => navigate("/")}
            >
              ✕
            </button>
          </div>
        </div>
        <div className='page-content'>
          <div className="card">
            <div className="card-entry">
              {cardData.entry}
            </div>
            <hr />
            <div className="card-value" ref={ref} onClick={handleCardClick}>
              {showTranslation ? cardData.value : encodedValue}
            </div>
            <div
              className={`card-answer ${isWrong ? 'error' : ''}`}
              style={{ visibility: solved || valueShown ? "hidden" : "visible" }}
            >
              <input
                placeholder={t('your_answer')}
                value={answer}
                onChange={handleAnswerChange}
                style={{ borderRight: "none" }}
                onKeyDown={(e) => e.key === "Enter" && handleCheckAnswer()}
              />
              <button
                className="button-no-active"
                onClick={handleCheckAnswer}
                style={{ padding: "0 2px", minWidth: "60px", flex: "0 0 auto" }}
              >
                {t('check')}</button>
            </div>
          </div>
        </div>
        <div className='page-bottom'>
          <div className='buttons'>
            {isAuthenticated &&
              <button
                className={`button-big ${solved || cardData.learned ? '' : 'button-disabled'}`}
                style={{ visibility: valueShown && !solved && !cardData.learned ? 'hidden' : 'visible' }}
                onClick={handleToggleLearned}
                disabled={loading || !(solved || cardData.learned)}
              >
                {cardData.learned ? t('forget') : t('learn')}
              </button>
            }
            <button
              className={`button-big ${isAuthenticated ? '' : 'button-single'}`}
              onClick={() => fetchCard()}
              disabled={loading}
            >
              {t('next')}
            </button>
          </div>
        </div>
      </>
      )}
    </div>
  );
}

export default Cards;