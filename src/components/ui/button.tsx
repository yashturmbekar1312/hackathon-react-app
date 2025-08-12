import * as React from "react";
import { cn } from "../../utils/cn";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger"
    | "outline"
    | "ghost"
    | "link";
  size?: "xs" | "sm" | "default" | "lg" | "xl";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      icon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseClasses = `
      inline-flex items-center justify-center font-medium transition-all duration-200 ease-in-out 
      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 
      disabled:pointer-events-none disabled:opacity-50 active:scale-95 
      relative overflow-hidden group
    `;

    const variants = {
      default: `
        bg-gradient-to-r from-neutral-600 to-neutral-700 hover:from-neutral-700 hover:to-neutral-800 
        text-white shadow-soft hover:shadow-moderate focus-visible:ring-neutral-500
      `,
      primary: `
        gradient-primary text-white shadow-soft hover:shadow-moderate 
        hover:from-brand-600 hover:to-brand-700 focus-visible:ring-brand-500
      `,
      secondary: `
        bg-gradient-to-r from-neutral-100 to-neutral-200 hover:from-neutral-200 hover:to-neutral-300 
        text-neutral-700 shadow-soft hover:shadow-moderate focus-visible:ring-neutral-400
      `,
      success: `
        gradient-success text-white shadow-soft hover:shadow-moderate 
        hover:from-success-600 hover:to-success-700 focus-visible:ring-success-500
      `,
      warning: `
        gradient-warning text-white shadow-soft hover:shadow-moderate 
        hover:from-warning-600 hover:to-warning-700 focus-visible:ring-warning-500
      `,
      danger: `
        gradient-danger text-white shadow-soft hover:shadow-moderate 
        hover:from-danger-600 hover:to-danger-700 focus-visible:ring-danger-500
      `,
      outline: `
        border-2 border-brand-300 bg-white/80 backdrop-blur-sm text-brand-700 
        hover:bg-brand-50 hover:border-brand-400 hover:text-brand-800 
        shadow-soft hover:shadow-moderate focus-visible:ring-brand-500
      `,
      ghost: `
        text-neutral-700 hover:bg-white/50 hover:text-neutral-800 
        backdrop-blur-sm hover:shadow-soft focus-visible:ring-neutral-400
      `,
      link: `
        text-brand-600 hover:text-brand-700 underline-offset-4 hover:underline 
        focus-visible:ring-brand-500 p-0 h-auto
      `,
    };

    const sizes = {
      xs: "h-7 px-2.5 py-1 text-xs rounded-lg",
      sm: "h-8 px-3 py-1.5 text-sm rounded-lg",
      default: "h-10 px-4 py-2 text-sm rounded-xl",
      lg: "h-12 px-6 py-3 text-base rounded-xl",
      xl: "h-14 px-8 py-4 text-lg rounded-2xl",
    };

    return (
      <button
        className={cn(baseClasses, variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        ref={ref}
        {...props}
      >
        {/* Loading Spinner */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Button Content */}
        <span
          className={`flex items-center space-x-2 ${
            isLoading ? "opacity-0" : "opacity-100"
          }`}
        >
          {icon && <span className="flex-shrink-0">{icon}</span>}
          {children && <span>{children}</span>}
        </span>

        {/* Hover Effect */}
        <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
