import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { UseFormReturn } from "react-hook-form";

interface SettingsSecurityTabProps {
  passwordForm: UseFormReturn<any>;
}

export function SettingsSecurityTab({ passwordForm }: SettingsSecurityTabProps) {
  return (
    <div className="animate-in fade-in duration-500 max-w-2xl">
      <div className="mb-10">
        <h2 className="text-[17px] font-bold mb-6">Change Password</h2>
        <div className="space-y-6">
          <div className="space-y-2 max-w-md">
            <Label className="text-sm font-semibold text-foreground">Current Password</Label>
            <Input
              {...passwordForm.register("currentPassword")}
              type="password"
              className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
            />
            {passwordForm.formState.errors.currentPassword && (
              <p className="text-xs text-destructive">{passwordForm.formState.errors.currentPassword.message as string}</p>
            )}
          </div>
          <Separator className="max-w-md" />
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">New Password</Label>
              <Input
                {...passwordForm.register("newPassword")}
                type="password"
                className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
              />
              {passwordForm.formState.errors.newPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.newPassword.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-foreground">Confirm Password</Label>
              <Input
                {...passwordForm.register("confirmPassword")}
                type="password"
                className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordForm.formState.errors.confirmPassword.message as string}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
