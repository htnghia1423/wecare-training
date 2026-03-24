import React from "react";
import {
    IoCheckmarkCircle,
    IoCloseCircle,
    IoWarning,
    IoInformationCircle,
    IoClose
} from "react-icons/io5";
import type { ToastItem } from "../../hooks/useToast";

interface ToastContainerProps {
    toasts: ToastItem[];
    onDismiss: (id: string) => void;
}

const icons = {
    success: <IoCheckmarkCircle size={20} />,
    error: <IoCloseCircle size={20} />,
    warning: <IoWarning size={20} />,
    info: <IoInformationCircle size={20} />
};

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
    if (toasts.length === 0) return null;

    return (
        <div className="wecare-toast-container" role="region" aria-label="Thông báo">
            {toasts.map((toast) => (
                <div
                    key={toast.id}
                    className={`wecare-toast wecare-toast--${toast.type}`}
                    role="alert"
                >
                    <span className="wecare-toast__icon">{icons[toast.type]}</span>
                    <span className="wecare-toast__message">{toast.message}</span>
                    <button
                        className="wecare-toast__close"
                        onClick={() => onDismiss(toast.id)}
                        aria-label="Đóng thông báo"
                        type="button"
                    >
                        <IoClose size={16} />
                    </button>
                </div>
            ))}
        </div>
    );
};
