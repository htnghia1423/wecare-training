import React from "react";

export type ButtonVariant = "primary" | "secondary" | "danger" | "ghost" | "success";
export type ButtonSize = "small" | "medium" | "large";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: ButtonVariant;
    size?: ButtonSize;
    isLoading?: boolean;
    icon?: React.ReactNode;
    children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
    variant = "primary",
    size = "medium",
    isLoading = false,
    icon,
    children,
    disabled,
    className = "",
    ...props
}) => {
    const baseClass = "wecare-button";
    const variantClass = `wecare-button--${variant}`;
    const sizeClass = `wecare-button--${size}`;
    const loadingClass = isLoading ? "wecare-button--loading" : "";

    const classes = [baseClass, variantClass, sizeClass, loadingClass, className]
        .filter(Boolean)
        .join(" ");

    return (
        <button className={classes} disabled={disabled || isLoading} {...props}>
            {isLoading && (
                <span className="wecare-button__spinner" aria-hidden="true">
                    <span className="spinner-border spinner-border-sm" />
                </span>
            )}
            {icon && !isLoading && (
                <span className="wecare-button__icon" aria-hidden="true">
                    {icon}
                </span>
            )}
            <span className="wecare-button__text">{children}</span>
        </button>
    );
};
