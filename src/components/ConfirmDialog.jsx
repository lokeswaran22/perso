import { FaExclamationTriangle } from 'react-icons/fa';
import './ConfirmDialog.css';

const ConfirmDialog = ({ isOpen, title, message, fileName, onConfirm, onCancel }) => {
    if (!isOpen) return null;

    return (
        <div className="confirm-overlay" onClick={onCancel}>
            <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                <div className="confirm-icon-wrapper">
                    <FaExclamationTriangle className="confirm-icon" />
                </div>

                <h2 className="confirm-title">{title}</h2>

                <div className="confirm-message">
                    <p>{message}</p>
                    {fileName && (
                        <div className="confirm-filename">
                            <strong>"{fileName}"</strong>
                        </div>
                    )}
                    <p className="confirm-warning">This action cannot be undone.</p>
                </div>

                <div className="confirm-actions">
                    <button
                        className="btn btn-secondary"
                        onClick={onCancel}
                    >
                        Cancel
                    </button>
                    <button
                        className="btn btn-danger"
                        onClick={onConfirm}
                        autoFocus
                    >
                        Delete Permanently
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmDialog;
