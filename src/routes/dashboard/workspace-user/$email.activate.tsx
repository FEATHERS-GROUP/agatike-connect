import { useState } from "react";
import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { activateWorkspaceUser } from "@/api/workspace_users";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

import { getSession } from "@/api/auth";
import { checkWorkspaceUserStatus } from "@/api/workspace_users";

export const Route = createFileRoute("/dashboard/workspace-user/$email/activate")({
  beforeLoad: async ({ params, location }) => {
    try {
      const email = decodeURIComponent(params.email);
      const status = await checkWorkspaceUserStatus({ data: { email } } as any);
      
      if (status === "active") {
        const session = await getSession();
        if (session) {
          throw redirect({ to: "/dashboard" });
        } else {
          throw redirect({ to: "/dashboard/login" });
        }
      }
    } catch (err: any) {
      if (err.redirect) {
        throw err;
      }
      // If user not found, we can just let the page load or show error later
    }
  },
  component: ActivatePage,
});

function ActivatePage() {
  const navigate = useNavigate();
  const { email: emailParam } = Route.useParams();
  const decodedEmail = decodeURIComponent(emailParam);
  
  const [email, setEmail] = useState(decodedEmail);
  const [initialPassword, setInitialPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const activateMutation = useMutation({
    mutationFn: (input: any) => activateWorkspaceUser(input),
    onSuccess: () => {
      toast.success("Account activated successfully! Logging you in...");
      navigate({ to: "/dashboard" }); // Navigate to the dashboard after activation
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to activate account");
    }
  });

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !initialPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    activateMutation.mutate({
      data: {
        email,
        initialPassword,
        newPassword
      }
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <form onSubmit={handleActivate}>
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-2xl font-bold tracking-tight">Activate Account</CardTitle>
            <CardDescription>
              Enter the credentials provided by your organizer and set a new password.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                readOnly
                className="bg-secondary/50 text-muted-foreground"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="initial-password">Initial Password (from Organizer)</Label>
              <Input 
                id="initial-password" 
                type="password" 
                value={initialPassword}
                onChange={e => setInitialPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2 pt-4">
              <Label htmlFor="new-password">New Password</Label>
              <Input 
                id="new-password" 
                type="password" 
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <Input 
                id="confirm-password" 
                type="password" 
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className="w-full" 
              type="submit" 
              disabled={activateMutation.isPending}
            >
              {activateMutation.isPending ? "Activating..." : "Activate & Login"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
