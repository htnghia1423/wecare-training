import { useState, useCallback } from "react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
    id: string;
    type: ToastType;
    message: string;
}

export interface UseToastReturn {
    toasts: ToastItem[];
    showToast: (message: string, type?: ToastType) => void;
    dismissToast: (id: string) => void;
}

export function useToast(autoDismissMs = 3500): UseToastReturn {
    const [toasts, setToasts] = useState<ToastItem[]>([]);

    const dismissToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    const showToast = useCallback(
        (message: string, type: ToastType = "info") => {
            const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
            setToasts((prev) => [...prev, { id, type, message }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, autoDismissMs);
        },
        [autoDismissMs]
    );

    return { toasts, showToast, dismissToast };
}
