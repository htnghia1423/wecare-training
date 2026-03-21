Dựa trên cấu trúc bảng của bạn, đây là các bài tập cơ bản về transform data trong Power Query: [learn.microsoft](https://learn.microsoft.com/en-us/training/modules/clean-data-power-bi/)

## Bài tập 1: Append Tables

Kết hợp dữ liệu xuất nhập kho [youtube](https://www.youtube.com/watch?v=6fDy5VMTK7U)

- Tạo query kết nối đến bảng **Xuất kho** và **Nhập kho**
- Sử dụng **Append Queries** để gộp 2 bảng thành 1 bảng tổng hợp
- Thêm custom column **"Loại giao dịch"** với giá trị "Xuất" hoặc "Nhập" để phân biệt
- Đổi tên column **Số lượng** thành **"SL Xuất"** cho bảng xuất và **"SL Nhập"** cho bảng nhập

## Bài tập 2: Merge Queries

Kết hợp thông tin sản phẩm với tồn kho [youtube](https://www.youtube.com/watch?v=6fDy5VMTK7U)

- Merge bảng **Sản phẩm** với bảng **Tồn kho** (Left Outer Join) dựa trên **Tên sản phẩm**
- Expand các column: Tồn thực tế, Đơn vị chuẩn từ bảng Tồn kho
- Thêm calculated column **"Trạng thái tồn"**: nếu Tồn thực tế > 0 thì "Còn hàng", ngược lại "Hết hàng"
- Merge tiếp với bảng **Nhóm sản phẩm** để lấy thông tin Source phụ trách

## Bài tập 3: Group By Operations

Tổng hợp dữ liệu đơn hàng [youtube](https://www.youtube.com/watch?v=cQMqVYnV3do)

- Từ bảng **Đơn bán chi tiết**, group by **Tên sản phẩm**
- Tính tổng **Số lượng** (Sum), trung bình **Đơn giá** (Average), và đếm số **Đơn hàng** (Count)
- Tạo query thứ 2: Group by cả **Đơn hàng** và **Tên sản phẩm** để tính Thành tiền cho mỗi đơn
- So sánh với bảng **Đơn mua chi tiết** để tìm sản phẩm nào có đơn giá bán cao hơn đơn giá mua

## Bài tập 4: Data Type & Cleaning

Chuẩn hóa dữ liệu khách hàng [zerotomastery](https://zerotomastery.io/blog/how-to-use-power-query-a-beginners-guide/)

- Đổi data type của **SDT** và **MST** từ Number sang Text
- Sử dụng **Transform > Format** để chuẩn hóa **Tên KH** (Proper Case hoặc Upper Case)
- Remove duplicates dựa trên **MST**
- Replace null values trong column **Địa chỉ** bằng "Chưa cập nhật"
- Trim whitespace ở tất cả text columns
