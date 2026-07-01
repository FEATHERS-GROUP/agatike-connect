import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/venue-designer/index.tsx";
let code = fs.readFileSync(file, "utf8");

// Imports
code = code.replace(
  'import { getWorkspaceVenueProjects, createVenueProject, deleteVenueProject } from "@/api/venues";',
  'import { getWorkspaceVenueProjects, createVenueProject, deleteVenueProject, updateVenueProjectFolder } from "@/api/venues";\nimport { FolderManager } from "@/components/ui/FolderManager";\nimport { Checkbox } from "@/components/ui/checkbox";',
);

// Mutations
const mutationsStr = `
  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateVenueProjectFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-venue-projects", activeWorkspace?.id] }),
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
  "  const createMutation = useMutation({",
  mutationsStr + "\n  const createMutation = useMutation({",
);

// Wrapper
const wrapperStart = `
          <FolderManager
            moduleType="venue_designer"
            items={dbProjects}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {isLoadingProjects ? (
                  <div className="col-span-full flex flex-col items-center justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                    <p className="text-sm text-muted-foreground mt-2">Loading venue projects...</p>
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60 p-8">
                    <MapPin className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No Venue Projects</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first venue seating map by selecting a template above.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((proj: any) => {
`;

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?dbProjects\.map\(\(proj: any\) => \{/g,
  wrapperStart,
);

const itemRenderContent = `
                    const isSelected = selectedIds.has(proj.id);

                    return (
                      <div key={proj.id} className="relative group rounded-3xl border overflow-hidden shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                           style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.6)" }}>
                        <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                           <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelect(proj.id, c as boolean)} className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary" />
                        </div>
                        <Link
                          to="/dashboard/$workspaceSlug/venue-designer/$projectId"
                          params={{ workspaceSlug, projectId: proj.id }}
                          className="block h-full"
                        >
`;

code = code.replace(
  /return \(\s*<Link\s*key=\{proj\.id\}[\s\S]*?className="group block rounded-3xl border border-border\/60 bg-card overflow-hidden shadow-sm transition-all hover:shadow-lg hover:border-primary\/50"\s*>/g,
  itemRenderContent,
);

const linkEndMatch = code.match(/<\/Link>\s*\);\s*\}\)\s*\)\}\s*<\/div>/);
if (linkEndMatch) {
  code = code.replace(
    /<\/Link>\s*\);\s*\}\)\s*\)\}\s*<\/div>/g,
    `</Link>\n</div>\n);\n})\n)}\n</div>\n)}\n</FolderManager>`,
  );
} else {
  console.log("Could not find end match");
}

fs.writeFileSync(file, code);
console.log("Updated venue designer page");
