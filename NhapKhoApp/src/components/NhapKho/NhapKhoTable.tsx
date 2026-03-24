import React from "react";
import {
    IoArrowUp,
    IoArrowDown,
    IoPencil,
    IoStopCircle,
    IoPlayCircle,
    IoEye
} from "react-icons/io5";
import type { NhapKhoTableRow, SortConfig, SortField } from "./types";

type NhapKhoRowWithAnnotations = NhapKhoTableRow & {
    "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"?: string;
};
import { Button } from "../common/Button";
import { SkeletonRow } from "./SkeletonRow";
import { formatDate, formatNumber } from "../../utils/formatters";

export interface NhapKhoTableProps {
    records: NhapKhoTableRow[];
    isLoading: boolean;
    sortConfig: SortConfig;
    onSort: (field: SortField) => void;
    onView: (record: NhapKhoTableRow) => void;
    onEdit: (record: NhapKhoTableRow) => void;
    onDelete: (record: NhapKhoTableRow) => void;
    onActivate: (record: NhapKhoTableRow) => void;
    onViewOnMuaChiTiet: (record: NhapKhoTableRow) => void;
    onViewSanPham: (record: NhapKhoTableRow) => void;
}

export const NhapKhoTable: React.FC<NhapKhoTableProps> = ({
    records,
    isLoading,
    sortConfig,
    onSort,
    onView,
    onEdit,
    onDelete,
    onActivate,
    onViewOnMuaChiTiet,
    onViewSanPham
}) => {
    const renderSortIcon = (field: SortField) => {
        if (sortConfig.field !== field) {
            return null;
        }
        return sortConfig.direction === "asc" ? (
            <IoArrowUp className="wecare-table__sort-icon" />
        ) : (
            <IoArrowDown className="wecare-table__sort-icon" />
        );
    };

    const renderSortableHeader = (label: string, field: SortField) => (
        <th
            className="wecare-table__header wecare-table__header--sortable"
            onClick={() => onSort(field)}
        >
            <span className="wecare-table__header-content">
                {label}
                {renderSortIcon(field)}
            </span>
        </th>
    );

    const getStatusBadge = (statecode?: number) => {
        if (statecode === 0) {
            return <span className="wecare-badge wecare-badge--success">Hoạt động</span>;
        }
        return <span className="wecare-badge wecare-badge--inactive">Không hoạt động</span>;
    };

    return (
        <div className="wecare-table-container">
            <table className="wecare-table">
                <thead>
                    <tr>
                        {renderSortableHeader("Mã nhập kho", "htn1423_name")}
                        {renderSortableHeader("Số lượng", "htn1423_soluong")}
                        <th className="wecare-table__header">Đơn mua chi tiết</th>
                        <th className="wecare-table__header">Tên sản phẩm</th>
                        {renderSortableHeader("Ngày tạo", "createdon")}
                        <th className="wecare-table__header">Trạng thái</th>
                        <th className="wecare-table__header wecare-table__header--actions">
                            Thao tác
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {isLoading ? (
                        // Show skeleton rows while loading
                        Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={index} />)
                    ) : records.length === 0 ? (
                        <tr>
                            <td colSpan={7} className="wecare-table__empty">
                                Không có dữ liệu
                            </td>
                        </tr>
                    ) : (
                        records.map((record) => (
                            <tr key={record.htn1423_nhapkhoid} className="wecare-table__row">
                                <td className="wecare-table__cell">{record.htn1423_name || "-"}</td>
                                <td className="wecare-table__cell">
                                    {record.htn1423_soluong !== undefined
                                        ? formatNumber(record.htn1423_soluong)
                                        : "-"}
                                </td>
                                <td className="wecare-table__cell">
                                    {record._htn1423_onmuachitiet_value ? (
                                        <button
                                            className="wecare-table__link"
                                            onClick={() => onViewOnMuaChiTiet(record)}
                                            type="button"
                                        >
                                            {record.htn1423_onmuachitietname ||
                                                (record as NhapKhoRowWithAnnotations)[
                                                    "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"
                                                ] ||
                                                "-"}
                                        </button>
                                    ) : (
                                        (record as NhapKhoRowWithAnnotations)[
                                            "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"
                                        ] || "-"
                                    )}
                                </td>
                                <td className="wecare-table__cell">
                                    {record._htn1423_onmuachitiet_value &&
                                    record.htn1423_tensanpham ? (
                                        <button
                                            className="wecare-table__link"
                                            onClick={() => onViewSanPham(record)}
                                            type="button"
                                        >
                                            {record.htn1423_tensanpham}
                                        </button>
                                    ) : (
                                        record.htn1423_tensanpham || "-"
                                    )}
                                </td>
                                <td className="wecare-table__cell">
                                    {record.createdon ? formatDate(record.createdon) : "-"}
                                </td>
                                <td className="wecare-table__cell">
                                    {getStatusBadge(record.statecode)}
                                </td>
                                <td className="wecare-table__cell wecare-table__cell--actions">
                                    <span className="wecare-tooltip">
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            icon={<IoEye />}
                                            onClick={() => onView(record)}
                                            aria-label="Xem chi tiết"
                                            className="wecare-btn-icon-only"
                                        >
                                            {" "}
                                        </Button>
                                        <span className="wecare-tooltip__bubble">Xem chi tiết</span>
                                    </span>
                                    <span className="wecare-tooltip">
                                        <Button
                                            variant="ghost"
                                            size="small"
                                            icon={<IoPencil />}
                                            onClick={() => onEdit(record)}
                                            disabled={record.statecode !== 0}
                                            aria-label="Sửa"
                                            className="wecare-btn-icon-only"
                                        >
                                            {" "}
                                        </Button>
                                        <span className="wecare-tooltip__bubble">Sửa</span>
                                    </span>
                                    {record.statecode === 0 ? (
                                        <span className="wecare-tooltip">
                                            <Button
                                                variant="danger"
                                                size="small"
                                                icon={<IoStopCircle />}
                                                onClick={() => onDelete(record)}
                                                aria-label="Ngừng"
                                                className="wecare-btn-icon-only"
                                            >
                                                {" "}
                                            </Button>
                                            <span className="wecare-tooltip__bubble">
                                                Ngừng hoạt động
                                            </span>
                                        </span>
                                    ) : (
                                        <span className="wecare-tooltip">
                                            <Button
                                                variant="success"
                                                size="small"
                                                icon={<IoPlayCircle />}
                                                onClick={() => onActivate(record)}
                                                aria-label="Kích hoạt"
                                                className="wecare-btn-icon-only"
                                            >
                                                {" "}
                                            </Button>
                                            <span className="wecare-tooltip__bubble">
                                                Kích hoạt
                                            </span>
                                        </span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};
