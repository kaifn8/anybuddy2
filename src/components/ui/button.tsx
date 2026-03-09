import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 active:scale-[0.97]",
  {
    variants: {
      variant: {
        default: "text-white rounded-xl bg-gradient-to-b from-[hsla(211,100%,56%,0.92)] to-[hsla(211,100%,42%,0.96)] backdrop-blur-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.25)] hover:from-[hsla(211,100%,60%,0.95)] hover:to-[hsla(211,100%,46%,0.98)] hover:-translate-y-px hover:shadow-[0_4px_14px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.3)]",
        destructive: "text-white rounded-xl bg-gradient-to-b from-[hsla(0,80%,55%,0.92)] to-[hsla(0,80%,42%,0.96)] shadow-[0_2px_10px_rgba(0,0,0,0.15),inset_0_1px_0_rgba(255,255,255,0.2)] hover:from-[hsla(0,80%,58%,0.95)] hover:to-[hsla(0,80%,45%,0.98)] hover:-translate-y-px",
        outline: "border border-input bg-background hover:bg-muted rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]",
        secondary: "text-foreground rounded-xl bg-gradient-to-b from-[hsla(0,0%,100%,0.7)] to-[hsla(0,0%,96%,0.7)] backdrop-blur-[16px] border border-white/40 shadow-[0_2px_8px_rgba(0,0,0,0.08),inset_0_1px_0_rgba(255,255,255,0.6)] hover:from-[hsla(0,0%,100%,0.85)] hover:to-[hsla(0,0%,98%,0.85)] hover:-translate-y-px",
        ghost: "hover:bg-muted rounded-xl",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8",
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
