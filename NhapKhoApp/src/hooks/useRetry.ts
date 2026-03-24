import { useCallback } from "react";

export interface RetryOptions {
    maxRetries?: number;
    retryDelay?: number;
    onRetry?: (attempt: number) => void;
}

export function useRetry() {
    const retry = useCallback(
        async <T>(fn: () => Promise<T>, options: RetryOptions = {}): Promise<T> => {
            const { maxRetries = 2, retryDelay = 1000, onRetry } = options;

            let lastError: unknown;

            for (let attempt = 0; attempt <= maxRetries; attempt++) {
                try {
                    return await fn();
                } catch (error) {
                    lastError = error;

                    if (attempt < maxRetries) {
                        onRetry?.(attempt + 1);
                        console.log(`Retry attempt ${attempt + 1}/${maxRetries}...`);
                        await new Promise((resolve) => setTimeout(resolve, retryDelay));
                    }
                }
            }

            throw lastError;
        },
        []
    );

    return { retry };
}
