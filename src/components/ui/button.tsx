import * as React from "react"
import { cn } from "../../utils/cn"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 ease-in-out shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95"

    const variants = {
      default: "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md",
      destructive: "bg-red-600 text-white hover:bg-red-700 hover:shadow-md",
      outline: "border-2 border-blue-600 bg-white text-blue-600 hover:bg-blue-50 hover:border-blue-700 hover:text-blue-700",
      secondary: "bg-gray-100 text-gray-900 hover:bg-gray-200 hover:shadow-sm",
      ghost: "text-gray-900 hover:bg-gray-100 hover:shadow-sm",
      link: "text-blue-600 hover:text-blue-700 underline-offset-4 hover:underline",
    }

    const sizes = {
      default: "h-10 px-5 py-2.5",
      sm: "h-9 rounded-md px-4 py-2 text-sm",
      lg: "h-11 rounded-md px-6 py-3 text-base",
      icon: "h-10 w-10 p-2",
    }

    return (
      <button
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
