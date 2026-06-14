import { cn } from "@/lib/utils";
import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { buttonVariants } from "./button-variants";
import type { VariantProps } from "class-variance-authority";

export function Button({
  className,
  variant = "default",
  type = "button",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      type={type}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
