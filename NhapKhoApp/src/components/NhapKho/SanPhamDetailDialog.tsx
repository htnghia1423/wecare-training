import React, { useEffect, useReducer } from "react";
import { IoClose } from "react-icons/io5";
import { Htn1423_onmuachitietsService, Htn1423_nghiasanphamsService } from "../../generated";
import { handleDataverseError } from "../../utils/dataverse";
import { formatDate } from "../../utils/formatters";
import type { Htn1423_nghiasanphams } from "../../generated/models/Htn1423_nghiasanphamsModel";

export interface SanPhamDetailDialogProps {
    isOpen: boolean;
    onClose: () => void;
    /** ID of the linked Đơn mua chi tiết — used to look up the product ID */
    onmuachitietId: string | undefined;
}

type DetailState = {
    record: Htn1423_nghiasanphams | null;
    isLoading: boolean;
    error: string | null;
};

type DetailAction =
    | { type: "FETCH_START" }
    | { type: "FETCH_SUCCESS"; payload: Htn1423_nghiasanphams }
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

type SanPhamWithAnnotations = Htn1423_nghiasanphams & {
    "_createdby_value@OData.Community.Display.V1.FormattedValue"?: string;
    "_modifiedby_value@OData.Community.Display.V1.FormattedValue"?: string;
    "_htn1423_nhomsanpham_value@OData.Community.Display.V1.FormattedValue"?: string;
};

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

export const SanPhamDetailDialog: React.FC<SanPhamDetailDialogProps> = ({
    isOpen,
    onClose,
    onmuachitietId
}) => {
    const [{ record, isLoading, error }, dispatch] = useReducer(detailReducer, {
        record: null,
        isLoading: false,
        error: null
    });

    useEffect(() => {
        if (!isOpen || !onmuachitietId) return;

        dispatch({ type: "FETCH_START" });

        // Step 1: fetch onmuachitiet to get the product ID
        Htn1423_onmuachitietsService.get(onmuachitietId, {
            select: ["_htn1423_tensanpham_value"]
        })
            .then((omctResult) => {
                const sanphamId = omctResult.data?._htn1423_tensanpham_value;
                if (!omctResult.success || !sanphamId) {
                    dispatch({
                        type: "FETCH_ERROR",
                        payload: "Không tìm thấy thông tin sản phẩm."
                    });
                    return;
                }

                // Step 2: fetch the product record
                return Htn1423_nghiasanphamsService.get(sanphamId, {
                    select: [
                        "htn1423_nghiasanphamid",
                        "htn1423_name",
                        "_htn1423_nhomsanpham_value",
                        "htn1423_quycach",
                        "htn1423_thuonghieu",
                        "htn1423_onvichuan",
                        "statecode",
                        "createdon",
                        "modifiedon",
                        "_createdby_value",
                        "_modifiedby_value"
                    ]
                }).then((spResult) => {
                    if (spResult.success && spResult.data) {
                        dispatch({ type: "FETCH_SUCCESS", payload: spResult.data });
                    } else {
                        dispatch({
                            type: "FETCH_ERROR",
                            payload: "Không thể tải chi tiết sản phẩm."
                        });
                    }
                });
            })
            .catch((err) => dispatch({ type: "FETCH_ERROR", payload: handleDataverseError(err) }));
    }, [isOpen, onmuachitietId]);

    useEffect(() => {
        if (!isOpen) return;
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const annotated = record as SanPhamWithAnnotations | null;
    const createdByDisplay =
        annotated?.createdbyname ||
        annotated?.["_createdby_value@OData.Community.Display.V1.FormattedValue"] ||
        "-";
    const modifiedByDisplay =
        annotated?.modifiedbyname ||
        annotated?.["_modifiedby_value@OData.Community.Display.V1.FormattedValue"] ||
        "-";
    const nhomsanphamDisplay =
        annotated?.["_htn1423_nhomsanpham_value@OData.Community.Display.V1.FormattedValue"] ||
        annotated?.htn1423_nhomsanphamname ||
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
                aria-labelledby="sanpham-modal-title"
            >
                <div className="wecare-modal__header">
                    <div className="wecare-detail__header-content">
                        <h2 id="sanpham-modal-title" className="wecare-modal__title">
                            {isLoading
                                ? "Chi tiết Sản phẩm"
                                : (record?.htn1423_name ?? "Chi tiết Sản phẩm")}
                        </h2>
                        {record && !isLoading && (
                            <StatusBadge statecode={record.statecode as unknown as number} />
                        )}
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

                <div className="wecare-modal__body">
                    {isLoading && <DetailSkeleton />}
                    {error && <p className="wecare-detail__error">{error}</p>}
                    {record && !isLoading && (
                        <div className="wecare-detail">
                            <div className="wecare-detail__section">
                                <h3 className="wecare-detail__section-title">Thông tin sản phẩm</h3>
                                <div className="wecare-detail__grid">
                                    <DetailField label="Tên sản phẩm" value={record.htn1423_name} />
                                    <DetailField label="Nhóm sản phẩm" value={nhomsanphamDisplay} />
                                    <DetailField label="Quy cách" value={record.htn1423_quycach} />
                                    <DetailField
                                        label="Thương hiệu"
                                        value={record.htn1423_thuonghieu}
                                    />
                                    <DetailField
                                        label="Đơn vị chuẩn"
                                        value={record.htn1423_onvichuan}
                                    />
                                    <DetailField
                                        label="Trạng thái"
                                        value={
                                            <StatusBadge
                                                statecode={record.statecode as unknown as number}
                                            />
                                        }
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
