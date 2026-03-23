import * as React from 'react';
import { KpiItem, WarehouseOverview as WarehouseOverviewComponent } from './WarehouseOverview';
import { IInputs, IOutputs } from './generated/ManifestTypes';

interface NavOptions { pageType: string; entityName: string; entityId?: string; formType?: number }
function navigateTo(context: ComponentFramework.Context<IInputs>, options: NavOptions): Promise<void> {
    // navigateTo is not yet in PCF typings, cast required
    return (context.navigation as unknown as { navigateTo: (o: NavOptions) => Promise<void> }).navigateTo(options);
}

export class WarehouseOverview implements ComponentFramework.ReactControl<IInputs, IOutputs> {
    private _notifyOutputChanged: () => void;
    private _context: ComponentFramework.Context<IInputs>;
    private _currentPage = 1;
    private _pageSize = 5;
    private _pageSizeApplied = false;
    private _isNavigating = false;
    private _kpiAllItems: KpiItem[] = [];
    private _kpiFetched = false;

    private async _fetchKpiCounts(context: ComponentFramework.Context<IInputs>): Promise<void> {
        try {
            const result = await context.webAPI.retrieveMultipleRecords(
                "htn1423_nghiatonkho",
                "?$select=htn1423_tonthucte,modifiedon&$filter=statecode eq 0&$top=5000"
            );
            this._kpiAllItems = result.entities.map((e) => {
                const row = e as { htn1423_tonthucte?: number; modifiedon?: string };
                return {
                    tonThucTe: row.htn1423_tonthucte ?? 0,
                    ngayTao: row.modifiedon ? new Date(row.modifiedon) : null,
                };
            });
            this._kpiFetched = true;
        } catch (err) {
            console.error("[PCF KPI] fetch failed", err);
            this._kpiFetched = false;
        }
        this._notifyOutputChanged();
    }

    public init(
        context: ComponentFramework.Context<IInputs>,
        notifyOutputChanged: () => void,
        state: ComponentFramework.Dictionary
    ): void {
        this._notifyOutputChanged = notifyOutputChanged;
        this._context = context;
        context.parameters.warehouseItems.paging.setPageSize(this._pageSize);
        context.mode.trackContainerResize(true);
        void this._fetchKpiCounts(context);
    }

    public updateView(context: ComponentFramework.Context<IInputs>): React.ReactElement {
        this._context = context;

        const dataset = context.parameters.warehouseItems;

        // Apply page size only on init or after user changes it (not during page navigation)
        if (!this._pageSizeApplied && !this._isNavigating) {
            if (dataset.paging.pageSize !== this._pageSize) {
                dataset.paging.setPageSize(this._pageSize);
                dataset.refresh();
            } else {
                this._pageSizeApplied = true;
            }
        }
        this._isNavigating = false;

        const lowStockThreshold = context.parameters.lowStockThreshold.raw ?? 10;

        const items = dataset.sortedRecordIds.map((id) => {
            const record = dataset.records[id];
            return {
                id,
                maTonKho:    record.getValue("htn1423_name")        as string ?? "",
                tenSanPham:  record.getFormattedValue("htn1423_tensanpham") ?? "",
                tonThucTe:   record.getValue("htn1423_tonthucte")   as number ?? 0,
                donViChuan:  record.getValue("htn1423_onvichuan")   as string ?? "",
                nhomSanPham: record.getValue("htn1423_nhomsanpham") as string ?? "",
                owner:       record.getFormattedValue("ownerid")            ?? "",
                ngayTao:     record.getValue("modifiedon")          as Date   ?? null,
            };
        });

        const hasMorePages    = dataset.paging.hasNextPage;
        const hasPrevPage     = dataset.paging.hasPreviousPage;
        const currentPage     = this._currentPage;
        const pageSize        = this._pageSize;
        const totalCount      = dataset.paging.totalResultCount;
        const isLoading       = dataset.loading;

        return React.createElement(WarehouseOverviewComponent, {
            items,
            kpiAllItems: this._kpiFetched ? this._kpiAllItems : undefined,
            lowStockThreshold,
            hasMorePages,
            hasPrevPage,
            currentPage,
            pageSize,
            totalCount,
            isLoading,
            onNextPage: () => {
                this._isNavigating = true;
                this._currentPage++;
                dataset.paging.loadExactPage(this._currentPage);
                this._notifyOutputChanged();
            },
            onPrevPage: () => {
                this._isNavigating = true;
                if (this._currentPage > 1) { this._currentPage--; }
                dataset.paging.loadExactPage(this._currentPage);
                this._notifyOutputChanged();
            },
            onCreateNew: () => {
                void navigateTo(context, { pageType: "entityrecord", entityName: "htn1423_nghiatonkho", formType: 2 });
            },
            onViewDetail: (id: string) => {
                void navigateTo(context, { pageType: "entityrecord", entityName: "htn1423_nghiatonkho", entityId: id });
            },
            onEdit: (id: string) => {
                void navigateTo(context, { pageType: "entityrecord", entityName: "htn1423_nghiatonkho", entityId: id, formType: 2 });
            },
            onChangePageSize: (size: number) => {
                this._pageSize = size;
                this._currentPage = 1;
                this._pageSizeApplied = false;
                dataset.paging.setPageSize(size);
                dataset.refresh();
                this._notifyOutputChanged();
            },
            onGoToPage: (page: number) => {
                this._isNavigating = true;
                this._currentPage = page;
                dataset.paging.loadExactPage(page);
                this._notifyOutputChanged();
            },
            onRefresh: () => {
                dataset.refresh();
                void this._fetchKpiCounts(this._context);
            },
            onExportExcel: () => {
                const entityType = dataset.getTargetEntityType();
                const rawViewId = dataset.getViewId();
                const viewId = rawViewId.startsWith("{") ? rawViewId : `{${rawViewId}}`;
                console.log("[PCF Export] entityType:", entityType, "viewId:", viewId);
                const exportUrl = `/main.aspx?pagetype=entitylist&etn=${entityType}&viewid=${viewId}&viewType=1039&Export=true`;
                window.open(exportUrl, "_blank");
            },
            onDelete: async (id: string, tenSanPham: string) => {
                const result = await context.navigation.openConfirmDialog(
                    { title: "Xác nhận vô hiệu hóa", text: `Bạn có chắc muốn vô hiệu hóa sản phẩm "${tenSanPham}" không?` },
                    { height: 200, width: 450 }
                );
                if (!result.confirmed) return;
                await context.webAPI.updateRecord("htn1423_nghiatonkho", id, { statecode: 1, statuscode: 2 });
                dataset.refresh();
                void this._fetchKpiCounts(this._context);
            },
        });
    }

    public getOutputs(): IOutputs {
        return {};
    }

    public destroy(): void {
        // Automatically cleanup React nodes if needed, or left empty
    }
}
