import React from "react";
import { Button } from "@/components/ui/button";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import { Loader2 } from "lucide-react";

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
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      // If the component is still mounted (e.g., waiting for parent to close it),
      // we could reset the state, but usually the parent will unmount this component.
      // We wrap it in a try-finally just in case.
    }
  };

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
      <div className="flex justify-center mb-10">
        <Loader2
          className="h-12 w-12 animate-spin"
          style={{ color: themeColor || "hsl(var(--primary))" }}
        />
      </div>
      {status === "payment" && (
        <Button 
          variant="outline" 
          className="rounded-xl h-12 px-8" 
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
            </>
          ) : (
            "Cancel Payment"
          )}
        </Button>
      )}
    </div>
  );
};
