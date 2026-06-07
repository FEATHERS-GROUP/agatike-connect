const fs = require("fs");

let content = fs.readFileSync(
  "src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx",
  "utf-8",
);

// 1. Add imports
content = content.replace(
  `import { useWorkspace } from "@/contexts/WorkspaceContext";`,
  `import { useWorkspace } from "@/contexts/WorkspaceContext";\nimport { COUNTRIES } from "@/lib/countries";\nimport { getCoordinates } from "@/api/geocoding";\nimport { Switch } from "@/components/ui/switch";`,
);

// 2. Add to formData
content = content.replace(
  `city: "",`,
  `city: "",\n    country: "RW",\n    address: "",\n    is_venue_private: false,`,
);

// 3. Update createVenue mutationFn
const mutationReplaceStr = `
    mutationFn: async () => {
      const workspace_id = activeWorkspace?.id;
      if (!workspace_id) throw new Error("No active workspace found");

      // Fetch Geocoding
      const addressString = \`\${formData.address}, \${formData.city}, \${COUNTRIES.find(c => c.code === formData.country)?.name || formData.country}\`;
      const coords = await getCoordinates({ data: addressString });
      const latitude = coords?.lat ? parseFloat(coords.lat) : null;
      const longitude = coords?.lng ? parseFloat(coords.lng) : null;

      return createRentableVenue({
        data: {
`;

content = content.replace(
  /mutationFn: async \(\) => \{\s+const workspace_id = activeWorkspace\?\.id;\s+if \(!workspace_id\) throw new Error\("No active workspace found"\);\s+return createRentableVenue\(\{\s+data: \{/,
  mutationReplaceStr.trim(),
);

// Add the fields into the data object
content = content.replace(
  `city: formData.city,`,
  `city: formData.city,\n          country: formData.country,\n          address: formData.address,\n          latitude,\n          longitude,\n          is_venue_private: formData.is_venue_private,`,
);

// 4. Validation
content = content.replace(
  `if (step === 2 && (!formData.name || !formData.city)) return toast.error("Name and City are required");`,
  `if (step === 2 && (!formData.name || !formData.city || !formData.address)) return toast.error("Name, City, and Address are required");`,
);

// 5. UI Updates for Step 2
const uiReplaceStr = `
                <div className="space-y-2">
                  <Label className="text-base">Venue Name <span className="text-red-500">*</span></Label>
                  <Input className="h-12 text-lg rounded-xl" value={formData.name} onChange={e => setFormData(p => ({...p, name: e.target.value}))} placeholder="e.g. Grand Kigali Arena" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Country <span className="text-red-500">*</span></Label>
                    <select className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base" value={formData.country} onChange={e => setFormData(p => ({...p, country: e.target.value}))}>
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">City / Location <span className="text-red-500">*</span></Label>
                    <Input className="h-12 text-lg rounded-xl" value={formData.city} onChange={e => setFormData(p => ({...p, city: e.target.value}))} placeholder="e.g. Kigali" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Street Address <span className="text-red-500">*</span></Label>
                    <Input className="h-12 text-lg rounded-xl" value={formData.address} onChange={e => setFormData(p => ({...p, address: e.target.value}))} placeholder="e.g. KG 11 Ave" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Maximum Capacity</Label>
                    <Input type="number" className="h-12 text-lg rounded-xl" value={formData.capacity} onChange={e => setFormData(p => ({...p, capacity: e.target.value}))} placeholder="e.g. 5000" />
                  </div>
                </div>
                
                <div className="flex items-center justify-between p-6 bg-secondary/30 border border-border/60 rounded-2xl">
                  <div className="space-y-1">
                    <Label className="text-lg">Private Venue Location</Label>
                    <p className="text-sm text-muted-foreground">If enabled, exact address is hidden until user books</p>
                  </div>
                  <Switch 
                    checked={formData.is_venue_private} 
                    onCheckedChange={(v) => setFormData(p => ({...p, is_venue_private: v}))}
                  />
                </div>
`;

content = content.replace(
  /<div className="space-y-2">\s+<Label className="text-base">Venue Name <span className="text-red-500">\*<\/span><\/Label>\s+<Input className="h-12 text-lg rounded-xl" value=\{formData.name\} onChange=\{e => setFormData\(p => \(\{\.\.\.p, name: e.target.value\}\)\)\} placeholder="e\.g\. Grand Kigali Arena" \/>\s+<\/div>\s+<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">\s+<div className="space-y-2">\s+<Label className="text-base">City \/ Location <span className="text-red-500">\*<\/span><\/Label>\s+<Input className="h-12 text-lg rounded-xl" value=\{formData.city\} onChange=\{e => setFormData\(p => \(\{\.\.\.p, city: e.target.value\}\)\)\} placeholder="e\.g\. Kigali, Rwanda" \/>\s+<\/div>\s+<div className="space-y-2">\s+<Label className="text-base">Maximum Capacity<\/Label>\s+<Input type="number" className="h-12 text-lg rounded-xl" value=\{formData.capacity\} onChange=\{e => setFormData\(p => \(\{\.\.\.p, capacity: e.target.value\}\)\)\} placeholder="e\.g\. 5000" \/>\s+<\/div>\s+<\/div>/,
  uiReplaceStr.trim(),
);

fs.writeFileSync("src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx", content);
