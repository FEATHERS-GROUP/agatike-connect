import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/book/books.tsx";
let code = fs.readFileSync(file, "utf8");

// Imports
code = code.replace(
  'import { getWorkspaceBooks, createAgatikeBook, deleteAgatikeBook } from "@/api/book";',
  'import { getWorkspaceBooks, createAgatikeBook, deleteAgatikeBook, updateBookFolder } from "@/api/book";\nimport { FolderManager } from "@/components/ui/FolderManager";\nimport { Checkbox } from "@/components/ui/checkbox";',
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
      return await updateBookFolder({ data: { id, folder_id: folderId } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-books", activeWorkspace?.id] }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await deleteAgatikeBook({ data: { id } } as any);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["workspace-books", activeWorkspace?.id] }),
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
  "  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);",
  mutationsStr + "\n  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);",
);

// Wrapper
const wrapperStart = `
          <FolderManager
            moduleType="agatike_books"
            items={books}
            getItemId={(item) => item.id}
            getFolderId={(item) => item.folder_id}
            onMoveItems={handleBulkMove}
            onDeleteItems={handleBulkDelete}
          >
            {({ filteredItems, handleSelect, selectedIds }) => (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                  <div className="col-span-full py-12 flex justify-center text-muted-foreground">
                    Loading books...
                  </div>
                ) : filteredItems.length === 0 ? (
                  <div className="col-span-full text-center py-12 bg-card rounded-[2rem] border border-dashed border-border/60">
                    <Book className="mx-auto h-12 w-12 text-muted-foreground mb-3" />
                    <h3 className="text-lg font-semibold">No Books found</h3>
                    <p className="text-sm text-muted-foreground mt-1 max-w-sm mx-auto">
                      Create your first Agatike Book to start tracking.
                    </p>
                  </div>
                ) : (
                  filteredItems.map((book: any) => {
`;

code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">[\s\S]*?books\.map\(\(book: any\) => \{/g,
  wrapperStart,
);

const itemRenderContent = `
                    const isSelected = selectedIds.has(book.id);

                    return (
                      <div key={book.id} className="relative group rounded-3xl border bg-card p-6 shadow-sm transition-all hover:shadow-lg focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
                           style={{ borderColor: isSelected ? "hsl(var(--primary))" : "hsl(var(--border) / 0.6)" }}>
                        <div className="absolute top-4 right-4 z-20" onClick={(e) => e.stopPropagation()}>
                           <Checkbox checked={isSelected} onCheckedChange={(c) => handleSelect(book.id, c as boolean)} className="data-[state=checked]:bg-primary" />
                        </div>
                        <div className="flex items-start gap-4 mb-4 pr-6 cursor-pointer" onClick={() => window.location.href = \`/dashboard/\${workspaceSlug}/book/\${book.id}\`}>
`;

code = code.replace(
  /return \(\s*<div\s*key=\{book\.id\}\s*className="group rounded-3xl border border-border\/60 bg-card p-6 shadow-sm transition-all hover:shadow-lg hover:border-primary\/50"\s*>\s*<div className="flex items-start gap-4 mb-4">/g,
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
console.log("Updated books page");
