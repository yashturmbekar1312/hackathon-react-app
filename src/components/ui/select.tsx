import * as React from "react"
import { cn } from "@/utils/cn"

export interface SelectProps
    extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, ...props }, ref) => {
        return (
            <select
                className={cn(
                    "w-full h-10 pl-3 pr-8 text-sm border border-gray-300 rounded-lg bg-white",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
                    "cursor-pointer appearance-none",
                    "bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg width=\"24\" height=\"24\" viewBox=\"0 0 24 24\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"%3e%3cpath d=\"M6 9L12 15L18 9\" stroke=\"%236B7280\" stroke-width=\"2\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/%3e%3c/svg%3e')]",
                    "bg-no-repeat bg-right-0.5 bg-[length:1.5em_1.5em]",
                    "hover:border-gray-400 transition-colors",
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Select.displayName = "Select"

export { Select }
