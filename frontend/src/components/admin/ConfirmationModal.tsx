
import { useEffect } from 'react';
import './ConfirmationModal.css';

type ConfirmationModalProps = {

    isOpen: boolean;

    title: string;

    message: string;

    confirmText?: string;

    cancelText?: string;

    onConfirm: () => void;

    onCancel: () => void;

    isDangerous?: boolean;
};

export default function ConfirmationModal({
    isOpen,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    onConfirm,
    onCancel,
    isDangerous = false,
}: ConfirmationModalProps) {

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }


        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);


    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onCancel]);


    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className={`modal-content ${isDangerous ? 'modal-content--danger' : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                {}
                <div className={`modal-icon ${isDangerous ? 'modal-icon--danger' : 'modal-icon--info'}`}>
                    {isDangerous ? (

                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    ) : (

                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </div>

                {}
                <h3 className="modal-title">{title}</h3>

                {}
                <p className="modal-message">{message}</p>

                {}
                <div className="modal-actions">
                    <button
                        type="button"
                        className="button button--ghost"
                        onClick={onCancel}
                    >
                        {cancelText}
                    </button>
                    <button
                        type="button"
                        className={`button ${isDangerous ? 'button--danger' : 'button--primary'}`}
                        onClick={onConfirm}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
