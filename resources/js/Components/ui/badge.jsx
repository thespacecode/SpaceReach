import * as React from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-lg border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                default: "border-transparent bg-primary text-primary-foreground",
                secondary: "border-transparent bg-secondary text-secondary-foreground",
                destructive: "border-transparent bg-destructive text-destructive-foreground",
                outline: "text-foreground",
                success: "border-transparent bg-emerald-50 text-emerald-700",
                warning: "border-transparent bg-amber-50 text-amber-700",
                info: "border-transparent bg-blue-50 text-blue-700",
                lead: "border-transparent bg-slate-100 text-slate-600",
                won: "border-transparent bg-emerald-50 text-emerald-700",
                lost: "border-transparent bg-red-50 text-red-700",
                active: "border-transparent bg-emerald-50 text-emerald-700",
                inactive: "border-transparent bg-slate-100 text-slate-600",
                pending: "border-transparent bg-amber-50 text-amber-700",
                paid: "border-transparent bg-emerald-50 text-emerald-700",
                overdue: "border-transparent bg-red-50 text-red-700",
                draft: "border-transparent bg-slate-100 text-slate-600",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

function Badge({ className, variant, ...props }) {
    return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
