import { useState, useEffect, useCallback } from "react";
import { Htn1423_onmuachitietsService } from "../generated";
import { handleDataverseError } from "../utils/dataverse";
import { useRetry } from "./useRetry";

export interface OnMuaChiTietLookupItem {
    htn1423_onmuachitietid: string;
    displayName: string;
}

export interface UseOnMuaChiTietReturn {
    lookupData: OnMuaChiTietLookupItem[];
    isLoading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

export function useOnMuaChiTiet(): UseOnMuaChiTietReturn {
    const [lookupData, setLookupData] = useState<OnMuaChiTietLookupItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { retry } = useRetry();

    const fetchOnMuaChiTiets = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const result = await retry(() =>
                Htn1423_onmuachitietsService.getAll({
                    filter: "statecode eq 0", // Only active records
                    orderBy: ["htn1423_name asc"],
                    top: 200,
                    select: ["htn1423_onmuachitietid", "htn1423_name", "_htn1423_tensanpham_value"]
                })
            );

            if (result.success && result.data) {
                type ItemWithAnnotation = (typeof result.data)[number] & {
                    "_htn1423_tensanpham_value@OData.Community.Display.V1.FormattedValue"?: string;
                };
                // Format for dropdown display
                const formatted = result.data.map((item) => {
                    const annotated = item as ItemWithAnnotation;
                    return {
                        htn1423_onmuachitietid: item.htn1423_onmuachitietid!,
                        displayName: `${item.htn1423_name} - ${item.htn1423_tensanphamname || annotated["_htn1423_tensanpham_value@OData.Community.Display.V1.FormattedValue"] || "N/A"}`
                    };
                });
                setLookupData(formatted);
            } else {
                throw new Error("Failed to fetch Đơn mua chi tiết");
            }
        } catch (err) {
            const errorMessage = handleDataverseError(err);
            setError(errorMessage);
            console.error("Error fetching Đơn mua chi tiết:", err);
        } finally {
            setIsLoading(false);
        }
    }, [retry]);

    useEffect(() => {
        fetchOnMuaChiTiets();
    }, [fetchOnMuaChiTiets]);

    return {
        lookupData,
        isLoading,
        error,
        refetch: fetchOnMuaChiTiets
    };
}
