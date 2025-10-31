import { useTranslation } from 'react-i18next';


export function RulesModal({ onClose }) {
    const { t } = useTranslation();

    return (
        <div className="modal-overlay">
            <div className='modal-content'>
                <div className='page-top'>
                    <div className='buttons-top'>
                        <button
                            className='button-small'
                            onClick={onClose}
                        >
                            ✕
                        </button>
                    </div>
                    <span>{t('header.rules')}</span>
                </div>
                <div className='page-content'>
                    <div className="data-entry">
                        <ul>
                            <li>{t('rule1')}</li>
                            <li>{t('rule2')}</li>
                            <li>{t('rule3')}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}