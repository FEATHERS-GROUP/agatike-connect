const fs = require("fs");

const inputPath = "src/routes/venues/$venueId_/facilities/checkout/$facilityId.tsx";
const outputPath = "src/components/page-builder/FacilityCheckoutSheet.tsx";

let content = fs.readFileSync(inputPath, "utf8");

// Remove TanStack Router imports
content = content.replace(
  /import \{ createFileRoute, Link, useNavigate, redirect \} from "@tanstack\/react-router";\n/,
  'import { Link } from "@tanstack/react-router";\n',
);

// Add Sheet imports
content = content.replace(
  /import \{ Button \} from "@\/components\/ui\/button";/,
  `import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";`,
);

// Remove Route definition
content = content.replace(/export const Route = createFileRoute.*?\n\}\);\n\n/s, "");

// Update function signature
content = content.replace(
  /function FacilityCheckoutPage\(\) \{[\s\S]*?const queryClient = useQueryClient\(\);/s,
  `interface FacilityCheckoutSheetProps {
  venue: any;
  facility: any;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export function FacilityCheckoutSheet({ venue, facility, isOpen, onClose, themeColor }: FacilityCheckoutSheetProps) {
  const queryClient = useQueryClient();
  const session = null;
`,
);

// Wrap return with Sheet
content = content.replace(
  /return \(\n    <div className="min-h-screen bg-background flex flex-col text-foreground">/,
  `return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl bg-background overflow-y-auto p-0 border-l border-border/40 sm:rounded-l-2xl shadow-2xl">
        <div className="flex flex-col text-foreground">`,
);

content = content.replace(
  /<\/div>\n  \);\n\}\n/s,
  `        </div>
      </SheetContent>
    </Sheet>
  );
}\n`,
);

// Hide Navbar and Footer
content = content.replace(/<Navbar \/>\n/, "");
content = content.replace(/<Footer \/>\n/, "");

// Add missing scroll container div to content
content = content.replace(
  /<main className="flex-1 max-w-7xl mx-auto w-full px-4 md:px-8 py-8">/,
  `<main className="flex-1 w-full px-4 md:px-6 py-6">`,
);

// Write the file
fs.writeFileSync(outputPath, content);
console.log("Created FacilityCheckoutSheet.tsx");
