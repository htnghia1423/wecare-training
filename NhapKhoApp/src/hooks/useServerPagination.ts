import { useState, useCallback, useRef } from "react";

export interface ServerPaginationState {
    currentPage: number;
    pageSize: number;
    totalRecords: number;
    totalPages: number;
    skipTokens: Map<number, string>;
    hasNextPage: boolean;
    hasPrevPage: boolean;
}

export interface UseServerPaginationReturn {
    pagination: ServerPaginationState;
    goToPage: (page: number) => void;
    nextPage: () => void;
    prevPage: () => void;
    setTotalRecords: (total: number) => void;
    setSkipToken: (page: number, token: string | undefined) => void;
    getSkipTokenForPage: (page: number) => string | undefined;
    reset: () => void;
    setPageSize: (size: number) => void;
}

export function useServerPagination(initialPageSize: number = 20): UseServerPaginationReturn {
    const [pagination, setPagination] = useState<ServerPaginationState>({
        currentPage: 1,
        pageSize: initialPageSize,
        totalRecords: 0,
        totalPages: 0,
        skipTokens: new Map(),
        hasNextPage: false,
        hasPrevPage: false
    });

    // Stable ref for skip tokens — avoids triggering re-fetch when tokens are stored
    const skipTokensRef = useRef<Map<number, string>>(new Map());

    const setTotalRecords = useCallback((total: number) => {
        setPagination((prev) => ({
            ...prev,
            totalRecords: total,
            totalPages: Math.ceil(total / prev.pageSize)
        }));
    }, []);

    const setSkipToken = useCallback((page: number, token: string | undefined) => {
        setPagination((prev) => {
            const newSkipTokens = new Map(prev.skipTokens);
            if (token) {
                newSkipTokens.set(page + 1, token); // Store token for next page
            }
            // Keep ref in sync for stable reads
            skipTokensRef.current = newSkipTokens;
            return {
                ...prev,
                skipTokens: newSkipTokens,
                hasNextPage: !!token
            };
        });
    }, []);
    const setPageSize = useCallback((size: number) => {
        setPagination((prev) => ({
            ...prev,
            pageSize: size,
            totalPages: prev.totalRecords ? Math.ceil(prev.totalRecords / size) : 0,
            currentPage: 1, // Reset to page 1 on page size change
            skipTokens: new Map() // Clear skip tokens
        }));
    }, []);
    // Use ref for stable reads — no dependency on pagination.skipTokens so fetchNhapKhos
    // doesn't re-run every time a skip token is stored
    const getSkipTokenForPage = useCallback(
        (page: number): string | undefined => {
            return skipTokensRef.current.get(page);
        },
        [] // stable — ref never changes identity
    );

    const goToPage = useCallback((page: number) => {
        setPagination((prev) => ({
            ...prev,
            currentPage: page,
            hasPrevPage: page > 1,
            hasNextPage: page < prev.totalPages
        }));
    }, []);

    const nextPage = useCallback(() => {
        setPagination((prev) => {
            // Guard on hasNextPage (set by skip-token presence), not totalPages
            // because $count is often ignored by Dataverse and totalPages stays at 1
            if (!prev.hasNextPage) return prev;

            const nextPageNum = prev.currentPage + 1;
            return {
                ...prev,
                currentPage: nextPageNum,
                hasPrevPage: true,
                hasNextPage: nextPageNum < prev.totalPages
            };
        });
    }, []);

    const prevPage = useCallback(() => {
        setPagination((prev) => {
            if (prev.currentPage <= 1) return prev;

            const prevPageNum = prev.currentPage - 1;
            return {
                ...prev,
                currentPage: prevPageNum,
                hasPrevPage: prevPageNum > 1,
                hasNextPage: true
            };
        });
    }, []);

    const reset = useCallback(() => {
        setPagination({
            currentPage: 1,
            pageSize: initialPageSize,
            totalRecords: 0,
            totalPages: 0,
            skipTokens: new Map(),
            hasNextPage: false,
            hasPrevPage: false
        });
    }, [initialPageSize]);

    return {
        pagination,
        goToPage,
        nextPage,
        prevPage,
        setTotalRecords,
        setSkipToken,
        getSkipTokenForPage,
        reset,
        setPageSize
    };
}
