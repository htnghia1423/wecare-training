import { useEffect, useState } from "react";
import { getContext } from "@microsoft/power-apps/app";

export interface CurrentUser {
    fullName: string;
    email: string;
    initials: string;
}

export function useCurrentUser(): CurrentUser | null {
    const [user, setUser] = useState<CurrentUser | null>(null);

    useEffect(() => {
        getContext()
            .then((ctx) => {
                const fullName = ctx.user.fullName ?? "";
                const email = ctx.user.userPrincipalName ?? "";
                const parts = fullName.trim().split(/\s+/);
                const initials =
                    parts.length >= 2
                        ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
                        : fullName.slice(0, 2).toUpperCase();
                setUser({ fullName, email, initials });
            })
            .catch(() => {
                // Gracefully fail in dev/local mode
            });
    }, []);

    return user;
}
