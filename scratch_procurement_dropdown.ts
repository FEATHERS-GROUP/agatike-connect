import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/book/procurement.tsx";
let code = fs.readFileSync(file, "utf8");

// Add imports for DropdownMenu
const dropdownImports = `
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
`;
code = code.replace(`import { cn } from "@/lib/utils";`, `import { cn } from "@/lib/utils";\n${dropdownImports}`);

// Replace ContextMenu for the Bulk Move button
const searchStr = `<ContextMenu>
                        <ContextMenuTrigger asChild>
                           <Button variant="outline" size="sm" className="h-8 gap-2 bg-white">
                              <MoveRight className="h-4 w-4" /> Bulk Move...
                           </Button>
                        </ContextMenuTrigger>
                        <ContextMenuContent className="w-48">
                           <ContextMenuItem onClick={() => handleBulkMove(null)}>Root (No Folder)</ContextMenuItem>
                           <ContextMenuSeparator />
                           {folders.map((f: any) => (
                              <ContextMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                                 <Folder className="mr-2 h-4 w-4" /> {f.name}
                              </ContextMenuItem>
                           ))}
                        </ContextMenuContent>
                     </ContextMenu>`;

const replaceStr = `<DropdownMenu>
                        <DropdownMenuTrigger asChild>
                           <Button variant="outline" size="sm" className="h-8 gap-2 bg-white">
                              <MoveRight className="h-4 w-4" /> Bulk Move...
                           </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-48">
                           <DropdownMenuItem onClick={() => handleBulkMove(null)}>Root (No Folder)</DropdownMenuItem>
                           <DropdownMenuSeparator />
                           {folders.map((f: any) => (
                              <DropdownMenuItem key={f.id} onClick={() => handleBulkMove(f.id)}>
                                 <Folder className="mr-2 h-4 w-4" /> {f.name}
                              </DropdownMenuItem>
                           ))}
                        </DropdownMenuContent>
                     </DropdownMenu>`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, replaceStr);
  fs.writeFileSync(file, code);
  console.log("Success");
} else {
  console.log("Could not find string");
}
