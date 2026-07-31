import { Camera, MoreHorizontal, Phone, Mail, User, Calendar, Globe } from "lucide-react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { Separator } from "@/components/ui/separator";
import { COUNTRIES } from "@/lib/countries";

function EditableInput({ icon: Icon, ...props }: any) {
  return (
    <div className="flex items-start gap-3 group">
      {Icon && <Icon className="h-4 w-4 text-muted-foreground/60 mt-2.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <input
          {...props}
          className={`w-full bg-transparent border border-transparent hover:border-border focus:bg-background focus:border-primary/30 focus:ring-2 focus:ring-primary/10 px-3 py-2 -ml-3 rounded-lg transition-all text-[14px] text-foreground font-medium placeholder:text-muted-foreground/50 focus:outline-none ${props.className || ""}`}
        />
        {props.error && <p className="text-[11px] text-destructive ml-1 mt-1">{props.error}</p>}
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
    <div className="w-full shrink-0 flex flex-col">
      {/* Identity Card */}
      <div className="flex flex-col items-center text-center gap-4 mb-8 group">
        <div
          className="relative h-24 w-24 shrink-0 rounded-full overflow-hidden cursor-pointer shadow-sm ring-2 ring-border bg-muted flex items-center justify-center transition-transform hover:scale-[1.02]"
          onClick={() => setIsAvatarModalOpen(true)}
        >
          {avatar ? (
            <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            <User className="h-10 w-10 text-muted-foreground" />
          )}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera className="h-6 w-6 text-white" />
          </div>
        </div>
        <div className="w-full">
          <input
            {...register("name")}
            className="font-bold text-xl text-center text-foreground bg-transparent border-transparent hover:border-border focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-primary/10 px-2 py-1 rounded-lg w-full outline-none transition-all placeholder:text-muted-foreground/50 truncate"
            placeholder="Organizer Name"
          />
          <div className="flex items-center justify-center text-[13px] text-muted-foreground font-medium mt-1">
            <span className="opacity-50">@</span>
            <input
              {...register("handle")}
              className="bg-transparent border-transparent text-center hover:border-border focus:border-primary/30 focus:bg-background focus:ring-2 focus:ring-primary/10 rounded-md outline-none w-auto max-w-[150px] transition-all py-0.5 placeholder:text-muted-foreground/40 truncate"
              placeholder="organizer-handle"
            />
          </div>
        </div>
      </div>

      <Separator className="my-6 bg-border/40" />

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
          <div className="flex items-start gap-3 group">
            <Globe className="h-4 w-4 text-muted-foreground mt-2 shrink-0" />
            <div className="flex-1">
              <select
                {...register("country")}
                className="w-full bg-transparent border border-transparent hover:bg-muted focus:bg-background focus:border-input focus:ring-2 focus:ring-ring px-2 py-1.5 -ml-2 rounded-md transition-all text-sm text-foreground font-medium focus:outline-none appearance-none"
              >
                <option value="">Select country...</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.country && (
                <p className="text-[10px] text-destructive ml-1">
                  {errors.country.message as string}
                </p>
              )}
            </div>
          </div>
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
