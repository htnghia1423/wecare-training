import React, { useEffect } from "react";
import { IoClose } from "react-icons/io5";

export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: "small" | "medium" | "large";
    closeOnBackdropClick?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    title,
    children,
    footer,
    size = "medium",
    closeOnBackdropClick = true
}) => {
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener("keydown", handleEscape);
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener("keydown", handleEscape);
            document.body.style.overflow = "unset";
        };
    }, [isOpen, onClose]);

    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (closeOnBackdropClick && e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="wecare-modal-backdrop" onClick={handleBackdropClick}>
            <div
                className={`wecare-modal wecare-modal--${size}`}
                role="dialog"
                aria-modal="true"
                aria-labelledby="modal-title"
            >
                <div className="wecare-modal__header">
                    <h2 id="modal-title" className="wecare-modal__title">
                        {title}
                    </h2>
                    <button
                        className="wecare-modal__close"
                        onClick={onClose}
                        aria-label="Đóng"
                        type="button"
                    >
                        <IoClose size={24} />
                    </button>
                </div>
                <div className="wecare-modal__body">{children}</div>
                {footer && <div className="wecare-modal__footer">{footer}</div>}
            </div>
        </div>
    );
};
