import React from 'react';
import { IoDocumentText } from 'react-icons/io5';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title?: string;
  message: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = <IoDocumentText size={64} />,
  title = 'Không có dữ liệu',
  message,
  action,
}) => {
  return (
    <div className="wecare-empty-state">
      <div className="wecare-empty-state__icon">{icon}</div>
      <h3 className="wecare-empty-state__title">{title}</h3>
      <p className="wecare-empty-state__message">{message}</p>
      {action && <div className="wecare-empty-state__action">{action}</div>}
    </div>
  );
};
