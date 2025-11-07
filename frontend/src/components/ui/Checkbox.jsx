import React from "react";
import { cn } from "../../lib/utils";

const Checkbox = React.forwardRef(
  ({ className, onCheckedChange, ...props }, ref) => (
    <input
      type="checkbox"
      className={cn(
        'h-4 w-4 rounded border border-gray-300 text-primary-600 focus:ring-primary-500 focus:ring-2',
        className
      )}
      ref={ref}
      onChange={onCheckedChange}
      {...props}
    />
  )
);

Checkbox.displayName = "Checkbox";

export { Checkbox };