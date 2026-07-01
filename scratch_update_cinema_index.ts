import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/Cinema/movies.tsx";
let code = fs.readFileSync(file, "utf8");

// Imports
code = code.replace(
  'import { getMovies, deleteMovie } from "@/api/cinema_management";',
  'import { getMovies, deleteMovie, updateMovieFolder } from "@/api/cinema_management";\nimport { FolderManager } from "@/components/ui/FolderManager";\nimport { Checkbox } from "@/components/ui/checkbox";'
);
code = code.replace('import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";', 'import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";\nimport { Checkbox as RadixCheckbox } from "@/components/ui/checkbox";'); // In case Checkbox is already imported, wait no, I used replace above. Let's just fix it.


// Mutations
const mutationsStr = `
  const moveMutation = useMutation({
    mutationFn: async ({ id, folderId }: { id: string; folderId: string | null }) => {
      return await updateMovieFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["cinema_movies", activeWorkspace?.id] }),
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

code = code.replace("  const deleteMutation = useMutation({", mutationsStr + "\n  const deleteMutation = useMutation({");

// Wrapper
const wrapperStart = `
          <FolderManager
            moduleType="cinema_movies"
            items={movies}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds }) => (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 mt-4">
                {isLoading ? (
                  <div className="col-span-full flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-card/50 p-12 text-center backdrop-blur-xl">
                    <Film className="mx-auto mb-4 h-12 w-12 text-muted-foreground/50" />
                    <h3 className="text-lg font-semibold tracking-tight">No Movies Added</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Get started by adding your first movie to the library.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((movie) => {
`;

code = code.replace(
  /<div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">[\s\S]*?movies\.map\(\(movie\) => \{/g,
  wrapperStart
);

const itemRenderContent = `
                    const isSelected = selectedIds.has(movie.id);

                    return (
                      <div
                        key={movie.id}
                        className="group relative overflow-hidden rounded-3xl border bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                        style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.6)" }}
                      >
                        <div className="absolute top-3 left-3 z-20" onClick={(e) => e.stopPropagation()}>
                           <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelect(movie.id, c as boolean)} className="bg-background/80 backdrop-blur-sm data-[state=checked]:bg-primary" />
                        </div>
                        <div className="aspect-[2/3] w-full overflow-hidden bg-muted">
`;

code = code.replace(
  /return \(\s*<div\s*key=\{movie\.id\}\s*className="group relative overflow-hidden rounded-3xl border border-border\/60 bg-card shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg"\s*>\s*<div className="aspect-\[2\/3\] w-full overflow-hidden bg-muted">/g,
  itemRenderContent
);

const linkEndMatch = code.match(/<\/div>\s*\);\s*\}\)\s*\)\}\s*<\/div>/);
if (linkEndMatch) {
  code = code.replace(
    /<\/div>\s*\);\s*\}\)\s*\)\}\s*<\/div>/g,
    `</div>\n);\n})\n)}\n</div>\n)}\n</FolderManager>`
  );
}

fs.writeFileSync(file, code);
console.log("Updated cinema movies page");
