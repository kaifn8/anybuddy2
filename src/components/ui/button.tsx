import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] active:duration-100",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground rounded-2xl bg-primary font-semibold text-[15px] tracking-[-0.01em] shadow-[0_4px_14px_hsl(var(--primary)/0.35),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_6px_20px_hsl(var(--primary)/0.4),inset_0_1px_0_rgba(255,255,255,0.25)] hover:-translate-y-0.5 hover:brightness-110",
        destructive:
          "text-destructive-foreground rounded-2xl bg-destructive font-semibold text-[15px] shadow-[0_4px_14px_hsl(var(--destructive)/0.3),inset_0_1px_0_rgba(255,255,255,0.15)] hover:shadow-[0_6px_20px_hsl(var(--destructive)/0.35)] hover:-translate-y-0.5 hover:brightness-110",
        outline:
          "border-2 border-border bg-background text-foreground rounded-2xl text-[14px] hover:bg-muted hover:border-border/80 hover:-translate-y-0.5",
        secondary:
          "text-foreground rounded-2xl text-[14px] bg-muted/60 backdrop-blur-xl border border-border/30 shadow-[0_1px_4px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.5)] hover:bg-muted hover:shadow-[0_2px_8px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.6)] hover:-translate-y-0.5",
        ghost:
          "text-muted-foreground rounded-2xl text-[14px] hover:bg-muted hover:text-foreground",
        link: "text-primary underline-offset-4 hover:underline text-[14px]",
      },
      size: {
        default: "h-12 px-6 py-2.5",
        sm: "h-10 px-4 text-[13px]",
        lg: "h-14 px-8 text-[16px]",
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
