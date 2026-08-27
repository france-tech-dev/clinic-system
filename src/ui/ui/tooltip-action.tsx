"use client";

import * as React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TooltipActionProps {
  title: string;
  asChild?: boolean;
  children: React.ReactNode;
}

function TooltipAction({ title, asChild = false, children }: TooltipActionProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={asChild}>
        {asChild ? children : <span className="inline-block">{children}</span>}
      </TooltipTrigger>
      <TooltipContent>{title}</TooltipContent>
    </Tooltip>
  );
}

export { TooltipAction };
