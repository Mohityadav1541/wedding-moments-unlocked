import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 font-body",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant hover:shadow-elegant-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border-2 border-primary/30 bg-transparent text-primary hover:bg-primary/10 hover:border-primary",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        // Wedding Theme Variants
        rose: "bg-rose-gold text-primary-foreground hover:bg-rose-gold-dark shadow-elegant hover:shadow-glow",
        sage: "bg-sage text-foreground hover:bg-sage-dark hover:text-primary-foreground shadow-elegant",
        elegant: "bg-gradient-to-r from-primary to-rose-gold text-primary-foreground hover:opacity-90 shadow-elegant-md hover:shadow-glow",
        hero: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-elegant-md hover:shadow-glow text-base font-semibold",
        "hero-outline": "border-2 border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground text-base font-semibold",
        gold: "bg-gold text-foreground hover:opacity-90 shadow-elegant font-semibold",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-12 rounded-lg px-8 text-base",
        xl: "h-14 rounded-xl px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
