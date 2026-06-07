const fs = require('fs');

let content = fs.readFileSync('src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx', 'utf-8');

// Update formData initialization
content = content.replace(
  `price_per_day: "",
      price_per_hour: "",
      price_per_week: "",
      price_annually: "",
      entrance_fee: "",
      currency: "$",`,
  `pricing_tiers: [{ name: "", amount: "" }],`
);

// Add missing functions to the component
const helperFunctions = `
  const addPricingTier = () => {
    setFormData(p => ({ ...p, pricing_tiers: [...p.pricing_tiers, { name: "", amount: "" }] }));
  };

  const updatePricingTier = (idx: number, field: string, val: string) => {
    setFormData(p => ({
      ...p,
      pricing_tiers: p.pricing_tiers.map((t, i) => i === idx ? { ...t, [field]: val } : t)
    }));
  };

  const removePricingTier = (idx: number) => {
    setFormData(p => ({ ...p, pricing_tiers: p.pricing_tiers.filter((_, i) => i !== idx) }));
  };
`;

content = content.replace(
  `const addSection = () => {`,
  helperFunctions + `\n  const addSection = () => {`
);

// Update step 4 validation in nextStep
content = content.replace(
  `if (step === 2 && formData.rental_model === "ENTIRE_VENUE") {`,
  `if (step === 4) {
      if (!formData.pricing_tiers.length) return toast.error("Add at least one pricing option");
      for (const t of formData.pricing_tiers) {
        if (!t.name || !t.amount) return toast.error("All pricing options must have a name and amount");
      }
    }
    if (step === 2 && formData.rental_model === "ENTIRE_VENUE") {`
);

// Replace Step 4 UI
const step4UI = `
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h2 className="text-3xl font-bold">Set your pricing</h2>
                <p className="text-muted-foreground mt-2 text-lg">Decide how you charge for this venue. Add multiple options if needed (e.g. Students, Adults).</p>
              </div>
              <div className="space-y-6 mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label className="text-base">Workspace Currency</Label>
                    <div className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 flex items-center text-base text-muted-foreground cursor-not-allowed">
                      {activeWorkspace?.currency || "RWF"}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-base">Pricing Preference</Label>
                    <select className="w-full h-12 rounded-xl bg-secondary/50 border border-input px-4 text-base" value={formData.rental_type} onChange={e => setFormData(p => ({...p, rental_type: e.target.value}))}>
                      {formData.rental_model === "ENTIRE_VENUE" && (
                        <>
                          <option value="Per Day">Per Day</option>
                          <option value="Per Hour">Per Hour</option>
                          <option value="Per Week">Per Week</option>
                          <option value="Annually">Annually</option>
                        </>
                      )}
                      {formData.rental_model === "ENTRANCE_ONLY" && (
                        <option value="Entrance Fee">Entrance Fee</option>
                      )}
                      {formData.rental_model === "HYBRID" && (
                        <option value="Multiple">Multiple Options</option>
                      )}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xl font-semibold">Pricing Options</Label>
                  <div className="space-y-4">
                    {formData.pricing_tiers.map((tier, idx) => (
                      <div key={idx} className="flex gap-4 items-start p-6 bg-secondary/20 rounded-2xl border border-border/60 relative">
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label className="text-base">Option Name</Label>
                            <Input className="h-12 bg-background rounded-xl" value={tier.name} onChange={e => updatePricingTier(idx, 'name', e.target.value)} placeholder={formData.rental_model === "ENTIRE_VENUE" ? "e.g. Full Day Rental" : "e.g. Student Entrance"} />
                          </div>
                          <div className="space-y-2">
                            <Label className="text-base">Amount ({activeWorkspace?.currency || "RWF"})</Label>
                            <Input type="number" className="h-12 bg-background rounded-xl" value={tier.amount} onChange={e => updatePricingTier(idx, 'amount', e.target.value)} placeholder="0.00" />
                          </div>
                        </div>
                        {formData.pricing_tiers.length > 1 && (
                          <Button variant="ghost" size="icon" className="text-red-500 mt-8" onClick={() => removePricingTier(idx)}>
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" className="w-full h-14 border-dashed rounded-xl" onClick={addPricingTier}>
                      <Plus className="h-5 w-5 mr-2" /> Add Pricing Option
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
`;

const oldStep4Start = `{step === 4 && (`;
const oldStep4End = `          {step === 5 && (`;

const step4Regex = /\{step === 4 && \([\s\S]*?\{step === 5 && \(/;
content = content.replace(step4Regex, step4UI.trim() + '\n\n          {step === 5 && (');

// Remove hardcoded currency passing to mutation
content = content.replace(
  `          is_venue_private: formData.is_venue_private,
          capacity: Number(formData.capacity) || 0,
          description: formData.description,
          rental_type: formData.rental_type,
          price_per_day: formData.price_per_day ? Number(formData.price_per_day) : null,
          price_per_hour: formData.price_per_hour ? Number(formData.price_per_hour) : null,
          price_per_week: formData.price_per_week ? Number(formData.price_per_week) : null,
          price_annually: formData.price_annually ? Number(formData.price_annually) : null,
          entrance_fee: formData.entrance_fee ? Number(formData.entrance_fee) : null,
          currency: formData.currency,`,
  `          is_venue_private: formData.is_venue_private,
          capacity: Number(formData.capacity) || 0,
          description: formData.description,
          rental_type: formData.rental_type,
          pricing_tiers: formData.pricing_tiers,`
);

fs.writeFileSync('src/routes/dashboard/$workspaceSlug/venues/create-venue.tsx', content);
