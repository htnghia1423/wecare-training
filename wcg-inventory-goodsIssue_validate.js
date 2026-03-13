var CheckTonKho = CheckTonKho || {};

/**
 * Đăng ký vào sự kiện OnChange của field Số lượng trên form Xuất kho.
 * Bật "Pass execution context as first parameter" khi đăng ký.
 */
CheckTonKho.onSoluongChange = async function (executionContext) {
    var formContext = executionContext.getFormContext();

    // Khai báo schema name
    var soLuongSchema = "htn1423_soluong";
    var sanPhamLookupSchema = "htn1423_tensanpham";
    var tonKhoEntityName = "htn1423_nghiatonkho";
    var tonKhoFieldSchema = "htn1423_tonthucte";
    var tonKhoSanPhamLookupSchema = "htn1423_tensanpham";

    var soLuongAttr = formContext.getAttribute(soLuongSchema);
    var soLuongControl = formContext.getControl(soLuongSchema);
    var sanPhamAttr = formContext.getAttribute(sanPhamLookupSchema);

    // Xóa thông báo cũ
    soLuongControl.clearNotification("TonKhoError");
    formContext.ui.clearFormNotification("TonKhoFormError");
    formContext.ui.clearFormNotification("TonKhoNotFound");

    var soLuong = soLuongAttr.getValue();
    var sanPham = sanPhamAttr ? sanPhamAttr.getValue() : null;

    if (soLuong == null || soLuong <= 0 || sanPham == null) {
        return;
    }

    var sanPhamId = sanPham[0].id.replace(/[{}]/g, "");
    var fetchFilter = "?$filter=_" + tonKhoSanPhamLookupSchema + "_value eq '" + sanPhamId + "'";
    var fetchSelect = "&$select=" + tonKhoFieldSchema;

    try {
        var result = await Xrm.WebApi.retrieveMultipleRecords(
            tonKhoEntityName,
            fetchFilter + fetchSelect
        );

        if (result.entities.length > 0) {
            var tonThucTe = result.entities[0][tonKhoFieldSchema] || 0;

            if (soLuong > tonThucTe) {
                soLuongAttr.setValue(null);
                soLuongControl.setNotification(
                    "SL nhập (" +
                        soLuong +
                        ") > Tồn thực tế (" +
                        tonThucTe +
                        "). Vui lòng điều chỉnh.",
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
                "Cảnh báo: Sản phẩm này chưa có dữ liệu tồn kho.",
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
