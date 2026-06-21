import sys

with open('src/routes/dashboard/$workspaceSlug/users/$userId.edit.tsx', 'r') as f:
    content = f.read()

# 1. Route declaration
old_route = """export const Route = createFileRoute("/dashboard/$workspaceSlug/users/add-user")({
  head: () => ({
    meta: [
      { title: "Add New User — Agatike Dashboard" },
      { name: "description", content: "Create a new workspace user with custom permissions." },
    ],
  }),
  component: AddUserPage,
});"""

new_route = """export const Route = createFileRoute("/dashboard/$workspaceSlug/users/$userId/edit")({
  head: () => ({
    meta: [
      { title: "Edit User — Agatike Dashboard" },
      { name: "description", content: "Edit a workspace user's permissions." },
    ],
  }),
  component: EditUserPage,
});"""
content = content.replace(old_route, new_route)

# 2. Imports and Function declaration
content = content.replace('import { addWorkspaceUser }', 'import { updateWorkspaceUser }')
content = content.replace('function AddUserPage() {', 'function EditUserPage() {')

# 3. Pre-population and states
old_states = """  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 7;

  // Step 1: Profile Info & Avatar
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [image, setImage] = useState("");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("avataaars");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  // Step 2: Workspace Access
  const [isAllWorkspaces, setIsAllWorkspaces] = useState(true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>([]);

  // Step 3: Module Access
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  // Step 4: Route Access (Pages)
  const [isAllRoutes, setIsAllRoutes] = useState(true);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);

  // Step 5: Access Duration
  const [isTemporary, setIsTemporary] = useState(false);
  const [expiresAt, setExpiresAt] = useState("");

  // Step 6: Security Setup
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");"""

new_states = """  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug, userId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const cachedUsers: any[] = queryClient.getQueryData(["workspace_users"]) || [];
  const existingUser = cachedUsers.find((u: any) => u.id === userId) || {};

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;

  // Step 1: Profile Info & Avatar
  const [name, setName] = useState(existingUser.name || "");
  const [email, setEmail] = useState(existingUser.email || "");
  const [role, setRole] = useState(existingUser.role || "user");
  const [image, setImage] = useState(existingUser.image || "");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("avataaars");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  // Step 2: Workspace Access
  const [isAllWorkspaces, setIsAllWorkspaces] = useState(existingUser.workspaces?.includes("ALL") ?? true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(existingUser.workspaces?.includes("ALL") ? [] : (existingUser.workspaces || []));

  // Step 3: Module Access
  const [selectedModules, setSelectedModules] = useState<string[]>(existingUser.modules || []);

  // Step 4: Route Access (Pages)
  const [isAllRoutes, setIsAllRoutes] = useState(existingUser.pages?.includes("ALL") ?? true);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(existingUser.pages?.includes("ALL") ? [] : (existingUser.pages || []));

  // Step 5: Access Duration
  const [isTemporary, setIsTemporary] = useState(existingUser.is_temporary || false);
  const [expiresAt, setExpiresAt] = useState(existingUser.expires_at ? new Date(existingUser.expires_at).toISOString().split('T')[0] : "");"""
content = content.replace(old_states, new_states)

# 4. Update mutation
old_mut = """  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      let finalImage = payload.image;
      if (finalImage && finalImage.startsWith("data:")) {
        const match = finalImage.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const res = await uploadFile({
            data: {
              base64: match[2],
              contentType: match[1],
              folder: "workspace-users/avatars",
              ext: match[1].split("/")[1] || "png",
            },
          } as any);
          finalImage = res.url;
        }
      }
      return addWorkspaceUser({
        data: { ...payload, image: finalImage },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success("User added successfully! An invitation has been sent.");
      navigate({ to: `/dashboard/${workspaceSlug}/users` });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to add user");
    },
  });"""

new_mut = """  const addMutation = useMutation({
    mutationFn: async (payload: any) => {
      let finalImage = payload.image;
      if (finalImage && finalImage.startsWith("data:")) {
        const match = finalImage.match(/^data:(.+);base64,(.+)$/);
        if (match) {
          const res = await uploadFile({
            data: {
              base64: match[2],
              contentType: match[1],
              folder: "workspace-users/avatars",
              ext: match[1].split("/")[1] || "png",
            },
          } as any);
          finalImage = res.url;
        }
      }
      return updateWorkspaceUser({
        data: { ...payload, image: finalImage, id: userId },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["workspace_users"] });
      toast.success("User updated successfully!");
      navigate({ to: `/dashboard/${workspaceSlug}/users` });
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update user");
    },
  });"""
content = content.replace(old_mut, new_mut)

# 5. Remove Step 6 validation & passwords
old_val6 = """  const validateStep6 = () => {
    if (!password || password.length < 6) {
      toast.error("Password must be at least 6 characters"); return false;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match"); return false;
    }
    return true;
  };"""
content = content.replace(old_val6, "")

content = content.replace("if (step === 6 && !validateStep6()) return;", "")

old_submit = """  const handleSubmit = () => {
    addMutation.mutate({
      name,
      email,
      password,
      role,
      image,
      workspaces: isAllWorkspaces ? ["ALL"] : selectedWorkspaces,
      modules: selectedModules,
      pages: isAllRoutes ? ["ALL"] : selectedRoutes,
      is_temporary: isTemporary,
      expires_at: isTemporary && expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };"""
new_submit = """  const handleSubmit = () => {
    addMutation.mutate({
      name,
      email,
      role,
      image,
      workspaces: isAllWorkspaces ? ["ALL"] : selectedWorkspaces,
      modules: selectedModules,
      pages: isAllRoutes ? ["ALL"] : selectedRoutes,
      is_temporary: isTemporary,
      expires_at: isTemporary && expiresAt ? new Date(expiresAt).toISOString() : null,
    });
  };"""
content = content.replace(old_submit, new_submit)

# 6. Fix Sidebar steps
old_sidebar = """  const sidebarSteps = [
    { n: 1, label: "Profile", desc: "Name & Avatar", icon: User },
    { n: 2, label: "Workspaces", desc: "Workspace Access", icon: Building2 },
    { n: 3, label: "Modules", desc: "Module Access", icon: Puzzle },
    { n: 4, label: "App Routes", desc: "Route Access", icon: FileText },
    { n: 5, label: "Duration", desc: "Access Duration", icon: Clock },
    { n: 6, label: "Security", desc: "Password Setup", icon: Lock },
    { n: 7, label: "Review", desc: "Confirm Details", icon: Eye },
  ];"""
new_sidebar = """  const sidebarSteps = [
    { n: 1, label: "Profile", desc: "Name & Avatar", icon: User },
    { n: 2, label: "Workspaces", desc: "Workspace Access", icon: Building2 },
    { n: 3, label: "Modules", desc: "Module Access", icon: Puzzle },
    { n: 4, label: "App Routes", desc: "Route Access", icon: FileText },
    { n: 5, label: "Duration", desc: "Access Duration", icon: Clock },
    { n: 6, label: "Review", desc: "Confirm Details", icon: Eye },
  ];"""
content = content.replace(old_sidebar, new_sidebar)

# 7. Remove Step 6 UI
old_step6_ui = """        {/* ========== STEP 6: Security ========== */}
        {step === 6 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight">Security Setup</h2>
              <p className="text-muted-foreground mt-1">
                Configure the initial password for the user. They can change it later.
              </p>
            </div>
            
            <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8 space-y-6">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                Account Password
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="user-password">Initial Password *</Label>
                  <Input
                    id="user-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="h-11 rounded-xl bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="user-confirm-password">Confirm Password *</Label>
                  <Input
                    id="user-confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    className="h-11 rounded-xl bg-secondary/50"
                  />
                </div>
              </div>
              
              <p className="text-xs text-muted-foreground bg-secondary/30 p-3 rounded-xl border border-border/40">
                💡 The user will receive an invitation email with this initial password and a link to activate their account.
              </p>
            </div>
          </div>
        )}"""
content = content.replace(old_step6_ui, "")

# 8. Rename Step 7 to Step 6
content = content.replace("{/* ========== STEP 7: Review & Confirm ========== */}", "{/* ========== STEP 6: Review & Confirm ========== */}")
content = content.replace("{step === 7 && (", "{step === 6 && (")

# 9. Remove password success box in Review
old_pw_box = """              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex gap-3">
                <Lock className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
                <p className="text-sm text-amber-600 dark:text-amber-400">
                  <strong>Password configured.</strong> An email will be sent to <strong>{email}</strong> containing their password and an activation link.
                </p>
              </div>"""
content = content.replace(old_pw_box, "")

# 10. Fix text "Add User" and "Create User"
content = content.replace('Add New User', 'Edit User')
content = content.replace('Add User', 'Edit User')
content = content.replace('creating the user account', 'updating the user account')
content = content.replace('Creating User...', 'Updating User...')
content = content.replace('Create User', 'Update User')

with open('src/routes/dashboard/$workspaceSlug/users/$userId.edit.tsx', 'w') as f:
    f.write(content)

