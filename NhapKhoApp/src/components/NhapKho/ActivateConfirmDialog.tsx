import React from "react";
import { IoCheckmarkCircle } from "react-icons/io5";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export interface ActivateConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    recordName: string;
    isActivating: boolean;
}

export const ActivateConfirmDialog: React.FC<ActivateConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    recordName,
    isActivating
}) => {
    const footer = (
        <div className="wecare-modal__actions">
            <Button variant="ghost" onClick={onClose} disabled={isActivating}>
                Hủy
            </Button>
            <Button variant="primary" onClick={onConfirm} isLoading={isActivating}>
                Kích hoạt
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận kích hoạt"
            footer={footer}
            size="small"
            closeOnBackdropClick={!isActivating}
        >
            <div className="wecare-activate-confirm">
                <div className="wecare-activate-confirm__icon">
                    <IoCheckmarkCircle size={48} />
                </div>
                <p className="wecare-activate-confirm__message">
                    Bạn có chắc chắn muốn kích hoạt bản ghi <strong>{recordName}</strong>?
                </p>
                <p className="wecare-activate-confirm__note">
                    Thao tác này sẽ chuyển bản ghi sang trạng thái Hoạt động.
                </p>
            </div>
        </Modal>
    );
};
