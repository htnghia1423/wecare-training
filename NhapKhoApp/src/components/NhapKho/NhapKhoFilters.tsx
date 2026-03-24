import React, { useState, useEffect } from "react";
import { IoSearch, IoAdd, IoRefresh, IoDownload } from "react-icons/io5";
import { Button } from "../common/Button";
import type { FilterConfig } from "./types";

export interface NhapKhoFiltersProps {
    filters: FilterConfig;
    onSearchChange: (searchTerm: string) => void;
    onStatusFilterChange: (status: "all" | "active" | "inactive") => void;
    onCreateNew: () => void;
    onRefresh: () => void;
    onExport: () => void;
    isLoading?: boolean;
    hasRecords?: boolean;
}

export const NhapKhoFilters: React.FC<NhapKhoFiltersProps> = ({
    filters,
    onSearchChange,
    onStatusFilterChange,
    onCreateNew,
    onRefresh,
    onExport,
    isLoading = false,
    hasRecords = true
}) => {
    const [localSearch, setLocalSearch] = useState(filters.searchTerm);

    // Debounce: only call onSearchChange 400ms after the user stops typing
    useEffect(() => {
        const timer = setTimeout(() => {
            onSearchChange(localSearch);
        }, 400);
        return () => clearTimeout(timer);
    }, [localSearch, onSearchChange]);

    // Keep local state in sync if parent resets the search externally
    useEffect(() => {
        setLocalSearch(filters.searchTerm);
    }, [filters.searchTerm]);

    return (
        <div className="wecare-filters">
            <div className="wecare-filters__search">
                <div className="wecare-input-group">
                    <span className="wecare-input-group__icon">
                        <IoSearch />
                    </span>
                    <input
                        type="text"
                        className="wecare-input wecare-input--search"
                        placeholder="Tìm kiếm theo mã, số lượng, tên sản phẩm..."
                        value={localSearch}
                        onChange={(e) => setLocalSearch(e.target.value)}
                    />
                </div>
            </div>

            <div className="wecare-filters__controls">
                <select
                    className="wecare-select"
                    value={filters.statusFilter}
                    onChange={(e) =>
                        onStatusFilterChange(e.target.value as "all" | "active" | "inactive")
                    }
                >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="active">Đang hoạt động</option>
                    <option value="inactive">Không hoạt động</option>
                </select>

                <div className="wecare-tooltip">
                    <Button
                        variant="ghost"
                        size="medium"
                        icon={<IoRefresh />}
                        onClick={onRefresh}
                        disabled={isLoading}
                        aria-label="Làm mới"
                    />
                    <span className="wecare-tooltip__bubble">Làm mới</span>
                </div>

                <div className="wecare-tooltip">
                    <Button
                        variant="ghost"
                        size="medium"
                        icon={<IoDownload />}
                        onClick={onExport}
                        disabled={isLoading || !hasRecords}
                        aria-label="Xuất Excel"
                    />
                    <span className="wecare-tooltip__bubble">Xuất Excel</span>
                </div>

                <Button variant="primary" size="medium" icon={<IoAdd />} onClick={onCreateNew}>
                    Tạo mới
                </Button>
            </div>
        </div>
    );
};
