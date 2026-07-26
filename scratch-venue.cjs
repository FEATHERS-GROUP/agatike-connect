const fs = require("fs");

const inputPath = "src/components/desktop/VenueCheckoutDesktop.tsx";
const outputPath = "src/components/page-builder/VenueCheckoutSheet.tsx";

let content = fs.readFileSync(inputPath, "utf8");

// Replace standard imports with Sheet imports
content = content.replace(
  /import \{ Button \} from "@\/components\/ui\/button";/,
  `import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";`,
);

// Remove getUserSession
content = content.replace(/import \{ getUserSession \} from "@\/api\/auth";\n/, "");

// Add Sheet wrapper to the component signature
content = content.replace(
  /export function VenueCheckoutDesktop\(\{ venue \}: \{ venue: any \}\) \{/,
  `interface VenueCheckoutSheetProps {
  venue: any;
  isOpen: boolean;
  onClose: () => void;
  themeColor?: string;
}

export function VenueCheckoutSheet({ venue, isOpen, onClose, themeColor }: VenueCheckoutSheetProps) {`,
);

// Remove session hook since it's guest checkout now
content = content.replace(
  /const \{ data: session \} = useQuery\(\{[\s\S]*?\}\);\n/,
  `const session = null;\n`,
);

// Hide Navbar and Footer
content = content.replace(/<Navbar \/>\n/, "");
content = content.replace(/<Footer \/>\n/, "");

// Fix isSuccess block
content = content.replace(
  /return \(\n      <div className="min-h-screen bg-secondary\/20 flex flex-col items-center justify-center p-4">\n        <div className="bg-card p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-border\/50">\n          <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" \/>\n          <h2 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!<\/h2>\n          <p className="text-muted-foreground mb-8">We have sent the tickets to your email.<\/p>\n          <div className="bg-secondary\/30 p-4 rounded-2xl mb-8 flex items-center justify-center gap-2 font-mono text-xl border border-border\/40">\n            <Ticket className="w-6 h-6 text-primary" \/>\n            <span className="font-bold tracking-widest">\n              \{Math.random\(\).toString\(36\).substring\(2, 10\).toUpperCase\(\)\}\n            <\/span>\n          <\/div>\n          <p className="text-sm text-muted-foreground">Redirecting to venues...<\/p>\n        <\/div>\n      <\/div>\n    \);/,
  `return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl bg-background overflow-y-auto p-0 border-l border-border/40 sm:rounded-l-2xl shadow-2xl">
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500 min-h-screen">
          <div className="bg-card p-12 rounded-3xl shadow-xl text-center max-w-md w-full border border-border/50">
            <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold tracking-tight mb-2">Booking Confirmed!</h2>
            <p className="text-muted-foreground mb-8">We have sent the tickets to your email.</p>
            <div className="bg-secondary/30 p-4 rounded-2xl mb-8 flex items-center justify-center gap-2 font-mono text-xl border border-border/40">
              <Ticket className="w-6 h-6 text-primary" />
              <span className="font-bold tracking-widest">
                {Math.random().toString(36).substring(2, 10).toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">Booking Confirmed</p>
            <Button onClick={onClose} className="rounded-xl h-12 px-8">Close</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );`,
);

// Fix main block
content = content.replace(
  /return \(\n    <div className="min-h-screen bg-secondary\/20 font-sans">\n      <Navbar \/>/,
  `return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl bg-background overflow-y-auto p-0 border-l border-border/40 sm:rounded-l-2xl shadow-2xl">
        <div className="flex flex-col text-foreground p-6">`,
);

// Replace userPhone=user?.phone with undefined
content = content.replace(/userPhone=\{user\?\.phone \|\| undefined\}/, "userPhone={undefined}");

// Close Sheet at end of main block
// We need to replace `</div>\n      <Footer />\n    </div>\n  );\n}`
content = content.replace(
  /<\/div>\n      <Footer \/>\n    <\/div>\n  \);\n\}/,
  `</div>
      </SheetContent>
    </Sheet>
  );
}`,
);

// Write the file
fs.writeFileSync(outputPath, content);
console.log("Created VenueCheckoutSheet.tsx");
