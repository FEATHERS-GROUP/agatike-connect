import React from "react";
import { Button } from "@/components/ui/button";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";

interface CheckYourPhoneProps {
  amount?: number;
  currency?: string;
  themeColor?: string;
  status?: "payment" | "generating" | "finalizing";
  onCancel: () => void;
}

export const CheckYourPhone = ({
  amount,
  currency = "RWF",
  themeColor,
  status = "payment",
  onCancel,
}: CheckYourPhoneProps) => {
  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      <img src={agatikeIcon} alt="Agatike" className="h-20 w-20 mb-6" />
      <h1 className="text-3xl font-bold mb-4">
        {status === "generating" ? "Generating Tickets" : "Check Your Phone"}
      </h1>
      <p className="text-lg text-muted-foreground mb-4 max-w-sm mx-auto">
        {status === "generating"
          ? "Your payment was successful! Please wait while we prepare and issue your tickets."
          : `We've sent a payment request to your mobile number. Please enter your PIN to confirm the payment${amount ? ` of ${currency} ${amount.toLocaleString()}` : ""}.`}
      </p>
      <p className="text-md text-foreground font-semibold mb-10 max-w-sm mx-auto">
        Processing... Please don't close this window!
      </p>
      <div className="flex gap-3 mb-10 justify-center">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: themeColor || "var(--primary)" }}
        />
      </div>
      {status === "payment" && (
        <Button variant="outline" className="rounded-xl h-12 px-8" onClick={onCancel}>
          Cancel Payment
        </Button>
      )}
    </div>
  );
};
