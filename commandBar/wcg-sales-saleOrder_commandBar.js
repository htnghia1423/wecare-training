var WcgDonBan = WcgDonBan || {};
WcgDonBan.CommandBar = WcgDonBan.CommandBar || {};

/**
 * Đăng ký vào nút Print SO trên command bar form Đơn bán.
 * Trong Maker Portal: Action = "Run JavaScript", chọn file này,
 * Function = "WcgDonBan.CommandBar.onPrintSOClick", Parameter = PrimaryControl.
 */
WcgDonBan.CommandBar.onPrintSOClick = function (primaryControl) {
    var formContext = primaryControl;
    var recordId = formContext.data.entity.getId().replace(/[{}]/g, "");

    var clientUrl = Xrm.Utility.getGlobalContext().getClientUrl();
    var data = encodeURIComponent(JSON.stringify({ recordId: recordId }));
    var url = clientUrl + "/WebResources/htn1423_wcgsalessaleOrder_printSO_ui?Data=" + data;

    window.open(url, "_blank");
};
