export function ConfirmModal({ onClose, onConfirm, message, confirmText, cancelText }) {
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
                    <span></span>
                </div>
                <div className='page-content'>
                    <div className="data-entry">
                        <p className="modal-message">{message}</p>
                    </div>
                </div>
                <div className='page-bottom'>
                    <div className="buttons">
                        <button
                            className="button-big"
                            onClick={onClose}
                        >
                            {cancelText}
                        </button>
                        <button
                            className="button-big"
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}