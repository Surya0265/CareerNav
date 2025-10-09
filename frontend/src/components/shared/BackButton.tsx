import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { cn } from "../ui/utils";

interface BackButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
  variant?: "ghost" | "secondary" | "outline";
}

export function BackButton({
  onClick,
  label = "Back",
  className,
  variant = "ghost"
}: BackButtonProps) {
  return (
    <Button
      variant={variant}
      size="sm"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-4 text-sm font-medium",
        variant === "ghost" ? "text-muted-foreground hover:text-foreground" : "",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      <span>{label}</span>
    </Button>
  );
}
