import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/rsvps/index.tsx";
let code = fs.readFileSync(file, "utf8");

// Imports
code = code.replace(
  'import { getWorkspaceForms } from "@/api/rsvps";',
  'import { getWorkspaceForms, updateCustomFormFolder, deleteCustomForm } from "@/api/rsvps";\nimport { FolderManager } from "@/components/ui/FolderManager";\nimport { Checkbox } from "@/components/ui/checkbox";'
);
code = code.replace('import { useWorkspace } from "@/contexts/WorkspaceContext";', 'import { useWorkspace } from "@/contexts/WorkspaceContext";\nimport { useQueryClient, useMutation } from "@tanstack/react-query";');


// Mutations
const mutationsStr = `
  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateCustomFormFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-rsvps", wsId] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteCustomForm({ data: { id } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-rsvps", wsId] }),
  });

  const handleBulkMove = async (itemIds: string[], folderId: string | null) => {
    const promises = itemIds.map(id => moveMutation.mutateAsync({ id, folderId }));
    await Promise.all(promises);
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    const promises = itemIds.map(id => deleteMutation.mutateAsync(id));
    await Promise.all(promises);
  };
`;

code = code.replace("  const { activeWorkspace } = useWorkspace();", "  const { activeWorkspace } = useWorkspace();\n" + mutationsStr);

// Wrapper
const wrapperStart = `
          <FolderManager
            moduleType="rsvp_forms"
            items={forms}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full py-12 flex justify-center text-muted-foreground">
                    Loading RSVP forms...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60">
                    <Inbox className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No Forms found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first RSVP form to collect responses.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((form: any) => {
`;

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?forms\.map\(\(form: any\) => \{/g,
  wrapperStart
);

const itemRenderContent = `
                    const isSelected = selectedIds.has(form.id);

                    return (
                      <div key={form.id} className="relative group rounded-3xl border bg-card shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                           style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.6)" }}>
                        <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                           <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelect(form.id, c as boolean)} className="data-[state=checked]:bg-primary" />
                        </div>
                        <Link
                          to="/dashboard/$workspaceSlug/rsvps/$formId"
                          params={{ workspaceSlug, formId: form.id }}
                          className="block p-6"
                        >
`;

code = code.replace(
  /return \(\s*<Link\s*key=\{form\.id\}\s*to="\/dashboard\/\$workspaceSlug\/rsvps\/\$formId"\s*params=\{\{ workspaceSlug, formId: form\.id \}\}\s*className="group block rounded-3xl border border-border\/60 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary\/50"\s*>/g,
  itemRenderContent
);

const linkEndMatch = code.match(/<\/Link>\s*\);\s*\}\)\s*\)\}\s*<\/div>/);
if (linkEndMatch) {
  code = code.replace(
    /<\/Link>\s*\);\s*\}\)\s*\)\}\s*<\/div>/g,
    `</Link>\n</div>\n);\n})\n)}\n</div>\n)}\n</FolderManager>`
  );
}

fs.writeFileSync(file, code);
console.log("Updated rsvps page");
