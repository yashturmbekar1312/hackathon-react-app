import React from "react";
import { cn } from "@/utils/cn";

interface LoadingSpinnerProps {
  size?: "sm" | "default" | "lg" | "xl";
  variant?: "primary" | "secondary" | "white";
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "default",
  variant = "primary",
  className,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    default: "w-6 h-6",
    lg: "w-8 h-8",
    xl: "w-12 h-12",
  };

  const variants = {
    primary: "border-brand-600 border-t-transparent",
    secondary: "border-neutral-400 border-t-transparent",
    white: "border-white border-t-transparent",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizes[size],
        variants[variant],
        className
      )}
    />
  );
};

interface LoadingPageProps {
  message?: string;
  showLogo?: boolean;
}

const LoadingPage: React.FC<LoadingPageProps> = ({
  message = "Loading...",
  showLogo = true,
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-brand-50/30 bg-mesh flex items-center justify-center">
      <div className="text-center space-y-6 animate-fade-in">
        {showLogo && (
          <div className="flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-2xl font-bold shadow-strong animate-float">
                W
              </div>
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-brand-400 to-brand-500 animate-pulse opacity-50"></div>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <LoadingSpinner size="lg" className="mx-auto" />
          <div className="space-y-2">
            <p className="text-lg font-medium text-neutral-700">{message}</p>
            <div className="flex justify-center space-x-1">
              <div
                className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="w-2 h-2 rounded-full bg-brand-500 animate-bounce"
                style={{ animationDelay: "300ms" }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoadingCardProps {
  lines?: number;
  showAvatar?: boolean;
  className?: string;
}

const LoadingCard: React.FC<LoadingCardProps> = ({
  lines = 3,
  showAvatar = false,
  className,
}) => {
  return (
    <div className={cn("card-modern p-6 space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full skeleton"></div>
          <div className="space-y-2 flex-1">
            <div className="h-4 skeleton rounded w-1/4"></div>
            <div className="h-3 skeleton rounded w-1/3"></div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, index) => (
          <div
            key={index}
            className={cn(
              "h-4 skeleton rounded",
              index === lines - 1 ? "w-3/4" : "w-full"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          ></div>
        ))}
      </div>
    </div>
  );
};

interface LoadingTableProps {
  rows?: number;
  columns?: number;
  className?: string;
}

const LoadingTable: React.FC<LoadingTableProps> = ({
  rows = 5,
  columns = 4,
  className,
}) => {
  return (
    <div className={cn("card-modern overflow-hidden", className)}>
      {/* Header */}
      <div className="flex border-b border-neutral-200 p-4 space-x-4">
        {Array.from({ length: columns }).map((_, index) => (
          <div key={index} className="h-4 skeleton rounded flex-1"></div>
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div
          key={rowIndex}
          className="flex border-b border-neutral-100 p-4 space-x-4"
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <div
              key={colIndex}
              className="h-4 skeleton rounded flex-1"
              style={{
                animationDelay: `${(rowIndex * columns + colIndex) * 50}ms`,
              }}
            ></div>
          ))}
        </div>
      ))}
    </div>
  );
};

export { LoadingSpinner, LoadingPage, LoadingCard, LoadingTable };
