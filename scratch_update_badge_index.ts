import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/badge-designer/index.tsx";
let code = fs.readFileSync(file, "utf8");

// Imports
code = code.replace(
  'import { getAllBadgeProjects } from "@/api/badges";',
  'import { getAllBadgeProjects, updateBadgeProjectFolder, deleteBadgeProject } from "@/api/badges";\nimport { FolderManager } from "@/components/ui/FolderManager";\nimport { Checkbox } from "@/components/ui/checkbox";',
);
code = code.replace(
  'import { useWorkspace } from "@/contexts/WorkspaceContext";',
  'import { useWorkspace } from "@/contexts/WorkspaceContext";\nimport { useQueryClient, useMutation } from "@tanstack/react-query";',
);

// Mutations
const mutationsStr = `
  const queryClient = useQueryClient();

  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateBadgeProjectFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-badges", activeWorkspace?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteBadgeProject({ data: { id } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-badges", activeWorkspace?.id] }),
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

code = code.replace(
  "  const [isCreating, setIsCreating] = useState(false);",
  mutationsStr + "\n  const [isCreating, setIsCreating] = useState(false);",
);

// Wrapper
const wrapperStart = `
          <FolderManager
            moduleType="badge_designer"
            items={dbProjects}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {isLoading ? (
                  <div className="col-span-full py-12 flex justify-center text-muted-foreground">
                    Loading badge projects...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60">
                    <h3 className="text-lg font-semibold">No Badges Created</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Click the "Create Badge" button above to start designing.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((proj: any) => {
`;

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">[\s\S]*?dbProjects\.map\(\(proj: any\) => \{/g,
  wrapperStart,
);

const itemRenderContent = `
                    const isSelected = selectedIds.has(proj.id);
                    return (
                      <div key={proj.id} className="relative group flex flex-col justify-between rounded-3xl border overflow-hidden shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                           style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.6)" }}>
                        <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                           <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelect(proj.id, c as boolean)} className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary" />
                        </div>
                        <div
                          className="h-32 p-4 relative"
                          style={{
                            background: proj.bg_image_url ? \`url(\${proj.bg_image_url})\` : proj.gradient_class || "#f97316",
                            backgroundSize: "cover",
                          }}
                        >
`;

code = code.replace(
  /return \(\s*<div\s*key=\{proj\.id\}[\s\S]*?className="h-32 p-4 relative"/g,
  itemRenderContent,
);

const linkEndMatch = code.match(/<\/div>\s*\);\s*\}\)\s*\)\}\s*<\/div>/);
if (linkEndMatch) {
  code = code.replace(
    /<\/div>\s*\);\s*\}\)\s*\)\}\s*<\/div>/g,
    `</div>\n);\n})\n)}\n</div>\n)}\n</FolderManager>`,
  );
}

fs.writeFileSync(file, code);
console.log("Updated badge designer page");
