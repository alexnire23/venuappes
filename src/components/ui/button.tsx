import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground rounded-2xl hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground rounded-2xl hover:bg-destructive/90",
        outline:
          "border border-border bg-card rounded-2xl hover:bg-secondary",
        secondary:
          "bg-secondary text-secondary-foreground rounded-2xl hover:bg-secondary/80",
        ghost: "hover:bg-secondary hover:text-secondary-foreground rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
        // Editorial hero button — deep green, large radius, subtle shadow
        hero: "bg-primary text-primary-foreground rounded-2xl shadow-lg hover:shadow-xl text-base font-semibold tracking-tight",
        accent: "bg-accent text-accent-foreground rounded-2xl hover:bg-accent/90",
        soft: "bg-primary/8 text-primary rounded-2xl hover:bg-primary/15",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3 text-xs",
        lg: "h-12 px-8 text-base",
        xl: "h-14 px-10 text-lg",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };
