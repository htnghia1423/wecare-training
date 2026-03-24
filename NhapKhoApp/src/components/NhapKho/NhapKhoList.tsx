import React, { useState } from "react";
import * as XLSX from "xlsx";
import { useNhapKho } from "../../hooks/useNhapKho";
import { NhapKhoFilters } from "./NhapKhoFilters";
import { NhapKhoTable } from "./NhapKhoTable";
import { NhapKhoForm } from "./NhapKhoForm";
import { Pagination } from "./Pagination";
import { DeleteConfirmDialog } from "./DeleteConfirmDialog";
import { ActivateConfirmDialog } from "./ActivateConfirmDialog";
import wecarelogo from "../../assets/wecare-logo.svg";
import { NhapKhoDetailDialog } from "./NhapKhoDetailDialog";
import { OnMuaChiTietDetailDialog } from "./OnMuaChiTietDetailDialog";
import { SanPhamDetailDialog } from "./SanPhamDetailDialog";
import { ErrorMessage } from "../common/ErrorMessage";
import { EmptyState } from "../common/EmptyState";
import { ToastContainer } from "../common/ToastContainer";
import { useToast } from "../../hooks/useToast";
import { useCurrentUser } from "../../hooks/useCurrentUser";
import type { FormMode, NhapKhoTableRow, NhapKhoFormData, SortField } from "./types";
import { IoAdd, IoSearch, IoFolderOpen } from "react-icons/io5";
import { Button } from "../common/Button";

export const NhapKhoList: React.FC = () => {
    const {
        records,
        isLoading,
        error,
        filters,
        sortConfig,
        pagination,
        setSearchTerm,
        setStatusFilter,
        setSort,
        nextPage,
        prevPage,
        setPageSize,
        createRecord,
        updateRecord,
        deleteRecord,
        activateRecord,
        refetch
    } = useNhapKho();

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [formMode, setFormMode] = useState<FormMode>("create");
    const [selectedRecord, setSelectedRecord] = useState<NhapKhoTableRow | undefined>(undefined);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [recordToDelete, setRecordToDelete] = useState<NhapKhoTableRow | undefined>(undefined);
    const [isDeleting, setIsDeleting] = useState(false);

    const [isActivateDialogOpen, setIsActivateDialogOpen] = useState(false);
    const [recordToActivate, setRecordToActivate] = useState<NhapKhoTableRow | undefined>(
        undefined
    );
    const [isActivating, setIsActivating] = useState(false);

    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [detailRecordId, setDetailRecordId] = useState<string | undefined>(undefined);

    const [isOmctDetailOpen, setIsOmctDetailOpen] = useState(false);
    const [omctDetailId, setOmctDetailId] = useState<string | undefined>(undefined);

    const [isSanPhamDetailOpen, setIsSanPhamDetailOpen] = useState(false);
    const [sanPhamOnmuachitietId, setSanPhamOnmuachitietId] = useState<string | undefined>(
        undefined
    );

    const { toasts, showToast, dismissToast } = useToast();
    const currentUser = useCurrentUser();

    const handleCreateNew = () => {
        setFormMode("create");
        setSelectedRecord(undefined);
        setIsFormOpen(true);
    };

    const handleViewDetail = (record: NhapKhoTableRow) => {
        setDetailRecordId(record.htn1423_nhapkhoid);
        setIsDetailOpen(true);
    };

    const handleViewOnMuaChiTiet = (record: NhapKhoTableRow) => {
        setOmctDetailId(record._htn1423_onmuachitiet_value);
        setIsOmctDetailOpen(true);
    };

    const handleViewSanPham = (record: NhapKhoTableRow) => {
        setSanPhamOnmuachitietId(record._htn1423_onmuachitiet_value);
        setIsSanPhamDetailOpen(true);
    };

    const handleExportExcel = () => {
        const now = new Date();
        const pad = (n: number) => String(n).padStart(2, "0");
        const datetime = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;

        const data = records.map((r) => {
            const rAnnotated = r as NhapKhoTableRow & {
                "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"?: string;
            };
            return {
                "Mã nhập kho": r.htn1423_name ?? "",
                "Số lượng": r.htn1423_soluong ?? "",
                "Đơn mua chi tiết":
                    r.htn1423_onmuachitietname ||
                    rAnnotated[
                        "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"
                    ] ||
                    "",
                "Tên sản phẩm": r.htn1423_tensanpham ?? "",
                "Ngày tạo": r.createdon ?? "",
                "Trạng thái": r.statecode === 0 ? "Hoạt động" : "Không hoạt động"
            };
        });

        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Nhập Kho");
        XLSX.writeFile(wb, `Nhập Kho_${datetime}.xlsx`);
    };

    const handleEdit = (record: NhapKhoTableRow) => {
        setFormMode("edit");
        setSelectedRecord(record);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (record: NhapKhoTableRow) => {
        setRecordToDelete(record);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!recordToDelete?.htn1423_nhapkhoid) return;

        setIsDeleting(true);
        try {
            await deleteRecord(recordToDelete.htn1423_nhapkhoid);
            setIsDeleteDialogOpen(false);
            setRecordToDelete(undefined);
            showToast(`Đã ngừng "${recordToDelete.htn1423_name}" thành công.`, "success");
        } catch (error) {
            console.error("Delete error:", error);
            showToast("Không thể ngừng bản ghi. Vui lòng thử lại.", "error");
        } finally {
            setIsDeleting(false);
        }
    };

    const handleActivateClick = (record: NhapKhoTableRow) => {
        setRecordToActivate(record);
        setIsActivateDialogOpen(true);
    };

    const handleActivateConfirm = async () => {
        if (!recordToActivate?.htn1423_nhapkhoid) return;

        setIsActivating(true);
        try {
            await activateRecord(recordToActivate.htn1423_nhapkhoid);
            setIsActivateDialogOpen(false);
            setRecordToActivate(undefined);
            showToast(`Đã kích hoạt "${recordToActivate.htn1423_name}" thành công.`, "success");
        } catch (error) {
            console.error("Activate error:", error);
            showToast("Không thể kích hoạt bản ghi. Vui lòng thử lại.", "error");
        } finally {
            setIsActivating(false);
        }
    };

    const handleSave = async (data: NhapKhoFormData) => {
        try {
            if (formMode === "create") {
                await createRecord(data);
                showToast("Tạo mới nhập kho thành công.", "success");
            } else if (formMode === "edit" && selectedRecord?.htn1423_nhapkhoid) {
                await updateRecord(selectedRecord.htn1423_nhapkhoid, data);
                showToast(`Đã cập nhật "${selectedRecord.htn1423_name}" thành công.`, "success");
            }
        } catch (error) {
            showToast("Lưu không thành công. Vui lòng thử lại.", "error");
            throw error; // re-throw so form stays open on error
        }
    };

    const handleSort = (field: SortField) => {
        // Toggle direction if same field, otherwise default to ascending
        const newDirection =
            sortConfig.field === field && sortConfig.direction === "asc" ? "desc" : "asc";
        setSort(field, newDirection);
    };

    const handlePageChange = (direction: "next" | "previous") => {
        if (direction === "next") {
            nextPage();
        } else {
            prevPage();
        }
    };

    // Show error message if there's an error and no records
    if (error && records.length === 0) {
        return (
            <div className="wecare-container">
                <div className="wecare-header">
                    <div className="wecare-header__brand">
                        <img src={wecarelogo} alt="WeCare logo" className="wecare-header__logo" />
                        <h1 className="wecare-title">Quản lý Nhập kho</h1>
                    </div>
                </div>
                <ErrorMessage message={error} onRetry={refetch} />
            </div>
        );
    }

    const isEmpty = !isLoading && !error && records.length === 0;
    const isSearchEmpty = isEmpty && !!filters.searchTerm;
    const isFilterEmpty = isEmpty && !filters.searchTerm && filters.statusFilter !== "active";
    const isBlankSlate = isEmpty && !filters.searchTerm && filters.statusFilter === "active";

    return (
        <div className="wecare-container">
            <div className="wecare-header">
                <div className="wecare-header__brand">
                    <img src={wecarelogo} alt="WeCare logo" className="wecare-header__logo" />
                    <div>
                        <h1 className="wecare-title">Quản lý Nhập kho</h1>
                        <p className="wecare-subtitle">Theo dõi và quản lý hàng hóa nhập kho</p>
                    </div>
                </div>
                <div className="wecare-header__actions">
                    {currentUser && (
                        <div className="wecare-user-info">
                            <div className="wecare-user-info__avatar" aria-hidden="true">
                                {currentUser.initials}
                            </div>
                            <div className="wecare-user-info__text">
                                <span className="wecare-user-info__name">
                                    {currentUser.fullName}
                                </span>
                                <span className="wecare-user-info__email">{currentUser.email}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <NhapKhoFilters
                filters={filters}
                onSearchChange={setSearchTerm}
                onStatusFilterChange={setStatusFilter}
                onCreateNew={handleCreateNew}
                onRefresh={refetch}
                onExport={handleExportExcel}
                isLoading={isLoading}
                hasRecords={records.length > 0}
            />

            {isBlankSlate ? (
                <EmptyState
                    icon={<IoFolderOpen size={64} />}
                    title="Chưa có dữ liệu"
                    message="Chưa có bản ghi nhập kho nào. Nhấn nút 'Tạo mới' để bắt đầu."
                    action={
                        <Button variant="primary" icon={<IoAdd />} onClick={handleCreateNew}>
                            Tạo mới
                        </Button>
                    }
                />
            ) : isSearchEmpty ? (
                <EmptyState
                    icon={<IoSearch size={56} />}
                    title="Không tìm thấy kết quả"
                    message={`Không có bản ghi nào khớp với từ khóa “${filters.searchTerm}”.`}
                />
            ) : isFilterEmpty ? (
                <EmptyState
                    icon={<IoFolderOpen size={56} />}
                    title="Không có bản ghi"
                    message="Không có bản ghi nào với trạng thái đã chọn."
                />
            ) : (
                <>
                    <NhapKhoTable
                        records={records}
                        isLoading={isLoading}
                        sortConfig={sortConfig}
                        onSort={handleSort}
                        onView={handleViewDetail}
                        onActivate={handleActivateClick}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                        onViewOnMuaChiTiet={handleViewOnMuaChiTiet}
                        onViewSanPham={handleViewSanPham}
                    />
                    <Pagination
                        currentPage={pagination.currentPage}
                        pageSize={pagination.pageSize}
                        totalRecords={pagination.totalRecords}
                        hasNextPage={pagination.hasNextPage}
                        hasPreviousPage={pagination.hasPrevPage}
                        onPageChange={handlePageChange}
                        onPageSizeChange={setPageSize}
                        isLoading={isLoading}
                    />
                </>
            )}

            <NhapKhoForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                onSave={handleSave}
                mode={formMode}
                initialData={selectedRecord}
            />

            <DeleteConfirmDialog
                isOpen={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={handleDeleteConfirm}
                recordName={recordToDelete?.htn1423_name || ""}
                isDeleting={isDeleting}
            />

            <ActivateConfirmDialog
                isOpen={isActivateDialogOpen}
                onClose={() => setIsActivateDialogOpen(false)}
                onConfirm={handleActivateConfirm}
                recordName={recordToActivate?.htn1423_name || ""}
                isActivating={isActivating}
            />

            <ToastContainer toasts={toasts} onDismiss={dismissToast} />

            <NhapKhoDetailDialog
                isOpen={isDetailOpen}
                onClose={() => setIsDetailOpen(false)}
                recordId={detailRecordId}
            />

            <OnMuaChiTietDetailDialog
                isOpen={isOmctDetailOpen}
                onClose={() => setIsOmctDetailOpen(false)}
                recordId={omctDetailId}
            />

            <SanPhamDetailDialog
                isOpen={isSanPhamDetailOpen}
                onClose={() => setIsSanPhamDetailOpen(false)}
                onmuachitietId={sanPhamOnmuachitietId}
            />
        </div>
    );
};
