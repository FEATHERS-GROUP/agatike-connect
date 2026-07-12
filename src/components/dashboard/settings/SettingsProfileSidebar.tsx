import { Camera, MoreHorizontal, Phone, Mail, User, Calendar, Globe } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Separator } from "@/components/ui/separator";

function EditableInput({ icon: Icon, ...props }: any) {
  return (
    <div className="flex items-start gap-3 group">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />}
      <div className="flex-1">
        <input
          {...props}
          className={`w-full bg-transparent border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring px-2 py-1.5 -ml-2 rounded-md transition-all text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none ${props.className || ""}`}
        />
        {props.error && <p className="text-[10px] text-destructive ml-1">{props.error}</p>}
      </div>
    </div>
  );
}

interface SettingsProfileSidebarProps {
  avatar: string;
  setIsAvatarModalOpen: (open: boolean) => void;
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
}

export function SettingsProfileSidebar({
  avatar,
  setIsAvatarModalOpen,
  register,
  errors,
}: SettingsProfileSidebarProps) {
  return (
    <div className="w-full md:w-[320px] md:pr-8 md:border-r border-border flex-shrink-0">
      {/* Identity Card */}
      <div className="flex items-start justify-between mb-8 group">
        <div className="flex items-center gap-4">
          <div
            className="relative h-[72px] w-[72px] rounded-2xl overflow-hidden cursor-pointer shadow-sm border border-border bg-muted flex items-center justify-center"
            onClick={() => setIsAvatarModalOpen(true)}
          >
            {avatar ? (
              <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <User className="h-8 w-8 text-muted-foreground" />
            )}
            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera className="h-5 w-5 text-white" />
            </div>
          </div>
          <div>
            <input
              {...register("name")}
              className="font-bold text-lg text-foreground bg-transparent border-transparent hover:border-border focus:border-input focus:bg-muted px-1 py-0.5 -ml-1 rounded w-full outline-none transition-colors"
              placeholder="Organizer Name"
            />
            <div className="flex items-center text-sm text-muted-foreground font-medium px-1 mt-0.5">
              #
              <input
                {...register("handle")}
                className="bg-transparent border-transparent hover:border-border focus:border-input focus:bg-muted rounded outline-none w-[120px] transition-colors"
                placeholder="handle"
              />
            </div>
          </div>
        </div>
        <button className="text-muted-foreground hover:text-foreground p-1">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>

      <Separator className="my-6" />

      {/* About / Contact */}
      <div className="mb-6">
        <h3 className="font-semibold text-[15px] mb-4">Contact</h3>
        <div className="space-y-1">
          <EditableInput
            icon={Phone}
            {...register("phone")}
            placeholder="Add phone number"
            error={errors.phone?.message as string}
          />
          <EditableInput
            icon={Mail}
            {...register("email")}
            placeholder="Add email address"
            error={errors.email?.message as string}
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Address / Bio */}
      <div className="mb-6">
        <h3 className="font-semibold text-[15px] mb-4">About</h3>
        <div className="flex items-start gap-3">
          <User className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
          <textarea
            {...register("bio")}
            placeholder="Write a short bio..."
            className="w-full bg-transparent border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring px-2 py-1.5 -ml-2 rounded-md transition-all text-sm text-foreground font-medium placeholder:text-muted-foreground focus:outline-none min-h-[100px] resize-none"
          />
        </div>
      </div>

      <Separator className="my-6" />

      {/* Platform Stats (mimicking Employee details) */}
      <div className="mb-6">
        <h3 className="font-semibold text-[15px] mb-4">Platform Details</h3>
        <div className="space-y-4">
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground w-24">Joined:</span>
            <span className="font-medium text-foreground">Jan 05, 2023</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <Globe className="h-4 w-4 text-muted-foreground shrink-0" />
            <span className="text-muted-foreground w-24">Status:</span>
            <span className="font-medium text-foreground">Verified Partner</span>
          </div>
        </div>
      </div>
    </div>
  );
}
