var CheckTonKho = CheckTonKho || {};

/**
 * Đăng ký vào sự kiện OnChange của field Số lượng trên form Xuất kho.
 * Bật "Pass execution context as first parameter" khi đăng ký.
 */
CheckTonKho.onSoluongChange = async function (executionContext) {
    var formContext = executionContext.getFormContext();

    var soLuongAttr = formContext.getAttribute("htn1423_soluong");
    var soLuongControl = formContext.getControl("htn1423_soluong");
    var donBanChiTietAttr = formContext.getAttribute("htn1423_onbanchitiet");

    // Xóa thông báo cũ
    soLuongControl.clearNotification("TonKhoError");
    formContext.ui.clearFormNotification("TonKhoFormError");
    formContext.ui.clearFormNotification("TonKhoNotFound");

    var soLuong = soLuongAttr.getValue();
    var donBanChiTiet = donBanChiTietAttr ? donBanChiTietAttr.getValue() : null;

    if (soLuong == null || soLuong <= 0 || donBanChiTiet == null) {
        return;
    }

    var donBanChiTietId = donBanChiTiet[0].id.replace(/[{}]/g, "");

    // Bước 1: Lấy Tên sản phẩm từ bản ghi Đơn bán chi tiết
    var donBanChiTietRecord;
    try {
        donBanChiTietRecord = await Xrm.WebApi.retrieveRecord(
            "htn1423_onbanchitiet",
            donBanChiTietId,
            "?$select=_htn1423_tensanpham_value"
        );
    } catch (error) {
        Xrm.Navigation.openAlertDialog({
            title: "Lỗi kiểm tra tồn kho",
            text: "Không thể lấy thông tin Đơn bán chi tiết: " + error.message
        });
        return;
    }

    var sanPhamId = donBanChiTietRecord["_htn1423_tensanpham_value"];
    if (!sanPhamId) {
        formContext.ui.setFormNotification(
            "Cảnh báo: Đơn bán chi tiết chưa có Tên sản phẩm.",
            "INFO",
            "TonKhoNotFound"
        );
        return;
    }

    // Bước 2: Query Tồn kho theo sản phẩm, chỉ lấy bản ghi Active (statecode eq 0)
    try {
        var result = await Xrm.WebApi.retrieveMultipleRecords(
            "htn1423_nghiatonkho",
            "?$select=htn1423_tonthucte&$filter=_htn1423_tensanpham_value eq '" + sanPhamId + "' and statecode eq 0"
        );

        if (result.entities.length > 0) {
            var tonThucTe = result.entities[0]["htn1423_tonthucte"] || 0;

            if (soLuong > tonThucTe) {
                soLuongAttr.setValue(null);
                soLuongControl.setNotification(
                    "SL nhập (" + soLuong + ") > Tồn thực tế (" + tonThucTe + "). Vui lòng điều chỉnh.",
                    "TonKhoError"
                );
                formContext.ui.setFormNotification(
                    "Lỗi tồn kho: Số lượng tối đa có thể xuất là " + tonThucTe + ". Field đã được reset.",
                    "WARNING",
                    "TonKhoFormError"
                );
            }
        } else {
            formContext.ui.setFormNotification(
                "Cảnh báo: Sản phẩm này chưa có dữ liệu tồn kho (hoặc đã Inactive).",
                "INFO",
                "TonKhoNotFound"
            );
        }
    } catch (error) {
        Xrm.Navigation.openAlertDialog({
            title: "Lỗi kiểm tra tồn kho",
            text: "Không thể kiểm tra tồn kho: " + error.message
        });
    }
};
