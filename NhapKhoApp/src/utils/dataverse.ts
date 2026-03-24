import { Htn1423_nhapkhosService } from '../generated';

/**
 * Soft delete Nhập kho record
 * Updates statecode=1 (Inactive) and statuscode=2 (Inactive)
 */
export async function softDeleteNhapKho(id: string): Promise<void> {
  await Htn1423_nhapkhosService.update(id, {
    statecode: 1,  // Inactive
    statuscode: 2  // Inactive
  });
}

/**
 * Build OData lookup binding string
 * Example: buildLookupBinding('htn1423_onmuachitiets', guid) 
 * Returns: `/htn1423_onmuachitiets(guid)`
 */
export function buildLookupBinding(entitySetName: string, recordId: string): string {
  // Remove curly braces from GUID if present
  const cleanId = recordId.replace(/[{}]/g, '');
  return `/${entitySetName}(${cleanId})`;
}

/**
 * Handle Dataverse API errors and return user-friendly message
 */
export function handleDataverseError(error: any): string {
  console.error('Dataverse Error:', error);
  
  // Check for network errors
  if (!navigator.onLine) {
    return 'Không có kết nối internet. Vui lòng kiểm tra kết nối và thử lại.';
  }
  
  // Check for specific error messages
  if (error?.message) {
    // Permission errors
    if (error.message.includes('permission') || error.message.includes('403')) {
      return 'Bạn không có quyền thực hiện thao tác này.';
    }
    
    // Not found errors
    if (error.message.includes('not found') || error.message.includes('404')) {
      return 'Không tìm thấy dữ liệu. Bản ghi có thể đã bị xóa.';
    }
    
    // Validation errors
    if (error.message.includes('validation') || error.message.includes('400')) {
      return `Dữ liệu không hợp lệ: ${error.message}`;
    }
    
    // Return original message if it's user-friendly
    if (error.message.length < 200) {
      return error.message;
    }
  }
  
  // Generic error message
  return 'Đã xảy ra lỗi. Vui lòng thử lại sau.';
}

/**
 * Extract GUID from lookup value
 */
export function extractGuid(lookupValue: string | undefined): string | undefined {
  if (!lookupValue) return undefined;
  
  // Remove curly braces and convert to lowercase
  return lookupValue.replace(/[{}]/g, '').toLowerCase();
}
