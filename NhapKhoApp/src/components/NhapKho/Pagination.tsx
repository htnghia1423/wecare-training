import React from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import { Button } from '../common/Button';

export interface PaginationProps {
  currentPage: number;
  pageSize: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (direction: 'next' | 'previous') => void;
  onPageSizeChange: (pageSize: number) => void;
  isLoading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  pageSize,
  totalRecords,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onPageSizeChange,
  isLoading = false,
}) => {
  const startRecord = totalRecords === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalRecords);

  return (
    <div className="wecare-pagination">
      <div className="wecare-pagination__info">
        <span>
          Hiển thị {startRecord} - {endRecord} / {totalRecords > 50000 ? '50,000+' : totalRecords.toLocaleString('vi-VN')} bản ghi
        </span>
      </div>

      <div className="wecare-pagination__controls">
        <label htmlFor="pageSize" className="wecare-pagination__label">
          Số bản ghi:
        </label>
        <select
          id="pageSize"
          className="wecare-pagination__select"
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          disabled={isLoading}
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>

        <div className="wecare-pagination__buttons">
          <Button
            variant="ghost"
            size="small"
            icon={<IoChevronBack />}
            onClick={() => onPageChange('previous')}
            disabled={!hasPreviousPage || isLoading}
            aria-label="Trang trước"
          >
            Trước
          </Button>
          <span className="wecare-pagination__page">Trang {currentPage}</span>
          <Button
            variant="ghost"
            size="small"
            icon={<IoChevronForward />}
            onClick={() => onPageChange('next')}
            disabled={!hasNextPage || isLoading}
            aria-label="Trang sau"
          >
            Sau
          </Button>
        </div>
      </div>
    </div>
  );
};
