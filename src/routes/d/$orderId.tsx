import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { redeemDigitalProduct } from "@/api/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, AlertCircle, CheckCircle2, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/d/$orderId")({
  component: DigitalDownloadPage,
});

function DigitalDownloadPage() {
  const { orderId } = Route.useParams();
  
  const [downloadState, setDownloadState] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [downloadUrl, setDownloadUrl] = useState("");
  const [productName, setProductName] = useState("");

  const redeemMutation = useMutation({
    mutationFn: () => redeemDigitalProduct({ data: { orderId } } as any),
    onSuccess: (data) => {
      setDownloadState("success");
      setDownloadUrl(data.fileUrl);
      setProductName(data.productName || "your file");
      
      // Trigger download automatically
      toast.success("Download started!");
      window.location.href = data.fileUrl;
    },
    onError: (error: any) => {
      setDownloadState("error");
      setErrorMessage(error.message || "Failed to redeem download link.");
    }
  });

  const handleDownload = () => {
    if (downloadState === "success" && downloadUrl) {
      window.location.href = downloadUrl;
      return;
    }
    
    setDownloadState("downloading");
    redeemMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-border/40">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mb-4">
            {downloadState === "error" ? (
              <AlertCircle className="w-8 h-8 text-destructive" />
            ) : downloadState === "success" ? (
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            ) : (
              <Lock className="w-8 h-8 text-primary" />
            )}
          </div>
          <CardTitle className="text-2xl font-bold">
            {downloadState === "error" 
              ? "Download Unavailable" 
              : downloadState === "success" 
                ? "Download Ready" 
                : "Secure Download"}
          </CardTitle>
          <CardDescription className="text-base mt-2">
            {downloadState === "error" 
              ? errorMessage
              : downloadState === "success"
                ? `Your secure link for ${productName} has been verified.`
                : "This is a single-use secure link. Once you click download, the link will expire."}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="flex flex-col gap-4 pt-4">
          {downloadState === "error" ? (
            <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg border border-destructive/20 text-center">
              Please contact support or the organizer if you believe this is an error.
            </div>
          ) : (
            <div className="bg-slate-100 text-slate-600 text-sm p-4 rounded-lg border border-slate-200">
              <p className="font-semibold text-slate-800 mb-1">Security Notice</p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Link expires exactly 24 hours after purchase.</li>
                <li>Link can only be used <strong>once</strong>.</li>
                <li>Do not refresh the page during download.</li>
              </ul>
            </div>
          )}
        </CardContent>

        <CardFooter>
          {downloadState !== "error" && (
            <Button 
              className="w-full h-12 text-lg font-medium" 
              onClick={handleDownload}
              disabled={downloadState === "downloading"}
            >
              {downloadState === "downloading" ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : downloadState === "success" ? (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download Again
                </>
              ) : (
                <>
                  <Download className="w-5 h-5 mr-2" />
                  Download File Now
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
