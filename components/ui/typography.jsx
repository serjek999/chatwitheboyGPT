import React from "react"
import { cn } from "@/lib/utils"

export const TypographyH4 = React.forwardRef(({ className, ...props }, ref) => (
  <h4
    ref={ref}
    className={cn("scroll-m-20 text-xl font-semibold tracking-tight", className)}
    {...props}
  />
))
TypographyH4.displayName = "TypographyH4"

export const TypographyP = React.forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("leading-7 [&:not(:first-child)]:mt-4", className)}
    {...props}
  />
))
TypographyP.displayName = "TypographyP"
