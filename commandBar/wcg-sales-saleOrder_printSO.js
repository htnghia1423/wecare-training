(function () {
    var API_BASE = window.location.origin + "/api/data/v9.2/";
    var API_HEADERS = {
        "Accept": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Prefer": "odata.include-annotations=\"OData.Community.Display.V1.FormattedValue\""
    };

    async function apiFetch(url) {
        var res = await fetch(API_BASE + url, { headers: API_HEADERS });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }

    function getRecordId() {
        var params = new URLSearchParams(window.location.search);
        var dataParam = params.get("Data") || params.get("data");
        if (!dataParam) return null;
        try {
            return JSON.parse(decodeURIComponent(dataParam)).recordId;
        } catch (e) {
            return dataParam.replace(/[{}]/g, "");
        }
    }

    function formatCurrency(value) {
        if (value == null || value === "") return "—";
        return Number(value).toLocaleString("vi-VN") + " đ";
    }

    function closeDialog() {
        window.close();
    }

    function printDocument() {
        window.print();
    }

    function showError(msg) {
        document.getElementById("doc-content").innerHTML =
            '<div class="state-msg error">&#9888; ' + msg + "</div>";
    }

    function renderDocument(donBan, khachHang, chiTietList) {
        var tenKH = khachHang.htn1423_name || "—";
        var diaChiKH = khachHang.htn1423_iachi || "—";
        var sdtKH = khachHang.htn1423_st || "—";
        var mstKH = khachHang.htn1423_mst || "";

        var maDon = donBan.htn1423_name || "—";
        var tongKhongVat = formatCurrency(donBan.htn1423_tongtienkhongvat);
        var thue = formatCurrency(donBan.htn1423_thue);
        var tongTien = formatCurrency(donBan.htn1423_tongtien);

        var today = new Date();
        var ngayIn =
            today.getDate() + " tháng " + (today.getMonth() + 1) + " năm " + today.getFullYear();

        var rowsHtml = "";
        chiTietList.forEach(function (item, idx) {
            var tenSP =
                item["_htn1423_tensanpham_value@OData.Community.Display.V1.FormattedValue"] || "—";
            var donGia = formatCurrency(item.htn1423_ongia);
            var soLuong = item.htn1423_soluong != null ? item.htn1423_soluong : "—";
            var vat = formatCurrency(item.htn1423_vat);
            var thanhTien = formatCurrency(item.htn1423_thanhtien);

            rowsHtml +=
                "<tr>" +
                "<td class='center' style='white-space:nowrap'>" +
                (idx + 1) +
                "</td>" +
                "<td>" +
                tenSP +
                "</td>" +
                "<td class='center' style='white-space:nowrap'>" +
                soLuong +
                "</td>" +
                "<td class='right' style='white-space:nowrap'>" +
                donGia +
                "</td>" +
                "<td class='right' style='white-space:nowrap'>" +
                vat +
                "</td>" +
                "<td class='right' style='white-space:nowrap'>" +
                thanhTien +
                "</td>" +
                "</tr>";
        });

        if (rowsHtml === "") {
            rowsHtml =
                "<tr><td colspan='6' class='center' style='color:#6C757D;padding:20px'>Không có sản phẩm</td></tr>";
        }

        document.getElementById("doc-content").innerHTML =
            "<div class='doc-header'>" +
            "<div class='logo-block'>" +
            "<img src='https://i.imgur.com/tD07Yrv.png' alt='Wecare Logo'>" +
            "<span class='brand-name'>WECARE</span>" +
            "</div>" +
            "<div class='company-info'>" +
            "<div class='company-name'>CÔNG TY CỔ PHẦN WECARE GROUP</div>" +
            "<div>Địa chỉ 1: 14-16-18-20, Đường 36, P. Bình Phú, Q6, HCM</div>" +
            "<div>Địa chỉ 2: Lô B39, KCN Phú Tài, P. Quy Nhơn Bắc, Tỉnh Gia Lai</div>" +
            "<div>SĐT: 0378 339 009 &nbsp;|&nbsp; MST: 4101562154</div>" +
            "<div>Website: <a href='https://wecare.com.vn' target='_blank'>https://wecare.com.vn</a></div>" +
            "<div>Quy Nhơn, ngày " +
            ngayIn +
            "</div>" +
            "</div>" +
            "</div>" +
            "<div class='order-bar'>" +
            maDon +
            "</div>" +
            "<div class='customer-section'>" +
            "<div>" +
            "<div><span class='label'>Tên khách hàng: </span><span class='value'>" +
            tenKH +
            "</span></div>" +
            "<div><span class='label'>Địa chỉ: </span>" +
            diaChiKH +
            "</div>" +
            "</div>" +
            "<div style='text-align:right'>" +
            "<div><span class='label'>SĐT: </span><span class='value'>" +
            sdtKH +
            "</span></div>" +
            (mstKH ? "<div><span class='label'>MST: </span>" + mstKH + "</div>" : "") +
            "</div>" +
            "</div>" +
            "<table style='table-layout:auto'>" +
            "<thead><tr>" +
            "<th style='width:40px;white-space:nowrap'>STT</th>" +
            "<th style='text-align:left'>Tên sản phẩm</th>" +
            "<th style='white-space:nowrap'>Số lượng</th>" +
            "<th style='white-space:nowrap'>Đơn giá</th>" +
            "<th style='white-space:nowrap'>VAT</th>" +
            "<th style='white-space:nowrap'>Thành tiền</th>" +
            "</tr></thead>" +
            "<tbody>" +
            rowsHtml +
            "</tbody>" +
            "</table>" +
            "<table class='totals-table'>" +
            "<tr>" +
            "<td colspan='4' class='total-label'>TỔNG GIÁ TRỊ ĐƠN HÀNG</td>" +
            "<td colspan='2' class='total-value'>" +
            tongKhongVat +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='4' class='total-label'>THUẾ VAT</td>" +
            "<td colspan='2' class='total-value'>" +
            thue +
            "</td>" +
            "</tr>" +
            "<tr>" +
            "<td colspan='4' class='total-final'>TỔNG TIỀN</td>" +
            "<td colspan='2' class='total-final' style='text-align:right'>" +
            tongTien +
            "</td>" +
            "</tr>" +
            "</table>";
    }

    async function loadData() {
        var recordId = getRecordId();
        if (!recordId) {
            showError("Không tìm thấy ID đơn hàng. Vui lòng thử lại.");
            return;
        }

        try {
            var donBan = await apiFetch(
                "htn1423_nghiaonbans(" + recordId + ")" +
                "?$select=htn1423_name,htn1423_tongtienkhongvat,htn1423_thue,htn1423_tongtien,_htn1423_khachhang_value"
            );

            var customerId = donBan["_htn1423_khachhang_value"];

            var results = await Promise.all([
                customerId
                    ? apiFetch(
                          "htn1423_nghiakhachhangs(" + customerId + ")" +
                          "?$select=htn1423_name,htn1423_iachi,htn1423_st,htn1423_mst"
                      )
                    : Promise.resolve({}),

                apiFetch(
                    "htn1423_onbanchitiets" +
                    "?$select=htn1423_soluong,htn1423_thanhtien,htn1423_vat,htn1423_ongia,_htn1423_tensanpham_value" +
                    "&$filter=_htn1423_onhang_value eq " + recordId + " and statecode eq 0" +
                    "&$orderby=createdon asc"
                )
            ]);

            renderDocument(donBan, results[0], results[1].value);
        } catch (error) {
            showError("Lỗi khi tải dữ liệu: " + (error.message || error));
        }
    }

    // Expose to window for onclick handlers in HTML
    window.closeDialog = closeDialog;
    window.printDocument = printDocument;

    document.addEventListener("DOMContentLoaded", loadData);
})();
