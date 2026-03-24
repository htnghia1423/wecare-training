import { useState, useCallback, useEffect } from "react";

import { Htn1423_nhapkhosService } from "../generated";
import { handleDataverseError, buildLookupBinding } from "../utils/dataverse";
import type { UseServerPaginationReturn } from "./useServerPagination"; // Import type for useServerPagination
import { useServerPagination } from "./useServerPagination";
import { useRetry } from "./useRetry";
import {
    ODataQueryBuilder,
    buildContainsFilter,
    buildOrFilter,
    escapeODataValue
} from "../utils/odataBuilder";
import type {
    NhapKhoFormData,
    NhapKhoTableRow,
    SortField,
    SortDirection,
    SortConfig,
    FilterConfig
} from "../components/NhapKho/types";

export interface UseNhapKhoReturn {
    // Data
    records: NhapKhoTableRow[];
    isLoading: boolean;
    error: string | null;

    // Pagination
    pagination: UseServerPaginationReturn["pagination"];
    nextPage: () => void;
    prevPage: () => void;
    setPageSize: (size: number) => void;

    // Filters/Sort
    filters: FilterConfig;
    setSearchTerm: (term: string) => void;
    setStatusFilter: (status: "all" | "active" | "inactive") => void;
    sortConfig: SortConfig;
    setSort: (field: SortField, direction: SortDirection) => void;

    // CRUD Operations
    createRecord: (data: NhapKhoFormData) => Promise<void>;
    updateRecord: (id: string, data: NhapKhoFormData) => Promise<void>;
    deleteRecord: (id: string) => Promise<void>;
    activateRecord: (id: string) => Promise<void>;

    // Utilities
    refetch: () => Promise<void>;
}

export function useNhapKho(): UseNhapKhoReturn {
    const [records, setRecords] = useState<NhapKhoTableRow[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [filters, setFilters] = useState<FilterConfig>({
        searchTerm: "",
        statusFilter: "active"
    });
    const [sortConfig, setSortConfig] = useState<SortConfig>({
        field: "createdon",
        direction: "desc"
    });

    const paginationHook = useServerPagination(25);
    const { retry } = useRetry();

    const {
        pagination,
        nextPage: paginationNextPage,
        prevPage: paginationPreviousPage,
        setTotalRecords,
        setSkipToken,
        getSkipTokenForPage,
        reset: resetPagination,
        setPageSize: paginationSetPageSize // Alias the setPageSize from useServerPagination
    } = paginationHook;

    /**
     * Fetch Nhập kho records with server-side pagination
     */
    const fetchNhapKhos = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const queryBuilder = new ODataQueryBuilder();

            // Base filter based on status
            let filterParts: string[] = [];
            if (filters.statusFilter === "active") {
                filterParts.push("statecode eq 0");
            } else if (filters.statusFilter === "inactive") {
                filterParts.push("statecode eq 1");
            }
            // 'all' means no status filter

            // Search filter (real-time)
            if (filters.searchTerm.trim()) {
                const escapedTerm = escapeODataValue(filters.searchTerm.trim());
                const searchFilters = [
                    buildContainsFilter("htn1423_name", escapedTerm),
                    buildContainsFilter("htn1423_tensanpham", escapedTerm)
                ];
                filterParts.push(`(${buildOrFilter(searchFilters)})`);
            }

            if (filterParts.length > 0) {
                queryBuilder.filter(filterParts.join(" and "));
            }

            queryBuilder
                .select(
                    "htn1423_nhapkhoid",
                    "htn1423_name",
                    "htn1423_soluong",
                    "_htn1423_onmuachitiet_value",
                    "htn1423_tensanpham",
                    "createdon",
                    "statecode",
                    "statuscode"
                )
                .orderBy(sortConfig.field, sortConfig.direction)
                .top(pagination.pageSize)
                .count(true);

            // Add skipToken for pagination (page 2+)
            const skipToken = getSkipTokenForPage(pagination.currentPage);
            if (skipToken && pagination.currentPage > 1) {
                queryBuilder.skipToken(skipToken);
            }

            const options = queryBuilder.build();

            const result = await retry(() => Htn1423_nhapkhosService.getAll(options));

            if (result.success && result.data) {
                setRecords(result.data as NhapKhoTableRow[]);

                // Update total records count (only from first page response)
                let realCount =
                    result.count ??
                    (result as any)["@odata.count"] ??
                    (result as any).totalRecordCount;

                if (realCount === undefined && pagination.totalRecords === 0) {
                    realCount = result.data.length;
                }

                if (realCount !== undefined) {
                    setTotalRecords(realCount);
                }

                // Store skipToken for next page
                if (result.skipToken) {
                    setSkipToken(pagination.currentPage, result.skipToken);
                }
            } else {
                console.error("Fetch Nhap Kho result error:", result);
                throw new Error(result.error?.message || "Failed to fetch Nhập kho records");
            }
        } catch (err) {
            const errorMessage = handleDataverseError(err);
            setError(errorMessage);
            console.error("Error fetching Nhập kho:", err);
        } finally {
            setIsLoading(false);
        }
    }, [
        pagination.currentPage,
        pagination.pageSize,
        filters,
        sortConfig,
        getSkipTokenForPage,
        setTotalRecords,
        setSkipToken,
        retry
    ]);

    /**
     * Create new Nhập kho record
     */
    const createRecord = useCallback(
        async (data: NhapKhoFormData): Promise<void> => {
            try {
                if (!data.htn1423_soluong || !data.htn1423_onmuachitiet) {
                    throw new Error("Missing required fields");
                }

                const record = {
                    htn1423_soluong: data.htn1423_soluong,
                    "htn1423_onmuachitiet@odata.bind": buildLookupBinding(
                        "htn1423_onmuachitiets",
                        data.htn1423_onmuachitiet
                    )
                };

                const result = await retry(() => Htn1423_nhapkhosService.create(record as any));

                if (result.success) {
                    // Reset to first page and refresh
                    resetPagination();
                    await fetchNhapKhos();
                } else {
                    throw new Error("Failed to create record");
                }
            } catch (err) {
                const errorMessage = handleDataverseError(err);
                setError(errorMessage);
                console.error("Error creating Nhập kho:", err);
                throw err;
            }
        },
        [retry, fetchNhapKhos, resetPagination]
    );

    /**
     * Update existing Nhập kho record
     */
    const updateRecord = useCallback(
        async (id: string, data: NhapKhoFormData): Promise<void> => {
            try {
                const changedFields: any = {};

                if (data.htn1423_soluong !== undefined) {
                    changedFields.htn1423_soluong = data.htn1423_soluong;
                }

                if (data.htn1423_onmuachitiet) {
                    changedFields["htn1423_onmuachitiet@odata.bind"] = buildLookupBinding(
                        "htn1423_onmuachitiets",
                        data.htn1423_onmuachitiet
                    );
                }

                const result = await retry(() => Htn1423_nhapkhosService.update(id, changedFields));

                if (result.success) {
                    await fetchNhapKhos();
                } else {
                    throw new Error("Failed to update record");
                }
            } catch (err) {
                const errorMessage = handleDataverseError(err);
                setError(errorMessage);
                console.error("Error updating Nhập kho:", err);
                throw err;
            }
        },
        [retry, fetchNhapKhos]
    );

    /**
     * Soft delete Nhập kho record (set statecode=1, statuscode=2)
     */
    const deleteRecord = useCallback(
        async (id: string): Promise<void> => {
            try {
                const result = await retry(() =>
                    Htn1423_nhapkhosService.update(id, { statecode: 1, statuscode: 2 })
                );

                if (result.success) {
                    await fetchNhapKhos();
                } else {
                    throw new Error("Failed to delete record");
                }
            } catch (err) {
                const errorMessage = handleDataverseError(err);
                setError(errorMessage);
                console.error("Error deleting Nhập kho:", err);
                throw err;
            }
        },
        [retry, fetchNhapKhos]
    );

    /**
     * Activate Nhập kho record (set statecode=0, statuscode=1)
     */
    const activateRecord = useCallback(
        async (id: string): Promise<void> => {
            try {
                const result = await retry(() =>
                    Htn1423_nhapkhosService.update(id, { statecode: 0, statuscode: 1 })
                );

                if (result.success) {
                    await fetchNhapKhos();
                } else {
                    throw new Error("Failed to activate record");
                }
            } catch (err) {
                const errorMessage = handleDataverseError(err);
                setError(errorMessage);
                console.error("Error activating Nhập kho:", err);
                throw err;
            }
        },
        [retry, fetchNhapKhos]
    );

    /**
     * Handle filter changes
     */
    const setSearchTerm = useCallback(
        (term: string) => {
            setFilters((prev) => ({ ...prev, searchTerm: term }));
            resetPagination(); // Reset to page 1 when search changes
        },
        [resetPagination]
    );

    const setStatusFilter = useCallback(
        (status: "all" | "active" | "inactive") => {
            setFilters((prev) => ({ ...prev, statusFilter: status }));
            resetPagination(); // Reset to page 1 when filter changes
        },
        [resetPagination]
    );

    /**
     * Handle sort change
     */
    const setSort = useCallback(
        (field: SortField, direction: SortDirection) => {
            setSortConfig({ field, direction });
            resetPagination(); // Reset to page 1 when sorting changes
        },
        [resetPagination]
    );

    /**
     * Handle page size change
     */
    const setPageSize = useCallback(
        (size: number) => {
            paginationSetPageSize(size);
            // paginationSetPageSize already resets to page 1 and clears skip tokens
        },
        [paginationSetPageSize]
    );

    /**
     * Wrapper functions for pagination
     */
    const nextPage = useCallback(() => {
        paginationNextPage();
    }, [paginationNextPage]);

    const prevPage = useCallback(() => {
        paginationPreviousPage();
    }, [paginationPreviousPage]);

    /**
     * Initial fetch + refetch when dependencies change
     */
    useEffect(() => {
        fetchNhapKhos();
    }, [fetchNhapKhos]);

    return {
        records,
        isLoading,
        error,

        pagination,
        nextPage,
        prevPage,
        setPageSize,

        filters,
        setSearchTerm,
        setStatusFilter,
        sortConfig,
        setSort,

        createRecord,
        updateRecord,
        deleteRecord,
        activateRecord,

        refetch: fetchNhapKhos
    };
}
