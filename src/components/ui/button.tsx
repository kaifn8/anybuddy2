import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97] active:duration-75",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground rounded-2xl font-semibold text-[15px] tracking-[-0.01em] bg-gradient-to-b from-primary to-[hsl(211_100%_44%)] shadow-[0_2px_12px_hsl(var(--primary)/0.35),inset_0_1px_0_hsl(0_0%_100%/0.2)] hover:shadow-[0_4px_20px_hsl(var(--primary)/0.4),inset_0_1px_0_hsl(0_0%_100%/0.25)] hover:-translate-y-0.5 hover:brightness-105",
        destructive:
          "text-destructive-foreground rounded-2xl font-semibold text-[15px] bg-gradient-to-b from-destructive to-[hsl(0_72%_45%)] shadow-[0_2px_12px_hsl(var(--destructive)/0.3),inset_0_1px_0_hsl(0_0%_100%/0.15)] hover:shadow-[0_4px_20px_hsl(var(--destructive)/0.35)] hover:-translate-y-0.5 hover:brightness-105",
        outline:
          "border border-border/50 bg-background/80 backdrop-blur-sm text-foreground rounded-2xl text-[14px] shadow-[0_1px_3px_hsl(var(--foreground)/0.04),inset_0_1px_0_hsl(0_0%_100%/0.6)] hover:bg-background hover:shadow-[0_2px_8px_hsl(var(--foreground)/0.06),inset_0_1px_0_hsl(0_0%_100%/0.7)] hover:-translate-y-0.5",
        secondary:
          "text-foreground rounded-2xl text-[14px] bg-background/70 backdrop-blur-xl border border-border/40 shadow-[0_1px_4px_hsl(var(--foreground)/0.04),inset_0_1px_0_hsl(0_0%_100%/0.5)] hover:bg-background/90 hover:shadow-[0_3px_12px_hsl(var(--foreground)/0.06),inset_0_1px_0_hsl(0_0%_100%/0.6)] hover:-translate-y-0.5",
        ghost:
          "text-muted-foreground rounded-2xl text-[14px] hover:bg-muted/60 hover:text-foreground",
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
