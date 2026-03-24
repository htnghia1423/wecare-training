import React from "react";
import { IoWarning } from "react-icons/io5";
import { Modal } from "../common/Modal";
import { Button } from "../common/Button";

export interface DeleteConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    recordName: string;
    isDeleting: boolean;
}

export const DeleteConfirmDialog: React.FC<DeleteConfirmDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    recordName,
    isDeleting
}) => {
    const footer = (
        <div className="wecare-modal__actions">
            <Button variant="ghost" onClick={onClose} disabled={isDeleting}>
                Hủy
            </Button>
            <Button variant="danger" onClick={onConfirm} isLoading={isDeleting}>
                Ngừng
            </Button>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Xác nhận ngừng hoạt động"
            footer={footer}
            size="small"
            closeOnBackdropClick={!isDeleting}
        >
            <div className="wecare-delete-confirm">
                <div className="wecare-delete-confirm__icon">
                    <IoWarning size={48} />
                </div>
                <p className="wecare-delete-confirm__message">
                    Bạn có chắc chắn muốn ngừng bản ghi <strong>{recordName}</strong>?
                </p>
                <p className="wecare-delete-confirm__note">
                    Thao tác này sẽ chuyển bản ghi sang trạng thái Không hoạt động.
                </p>
            </div>
        </Modal>
    );
};
