import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getEventSections, addMultipleEventStaff } from "@/api/staff";
import { getUserByHandle } from "@/api/users";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { toast } from "sonner";
import { ArrowLeft, UserPlus, Users, Loader2, Search, X, Check, Lock, Shield, ArrowRight, ScanLine, Ticket, BarChart3, MapPin, CheckCircle2, Upload, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/staff_/add")({
  component: AddStaffPage,
});

function AddStaffPage() {
  const { eventId, workspaceSlug } = Route.useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { activeWorkspace } = useWorkspace();
  const { canAddEventStaff } = useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  // Multi-step state
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [registrationType, setRegistrationType] = useState<"account" | "no-account">("account");

  // Data arrays for bulk
  const [accountInputs, setAccountInputs] = useState([{ handle: "", user: null as any, first_name: "", last_name: "", phone: "", id_passport: "", profile_image: "", error: "", isLoading: false }]);
  const [noAccountInputs, setNoAccountInputs] = useState([{ first_name: "", last_name: "", email: "", phone: "", id_passport: "", profile_image: "" }]);

  // Permissions shared for the bulk batch
  const [permissions, setPermissions] = useState({
    role: "Volunteer",
    allowed_sections: [] as string[],
    app_permissions: [] as string[],
  });

  const { data: sections = [] } = useQuery({
    queryKey: ["event-sections", eventId],
    queryFn: async () => {
      try {
        return await getEventSections({ data: { event_id: eventId } } as any);
      } catch {
        return [];
      }
    },
  });

  // Automatically lookup user when handle changes
  const lookupUser = async (index: number, handle: string) => {
    if (!handle.trim()) {
      const newInputs = [...accountInputs];
      newInputs[index].user = null;
      newInputs[index].error = "";
      setAccountInputs(newInputs);
      return;
    }

    const newInputs = [...accountInputs];
    newInputs[index].isLoading = true;
    newInputs[index].error = "";
    setAccountInputs(newInputs);

    try {
      const user = await getUserByHandle({ data: { handle: handle.trim() } } as any);
      const updatedInputs = [...accountInputs];
      updatedInputs[index].isLoading = false;
      if (user) {
        updatedInputs[index].user = user;
        updatedInputs[index].first_name = user.username;
        updatedInputs[index].error = "";
      } else {
        updatedInputs[index].user = null;
        updatedInputs[index].error = "User not found";
      }
      setAccountInputs(updatedInputs);
    } catch (err) {
      const updatedInputs = [...accountInputs];
      updatedInputs[index].isLoading = false;
      updatedInputs[index].user = null;
      updatedInputs[index].error = "Search failed";
      setAccountInputs(updatedInputs);
    }
  };

  const handleImageUpload = async (index: number, e: React.ChangeEvent<HTMLInputElement>, isAccount: boolean) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error(`File ${file.name} exceeds 5MB limit`);
      return;
    }

    try {
      const toastId = toast.loading("Uploading image...");
      const url = await uploadFileToStorage(file, "staff-avatars");

      if (isAccount) {
        const newInputs = [...accountInputs];
        newInputs[index].profile_image = url;
        setAccountInputs(newInputs);
      } else {
        const newInputs = [...noAccountInputs];
        newInputs[index].profile_image = url;
        setNoAccountInputs(newInputs);
      }
      toast.success("Image uploaded", { id: toastId });
    } catch (err) {
      toast.error(`Failed to upload ${file.name}`);
    }
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const objectsToInsert: any[] = [];
      const generatedPins = new Set<string>();

      const generatePin = () => {
        const date = new Date();
        const yy = date.getFullYear().toString().slice(-2);
        const mm = (date.getMonth() + 1).toString().padStart(2, '0');
        const numbers = '01234567899876543210234567890134567890124567890123567890123467890123457890123456890123456890123456790123456780123456789';
        while (true) {
          let randomNums = '';
          for (let i = 0; i < 5; i++) {
            randomNums += numbers.charAt(Math.floor(Math.random() * numbers.length));
          }
          const pin = `${yy}${mm}${randomNums}`;
          if (!generatedPins.has(pin)) {
            generatedPins.add(pin);
            return pin;
          }
        }
      };

      if (registrationType === "account") {
        const validUsers = accountInputs.filter(input => input.user);
        if (validUsers.length === 0) throw new Error("No valid users selected.");

        validUsers.forEach(input => {
          const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
          objectsToInsert.push({
            event_id: eventId,
            user_id: input.user.id,
            first_name: input.first_name || input.user.username,
            last_name: input.last_name || null,
            email: input.user.email,
            phone: input.phone || null,
            id_passport: input.id_passport || null,
            role: permissions.role,
            allowed_sections: permissions.allowed_sections,
            app_permissions: permissions.app_permissions,
            profile_image: input.profile_image || input.user.profile?.avatar_url || null,
            badge_qr_string: `STAFF-${randomId}`,
            pin_code: generatePin(),
            status: "active",
          });
        });
      } else {
        const validProfiles = noAccountInputs.filter(input => input.first_name && input.email);
        if (validProfiles.length === 0) throw new Error("No valid profiles provided (First Name and Email are required).");

        validProfiles.forEach(input => {
          const randomId = Math.random().toString(36).substring(2, 10).toUpperCase();
          objectsToInsert.push({
            event_id: eventId,
            user_id: null,
            first_name: input.first_name,
            last_name: input.last_name || null,
            email: input.email,
            phone: input.phone || null,
            id_passport: input.id_passport || null,
            role: permissions.role,
            allowed_sections: permissions.allowed_sections,
            app_permissions: permissions.app_permissions,
            profile_image: input.profile_image || null,
            badge_qr_string: `STAFF-${randomId}`,
            pin_code: generatePin(),
            status: "active",
          });
        });
      }

      return await addMultipleEventStaff({ data: { objects: objectsToInsert } } as any);
    },
    onSuccess: () => {
      toast.success("Staff members successfully added!");
      queryClient.invalidateQueries({ queryKey: ["event-staff", eventId] });
      navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add staff members");
    }
  });

  const getValidCount = () => {
    if (registrationType === "account") {
      return accountInputs.filter(i => i.user).length;
    }
    return noAccountInputs.filter(i => i.first_name && i.email).length;
  };

  const handleNext = () => {
    if (step === 2 && getValidCount() === 0) {
      toast.error("Please add at least one valid user to proceed.");
      return;
    }
    setStep((prev) => (prev + 1) as any);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-500">
      <header className="flex items-center gap-4">
        <button
          onClick={() => {
            if (step > 1) setStep((prev) => (prev - 1) as any);
            else navigate({ to: `/dashboard/${workspaceSlug}/events/${eventId}/staff` });
          }}
          className="p-2 bg-secondary rounded-full hover:bg-secondary/80 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Staff Members</h1>
          <p className="text-sm text-muted-foreground">Step {step} of 4: {
            step === 1 ? "Select Account Type" :
              step === 2 ? "Add Users" :
                step === 3 ? "Set Permissions" : "Review & Submit"
          }</p>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-colors ${step >= i ? "bg-primary" : "bg-secondary"}`} />
        ))}
      </div>

      <div className="bg-card border border-border/60 rounded-2xl p-6 shadow-sm">
        {step === 1 && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium">How do you want to add staff?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setRegistrationType("account")}
                className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all ${registrationType === "account" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"}`}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <Search className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Existing Agatike Users</h3>
                <p className="text-sm text-muted-foreground text-center">Search for users who already have an account on Agatike using their handle or email.</p>
              </button>
              <button
                onClick={() => setRegistrationType("no-account")}
                className={`flex flex-col items-center justify-center p-8 rounded-xl border-2 transition-all ${registrationType === "no-account" ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/50"}`}
              >
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
                  <UserPlus className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-lg mb-2">Create New Profiles</h3>
                <p className="text-sm text-muted-foreground text-center">Add external staff by manually entering their name and contact information.</p>
              </button>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleNext} className="bg-primary text-primary-foreground font-bold shadow-[var(--shadow-glow)]">
                Continue to Step 2 <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && registrationType === "account" && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium mb-4">Add Existing Users</h2>
            <div className="space-y-4">
              {accountInputs.map((input, index) => (
                <div key={index} className="flex items-start gap-4 p-4 border border-border/50 rounded-xl bg-secondary/20">
                  <div className="flex-1 space-y-2">
                    <Label>User @handle, Username, or Email</Label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. @johndoe or john@example.com"
                        value={input.handle}
                        onChange={(e) => {
                          const newInputs = [...accountInputs];
                          newInputs[index].handle = e.target.value;
                          setAccountInputs(newInputs);
                        }}
                        onBlur={() => lookupUser(index, input.handle)}
                        className="pl-10"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {input.isLoading && <p className="text-xs text-primary animate-pulse flex items-center"><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Searching...</p>}
                    {input.error && <p className="text-xs text-red-500 flex items-center"><X className="h-3 w-3 mr-1" /> {input.error}</p>}
                    {input.user && (
                      <div className="mt-4 space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-card rounded-lg border border-border shadow-sm">
                          <div className="h-10 w-10 rounded-full bg-primary/10 overflow-hidden shrink-0">
                            {input.user.profile?.avatar_url ? (
                              <img src={input.user.profile.avatar_url} alt="Profile" className="h-full w-full object-cover" />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center font-bold text-primary">{input.user.username?.[0]}</div>
                            )}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-none">{input.user.username}</p>
                            <p className="text-xs text-muted-foreground mt-1">@{input.user.handle} • {input.user.email}</p>
                          </div>
                          <div className="ml-auto">
                            <Check className="h-5 w-5 text-green-500" />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Display First Name</Label>
                            <Input
                              value={input.first_name}
                              onChange={(e) => {
                                const newInputs = [...accountInputs];
                                newInputs[index].first_name = e.target.value;
                                setAccountInputs(newInputs);
                              }}
                            />
                            <p className="text-[10px] text-muted-foreground">Overrides the username on their badge.</p>
                          </div>
                          <div className="space-y-2">
                            <Label>Display Last Name (Optional)</Label>
                            <Input
                              value={input.last_name}
                              onChange={(e) => {
                                const newInputs = [...accountInputs];
                                newInputs[index].last_name = e.target.value;
                                setAccountInputs(newInputs);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Phone Number (Optional)</Label>
                            <Input
                              type="tel"
                              value={input.phone}
                              onChange={(e) => {
                                const newInputs = [...accountInputs];
                                newInputs[index].phone = e.target.value;
                                setAccountInputs(newInputs);
                              }}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>ID / Passport Number (Optional)</Label>
                            <Input
                              value={input.id_passport}
                              onChange={(e) => {
                                const newInputs = [...accountInputs];
                                newInputs[index].id_passport = e.target.value;
                                setAccountInputs(newInputs);
                              }}
                            />
                          </div>
                        </div>

                        <div className="mt-4 pt-4 border-t border-border/50">
                          <Label className="block mb-2">Staff Photo (Optional, Max 5MB)</Label>
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-xl bg-secondary/50 border border-border/50 overflow-hidden flex items-center justify-center">
                              {input.profile_image ? (
                                <img src={input.profile_image} className="w-full h-full object-cover" alt="Upload" />
                              ) : input.user?.profile?.avatar_url ? (
                                <img src={input.user.profile.avatar_url} className="w-full h-full object-cover opacity-50" alt="Fallback" />
                              ) : (
                                <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => handleImageUpload(index, e, true)}
                                className="text-xs cursor-pointer"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  {accountInputs.length > 1 && (
                    <button
                      onClick={() => setAccountInputs(accountInputs.filter((_, i) => i !== index))}
                      className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors mt-8"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setAccountInputs([...accountInputs, { handle: "", user: null, first_name: "", last_name: "", phone: "", id_passport: "", profile_image: "", error: "", isLoading: false }])}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Another User
            </Button>

            <div className="flex justify-between pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNext} disabled={getValidCount() === 0} className="bg-primary text-primary-foreground font-bold shadow-[var(--shadow-glow)]">
                Next: Set Permissions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 2 && registrationType === "no-account" && (
          <div className="space-y-6">
            <h2 className="text-xl font-medium mb-4">Create New Profiles</h2>
            <div className="space-y-6">
              {noAccountInputs.map((input, index) => (
                <div key={index} className="p-4 border border-border/50 rounded-xl bg-secondary/20 relative">
                  {noAccountInputs.length > 1 && (
                    <button
                      onClick={() => setNoAccountInputs(noAccountInputs.filter((_, i) => i !== index))}
                      className="absolute top-4 right-4 p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <h3 className="font-bold mb-4 text-sm uppercase tracking-wider text-muted-foreground">Staff Member {index + 1}</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>First Name <span className="text-red-500">*</span></Label>
                      <Input
                        value={input.first_name}
                        onChange={(e) => {
                          const newInputs = [...noAccountInputs];
                          newInputs[index].first_name = e.target.value;
                          setNoAccountInputs(newInputs);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Last Name</Label>
                      <Input
                        value={input.last_name}
                        onChange={(e) => {
                          const newInputs = [...noAccountInputs];
                          newInputs[index].last_name = e.target.value;
                          setNoAccountInputs(newInputs);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Email <span className="text-red-500">*</span></Label>
                      <Input
                        type="email"
                        value={input.email}
                        onChange={(e) => {
                          const newInputs = [...noAccountInputs];
                          newInputs[index].email = e.target.value;
                          setNoAccountInputs(newInputs);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input
                        type="tel"
                        value={input.phone}
                        onChange={(e) => {
                          const newInputs = [...noAccountInputs];
                          newInputs[index].phone = e.target.value;
                          setNoAccountInputs(newInputs);
                        }}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ID / Passport Number (Optional)</Label>
                      <Input
                        value={input.id_passport}
                        onChange={(e) => {
                          const newInputs = [...noAccountInputs];
                          newInputs[index].id_passport = e.target.value;
                          setNoAccountInputs(newInputs);
                        }}
                      />
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-border/50">
                    <Label className="block mb-2">Staff Photo (Optional, Max 5MB)</Label>
                    <div className="flex items-center gap-4">
                      <div className="h-16 w-16 rounded-xl bg-secondary/50 border border-border/50 overflow-hidden flex items-center justify-center">
                        {input.profile_image ? (
                          <img src={input.profile_image} className="w-full h-full object-cover" alt="Upload" />
                        ) : (
                          <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
                        )}
                      </div>
                      <div className="flex-1">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleImageUpload(index, e, false)}
                          className="text-xs cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              variant="outline"
              className="w-full border-dashed"
              onClick={() => setNoAccountInputs([...noAccountInputs, { first_name: "", last_name: "", email: "", phone: "", id_passport: "", profile_image: "" }])}
            >
              <UserPlus className="mr-2 h-4 w-4" /> Add Another Form
            </Button>

            <div className="flex justify-between pt-4 border-t border-border/50">
              <Button variant="ghost" onClick={() => setStep(1)}>Back</Button>
              <Button onClick={handleNext} disabled={getValidCount() === 0} className="bg-primary text-primary-foreground font-bold shadow-[var(--shadow-glow)]">
                Next: Set Permissions <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-medium mb-1">Set Permissions</h2>
              <p className="text-sm text-muted-foreground">These settings will be applied to all {getValidCount()} users in this batch.</p>
            </div>

            <div className="space-y-10 bg-secondary/10 border border-border/50 rounded-xl p-6 sm:p-8">
              <div className="space-y-4">
                <div>
                  <Label className="text-base font-bold flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Event Role</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select the primary job title for these staff members.</p>
                </div>
                <div className="max-w-md">
                  <Select value={permissions.role} onValueChange={(val) => setPermissions({ ...permissions, role: val })}>
                    <SelectTrigger className="h-12 text-base"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Organizer">Organizer</SelectItem>
                      <SelectItem value="Manager">Manager</SelectItem>
                      <SelectItem value="Security Lead">Security Lead</SelectItem>
                      <SelectItem value="Security">Security</SelectItem>
                      <SelectItem value="Gate Staff">Gate Staff / Check-in</SelectItem>
                      <SelectItem value="Box Office">Box Office / Ticketing</SelectItem>
                      <SelectItem value="Bartender">Bartender</SelectItem>
                      <SelectItem value="VIP Host">VIP Host</SelectItem>
                      <SelectItem value="Medical Staff">Medical / First Aid</SelectItem>
                      <SelectItem value="Volunteer">Volunteer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-border/50">
                <div>
                  <Label className="text-base font-bold">App Permissions (What they can do)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Select the features this staff member can access on their mobile app.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { id: "SCAN_TICKETS", label: "Scan Tickets", desc: "Access the scanner for entry", icon: ScanLine, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/30" },
                    { id: "VIEW_GUESTLIST", label: "Guestlist", desc: "Manage & check-in VIPs", icon: Users, color: "text-purple-500", bg: "bg-purple-500/10", border: "border-purple-500/30" },
                    { id: "SELL_TICKETS", label: "Box Office", desc: "Sell & print tickets", icon: Ticket, color: "text-green-500", bg: "bg-green-500/10", border: "border-green-500/30" },
                    { id: "VIEW_ANALYTICS", label: "Analytics", desc: "View event stats", icon: BarChart3, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/30" }
                  ].map((perm) => {
                    const isSelected = permissions.app_permissions.includes(perm.id);
                    return (
                      <div
                        key={perm.id}
                        onClick={() => {
                          if (isSelected) {
                            setPermissions({ ...permissions, app_permissions: permissions.app_permissions.filter(id => id !== perm.id) });
                          } else {
                            setPermissions({ ...permissions, app_permissions: [...permissions.app_permissions, perm.id] });
                          }
                        }}
                        className={`relative cursor-pointer overflow-hidden rounded-2xl border p-4 transition-all duration-300 ${isSelected ? `border-primary shadow-[0_0_15px_rgba(var(--primary),0.15)] bg-primary/5` : `border-border/50 bg-secondary/20 hover:border-border hover:bg-secondary/40`}`}
                      >
                        <div className="flex flex-col items-start gap-4">
                          <div className={`p-3 rounded-xl shrink-0 transition-colors ${isSelected ? perm.bg + ' ' + perm.color : 'bg-muted text-muted-foreground'}`}>
                            <perm.icon className="h-6 w-6" />
                          </div>
                          <div>
                            <h4 className={`font-semibold tracking-tight ${isSelected ? 'text-foreground' : 'text-foreground/80'}`}>{perm.label}</h4>
                            <p className="text-xs text-muted-foreground mt-1">{perm.desc}</p>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute top-4 right-4 text-primary animate-in zoom-in duration-200">
                            <CheckCircle2 className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-8 border-t border-border/50">
                <div>
                  <Label className="text-base font-bold">Allowed Sections (Where they can go)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Define physical access control for this batch of staff members.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  <div
                    onClick={() => {
                      if (permissions.allowed_sections.includes("*")) {
                        setPermissions({ ...permissions, allowed_sections: [] });
                      } else {
                        setPermissions({ ...permissions, allowed_sections: ["*"] });
                      }
                    }}
                    className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 ${permissions.allowed_sections.includes("*") ? 'border-yellow-500 bg-yellow-500/10 text-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.15)]' : 'border-border/50 bg-secondary/20 text-muted-foreground hover:bg-secondary/40 hover:border-border'}`}
                  >
                    <Shield className={`h-6 w-6 ${permissions.allowed_sections.includes("*") ? "animate-pulse" : ""}`} />
                    <span className="text-xs font-bold uppercase tracking-wider">All Access</span>
                  </div>
                  {sections.map(sec => {
                    const isAllAccess = permissions.allowed_sections.includes("*");
                    const isSelected = permissions.allowed_sections.includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => {
                          if (isAllAccess) return;
                          if (isSelected) {
                            setPermissions({ ...permissions, allowed_sections: permissions.allowed_sections.filter(id => id !== sec.id) });
                          } else {
                            setPermissions({ ...permissions, allowed_sections: [...permissions.allowed_sections, sec.id] });
                          }
                        }}
                        className={`cursor-pointer rounded-2xl border p-4 flex flex-col items-center justify-center gap-2 text-center transition-all duration-300 ${!isAllAccess && isSelected ? 'border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(var(--primary),0.15)]' : isAllAccess ? 'opacity-40 border-border/50 bg-secondary/5 pointer-events-none' : 'border-border/50 bg-secondary/20 text-foreground hover:bg-secondary/40 hover:border-border'}`}
                      >
                        <MapPin className={`h-5 w-5 ${isSelected ? "text-primary" : "text-muted-foreground opacity-70"}`} />
                        <span className="text-xs font-semibold line-clamp-2 leading-tight">{sec.name}</span>
                      </div>
                    );
                  })}
                  {sections.length === 0 && (
                    <div className="col-span-full">
                      <p className="text-sm text-muted-foreground italic p-4 text-center border border-dashed rounded-xl">No sections defined for this event.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/50">
              <Button variant="ghost" onClick={() => setStep(2)}>Back</Button>
              <Button onClick={handleNext} className="bg-primary text-primary-foreground font-bold shadow-[var(--shadow-glow)]">
                Review & Submit <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8">
            <div className="text-center">
              <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mx-auto mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Review Batch</h2>
              <p className="text-muted-foreground">You are about to add {getValidCount()} staff member(s).</p>
            </div>

            <div className="bg-secondary/20 border border-border/50 rounded-xl p-6">
              <h3 className="font-bold text-sm uppercase tracking-wider text-muted-foreground mb-4">Configuration</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Role</p>
                  <p className="font-medium">{permissions.role}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">PIN Code</p>
                  <p className="font-medium font-mono text-green-500">Auto-Generated</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">App Permissions</p>
                  <p className="font-medium">{permissions.app_permissions.length > 0 ? `${permissions.app_permissions.length} Features Enabled` : "No Features"}</p>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <p className="text-xs text-muted-foreground">Access Sections</p>
                  <p className="font-medium">{permissions.allowed_sections.includes("*") ? "All Access" : permissions.allowed_sections.length > 0 ? `${permissions.allowed_sections.length} Sections Selected` : "No Sections"}</p>
                </div>
              </div>
            </div>

            <div className="flex justify-between pt-6 border-t border-border/50">
              <Button variant="ghost" onClick={() => setStep(3)}>Back to Permissions</Button>
              <Button
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending}
                className="bg-primary text-primary-foreground font-bold shadow-[var(--shadow-glow)] px-8"
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Confirm & Add Staff
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
