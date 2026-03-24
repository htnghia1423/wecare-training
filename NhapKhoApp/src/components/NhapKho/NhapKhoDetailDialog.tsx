import React, { useEffect, useReducer } from "react";
import { IoClose } from "react-icons/io5";
import { Htn1423_nhapkhosService } from "../../generated";
import { handleDataverseError } from "../../utils/dataverse";
import { formatDate, formatNumber } from "../../utils/formatters";
import type { Htn1423_nhapkhos } from "../../generated/models/Htn1423_nhapkhosModel";

export interface NhapKhoDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    recordId: string | undefined;
}

const DetailSkeleton: React.FC = () => (
    <div className="wecare-detail-skeleton">
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="wecare-detail-skeleton__row">
                <div className="wecare-skeleton wecare-detail-skeleton__label" />
                <div className="wecare-skeleton wecare-detail-skeleton__value" />
            </div>
        ))}
        <div className="wecare-detail-skeleton__divider" />
        {Array.from({ length: 4 }).map((_, i) => (
            <div key={i + 4} className="wecare-detail-skeleton__row">
                <div className="wecare-skeleton wecare-detail-skeleton__label" />
                <div className="wecare-skeleton wecare-detail-skeleton__value" />
            </div>
        ))}
    </div>
);

const DetailField: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="wecare-detail__field">
        <span className="wecare-detail__label">{label}</span>
        <span className="wecare-detail__value">{value ?? "-"}</span>
    </div>
);

const StatusBadge: React.FC<{ statecode?: number }> = ({ statecode }) =>
    statecode === 0 ? (
        <span className="wecare-badge wecare-badge--success">Hoạt động</span>
    ) : (
        <span className="wecare-badge wecare-badge--inactive">Không hoạt động</span>
    );

type DetailState = {
    record: Htn1423_nhapkhos | null;
    isLoading: boolean;
    error: string | null;
};

type DetailAction =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: Htn1423_nhapkhos }
    | { type: "FETCH_ERROR"; payload: string };

function detailReducer(_state: DetailState, action: DetailAction): DetailState {
    switch (action.type) {
        case "FETCH_START":
            return { record: null, isLoading: true, error: null };
        case "FETCH_SUCCESS":
            return { record: action.payload, isLoading: false, error: null };
        case "FETCH_ERROR":
            return { record: null, isLoading: false, error: action.payload };
    }
}

type NhapKhosWithAnnotations = Htn1423_nhapkhos & {
    "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"?: string;
    "ownerid@OData.Community.Display.V1.FormattedValue"?: string;
    "_createdby_value@OData.Community.Display.V1.FormattedValue"?: string;
    "_modifiedby_value@OData.Community.Display.V1.FormattedValue"?: string;
};

export const NhapKhoDetailDialog: React.FC<NhapKhoDetailDialogProps> = ({
    isOpen,
    onClose,
    recordId
}) => {
    const [{ record, isLoading, error }, dispatch] = useReducer(detailReducer, {
        record: null,
        isLoading: false,
        error: null
    });

    useEffect(() => {
        if (!isOpen || !recordId) return;

        dispatch({ type: "FETCH_START" });

        Htn1423_nhapkhosService.get(recordId, {
            select: [
                "htn1423_nhapkhoid",
                "htn1423_name",
                "htn1423_soluong",
                "_htn1423_onmuachitiet_value",
                "htn1423_tensanpham",
                "statecode",
                "statuscode",
                "createdon",
                "modifiedon",
                "ownerid",
                "_createdby_value",
                "_modifiedby_value"
            ]
        })
            .then((result) => {
                if (result.success && result.data) {
                    dispatch({ type: "FETCH_SUCCESS", payload: result.data });
                } else {
                    dispatch({ type: "FETCH_ERROR", payload: "Không thể tải chi tiết bản ghi." });
                }
            })
            .catch((err) => dispatch({ type: "FETCH_ERROR", payload: handleDataverseError(err) }));
    }, [isOpen, recordId]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const annotated = record as NhapKhosWithAnnotations | null;
    const onmuachitietDisplay =
        annotated?.htn1423_onmuachitietname ||
        annotated?.["_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"] ||
        "-";
    const createdByDisplay =
        annotated?.createdbyname ||
        annotated?.["_createdby_value@OData.Community.Display.V1.FormattedValue"] ||
        annotated?.["ownerid@OData.Community.Display.V1.FormattedValue"] ||
        annotated?.owneridname ||
        "-";
    const modifiedByDisplay =
        annotated?.modifiedbyname ||
        annotated?.["_modifiedby_value@OData.Community.Display.V1.FormattedValue"] ||
        "-";

    return (
        <div
            className="wecare-modal-backdrop"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            <div
                className="wecare-modal wecare-modal--medium"
                role="dialog"
                aria-modal="true"
                aria-labelledby="detail-modal-title"
            >
                {/* Header */}
                <div className="wecare-modal__header">
                    <div className="wecare-detail__header-content">
                        <h2 id="detail-modal-title" className="wecare-modal__title">
                            {isLoading
                                ? "Chi tiết Nhập kho"
                                : (record?.htn1423_name ?? "Chi tiết Nhập kho")}
                        </h2>
                        {record && !isLoading && <StatusBadge statecode={record.statecode} />}
                    </div>
                    <button
                        className="wecare-modal__close"
                        onClick={onClose}
                        aria-label="Đóng"
                        type="button"
                    >
                        <IoClose size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="wecare-modal__body">
                    {isLoading && <DetailSkeleton />}

                    {error && <p className="wecare-detail__error">{error}</p>}

                    {record && !isLoading && (
                        <div className="wecare-detail">
                            <div className="wecare-detail__section">
                                <h3 className="wecare-detail__section-title">Thông tin nhập kho</h3>
                                <div className="wecare-detail__grid">
                                    <DetailField label="Mã nhập kho" value={record.htn1423_name} />
                                    <DetailField
                                        label="Số lượng"
                                        value={
                                            record.htn1423_soluong !== undefined
                                                ? formatNumber(record.htn1423_soluong)
                                                : "-"
                                        }
                                    />
                                    <DetailField
                                        label="Đơn mua chi tiết"
                                        value={onmuachitietDisplay}
                                    />
                                    <DetailField
                                        label="Tên sản phẩm"
                                        value={record.htn1423_tensanpham}
                                    />
                                    <DetailField
                                        label="Trạng thái"
                                        value={<StatusBadge statecode={record.statecode} />}
                                    />
                                </div>
                            </div>

                            <div className="wecare-detail__divider" />

                            <div className="wecare-detail__section">
                                <h3 className="wecare-detail__section-title">Thông tin hệ thống</h3>
                                <div className="wecare-detail__grid">
                                    <DetailField label="Người tạo" value={createdByDisplay} />
                                    <DetailField
                                        label="Ngày tạo"
                                        value={
                                            record.createdon ? formatDate(record.createdon) : "-"
                                        }
                                    />
                                    <DetailField label="Người sửa đổi" value={modifiedByDisplay} />
                                    <DetailField
                                        label="Ngày sửa đổi"
                                        value={
                                            record.modifiedon ? formatDate(record.modifiedon) : "-"
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="wecare-modal__footer">
                    <div className="wecare-modal__actions">
                        <button
                            className="wecare-button wecare-button--ghost wecare-button--medium"
                            onClick={onClose}
                            type="button"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
