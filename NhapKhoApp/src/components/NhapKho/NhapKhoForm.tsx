import React, { useState, useEffect, useRef } from "react";
import { IoSave, IoInformationCircleOutline } from "react-icons/io5";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";
import type { NhapKhoFormData, FormMode, NhapKhoTableRow } from "./types";
import { useOnMuaChiTiet } from "../../hooks/useOnMuaChiTiet";
import { validateSoLuong } from "../../utils/validation";
import { LoadingSpinner } from "../common/LoadingSpinner";
import { ErrorMessage } from "../common/ErrorMessage";

export interface NhapKhoFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: NhapKhoFormData, closeAfterSave: boolean) => Promise<void>;
    mode: FormMode;
    initialData?: NhapKhoTableRow;
}

export const NhapKhoForm: React.FC<NhapKhoFormProps> = ({
    isOpen,
    onClose,
    onSave,
    mode,
    initialData
}) => {
    const [formData, setFormData] = useState<NhapKhoFormData>({
        htn1423_soluong: undefined,
        htn1423_onmuachitiet: undefined
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Searchable lookup state
    const [lookupSearch, setLookupSearch] = useState("");
    const [isLookupOpen, setIsLookupOpen] = useState(false);
    const lookupRef = useRef<HTMLDivElement>(null);

    const {
        lookupData,
        isLoading: isLoadingLookup,
        error: lookupError,
        refetch
    } = useOnMuaChiTiet();

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (lookupRef.current && !lookupRef.current.contains(e.target as Node)) {
                setIsLookupOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Initialize form data when opening
    useEffect(() => {
        if (isOpen && initialData && mode === "edit") {
            setFormData({
                htn1423_soluong: initialData.htn1423_soluong,
                htn1423_onmuachitiet: initialData._htn1423_onmuachitiet_value
            });
            setErrors({});
        } else if (isOpen && mode === "create") {
            setFormData({
                htn1423_soluong: undefined,
                htn1423_onmuachitiet: undefined
            });
            setErrors({});
            setLookupSearch("");
        }
    }, [isOpen, initialData, mode]);

    // Sync lookupSearch display with selected value
    useEffect(() => {
        if (formData.htn1423_onmuachitiet && lookupData.length > 0) {
            const selected = lookupData.find(
                (item) => item.htn1423_onmuachitietid === formData.htn1423_onmuachitiet
            );
            if (selected) setLookupSearch(selected.displayName);
        }
    }, [formData.htn1423_onmuachitiet, lookupData]);

    const filteredLookupData = lookupData.filter((item) =>
        item.displayName.toLowerCase().includes(lookupSearch.toLowerCase())
    );

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        // Validate số lượng
        const soLuongError = validateSoLuong(formData.htn1423_soluong);
        if (soLuongError) {
            newErrors.htn1423_soluong = soLuongError;
        }

        // Validate lookup field (required)
        if (!formData.htn1423_onmuachitiet) {
            newErrors.htn1423_onmuachitiet = "Vui lòng chọn đơn mua chi tiết";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;

        setIsSaving(true);
        try {
            const dataToSave: NhapKhoFormData = {
                ...formData,
                htn1423_soluong: formData.htn1423_soluong
                    ? Number(formData.htn1423_soluong)
                    : undefined
            };
            await onSave(dataToSave, true);
            onClose();
        } catch (error) {
            console.error("Form save error:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleFieldChange = (field: keyof NhapKhoFormData, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error for this field when user makes changes
        if (errors[field]) {
            setErrors((prev) => {
                const newErrors = { ...prev };
                delete newErrors[field];
                return newErrors;
            });
        }
    };

    const footer = (
        <div className="wecare-modal__actions">
            <Button variant="ghost" onClick={onClose} disabled={isSaving}>
                Hủy
            </Button>
            <Button
                variant="primary"
                icon={<IoSave />}
                onClick={handleSave}
                isLoading={isSaving}
                disabled={mode === "view"}
            >
                Lưu
            </Button>
        </div>
    );

    const title =
        mode === "create"
            ? "Tạo mới Nhập kho"
            : mode === "edit"
              ? "Chỉnh sửa Nhập kho"
              : "Chi tiết Nhập kho";

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={title}
            footer={footer}
            size="medium"
            closeOnBackdropClick={!isSaving}
        >
            <div className="wecare-form">
                {/* Auto-number field - only shown in edit mode, always read-only */}
                {mode === "edit" && initialData && (
                    <div className="wecare-form__group">
                        <label className="wecare-form__label">Mã nhập kho</label>
                        <input
                            type="text"
                            className="wecare-input"
                            value={initialData.htn1423_name || ""}
                            disabled
                            readOnly
                        />
                        <p className="wecare-form__hint">Mã tự động, không thể chỉnh sửa</p>
                    </div>
                )}

                {/* Đơn mua chi tiết - Lookup field */}
                <div className="wecare-form__group">
                    <label className="wecare-form__label" htmlFor="htn1423_onmuachitiet">
                        Đơn mua chi tiết <span className="wecare-form__required">*</span>
                    </label>
                    {isLoadingLookup ? (
                        <LoadingSpinner size="small" text="Đang tải..." />
                    ) : lookupError ? (
                        <ErrorMessage
                            message="Không thể tải danh sách đơn mua chi tiết"
                            onRetry={refetch}
                        />
                    ) : (
                        <div ref={lookupRef} className="wecare-lookup">
                            <input
                                id="lookup-search"
                                type="text"
                                className={`wecare-input ${errors.htn1423_onmuachitiet ? "wecare-input--error" : ""}`}
                                placeholder="Tìm kiếm đơn mua chi tiết..."
                                value={lookupSearch}
                                onChange={(e) => {
                                    setLookupSearch(e.target.value);
                                    setIsLookupOpen(true);
                                    if (!e.target.value)
                                        handleFieldChange("htn1423_onmuachitiet", undefined);
                                }}
                                onFocus={() => setIsLookupOpen(true)}
                                disabled={mode === "view" || isSaving}
                                autoComplete="off"
                            />
                            {isLookupOpen && filteredLookupData.length > 0 && (
                                <ul className="wecare-lookup__list">
                                    {filteredLookupData.map((item) => (
                                        <li
                                            key={item.htn1423_onmuachitietid}
                                            className={`wecare-lookup__item ${
                                                formData.htn1423_onmuachitiet ===
                                                item.htn1423_onmuachitietid
                                                    ? "wecare-lookup__item--selected"
                                                    : ""
                                            }`}
                                            onMouseDown={(e) => {
                                                e.preventDefault();
                                                handleFieldChange(
                                                    "htn1423_onmuachitiet",
                                                    item.htn1423_onmuachitietid
                                                );
                                                setLookupSearch(item.displayName);
                                                setIsLookupOpen(false);
                                            }}
                                        >
                                            {item.displayName}
                                        </li>
                                    ))}
                                </ul>
                            )}
                            {isLookupOpen && filteredLookupData.length === 0 && lookupSearch && (
                                <ul className="wecare-lookup__list">
                                    <li className="wecare-lookup__item wecare-lookup__item--empty">
                                        Không tìm thấy kết quả
                                    </li>
                                </ul>
                            )}
                        </div>
                    )}
                    {errors.htn1423_onmuachitiet && (
                        <p className="wecare-form__error">{errors.htn1423_onmuachitiet}</p>
                    )}
                </div>

                {/* Số lượng - Number field */}
                <div className="wecare-form__group">
                    <label className="wecare-form__label" htmlFor="htn1423_soluong">
                        Số lượng <span className="wecare-form__required">*</span>
                        <span
                            className="wecare-tooltip"
                            title="Số lượng phải lớn hơn 0 (cho phép số thập phân)"
                        >
                            <IoInformationCircleOutline size={14} />
                        </span>
                    </label>
                    <input
                        id="htn1423_soluong"
                        type="number"
                        className={`wecare-input ${errors.htn1423_soluong ? "wecare-input--error" : ""}`}
                        value={formData.htn1423_soluong ?? ""}
                        onChange={(e) =>
                            handleFieldChange(
                                "htn1423_soluong",
                                e.target.value ? Number(e.target.value) : undefined
                            )
                        }
                        disabled={mode === "view" || isSaving}
                        min="0"
                        step="any"
                        placeholder="Nhập số lượng"
                    />
                    {errors.htn1423_soluong && (
                        <p className="wecare-form__error">{errors.htn1423_soluong}</p>
                    )}
                </div>

                {/* Tên sản phẩm - Read-only rollup/computed field */}
                {mode === "edit" && initialData && (
                    <div className="wecare-form__group">
                        <label className="wecare-form__label">Tên sản phẩm</label>
                        <input
                            type="text"
                            className="wecare-input"
                            value={initialData.htn1423_tensanpham || ""}
                            disabled
                            readOnly
                        />
                        <p className="wecare-form__hint">Trường tự động từ đơn mua chi tiết</p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
