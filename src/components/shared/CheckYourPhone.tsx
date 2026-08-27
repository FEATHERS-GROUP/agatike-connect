import React from "react";
import { Button } from "@/components/ui/button";
import agatikeIcon from "@/assets/logo/Agatike Icon.png";
import { Loader2, XCircle } from "lucide-react";

interface CheckYourPhoneProps {
  amount?: number;
  currency?: string;
  themeColor?: string;
  status?: "payment" | "generating" | "finalizing" | "error" | "processing";
  errorMessage?: string;
  onCancel: () => void;
  onClose?: () => void;
}

export const CheckYourPhone = ({
  amount,
  currency = "RWF",
  themeColor,
  status = "payment",
  errorMessage,
  onCancel,
  onClose,
}: CheckYourPhoneProps) => {
  const [isCancelling, setIsCancelling] = React.useState(false);

  const handleCancel = async () => {
    setIsCancelling(true);
    try {
      await onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  const isError = status === "error" || !!errorMessage;

  return (
    <div className="fixed inset-0 z-[9999] bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center">
      {!isError && <img src={agatikeIcon} alt="Agatike" className="h-20 w-20 mb-6" />}
      {isError && <XCircle className="h-20 w-20 mb-6 text-destructive" />}

      <h1 className="text-3xl font-bold mb-4">
        {isError
          ? "Payment Failed"
          : status === "generating"
            ? "Generating Tickets"
            : status === "processing"
              ? "Initiating Payment"
              : "Check Your Phone"}
      </h1>

      <p
        className={`text-lg mb-4 max-w-sm mx-auto ${isError ? "text-destructive font-medium" : "text-muted-foreground"}`}
      >
        {isError
          ? errorMessage || "Your payment failed or was cancelled."
          : status === "generating"
            ? "Your payment was successful! Please wait while we prepare and issue your tickets."
            : status === "processing"
              ? "Initiating payment with your mobile money provider. Please wait..."
              : `We've sent a payment request to your mobile number. Please enter your PIN to confirm the payment${amount ? ` of ${currency} ${amount.toLocaleString()}` : ""}.`}
      </p>

      {!isError && (
        <p className="text-md text-foreground font-semibold mb-10 max-w-sm mx-auto">
          Processing... Please don't close this window!
        </p>
      )}

      {!isError && (
        <div className="flex justify-center mb-10">
          <Loader2
            className="h-12 w-12 animate-spin"
            style={{ color: themeColor || "hsl(var(--primary))" }}
          />
        </div>
      )}

      {!isError && status === "payment" && (
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

      {isError && (
        <Button
          variant="default"
          className="rounded-xl h-12 px-10 mt-6"
          onClick={onClose || onCancel}
        >
          Close
        </Button>
      )}
    </div>
  );
};
