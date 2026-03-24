/**
 * Validate số lượng
 */
export function validateSoLuong(value: string | number | undefined | null): string | null {
  if (value === '' || value === undefined || value === null) {
    return 'Số lượng không được để trống';
  }
  
  const num = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(num)) {
    return 'Số lượng phải là số hợp lệ';
  }
  
  if (num <= 0) {
    return 'Số lượng phải lớn hơn 0';
  }
  
  return null;
}

/**
 * Validate lookup field (Đơn mua chi tiết)
 */
export function validateOnMuaChiTiet(value: string | undefined): string | null {
  if (!value || value.trim() === '') {
    return 'Vui lòng chọn đơn mua chi tiết';
  }
  
  return null;
}

/**
 * Validate POD- prefix (for Đơn mua chi tiết name)
 * Note: Chỉ dùng nếu cần validate manual input
 */
export function validatePODName(name: string): string | null {
  if (!name || name.trim() === '') {
    return 'Tên không được để trống';
  }
  
  if (!name.startsWith('POD-')) {
    return 'Tên phải bắt đầu bằng "POD-"';
  }
  
  return null;
}
