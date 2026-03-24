import React from 'react';
import { IoAlertCircle, IoRefresh } from 'react-icons/io5';
import { Button } from './Button';

export interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  onRetry,
  showRetry = true,
}) => {
  return (
    <div className="wecare-error" role="alert">
      <div className="wecare-error__icon">
        <IoAlertCircle size={48} />
      </div>
      <p className="wecare-error__message">{message}</p>
      {showRetry && onRetry && (
        <Button
          variant="primary"
          size="medium"
          icon={<IoRefresh />}
          onClick={onRetry}
        >
          Thử lại
        </Button>
      )}
    </div>
  );
};
