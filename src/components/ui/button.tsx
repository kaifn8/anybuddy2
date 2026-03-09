import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.98] active:duration-100",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground rounded-xl bg-primary font-semibold text-[15px] tracking-[-0.01em] shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/25 hover:-translate-y-0.5 hover:brightness-110",
        destructive:
          "text-destructive-foreground rounded-xl bg-destructive font-semibold text-[15px] shadow-lg shadow-destructive/20 hover:shadow-xl hover:shadow-destructive/25 hover:-translate-y-0.5 hover:brightness-110",
        outline:
          "border-2 border-border bg-background text-foreground rounded-xl text-[14px] hover:bg-muted hover:border-border/80 hover:-translate-y-0.5",
        secondary:
          "text-foreground rounded-xl text-[14px] bg-muted/60 backdrop-blur-xl border border-border/30 shadow-sm hover:bg-muted hover:shadow-md hover:-translate-y-0.5",
        ghost:
          "text-muted-foreground rounded-xl text-[14px] hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline text-[14px]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[13px]",
        lg: "h-13 px-8 text-[16px]",
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
