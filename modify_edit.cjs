const fs = require("fs");

let content = fs.readFileSync(
  "src/routes/dashboard/$workspaceSlug/users/$userId.edit.tsx",
  "utf-8",
);

// 1. Route declaration
content = content.replace(
  /export const Route = createFileRoute\("\/dashboard\/\$workspaceSlug\/users\/\$userId\/edit"\)\(\{([\s\S]*?)\}\);/g,
  `export const Route = createFileRoute("/dashboard/$workspaceSlug/users/$userId/edit")({
  head: () => ({
    meta: [
      { title: "Edit User — Agatike Dashboard" },
      { name: "description", content: "Edit a workspace user's permissions." },
    ],
  }),
  component: EditUserPage,
});`,
);

// 2. Imports and Function declaration
content = content.replace(/import \{ addWorkspaceUser \}/, "import { updateWorkspaceUser }");
content = content.replace(/function AddUserPage\(\) \{/, "function EditUserPage() {");

// 3. Pre-population and states
const stateReplacement = `
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { workspaceSlug, userId } = Route.useParams();
  const { activeWorkspace } = useWorkspace();

  const cachedUsers: any[] = queryClient.getQueryData(["workspace_users"]) || [];
  const existingUser = cachedUsers.find((u) => u.id === userId);

  const [step, setStep] = useState(1);
  const TOTAL_STEPS = 6;

  const [name, setName] = useState(existingUser?.name || "");
  const [email, setEmail] = useState(existingUser?.email || "");
  const [role, setRole] = useState(existingUser?.role || "user");
  const [image, setImage] = useState(existingUser?.image || "");

  const [isAvatarPickerOpen, setIsAvatarPickerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("avataaars");
  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  const [isAllWorkspaces, setIsAllWorkspaces] = useState(existingUser?.workspaces?.includes("ALL") ?? true);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<string[]>(existingUser?.workspaces?.includes("ALL") ? [] : (existingUser?.workspaces || []));

  const [selectedModules, setSelectedModules] = useState<string[]>(existingUser?.modules || []);

  const [isAllRoutes, setIsAllRoutes] = useState(existingUser?.pages?.includes("ALL") ?? true);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>(existingUser?.pages?.includes("ALL") ? [] : (existingUser?.pages || []));

  const [isTemporary, setIsTemporary] = useState(existingUser?.is_temporary || false);
  const [expiresAt, setExpiresAt] = useState(existingUser?.expires_at ? new Date(existingUser.expires_at).toISOString().split('T')[0] : "");
`;

content = content.replace(
  /const navigate = useNavigate\(\);[\s\S]*?const \[confirmPassword, setConfirmPassword\] = useState\(""\);/m,
  stateReplacement.trim(),
);

// 4. Update mutation
content = content.replace(
  /const addMutation = useMutation\(\{([\s\S]*?)return addWorkspaceUser\(\{([\s\S]*?)\}\);([\s\S]*?)toast\.success\("User added successfully! An invitation has been sent\."\);([\s\S]*?)\}\);/m,
  `const addMutation = useMutation({$1return updateWorkspaceUser({
        data: { ...payload, image: finalImage, id: userId },
      });$3toast.success("User updated successfully!");$4});`,
);

// 5. Remove Step 6 validation & passwords
content = content.replace(/const validateStep6 = \(\) => \{[\s\S]*?return true;\s*\};\s*/, "");
content = content.replace(/if \(step === 6 && !validateStep6\(\)\) return;\s*/, "");

content = content.replace(
  /const handleSubmit = \(\) => \{[\s\S]*?addMutation\.mutate\(\{[\s\S]*?\}\);\s*\};/m,
  `const handleSubmit = () => {
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
  };`,
);

// 6. Fix Sidebar steps
content = content.replace(
  /const sidebarSteps = \[([\s\S]*?)\];/,
  `const sidebarSteps = [
    { n: 1, label: "Profile", desc: "Name & Avatar", icon: User },
    { n: 2, label: "Workspaces", desc: "Workspace Access", icon: Building2 },
    { n: 3, label: "Modules", desc: "Module Access", icon: Puzzle },
    { n: 4, label: "App Routes", desc: "Route Access", icon: FileText },
    { n: 5, label: "Duration", desc: "Access Duration", icon: Clock },
    { n: 6, label: "Review", desc: "Confirm Details", icon: Eye },
  ];`,
);

// 7. Remove Step 6 UI
content = content.replace(
  /\{\/\* ========== STEP 6: Security ========== \*\/\}([\s\S]*?)STEP 7: Review & Confirm/,
  "STEP 7: Review & Confirm",
);

// 8. Rename Step 7 to Step 6
content = content.replace(
  /STEP 7: Review & Confirm ========== \*\/\}\s*\{step === 7 && \(/m,
  "STEP 6: Review & Confirm ========== */}\n        {step === 6 && (",
);

// 9. Remove password success box in Review
content = content.replace(
  /<div className="p-4 bg-amber-500\/10 border border-amber-500\/20 rounded-2xl flex gap-3">([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*\)}/m,
  "</div>\n            </div>\n          </div>\n        )}",
);

// 10. Fix text "Add User" and "Create User"
content = content.replace(
  /<h2 className="text-xl font-bold">Add New User<\/h2>/g,
  '<h2 className="text-xl font-bold">Edit User</h2>',
);
content = content.replace(
  /<h1 className="text-sm font-bold">Add User<\/h1>/g,
  '<h1 className="text-sm font-bold">Edit User</h1>',
);
content = content.replace(
  /Double-check the details before creating the user account\./g,
  "Double-check the details before updating the user account.",
);
content = content.replace(/Creating User\.\.\./g, "Updating User...");
content = content.replace(/Create User/g, "Update User");

fs.writeFileSync("src/routes/dashboard/$workspaceSlug/users/$userId.edit.tsx", content);
