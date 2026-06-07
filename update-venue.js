const fs = require('fs');

let content = fs.readFileSync('src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx', 'utf-8');

const VENUE_TYPES = `const VENUE_TYPES = [
  {
    id: "Stadium",
    title: "Stadium",
    description: "Large outdoor or indoor venue with tiered seating for sports or concerts.",
    icon: "Building2"
  },
  {
    id: "Arena",
    title: "Arena",
    description: "Enclosed indoor venue for major events, performances, and tournaments.",
    icon: "Warehouse"
  },
  {
    id: "Conference Room",
    title: "Conference Room",
    description: "Professional enclosed space designed for meetings and presentations.",
    icon: "Presentation"
  },
  {
    id: "Wedding Garden",
    title: "Wedding Garden",
    description: "Beautiful outdoor landscaped space perfect for wedding ceremonies.",
    icon: "Flower2"
  },
  {
    id: "Park",
    title: "Park",
    description: "Open green public space for outdoor activities and large gatherings.",
    icon: "Trees"
  },
  {
    id: "Museum",
    title: "Museum",
    description: "Cultural or historical institution offering private event spaces or tours.",
    icon: "Landmark"
  },
  {
    id: "Playground",
    title: "Playground",
    description: "Recreational outdoor area specifically designed for children's activities.",
    icon: "Castle"
  },
  {
    id: "Basketball Court",
    title: "Basketball Court",
    description: "Indoor or outdoor court designed for sports events and tournaments.",
    icon: "CircleDot"
  }
];`;

content = content.replace(/const VENUE_TYPES = \[\s*"Stadium"[^\]]*\];/, VENUE_TYPES);

const newImports = `import { ArrowLeft, ArrowRight, Save, MapPin, Loader2, CheckCircle2, UploadCloud, Plus, Trash2, X, Building2, Warehouse, Presentation, Flower2, Trees, Landmark, Castle, CircleDot } from "lucide-react";`;
content = content.replace(/import { ArrowLeft,[^;]+} from "lucide-react";/, newImports);

const newGrid = `<div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
                {VENUE_TYPES.map(vt => {
                  const Icon = {
                    Building2, Warehouse, Presentation, Flower2, Trees, Landmark, Castle, CircleDot
                  }[vt.icon];
                  
                  return (
                    <button
                      key={vt.id}
                      onClick={() => setFormData(p => ({ ...p, type: vt.id }))}
                      className={cn(
                        "flex items-start text-left gap-4 p-6 rounded-2xl border-2 transition-all hover:border-orange-500/50",
                        formData.type === vt.id ? "border-orange-500 bg-orange-500/5 shadow-sm" : "border-border/60 bg-secondary/20"
                      )}
                    >
                      <div className={cn(
                        "p-3 rounded-xl shrink-0 transition-colors",
                        formData.type === vt.id ? "bg-orange-500 text-white" : "bg-orange-500/10 text-orange-500"
                      )}>
                        {Icon && <Icon className="h-7 w-7" />}
                      </div>
                      <div>
                        <span className="font-bold text-lg block">{vt.title}</span>
                        <span className="text-muted-foreground text-sm mt-1 block leading-snug">{vt.description}</span>
                      </div>
                    </button>
                  );
                })}
              </div>`;

content = content.replace(/<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-8">[\s\S]*?<\/div>\s*<\/div>\s*\)}/, newGrid + '\n            </div>\n          )}');

fs.writeFileSync('src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx', content);
