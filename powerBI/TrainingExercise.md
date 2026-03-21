Dựa trên cấu trúc dữ liệu inventory management của bạn, đây là một bài tập tổng hợp hoàn chỉnh trong 1 trang Power BI: [wiseowl.co](https://www.wiseowl.co.uk/power-bi/exercises/power-bi-desktop/)

## Bài tập: Sales & Inventory Dashboard - Trang Duy Nhất

### Phần 1: Chuẩn bị dữ liệu (Power Query)

**Transform bảng Đơn bán chi tiết**:

- Merge với bảng **Sản phẩm** để lấy Nhóm sản phẩm, Đơn vị chuẩn
- Merge với bảng **Đơn bán** để lấy thông tin Khách hàng, Ngày đơn hàng
- Add custom column **"Loại giao dịch"** = "Bán"

**Transform bảng Đơn mua chi tiết**:

- Merge với bảng **Sản phẩm** và **Đơn mua**
- Add custom column **"Loại giao dịch"** = "Mua"

**Tạo Date Table**:

- Tạo calendar table từ ngày đầu tiên đến hiện tại
- Add columns: Year, Quarter, Month, Week, Day of Week

### Phần 2: Data Modeling

**Thiết lập Relationships**: [youtube](https://www.youtube.com/watch?v=VaOhNqNtGGE)

- Date[Date] → Đơn bán[Ngày tạo] (many-to-one)
- Sản phẩm[ID] → Đơn bán chi tiết[Sản phẩm] (one-to-many)
- Đơn bán[ID] → Đơn bán chi tiết[Đơn hàng] (one-to-many)
- Khách hàng[ID] → Đơn bán[Khách hàng] (one-to-many)
- Sản phẩm[Tên sản phẩm] → Tồn kho[Tên sản phẩm] (one-to-one)
- Nhóm sản phẩm[ID] → Sản phẩm[Nhóm sản phẩm] (one-to-many)

### Phần 3: DAX Measures

**Sales Measures**: [learn.microsoft](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics)

```DAX
Total Revenue = SUM('Đơn bán'[Tổng tiền])
Total Orders = DISTINCTCOUNT('Đơn bán'[Đơn hàng])
Avg Order Value = DIVIDE([Total Revenue], [Total Orders])
Total Customers = DISTINCTCOUNT('Đơn bán'[Khách hàng])
Revenue LM = CALCULATE([Total Revenue], PREVIOUSMONTH('Date'[Date]))
Revenue Growth % = DIVIDE([Total Revenue] - [Revenue LM], [Revenue LM])
```

**Inventory Measures**: [linkedin](https://www.linkedin.com/posts/chiamaka-igwe-ab187a92_powerbi-inventorymanagement-dataanalytics-activity-7368213144235659266-8DKJ)

```DAX
Total Stock Value = 
SUMX(
    'Tồn kho',
    'Tồn kho'[Tồn thực tế] * 
    CALCULATE(AVERAGE('Đơn bán chi tiết'[Đơn giá]))
)

Stock Out Count = 
CALCULATE(
    COUNTROWS('Tồn kho'),
    'Tồn kho'[Tồn thực tế] = 0
)

Stock Out % = DIVIDE([Stock Out Count], COUNTROWS('Tồn kho'))

Low Stock Count = 
CALCULATE(
    COUNTROWS('Tồn kho'),
    'Tồn kho'[Tồn thực tế] > 0 && 'Tồn kho'[Tồn thực tế] < 10
)
```

**Product Performance**: [pbivisuals](https://pbivisuals.com/power-bi-exercise/)

```DAX
Qty Sold = SUM('Đơn bán chi tiết'[Số lượng])
Qty Purchased = SUM('Đơn mua chi tiết'[Số lượng])

Product Rank = 
RANKX(
    ALL('Sản phẩm'[Tên sản phẩm]),
    [Total Revenue],
    ,
    DESC,
    Dense
)
```

### Phần 4: Layout Dashboard (1 Trang)

**Header Section** - KPI Cards (4 cards ngang):

1. **Total Revenue** | Revenue Growth % (với conditional formatting: xanh nếu > 0, đỏ nếu < 0)
2. **Total Orders** | vs Last Month
3. **Total Stock Value** | Stock Out % (đỏ nếu > 10%)
4. **Avg Order Value** | Total Customers

**Left Column** (40% width):

**Visual 1 - Revenue Trend** (Line chart):

- X-axis: Date[Month]
- Y-axis: [Total Revenue]
- Add forecast line

**Visual 2 - Top 10 Products** (Bar chart):

- Y-axis: Sản phẩm[Tên sản phẩm]
- X-axis: [Total Revenue]
- Conditional formatting: gradient color
- Show only top 10 by [Product Rank]

**Visual 3 - Revenue by Nhóm SP** (Donut chart):

- Legend: Nhóm sản phẩm[Tên Nhóm sản phẩm]
- Values: [Total Revenue]
- Show percentages

**Right Column** (60% width):

**Visual 4 - Stock Status Matrix** (Matrix):

- Rows: Nhóm sản phẩm[Tên Nhóm sản phẩm], Sản phẩm[Tên sản phẩm]
- Values: Tồn kho[Tồn thực tế], [Qty Sold], [Qty Purchased]
- Conditional formatting trên Tồn thực tế:
  - Red: = 0
  - Yellow: 1-9
  - Green: >= 10

**Visual 5 - Customer Breakdown** (Table):

- Columns:
  - Khách hàng[Tên KH]
  - Nhóm khách hàng[Tên nhóm]
  - [Total Orders]
  - [Total Revenue]
  - [Avg Order Value]
- Sort by Revenue descending
- Top 15 customers only

**Visual 6 - Sales vs Purchase Analysis** (Clustered column chart):

- X-axis: Date[Month]
- Y-axis: [Total Revenue], [Total Purchase] (từ Đơn mua)
- Dual axis để so sánh trend

**Bottom Section** - Detailed Transactions (Table):

- Columns:
  - Đơn bán[Đơn hàng]
  - Khách hàng[Tên KH]
  - Sản phẩm[Tên sản phẩm]
  - Đơn bán chi tiết[Số lượng]
  - Đơn bán chi tiết[Đơn giá]
  - Đơn bán chi tiết[Thành tiền]
  - Đơn bán[VAT]
- Enable drill-through từ các visuals khác

### Phần 5: Interactivity & Formatting [pbivisuals](https://pbivisuals.com/power-bi-exercise/)

**Slicers** (Top of page, horizontal):

- Date range slicer (between mode)
- Nhóm sản phẩm (dropdown)
- Nhóm khách hàng (dropdown)
- VAT choice (buttons: Tất cả/Có VAT/Không VAT)

**Conditional Formatting**:

- Revenue Growth %: Data bars với positive = green, negative = red
- Stock Out %: Background color red nếu > 10%
- Tồn thực tế: Icon set (🔴 = 0, 🟡 = 1-9, 🟢 = 10+)

**Interactions**:

- Clicking product trong Top 10 → filter tất cả visuals khác
- Clicking Nhóm SP trong donut → highlight related data
- Disable interaction từ KPI cards

**Tooltips**:

- Custom tooltip cho Revenue Trend hiển thị: Số đơn, Số KH, Top 3 sản phẩm
- Custom tooltip cho Stock Matrix hiển thị: Ngày nhập gần nhất, Source phụ trách

**Theme**:

- Sử dụng corporate colors phù hợp
- Font consistency: Title (14pt Bold), Labels (10pt)
- Add logo và title "Sales & Inventory Dashboard"

### Phần 6: Deliverables

**Yêu cầu hoàn thành**:

1. ✅ Tất cả visuals hiển thị chính xác với data từ Dataverse
2. ✅ Slicers hoạt động đồng bộ trên toàn bộ trang
3. ✅ Conditional formatting áp dụng đúng business rules
4. ✅ Performance tốt (load time < 3 giây)
5. ✅ Mobile view layout responsive
6. ✅ Export PDF với quality cao

**Bonus Challenges**: [learn.microsoft](https://learn.microsoft.com/en-us/power-bi/transform-model/desktop-quickstart-learn-dax-basics)

- Thêm drill-through page để xem chi tiết từng sản phẩm
- Tạo bookmark cho 3 views: Sales Focus / Inventory Focus / Customer Focus
- Setup Row-Level Security theo Sale phụ trách / Source phụ trách
- Add sync slicers nếu có nhiều pages

Bài tập này tổng hợp đầy đủ các kỹ năng: Power Query transformation, data modeling, DAX calculations, visualization design, và interactivity trong một trang duy nhất. [bi4dynamics](https://www.bi4dynamics.com/power-bi/inventory-dashboard/)
