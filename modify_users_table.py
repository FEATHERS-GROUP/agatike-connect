import sys

with open('src/components/dashboard/users/UsersTable.tsx', 'r') as f:
    content = f.read()

# Add Mail to lucide-react imports
content = content.replace(
    'import { Pencil, Trash2, Eye, User, Clock, Building2, Puzzle, FileText } from "lucide-react";',
    'import { Pencil, Trash2, Eye, User, Clock, Building2, Puzzle, FileText, Mail } from "lucide-react";'
)

# Add resendWorkspaceUserInvite to imports
content = content.replace(
    'import { removeWorkspaceUser } from "@/api/workspace_users";',
    'import { removeWorkspaceUser, resendWorkspaceUserInvite } from "@/api/workspace_users";'
)

# Add resendMutation
mutation_str = """  const deleteMutation = useMutation({"""
new_mutation_str = """  const resendMutation = useMutation({
    mutationFn: async (userId: string) => {
      await resendWorkspaceUserInvite({ data: { userId } } as any);
    },
    onSuccess: () => {
      toast.success("Invite email resent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend invite");
    }
  });

  const handleResendEmail = () => {
    if (selectedUsers.length === 1) {
      resendMutation.mutate(selectedUsers[0]);
    }
  };

  const deleteMutation = useMutation({"""

content = content.replace(mutation_str, new_mutation_str)

# Add selectedUser
get_selected_user_str = """  const toggleSelectUser = (id: string) => {"""
new_selected_user_str = """  const selectedUser = selectedUsers.length === 1 ? users.find(u => u.id === selectedUsers[0]) : null;

  const toggleSelectUser = (id: string) => {"""

content = content.replace(get_selected_user_str, new_selected_user_str)

# Add Resend button in the floating bar
buttons_str = """                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-2"
                  onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/users/${selectedUsers[0]}/edit` })}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>"""

new_buttons_str = """                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-2"
                  onClick={() => navigate({ to: `/dashboard/${workspaceSlug}/users/${selectedUsers[0]}/edit` })}
                >
                  <Pencil className="h-4 w-4" /> Edit
                </Button>
                {selectedUser?.status === "pending" && (
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="h-8 gap-2 text-primary border-primary/20 hover:bg-primary/10"
                    onClick={handleResendEmail} 
                    disabled={resendMutation.isPending}
                  >
                    <Mail className="h-4 w-4" /> 
                    {resendMutation.isPending ? "Sending..." : "Resend Invite"}
                  </Button>
                )}"""

content = content.replace(buttons_str, new_buttons_str)

with open('src/components/dashboard/users/UsersTable.tsx', 'w') as f:
    f.write(content)

print("Updated UsersTable.tsx successfully!")
