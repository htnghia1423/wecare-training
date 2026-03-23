import * as React from "react";

export interface WarehouseItem {
    id: string;
    maTonKho: string;
    tenSanPham: string;
    tonThucTe: number;
    donViChuan: string;
    nhomSanPham: string;
    owner: string;
    ngayTao: Date | null;
}

/** Lightweight rows for KPI (full dataset via Web API, independent of table paging). */
export interface KpiItem {
    tonThucTe: number;
    ngayTao: Date | null;
}

export interface WarehouseOverviewProps {
    items: WarehouseItem[];
    /** When set, KPI cards use this full list instead of paginated `items`. */
    kpiAllItems?: KpiItem[];
    lowStockThreshold: number;
    hasMorePages: boolean;
    hasPrevPage: boolean;
    currentPage: number;
    pageSize: number;
    totalCount: number;
    onNextPage: () => void;
    onPrevPage: () => void;
    onChangePageSize: (size: number) => void;
    onGoToPage: (page: number) => void;
    onCreateNew: () => void;
    onViewDetail: (id: string) => void;
    onEdit: (id: string) => void;
    onDelete: (id: string, tenSanPham: string) => void;
    onExportExcel: () => void;
    onRefresh: () => void;
    isLoading: boolean;
}

function formatNumber(n: number): string {
    if (n === null || n === undefined) return "0";
    return n.toLocaleString("vi-VN");
}

function getInitials(name: string): string {
    if (!name) return "??";
    const parts = name.split(" ");
    if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    return name.substring(0, 2).toUpperCase();
}

function formatDateDisplay(isoDate: string): string {
    if (!isoDate) return "";
    const [y, m, d] = isoDate.split("-");
    return `${d}/${m}/${y}`;
}

function formatMonthDisplay(ym: string): string {
    if (!ym) return "";
    const [y, m] = ym.split("-");
    return `Tháng ${parseInt(m)}, ${y}`;
}

function toYearMonth(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

const TAG_COLORS = [
    { bg: "#C5E0E8", color: "#236E84" }, // Pale Blue / Dark Wecare Blue
    { bg: "#d4ecf5", color: "#164553" }, // Light Blue / Deep Wecare Blue
    { bg: "#e8f4f8", color: "#3492ab" }, // Very Light / Wecare Blue
    { bg: "#b5d8e4", color: "#164553" }, // Medium Blue Tint
    { bg: "#dff0d8", color: "#2e7d32" }, // Light Wecare Green
    { bg: "#c8e6c9", color: "#1b5e20" }, // Medium Green
    { bg: "#e0f2e9", color: "#236E84" }, // Pale Blue-Green
    { bg: "#f0f8fb", color: "#3492ab" }, // Almost White Blue
];

function getTagColor(name: string): { bg: string; color: string } {
    let hash = 0;
    for (let i = 0; i < name.length; i++) { hash = name.charCodeAt(i) + ((hash << 5) - hash); }
    return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}


function getPageNumbers(current: number, total: number): (number | '...')[] {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | '...')[] = [1];
    if (current > 3) pages.push('...');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('...');
    pages.push(total);
    return pages;
}

export function WarehouseOverview(props: WarehouseOverviewProps): React.ReactElement {
    const { items, kpiAllItems, lowStockThreshold, hasMorePages, hasPrevPage, currentPage, pageSize, totalCount, onNextPage, onPrevPage, onChangePageSize, onGoToPage, onCreateNew, onViewDetail, onEdit, onDelete, onExportExcel, onRefresh, isLoading } = props;
    const totalPages = totalCount > 0 ? Math.ceil(totalCount / pageSize) : null;
    const [goToPageInput, setGoToPageInput] = React.useState("");
    const [searchText, setSearchText] = React.useState("");
    const [dateFrom, setDateFrom] = React.useState<string>("");
    const [dateTo, setDateTo] = React.useState<string>("");
    const [filterMonth, setFilterMonth] = React.useState<string>(String(new Date().getMonth() + 1));
    const [filterYear, setFilterYear] = React.useState<string>(String(new Date().getFullYear()));
    const [lastUpdated, setLastUpdated] = React.useState<Date>(new Date());
    const [isRefreshing, setIsRefreshing] = React.useState(false);
    const refreshTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

    React.useEffect(() => {
        if (!isLoading) {
            setLastUpdated(new Date());
            setIsRefreshing(false);
            if (refreshTimerRef.current) {
                clearTimeout(refreshTimerRef.current);
                refreshTimerRef.current = null;
            }
        }
    }, [isLoading]);

    const currentYear = new Date().getFullYear();
    const yearOptions = Array.from({ length: 6 }, (_, i) => (currentYear - 3 + i).toString());

    // KPI: use full dataset from Web API when available; else fall back to current page (paged items).
    const kpiSource: (WarehouseItem | KpiItem)[] = kpiAllItems ?? items;

    // KPI: filter by selected month+year (only when both selected)
    const bothSelected = filterMonth !== "" && filterYear !== "";

    const kpiItems = bothSelected
        ? kpiSource.filter(i => {
            const d = i.ngayTao ? new Date(i.ngayTao) : null;
            return d !== null
                && (d.getMonth() + 1).toString() === filterMonth
                && d.getFullYear().toString() === filterYear;
        })
        : kpiSource;

    const prevMonthItems = bothSelected ? (() => {
        const m = parseInt(filterMonth), y = parseInt(filterYear);
        const pm = m === 1 ? 12 : m - 1;
        const py = m === 1 ? y - 1 : y;
        return kpiSource.filter(i => {
            const d = i.ngayTao ? new Date(i.ngayTao) : null;
            return d !== null && (d.getMonth() + 1) === pm && d.getFullYear() === py;
        });
    })() : null;

    const totalCurr   = kpiItems.length;
    const inStockCurr = kpiItems.filter(i => (i.tonThucTe || 0) > 0).length;
    const outCurr     = kpiItems.filter(i => (i.tonThucTe || 0) <= 0).length;

    function calcTrend(curr: number, prev: number): { pct: string; up: boolean } | null {
        if (prev === 0) return curr > 0 ? { pct: "100", up: true } : null;
        const val = ((curr - prev) / prev) * 100;
        return { pct: Math.abs(val).toFixed(1), up: val >= 0 };
    }

    const trendTotal = prevMonthItems ? calcTrend(totalCurr, prevMonthItems.length) : null;
    const trendIn    = prevMonthItems ? calcTrend(inStockCurr, prevMonthItems.filter(i => (i.tonThucTe || 0) > 0).length) : null;
    const trendOut   = prevMonthItems ? calcTrend(outCurr, prevMonthItems.filter(i => (i.tonThucTe || 0) <= 0).length) : null;

    // Filter
    const filtered = items.filter(i => {
        const q = searchText.toLowerCase();
        const matchText = !q ||
            i.maTonKho.toLowerCase().includes(q) ||
            i.tenSanPham.toLowerCase().includes(q) ||
            i.nhomSanPham.toLowerCase().includes(q);
        const itemDate = i.ngayTao ? new Date(i.ngayTao) : null;
        const matchFrom = !dateFrom || (itemDate !== null && itemDate >= new Date(dateFrom));
        const matchTo = !dateTo || (itemDate !== null && itemDate <= new Date(dateTo + "T23:59:59"));
        const matchMonth = !filterMonth || (itemDate !== null && (itemDate.getMonth() + 1).toString() === filterMonth);
        const matchYear = !filterYear || (itemDate !== null && itemDate.getFullYear().toString() === filterYear);
        return matchText && matchFrom && matchTo && matchMonth && matchYear;
    });

    return React.createElement(
        "div",
        { className: "wh-dashboard" },

        // ─── Header ──────────────────────────────────────────────────────────
        React.createElement("div", { className: "wh-header-area" },
            React.createElement("nav", { className: "wh-breadcrumb" }, "Dashboard › Tồn kho"),
            React.createElement("div", { className: "wh-header-row" },
                React.createElement("h1", { className: "wh-title" }, "Tổng quan kho hàng"),
                React.createElement("div", { className: "wh-header-actions" },
                    React.createElement("div", { className: "wh-date-badge wh-date-badge-picker" },
                        React.createElement("span", { className: "material-symbols-outlined" }, "calendar_today"),
                        React.createElement("select", {
                            className: "wh-month-select",
                            value: filterMonth,
                            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFilterMonth(e.target.value)
                        },
                            React.createElement("option", { value: "" }, "Tất cả tháng"),
                            ...["1","2","3","4","5","6","7","8","9","10","11","12"].map(m =>
                                React.createElement("option", { key: m, value: m }, `Tháng ${m}`)
                            )
                        ),
                        React.createElement("select", {
                            className: "wh-month-select",
                            value: filterYear,
                            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setFilterYear(e.target.value)
                        },
                            React.createElement("option", { value: "" }, "Tất cả năm"),
                            ...yearOptions.map(y =>
                                React.createElement("option", { key: y, value: y }, y)
                            )
                        ),
                        (filterMonth || filterYear) ? React.createElement("button", {
                            className: "wh-badge-clear",
                            title: "Xóa lọc tháng/năm",
                            onClick: (e: React.MouseEvent) => { e.stopPropagation(); setFilterMonth(""); setFilterYear(""); }
                        }, React.createElement("span", { className: "material-symbols-outlined" }, "close")) : null
                    ),
                    React.createElement("button", { className: "wh-btn-primary", onClick: onCreateNew }, 
                        React.createElement("span", { className: "material-symbols-outlined" }, "add_box"),
                        React.createElement("span", null, "Nhập kho mới")
                    )
                )
            )
        ),

        // ─── KPI Cards ───────────────────────────────────────────────────────
        React.createElement("div", { className: "wh-kpi-grid" },
            // Card 1
            React.createElement("div", { className: "wh-kpi-card" },
                React.createElement("div", { className: "wh-kpi-header" },
                    React.createElement("div", { className: "wh-kpi-icon-box wh-bg-cyan" },
                        React.createElement("span", { className: "material-symbols-outlined wh-text-cyan" }, "inventory_2")
                    ),
                    trendTotal ? React.createElement("div", { className: `wh-trend ${trendTotal.up ? "wh-text-green" : "wh-text-red"}` },
                        (trendTotal.up ? "🡵" : "🡶") + ` ${trendTotal.pct}%`) : null
                ),
                React.createElement("div", { className: "wh-kpi-body" },
                    React.createElement("p", { className: "wh-kpi-label" }, "SỐ SP TRONG KHO"),
                    React.createElement("div", { className: "wh-kpi-val-row" },
                        React.createElement("h2", { className: "wh-kpi-val" }, formatNumber(totalCurr)),
                        React.createElement("span", { className: "wh-kpi-unit" }, "sản phẩm")
                    )
                ),
                React.createElement("div", { className: "wh-sparkline" },
                    React.createElement("div", { className: "wh-spark-bar wh-bg-cyan", style: { width: "40%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-gray", style: { width: "20%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-gray", style: { width: "10%" } })
                )
            ),
            // Card 2
            React.createElement("div", { className: "wh-kpi-card" },
                React.createElement("div", { className: "wh-kpi-header" },
                    React.createElement("div", { className: "wh-kpi-icon-box wh-bg-green" },
                        React.createElement("span", { className: "material-symbols-outlined wh-text-green" }, "check_circle")
                    ),
                    trendIn ? React.createElement("div", { className: `wh-trend ${trendIn.up ? "wh-text-green" : "wh-text-red"}` },
                        (trendIn.up ? "🡵" : "🡶") + ` ${trendIn.pct}%`) : null
                ),
                React.createElement("div", { className: "wh-kpi-body" },
                    React.createElement("p", { className: "wh-kpi-label" }, "SỐ SP CÒN TỒN"),
                    React.createElement("div", { className: "wh-kpi-val-row" },
                        React.createElement("h2", { className: "wh-kpi-val" }, formatNumber(inStockCurr)),
                        React.createElement("span", { className: "wh-kpi-unit" }, "đang kinh doanh")
                    )
                ),
                React.createElement("div", { className: "wh-sparkline" },
                    React.createElement("div", { className: "wh-spark-bar wh-bg-green wh-opacity-30", style: { width: "30%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-green wh-opacity-60", style: { width: "40%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-green", style: { width: "25%" } })
                )
            ),
            // Card 3
            React.createElement("div", { className: "wh-kpi-card" },
                React.createElement("div", { className: "wh-kpi-header" },
                    React.createElement("div", { className: "wh-kpi-icon-box wh-bg-red" },
                        React.createElement("span", { className: "material-symbols-outlined wh-text-red" }, "error")
                    ),
                    trendOut ? React.createElement("div", { className: `wh-trend ${trendOut.up ? "wh-text-green" : "wh-text-red"}` },
                        (trendOut.up ? "🡵" : "🡶") + ` ${trendOut.pct}%`) : null
                ),
                React.createElement("div", { className: "wh-kpi-body" },
                    React.createElement("p", { className: "wh-kpi-label" }, "SỐ SP HẾT TỒN"),
                    React.createElement("div", { className: "wh-kpi-val-row" },
                        React.createElement("h2", { className: "wh-kpi-val wh-text-red" }, formatNumber(outCurr)),
                        React.createElement("span", { className: "wh-kpi-unit" }, "cần nhập gấp")
                    )
                ),
                React.createElement("div", { className: "wh-sparkline" },
                    React.createElement("div", { className: "wh-spark-bar wh-bg-red wh-opacity-30", style: { width: "20%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-red wh-opacity-60", style: { width: "40%" } }),
                    React.createElement("div", { className: "wh-spark-bar wh-bg-red", style: { width: "30%" } })
                )
            )
        ),

        // ─── Main Table Section ─────────────────────────────────────────────
        React.createElement("div", { className: "wh-table-container" },
            // Table Header / Controls
            React.createElement("div", { className: "wh-table-controls" },
                React.createElement("div", null,
                    React.createElement("h3", { className: "wh-table-title" }, "Danh sách hàng hóa"),
                    React.createElement("p", { className: "wh-table-subtitle" }, "Cập nhật lúc " + lastUpdated.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }))
                ),
                React.createElement("div", { className: "wh-table-actions" },
                    React.createElement("div", { className: "wh-search-box" },
                        React.createElement("span", { className: "material-symbols-outlined wh-search-icon" }, "search"),
                        React.createElement("input", { 
                            type: "text", 
                            placeholder: "Mã hoặc tên sản phẩm...", 
                            className: "wh-search-input",
                            value: searchText,
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSearchText(e.target.value)
                        })
                    ),
                    React.createElement("div", { className: "wh-date-range" },
                        React.createElement("span", { className: "material-symbols-outlined wh-date-range-icon" }, "calendar_month"),
                        React.createElement("input", {
                            type: "date",
                            className: "wh-date-input",
                            value: dateFrom,
                            title: "Từ ngày",
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDateFrom(e.target.value)
                        }),
                        React.createElement("span", { className: "wh-date-sep" }, "—"),
                        React.createElement("input", {
                            type: "date",
                            className: "wh-date-input",
                            value: dateTo,
                            title: "Đến ngày",
                            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setDateTo(e.target.value)
                        }),
                        (dateFrom || dateTo) ? React.createElement("button", {
                            className: "wh-btn-icon",
                            title: "Xóa bộ lọc ngày",
                            onClick: () => { setDateFrom(""); setDateTo(""); }
                        }, React.createElement("span", { className: "material-symbols-outlined" }, "close")) : null
                    ),
                    React.createElement("button", {
                        className: "wh-btn-secondary",
                        onClick: onExportExcel,
                        disabled: isLoading || filtered.length === 0,
                        title: filtered.length === 0 ? "Không có dữ liệu để xuất" : "Xuất Excel"
                    },
                        React.createElement("span", { className: "material-symbols-outlined" }, "description"),
                        React.createElement("span", null, "Xuất Excel")
                    ),
                    React.createElement("button", {
                        className: "wh-btn-icon-only",
                        onClick: () => {
                            setIsRefreshing(true);
                            if (refreshTimerRef.current) clearTimeout(refreshTimerRef.current);
                            refreshTimerRef.current = setTimeout(() => setIsRefreshing(false), 2500);
                            onRefresh();
                        },
                        disabled: isLoading || isRefreshing,
                        title: "Làm mới dữ liệu"
                    }, React.createElement("span", {
                        className: "material-symbols-outlined" + (isRefreshing ? " wh-spin" : "")
                    }, "refresh"))
                )
            ),
            
            // The Table
            React.createElement("div", { className: "wh-table-scroll" },
                React.createElement("table", { className: "wh-data-table" },
                    React.createElement("thead", null,
                        React.createElement("tr", null,
                            React.createElement("th", null, "AUTOCODE"),
                            React.createElement("th", null, "TÊN SẢN PHẨM"),
                            React.createElement("th", { className: "wh-text-center" }, "TỒN THỰC TẾ"),
                            React.createElement("th", null, "ĐƠN VỊ"),
                            React.createElement("th", null, "NHÓM SẢN PHẨM"),
                            React.createElement("th", null, "NGƯỜI QUẢN LÝ"),
                            React.createElement("th", { className: "wh-text-center" }, "HÀNH ĐỘNG")
                        )
                    ),
                    React.createElement("tbody", null,
                        isLoading
                        ? Array.from({ length: 5 }, (_, i) =>
                            React.createElement("tr", { key: `skeleton-${i}`, className: "wh-skeleton-row" },
                                ...Array.from({ length: 8 }, (__, j) =>
                                    React.createElement("td", { key: j },
                                        React.createElement("div", { className: "wh-skeleton-cell" })
                                    )
                                )
                            )
                          )
                        : filtered.length === 0 
                        ? React.createElement("tr", null, 
                            React.createElement("td", { colSpan: 7, className: "wh-empty-state" }, "Không có dữ liệu phù hợp")
                          )
                        : filtered.map(item => {
                            const ton = item.tonThucTe || 0;
                            const isOut = ton <= 0;
                            const isLow = ton > 0 && ton < lowStockThreshold;
                            
                            return React.createElement("tr", { key: item.id },
                                // Autocode
                                React.createElement("td", { className: "wh-cell-mono wh-text-cyan" }, item.maTonKho || "—"),
                                // Tên sản phẩm
                                React.createElement("td", null,
                                    React.createElement("div", { className: "wh-product-cell" },
                                        React.createElement("div", null,
                                            React.createElement("div", { className: "wh-product-name" }, item.tenSanPham || "—"),
                                            React.createElement("div", { className: "wh-product-sub" }, "Cập nhật: " + (item.ngayTao ? new Date(item.ngayTao).toLocaleString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—"))
                                        )
                                    )
                                ),
                                // Tồn thực tế + Status
                                React.createElement("td", { className: "wh-text-center" },
                                    React.createElement("div", { className: "wh-stock-cell" },
                                        React.createElement("span", { className: `wh-stock-num ${isOut || isLow ? "wh-text-red" : ""}` }, formatNumber(ton)),
                                        isOut ? React.createElement("span", { className: "wh-stock-badge wh-stock-badge-out" }, "HẾT HÀNG") : 
                                        isLow ? React.createElement("span", { className: "wh-stock-badge wh-stock-badge-low" }, "SẮP HẾT") : null
                                    )
                                ),
                                // Đơn vị
                                React.createElement("td", { className: "wh-cell-muted" }, item.donViChuan || "—"),
                                // Nhóm sản phẩm (Tag)
                                React.createElement("td", null, (() => {
                                    const tc = getTagColor(item.nhomSanPham || "Khác");
                                    return React.createElement("span", {
                                        className: "wh-group-tag",
                                        style: { background: tc.bg, color: tc.color }
                                    }, item.nhomSanPham || "Khác");
                                })()),
                                // Người quản lý (Avatar)
                                React.createElement("td", null,
                                    React.createElement("div", { className: "wh-owner-cell" },
                                        React.createElement("div", { className: "wh-avatar" }, getInitials(item.owner)),
                                        React.createElement("span", { className: "wh-owner-name" }, item.owner || "—")
                                    )
                                ),
                                // Hành động
                                React.createElement("td", { className: "wh-text-center" },
                                    React.createElement("div", { className: "wh-actions-cell" },
                                        React.createElement("button", { className: "wh-action-btn wh-hover-cyan", title: "Xem chi tiết", onClick: () => onViewDetail(item.id) }, React.createElement("span", { className: "material-symbols-outlined" }, "visibility")),
                                        React.createElement("button", { className: "wh-action-btn wh-hover-cyan", title: "Chỉnh sửa", onClick: () => onEdit(item.id) }, React.createElement("span", { className: "material-symbols-outlined" }, "edit")),
                                        React.createElement("button", { className: "wh-action-btn wh-hover-red", title: "Xóa", onClick: () => onDelete(item.id, item.tenSanPham) }, React.createElement("span", { className: "material-symbols-outlined" }, "delete"))
                                    )
                                )
                            );
                        })
                    )
                )
            ),

            // Pagination Footer
            React.createElement("div", { className: "wh-table-footer" },
                React.createElement("span", { className: "wh-pagination-info" },
                    "Trang ", React.createElement("span", { className: "wh-font-bold" }, currentPage),
                    totalPages ? [" / ", React.createElement("span", { key: "tp", className: "wh-font-bold" }, totalPages), " trang"] : null,
                    totalCount > 0
                        ? [" · Tổng ", React.createElement("span", { key: "tc", className: "wh-font-bold" }, formatNumber(totalCount)), " sản phẩm"]
                        : [" · ", React.createElement("span", { key: "il", className: "wh-font-bold" }, formatNumber(items.length)), " sản phẩm (trang này)"]
                ),
                React.createElement("div", { className: "wh-pagination-right" },
                    // Go-to page
                    React.createElement("label", { className: "wh-page-size-label" }, "Đến trang:"),
                    React.createElement("input", {
                        type: "number",
                        className: "wh-goto-input",
                        min: 1,
                        placeholder: currentPage.toString(),
                        value: goToPageInput,
                        onChange: (e: React.ChangeEvent<HTMLInputElement>) => setGoToPageInput(e.target.value),
                        onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => {
                            if (e.key === "Enter") {
                                const p = parseInt(goToPageInput);
                                if (!isNaN(p) && p >= 1) { onGoToPage(p); setGoToPageInput(""); }
                            }
                        }
                    }),
                    // Page size
                    React.createElement("label", { className: "wh-page-size-label" }, "Hàng/trang:"),
                    React.createElement("select", {
                        className: "wh-page-size-select",
                        value: pageSize,
                        onChange: (e: React.ChangeEvent<HTMLSelectElement>) => onChangePageSize(parseInt(e.target.value))
                    },
                        [5, 10, 15, 20, 25, 50, 100, 250].map(n =>
                            React.createElement("option", { key: n, value: n }, n)
                        )
                    ),
                    // Prev / Numbered pages / Next
                    React.createElement("div", { className: "wh-pagination-controls" },
                        React.createElement("button", { className: "wh-page-btn", disabled: !hasPrevPage, onClick: onPrevPage },
                            React.createElement("span", { className: "material-symbols-outlined" }, "chevron_left")
                        ),
                        ...(totalPages
                            ? getPageNumbers(currentPage, totalPages).map((p, i) =>
                                p === '...'
                                    ? React.createElement("span", { key: `ellipsis-${i}`, className: "wh-page-ellipsis" }, "…")
                                    : React.createElement("button", {
                                        key: p,
                                        className: p === currentPage ? "wh-page-btn wh-page-btn-active" : "wh-page-btn wh-page-btn-num",
                                        onClick: p !== currentPage ? () => onGoToPage(p) : undefined
                                    }, p.toString())
                              )
                            : [React.createElement("button", { key: "cp", className: "wh-page-btn wh-page-btn-active" }, currentPage.toString())]
                        ),
                        React.createElement("button", { className: "wh-page-btn", disabled: !hasMorePages, onClick: onNextPage },
                            React.createElement("span", { className: "material-symbols-outlined" }, "chevron_right")
                        )
                    )
                )
            )
        )
    );
}
