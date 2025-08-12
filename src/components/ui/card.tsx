import * as React from "react";
import { cn } from "../../utils/cn";

const Card = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    variant?: "default" | "glass" | "gradient" | "bordered" | "elevated";
    hover?: boolean;
  }
>(({ className, variant = "default", hover = true, ...props }, ref) => {
  const variants = {
    default: "bg-white border border-neutral-200 shadow-soft",
    glass: "glass border border-white/20 shadow-moderate",
    gradient:
      "bg-gradient-to-br from-white via-white to-neutral-50/50 border border-neutral-200/50 shadow-soft",
    bordered: "bg-white border-2 border-neutral-300 shadow-soft",
    elevated: "bg-white border border-neutral-200 shadow-moderate",
  };

  return (
    <div
      ref={ref}
      className={cn(
        "rounded-2xl transition-all duration-300",
        variants[variant],
        hover && "hover:shadow-moderate hover:-translate-y-1",
        "group animate-fade-in-up",
        className
      )}
      {...props}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <div className="relative">{props.children}</div>
    </div>
  );
});
Card.displayName = "Card";

const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-2 p-6 pb-4", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement> & {
    gradient?: boolean;
  }
>(({ className, gradient = false, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      gradient ? "text-gradient" : "text-neutral-800",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-neutral-600 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-2", className)} {...props} />
));
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-2", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

// Stats Card Component
const StatsCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    title: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: {
      value: number;
      isPositive: boolean;
    };
    valueColor?: "default" | "success" | "warning" | "danger";
  }
>(
  (
    { className, title, value, icon, trend, valueColor = "default", ...props },
    ref
  ) => {
    const valueColors = {
      default: "text-neutral-800",
      success: "text-success-600",
      warning: "text-warning-600",
      danger: "text-danger-600",
    };

    return (
      <Card
        ref={ref}
        variant="gradient"
        className={cn("overflow-hidden", className)}
        {...props}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-neutral-600">{title}</p>
              <p className={cn("text-3xl font-bold", valueColors[valueColor])}>
                {value}
              </p>
              {trend && (
                <div
                  className={cn(
                    "flex items-center text-sm font-medium",
                    trend.isPositive ? "text-success-600" : "text-danger-600"
                  )}
                >
                  <svg
                    className={cn(
                      "w-4 h-4 mr-1",
                      trend.isPositive ? "rotate-0" : "rotate-180"
                    )}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M7 17l10-10M7 7h10v10"
                    />
                  </svg>
                  {Math.abs(trend.value)}%
                </div>
              )}
            </div>
            {icon && (
              <div className="p-3 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 text-brand-600">
                {icon}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }
);
StatsCard.displayName = "StatsCard";

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  StatsCard,
};
