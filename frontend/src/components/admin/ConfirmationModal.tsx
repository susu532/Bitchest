// Modern confirmation modal component with animations and glassmorphism
import { useEffect } from 'react';
import './ConfirmationModal.css';

type ConfirmationModalProps = {
    // Whether the modal is open or closed
    isOpen: boolean;
    // Title of the modal
    title: string;
    // Message to display in the modal
    message: string;
    // Text for the confirm button (defaults to "Confirm")
    confirmText?: string;
    // Text for the cancel button (defaults to "Cancel")
    cancelText?: string;
    // Callback when user confirms
    onConfirm: () => void;
    // Callback when user cancels
    onCancel: () => void;
    // Optional: make the modal dangerous (red theme for destructive actions)
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
    // Prevent body scroll when modal is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }

        // Cleanup on unmount
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isOpen) {
                onCancel();
            }
        };

        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onCancel]);

    // Don't render anything if modal is not open
    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div
                className={`modal-content ${isDangerous ? 'modal-content--danger' : ''}`}
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
            >
                {/* Icon */}
                <div className={`modal-icon ${isDangerous ? 'modal-icon--danger' : 'modal-icon--info'}`}>
                    {isDangerous ? (
                        // Warning/danger icon
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                            <line x1="12" y1="9" x2="12" y2="13" />
                            <line x1="12" y1="17" x2="12.01" y2="17" />
                        </svg>
                    ) : (
                        // Info icon
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    )}
                </div>

                {/* Title */}
                <h3 className="modal-title">{title}</h3>

                {/* Message */}
                <p className="modal-message">{message}</p>

                {/* Actions */}
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
