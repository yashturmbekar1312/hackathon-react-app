import * as React from "react";
import { cn } from "../../utils/cn";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: "default" | "filled" | "outlined";
  inputSize?: "sm" | "default" | "lg";
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      variant = "default",
      inputSize = "default",
      icon,
      error,
      label,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    const baseClasses = `
      w-full border transition-all duration-200 ease-in-out
      focus:outline-none focus:ring-2 focus:ring-offset-0
      disabled:cursor-not-allowed disabled:opacity-50
      placeholder:text-neutral-400
    `;

    const variants = {
      default: `
        bg-white/80 backdrop-blur-sm border-neutral-300 
        focus:border-brand-500 focus:ring-brand-500/20
        hover:border-neutral-400
      `,
      filled: `
        bg-neutral-100 border-transparent 
        focus:bg-white focus:border-brand-500 focus:ring-brand-500/20
        hover:bg-neutral-50
      `,
      outlined: `
        bg-transparent border-2 border-neutral-300
        focus:border-brand-500 focus:ring-brand-500/20
        hover:border-neutral-400
      `,
    };

    const sizes = {
      sm: "h-9 px-3 py-2 text-sm rounded-lg",
      default: "h-11 px-4 py-3 text-sm rounded-xl",
      lg: "h-12 px-5 py-3 text-base rounded-xl",
    };

    const errorClasses = error
      ? "border-danger-500 focus:border-danger-500 focus:ring-danger-500/20"
      : "";

    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-neutral-700"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              {icon}
            </div>
          )}

          <input
            id={inputId}
            type={type}
            className={cn(
              baseClasses,
              variants[variant],
              sizes[inputSize],
              errorClasses,
              icon && "pl-10",
              className
            )}
            ref={ref}
            {...props}
          />

          {/* Focus ring effect */}
          <div className="absolute inset-0 rounded-xl border-2 border-transparent bg-gradient-to-r from-brand-500 to-brand-600 opacity-0 focus-within:opacity-20 transition-opacity duration-200 pointer-events-none" />
        </div>

        {error && (
          <p className="text-sm text-danger-600 flex items-center">
            <svg
              className="w-4 h-4 mr-1 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
