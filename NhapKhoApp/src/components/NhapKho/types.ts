import type { Htn1423_nhapkhos } from "../../generated/models/Htn1423_nhapkhosModel";

export interface NhapKhoFormData {
    htn1423_soluong?: number | string;
    htn1423_onmuachitiet?: string; // GUID of the lookup record
}

export interface NhapKhoTableRow extends Htn1423_nhapkhos {
    htn1423_onmuachitietname?: string; // Formatted lookup display name
    "_htn1423_onmuachitiet_value@OData.Community.Display.V1.FormattedValue"?: string;
}

export type SortField = "htn1423_name" | "htn1423_soluong" | "createdon" | "modifiedon";
export type SortDirection = "asc" | "desc";

export interface SortConfig {
    field: SortField;
    direction: SortDirection;
}

export interface FilterConfig {
    searchTerm: string;
    statusFilter: "all" | "active" | "inactive";
}

export type FormMode = "create" | "edit" | "view";
