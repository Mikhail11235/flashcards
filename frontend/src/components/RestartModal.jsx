import { useNavigate } from "react-router-dom";


export function RestartModal({ hideRestart, onReset, onRestart, message, resetText, restartText }) {
    const navigate = useNavigate();

    return (
        <div className="modal-overlay">
            <div className='modal-content'>
                <div className='page-top'>
                    <div className='buttons-top'>
                        <button
                            className='button-small'
                            onClick={() => navigate("/")}
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
                            className={`button-big ${!hideRestart ? '' : 'button-single'}`}
                            onClick={onReset}
                        >
                            {resetText}
                        </button>
                        {!hideRestart && (
                            <button
                                className="button-big"
                                onClick={onRestart}
                            >
                                {restartText}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}