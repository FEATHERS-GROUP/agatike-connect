import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { ServerCrash, FileQuestion } from "lucide-react";

export function PageNotFound({
  isBlocked = false,
  isExpired = false,
}: {
  isBlocked?: boolean;
  isExpired?: boolean;
}) {
  const isDisconnected = isBlocked || isExpired;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
            {isDisconnected ? (
              <ServerCrash className="w-32 h-32 text-destructive relative z-10 drop-shadow-2xl animate-pulse" />
            ) : (
              <FileQuestion className="w-32 h-32 text-primary relative z-10 drop-shadow-2xl animate-bounce" />
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground">
            {isDisconnected ? "Service Unavailable" : "Page Not Found"}
          </h1>
          <p className="text-base text-muted-foreground font-medium">
            {isBlocked
              ? "This company's account has been suspended."
              : isExpired
                ? "This company's subscription has expired."
                : "This company page does not exist or is not published."}
          </p>
        </div>

        <Button
          asChild
          size="lg"
          className="rounded-full px-8 shadow-lg hover:shadow-xl hover:scale-105 transition-all mt-4"
        >
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    </div>
  );
}
