import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Instagram, Twitter, Youtube } from "lucide-react";
import { UseFormRegister } from "react-hook-form";

interface SettingsSocialTabProps {
  register: UseFormRegister<any>;
}

export function SettingsSocialTab({ register }: SettingsSocialTabProps) {
  return (
    <div className="animate-in fade-in duration-500 max-w-2xl">
      <div className="mb-10">
        <h2 className="text-[17px] font-bold mb-6">Social Links</h2>
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Instagram className="h-4 w-4 text-pink-500" /> Instagram Profile
            </Label>
            <Input
              {...register("instagram")}
              placeholder="https://instagram.com/yourhandle"
              className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Twitter className="h-4 w-4 text-blue-400" /> Twitter Profile
            </Label>
            <Input
              {...register("twitter")}
              placeholder="https://twitter.com/yourhandle"
              className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Youtube className="h-4 w-4 text-red-500" /> YouTube Channel
            </Label>
            <Input
              {...register("youtube")}
              placeholder="https://youtube.com/c/yourchannel"
              className="rounded-md border-border focus:border-primary focus:ring-primary h-10"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
