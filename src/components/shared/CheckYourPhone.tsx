import React from "react";
import { Button } from "@/components/ui/button";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";

interface CheckYourPhoneProps {
  amount?: number;
  currency?: string;
  themeColor?: string;
  onCancel: () => void;
}

export const CheckYourPhone = ({
  amount,
  currency = "RWF",
  themeColor,
  onCancel,
}: CheckYourPhoneProps) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
      <img src={agatikeIcon} alt="Agatike" className="h-20 w-20 mb-6 animate-pulse" />
      <h1 className="text-3xl font-bold mb-4">Check Your Phone</h1>
      <p className="text-lg text-muted-foreground mb-4 max-w-sm mx-auto">
        We've sent a payment request to your mobile number. Please enter your PIN to confirm the
        payment{amount ? ` of ${currency} ${amount.toLocaleString()}` : ""}.
      </p>
      <p className="text-md text-foreground font-semibold mb-10 max-w-sm mx-auto">
        Processing... Please don't close this window!
      </p>
      <div className="flex gap-3 mb-10 justify-center">
        <div
          className="h-3 w-3 rounded-full animate-bounce"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
        <div
          className="h-3 w-3 rounded-full animate-bounce delay-75"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
        <div
          className="h-3 w-3 rounded-full animate-bounce delay-150"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
      </div>
      <Button variant="outline" className="rounded-xl h-12 px-8" onClick={onCancel}>
        Cancel Payment
      </Button>
    </div>
  );
};
