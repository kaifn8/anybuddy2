import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "text-primary-foreground rounded-2xl font-bold text-[14px] tracking-[-0.01em] bg-gradient-to-b from-[hsl(211_100%_54%)] to-[hsl(211_100%_44%)] shadow-[0_1px_3px_hsl(var(--primary)/0.2),0_4px_16px_hsl(var(--primary)/0.2),inset_0_1px_0_hsl(0_0%_100%/0.15)] hover:shadow-[0_2px_8px_hsl(var(--primary)/0.25),0_8px_24px_hsl(var(--primary)/0.2),inset_0_1px_0_hsl(0_0%_100%/0.2)] hover:-translate-y-0.5 hover:brightness-[1.03] active:scale-[0.97] active:duration-[80ms] transition-all duration-300 ease-[cubic-bezier(0.25,1,0.5,1)]",
        destructive:
          "text-destructive-foreground rounded-2xl font-bold text-[14px] bg-gradient-to-b from-destructive to-[hsl(0_68%_44%)] shadow-[0_1px_3px_hsl(var(--destructive)/0.2),0_4px_12px_hsl(var(--destructive)/0.15),inset_0_1px_0_hsl(0_0%_100%/0.12)] hover:shadow-[0_4px_20px_hsl(var(--destructive)/0.2)] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300",
        outline:
          "border border-border/40 bg-background/70 backdrop-blur-xl text-foreground rounded-2xl text-[13px] shadow-[0_1px_3px_hsl(var(--foreground)/0.03),inset_0_0.5px_0_hsl(0_0%_100%/0.5)] hover:bg-background hover:shadow-[0_2px_8px_hsl(var(--foreground)/0.05)] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300",
        secondary:
          "text-foreground rounded-2xl text-[13px] bg-background/60 backdrop-blur-xl border border-border/30 shadow-[0_1px_3px_hsl(var(--foreground)/0.03),inset_0_0.5px_0_hsl(0_0%_100%/0.4)] hover:bg-background/80 hover:shadow-[0_3px_12px_hsl(var(--foreground)/0.05)] hover:-translate-y-0.5 active:scale-[0.97] active:duration-[80ms] transition-all duration-300",
        ghost:
          "text-muted-foreground rounded-2xl text-[13px] hover:bg-muted/40 hover:text-foreground active:scale-[0.97] active:duration-[80ms] transition-all duration-200",
        link: "text-primary underline-offset-4 hover:underline text-[13px]",
      },
      size: {
        default: "h-11 px-6 py-2.5",
        sm: "h-9 px-4 text-[12px]",
        lg: "h-13 px-8 text-[15px]",
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
