import { createFileRoute, useNavigate, useParams, Link } from "@tanstack/react-router";
import { ChevronLeft, Plus, ShoppingBag, Ticket, QrCode, Check, Loader2, Image as ImageIcon, Trash2, PlusCircle } from "lucide-react";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/products_/new")({
  component: NewProductPage,
});

function NewProductPage() {
  const params = useParams({ strict: false });
  const eventId = params.eventId as string;
  const workspaceSlug = params.workspaceSlug as string;
  const navigate = useNavigate();
  const { activeWorkspace } = useWorkspace();
  const queryClient = useQueryClient();
  const { canCreateCampaign, canCreateGiftCard, canCreatePunchCard, canCreateProduct } =
    useSubscriptionLimits(activeWorkspace?.orgnizer_id, activeWorkspace?.id);

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    type: "physical",
    name: "",
    description: "",
    price: "",
    stock_limit: "",
    value_amount: "",
    punch_count: "",
    reward_description: "",
    category: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");

  type ColorVariant = { name: string; stock: number };
  type SizeVariant = { name: string; stock: number; colors: ColorVariant[] };

  const [sizes, setSizes] = useState<SizeVariant[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  // Temp inputs for sizes
  const [sizeInput, setSizeInput] = useState("");
  const [sizeStock, setSizeStock] = useState("");
  
  // Temp inputs for colors per size
  const [colorInputs, setColorInputs] = useState<Record<string, { name: string, stock: string }>>({});

  const updateColorInput = (sizeName: string, field: "name" | "stock", value: string) => {
    setColorInputs(prev => ({
      ...prev,
      [sizeName]: { ...(prev[sizeName] || { name: "", stock: "" }), [field]: value }
    }));
  };

  const addSize = () => {
    if (sizeInput.trim() && !sizes.find(s => s.name === sizeInput.trim())) {
      const newStock = parseInt(sizeStock) || 0;
      const limit = parseInt(formData.stock_limit);
      if (!isNaN(limit)) {
        const currentTotal = sizes.reduce((acc, curr) => acc + curr.stock, 0);
        if (currentTotal + newStock > limit) {
          toast.error("Stock Limit Exceeded", { description: `You only have ${limit - currentTotal} stock remaining for sizes.` });
          return;
        }
      }
      setSizes([...sizes, { name: sizeInput.trim(), stock: newStock, colors: [] }]);
      setSizeInput("");
      setSizeStock("");
    }
  };

  const addColorToSize = (sizeName: string) => {
    const input = colorInputs[sizeName];
    if (!input || !input.name.trim()) return;

    const newStock = parseInt(input.stock) || 0;
    
    setSizes(sizes.map(size => {
      if (size.name === sizeName) {
        if (size.colors.find(c => c.name === input.name.trim())) return size;
        
        const currentColorTotal = size.colors.reduce((acc, c) => acc + c.stock, 0);
        if (currentColorTotal + newStock > size.stock) {
          toast.error("Size Stock Exceeded", { description: `You only have ${size.stock - currentColorTotal} stock remaining for colors within the '${sizeName}' size.` });
          return size;
        }
        
        return {
          ...size,
          colors: [...size.colors, { name: input.name.trim(), stock: newStock }]
        };
      }
      return size;
    }));

    updateColorInput(sizeName, "name", "");
    updateColorInput(sizeName, "stock", "");
  };

  const removeColorFromSize = (sizeName: string, colorName: string) => {
    setSizes(sizes.map(size => {
      if (size.name === sizeName) {
        return { ...size, colors: size.colors.filter(c => c.name !== colorName) };
      }
      return size;
    }));
  };

  const addSpec = () => {
    setSpecs([...specs, { key: "", value: "" }]);
  };

  const updateSpec = (index: number, field: "key" | "value", val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const removeSpec = (index: number) => {
    setSpecs(specs.filter((_, i) => i !== index));
  };

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        type: formData.type,
        name: formData.name,
        description: formData.description,
        price: formData.type === "loyalty_card" ? "0" : formData.price || "0",
        stock_limit: formData.stock_limit ? String(formData.stock_limit) : null,
        value_amount: formData.type === "voucher" && formData.value_amount ? String(formData.value_amount) : null,
        punch_count: (formData.type === "punch_card" || formData.type === "loyalty_card") && formData.punch_count ? String(formData.punch_count) : null,
        reward_description: formData.type === "loyalty_card" ? formData.reward_description : null,
        is_active: true,
        workspace_id: activeWorkspace?.id,
        event_id: eventId || null,
        sold_count: "0",
      };

      if (formData.type === "physical") {
        if (formData.category) payload.category = formData.category;
        payload.available_sizes = sizes.length > 0 ? sizes : null;
        
        const validSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
        payload.specs = validSpecs.length > 0 ? validSpecs : null;
      }

      if (imageFile) {
        payload.image_url = await uploadFileToStorage(imageFile, "events/products");
      }

      return await createProduct({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Product created successfully!");
      queryClient.invalidateQueries({ queryKey: ["event-products", eventId] });
      navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products&add-ons`, params: { eventId, workspaceSlug } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to create product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (formData.type !== "loyalty_card" && !formData.price)) {
      toast.error("Please fill in the required fields");
      return;
    }

    if (formData.type === "physical" && formData.stock_limit) {
      const limit = parseInt(formData.stock_limit);
      if (!isNaN(limit)) {
        const totalSizes = sizes.reduce((acc, s) => acc + s.stock, 0);
        if (totalSizes > limit) {
          toast.error("Stock Limit Exceeded", { description: "The total stock assigned to sizes exceeds the global Total Stock limit." });
          return;
        }
        
        // Also validate that no size has colors exceeding its own stock
        for (const size of sizes) {
          const totalColors = size.colors.reduce((acc, c) => acc + c.stock, 0);
          if (totalColors > size.stock) {
            toast.error("Size Stock Exceeded", { description: `The colors under size '${size.name}' exceed the stock allocated for that size.` });
            return;
          }
        }
      }
    }

    let canCreate = true;
    let limitType = "Product";

    if (formData.type === "physical") {
      canCreate = canCreateCampaign();
      limitType = "Campaign";
    } else if (formData.type === "voucher") {
      canCreate = canCreateGiftCard();
      limitType = "Gift Card";
    } else if (formData.type === "punch_card" || formData.type === "loyalty_card") {
      canCreate = canCreatePunchCard();
      limitType = "Punch Card";
    } else {
      canCreate = canCreateProduct();
    }

    if (!canCreate) {
      toast.error(`${limitType} Limit Reached`, {
        description: `You have reached the maximum number of ${limitType}s allowed by your plan.`,
      });
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 lg:px-8 space-y-8 animate-in fade-in duration-500 pb-20">
      <header className="flex items-center gap-4 py-4 border-b border-border/40">
        <Button
          variant="outline"
          size="icon"
          className="h-10 w-10 rounded-full flex-shrink-0 hover:bg-secondary transition-colors"
          onClick={() => navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products&add-ons`, params: { eventId, workspaceSlug } })}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground/90">Add New Item</h1>
        </div>
      </header>

      {step === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8">
          {[
            { id: "physical", label: "Physical Merch", icon: ShoppingBag, desc: "T-shirts, posters, physical goods" },
            { id: "voucher", label: "Voucher / Gift Card", icon: Ticket, desc: "Pre-paid monetary balance" },
            { id: "punch_card", label: "Punch Card", icon: QrCode, desc: "Pre-paid quantity of items" },
            { id: "loyalty_card", label: "Loyalty Card", icon: Check, desc: "Free card to earn rewards" },
          ].map((typeOption) => {
            const Icon = typeOption.icon;
            return (
              <div
                key={typeOption.id}
                onClick={() => {
                  setFormData({ ...formData, type: typeOption.id });
                  setStep(2);
                }}
                className="cursor-pointer rounded-3xl border border-border/60 bg-card p-6 transition-all hover:bg-secondary/50 hover:border-primary hover:-translate-y-1 shadow-[var(--shadow-card)]"
              >
                <div className="h-14 w-14 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                  <Icon className="h-7 w-7" />
                </div>
                <h3 className="font-semibold text-lg text-foreground mb-1">{typeOption.label}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{typeOption.desc}</p>
              </div>
            );
          })}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8 mt-8">
          <div className="flex justify-between items-center bg-secondary/20 p-5 rounded-2xl border border-border/30 mb-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                {formData.type === "physical" && <ShoppingBag className="h-6 w-6 text-primary" />}
                {formData.type === "voucher" && <Ticket className="h-6 w-6 text-primary" />}
                {formData.type === "punch_card" && <QrCode className="h-6 w-6 text-primary" />}
                {formData.type === "loyalty_card" && <Check className="h-6 w-6 text-primary" />}
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold block mb-0.5">Creating</span>
                <span className="text-lg font-bold capitalize text-foreground">{formData.type.replace("_", " ")}</span>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={() => setStep(1)} className="rounded-full px-6">Change Type</Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Basic Info & Image */}
            <div className="lg:col-span-5 flex flex-col gap-8">
              <div className="rounded-3xl border border-border/40 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col gap-6">
                <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/20 pb-4">Basic Information</h3>
                
                {formData.type === "physical" && (
                  <div className="flex flex-col gap-2">
                    <label className="relative flex aspect-[4/5] w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-[2rem] border-2 border-dashed border-border/50 bg-secondary/20 transition-all hover:border-primary/50 group">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-muted-foreground/60 group-hover:text-primary transition-colors">
                          <ImageIcon className="h-10 w-10" />
                          <span className="text-sm font-semibold uppercase tracking-wider">Upload Image</span>
                        </div>
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          setImageFile(f);
                          setImagePreview(URL.createObjectURL(f));
                        }}
                      />
                    </label>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Item Name <span className="text-red-500">*</span></Label>
                  <Input
                    className="h-14 rounded-2xl text-lg font-medium bg-secondary/20 border-border/40 focus:bg-background"
                    placeholder="e.g. Premium T-Shirt"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                {formData.type !== "loyalty_card" && (
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Price <span className="text-red-500">*</span></Label>
                      <Input
                        type="number"
                        className="h-14 rounded-2xl text-lg font-bold text-primary bg-secondary/20 border-border/40 focus:bg-background"
                        placeholder="0.00"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      />
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Total Stock</Label>
                      <Input
                        type="number"
                        className="h-14 rounded-2xl text-lg font-medium bg-secondary/20 border-border/40 focus:bg-background"
                        placeholder="Unlimited"
                        value={formData.stock_limit}
                        onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Description</Label>
                  <Textarea
                    className="min-h-[120px] rounded-2xl text-base bg-secondary/20 border-border/40 focus:bg-background resize-none"
                    placeholder="Details about this item..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Variants, Rules & Specs */}
            <div className="lg:col-span-7 flex flex-col pt-4">
              {formData.type === "physical" && (
                <div className="rounded-3xl border border-border/40 bg-card p-8 shadow-[var(--shadow-card)] space-y-10">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/20 pb-4">Variants & Specs</h3>
                  
                  <div className="space-y-3">
                    <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Category</Label>
                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                      <SelectTrigger className="h-14 rounded-2xl bg-secondary/20 border-border/40 focus:bg-background text-base"><SelectValue placeholder="Select category..." /></SelectTrigger>
                      <SelectContent className="rounded-2xl border-border/40 shadow-xl">
                        <SelectItem value="tshirts" className="py-3">T-Shirts</SelectItem>
                        <SelectItem value="caps" className="py-3">Caps / Hats</SelectItem>
                        <SelectItem value="jumpers" className="py-3">Jumpers / Hoodies</SelectItem>
                        <SelectItem value="clothes" className="py-3">Clothes / Apparel</SelectItem>
                        <SelectItem value="accessories" className="py-3">Accessories</SelectItem>
                        <SelectItem value="books" className="py-3">Books / Media</SelectItem>
                        <SelectItem value="art" className="py-3">Art / Portraits</SelectItem>
                        <SelectItem value="bottles" className="py-3">Bottles / Drinks</SelectItem>
                        <SelectItem value="jewelry" className="py-3">Jewelry / Rings</SelectItem>
                        <SelectItem value="other" className="py-3">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-4">
                    <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Available Variants & Sub-variants</Label>
                    
                    <div className="flex flex-col gap-6 mb-4">
                      {sizes.map((size) => (
                        <div key={size.name} className="flex flex-col bg-secondary/20 rounded-3xl border border-border/30 shadow-sm overflow-hidden">
                          {/* Size Header */}
                          <div className="flex justify-between items-center bg-secondary/60 px-5 py-4 border-b border-border/30">
                            <span className="font-bold text-lg">{size.name}</span>
                            <div className="flex items-center gap-6">
                              <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Variant Stock: <span className="text-foreground">{size.stock}</span></span>
                              <button type="button" onClick={() => setSizes(sizes.filter(s => s.name !== size.name))} className="text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"><Trash2 className="h-4 w-4" /></button>
                            </div>
                          </div>

                          {/* Nested Colors */}
                          <div className="p-5 space-y-4">
                            {size.colors.length > 0 && (
                              <div className="flex flex-col gap-2">
                                {size.colors.map((color) => (
                                  <div key={color.name} className="flex justify-between items-center bg-background px-4 py-3 rounded-2xl border border-border/30 shadow-sm">
                                    <span className="font-bold text-sm">{color.name}</span>
                                    <div className="flex items-center gap-4">
                                      <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Stock: <span className="text-foreground">{color.stock}</span></span>
                                      <button type="button" onClick={() => removeColorFromSize(size.name, color.name)} className="text-muted-foreground hover:text-red-500 transition-colors p-1.5 hover:bg-red-500/10 rounded-full"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Add Color Input */}
                            <div className="flex gap-3 items-center bg-background p-1.5 rounded-2xl border border-border/20">
                              <Input 
                                placeholder="Add sub-variant (e.g. Red, Signed)" 
                                value={colorInputs[size.name]?.name || ""} 
                                onChange={e => updateColorInput(size.name, "name", e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorToSize(size.name))} 
                                className="h-10 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4 text-sm" 
                              />
                              <div className="h-6 w-px bg-border/40"></div>
                              <Input 
                                placeholder="Stock" 
                                type="number" 
                                value={colorInputs[size.name]?.stock || ""} 
                                onChange={e => updateColorInput(size.name, "stock", e.target.value)} 
                                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColorToSize(size.name))} 
                                className="h-10 rounded-xl w-24 bg-transparent border-none shadow-none focus-visible:ring-0 px-3 text-sm" 
                              />
                              <Button type="button" variant="secondary" onClick={() => addColorToSize(size.name)} className="rounded-xl h-9 px-4 text-xs font-semibold bg-primary/10 text-primary hover:bg-primary/20">Add Sub-variant</Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Add Size Input */}
                    <div className="flex gap-3 items-center bg-secondary/10 p-2 rounded-[1.25rem] border border-border/20">
                      <Input placeholder="Add a new variant (e.g. XL, Hardcover, 500ml)" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} className="h-12 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                      <div className="h-8 w-px bg-border/40"></div>
                      <Input placeholder="Stock (e.g. 10)" type="number" value={sizeStock} onChange={e => setSizeStock(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} className="h-12 rounded-xl w-32 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                      <Button type="button" variant="secondary" onClick={addSize} className="rounded-xl h-10 px-6 font-semibold bg-primary/10 text-primary hover:bg-primary/20">Add Variant</Button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-border/20">
                    <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Product Specifications</Label>
                    <div className="space-y-3">
                      {specs.map((spec, idx) => (
                        <div key={idx} className="flex gap-3 items-center bg-secondary/10 p-2 rounded-[1.25rem] border border-border/20">
                          <Input placeholder="Label (e.g. Material)" value={spec.key} onChange={e => updateSpec(idx, "key", e.target.value)} className="h-12 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                          <div className="h-8 w-px bg-border/40"></div>
                          <Input placeholder="Value (e.g. 100% Cotton)" value={spec.value} onChange={e => updateSpec(idx, "value", e.target.value)} className="h-12 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeSpec(idx)} className="text-muted-foreground hover:text-red-500 p-2 hover:bg-red-500/10 rounded-full h-10 w-10"><Trash2 className="h-4 w-4" /></Button>
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" onClick={addSpec} className="w-full h-14 rounded-2xl border-dashed border-border/60 hover:bg-secondary/30 transition-colors font-medium">
                      <PlusCircle className="h-5 w-5 mr-2 text-muted-foreground" /> Add Specification
                    </Button>
                  </div>
                </div>
              )}

              {(formData.type === "voucher" || formData.type === "punch_card" || formData.type === "loyalty_card") && (
                <div className="rounded-3xl border border-border/40 bg-card p-8 shadow-[var(--shadow-card)] space-y-8">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-widest border-b border-border/20 pb-4">Digital Rules</h3>
                  
                  {formData.type === "voucher" && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Starting Wallet Balance <span className="text-red-500">*</span></Label>
                      <Input type="number" className="h-14 rounded-2xl text-lg font-bold text-primary bg-secondary/20 border-border/40 focus:bg-background" placeholder="e.g. 100" value={formData.value_amount} onChange={(e) => setFormData({ ...formData, value_amount: e.target.value })} />
                      <p className="text-xs text-muted-foreground mt-2 pl-2">The amount of money loaded onto this voucher for spending.</p>
                    </div>
                  )}

                  {(formData.type === "punch_card" || formData.type === "loyalty_card") && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">{formData.type === "loyalty_card" ? "Target Stamps to Reward" : "Number of Pre-paid Items"} <span className="text-red-500">*</span></Label>
                      <Input type="number" className="h-14 rounded-2xl text-lg font-medium bg-secondary/20 border-border/40 focus:bg-background" placeholder={formData.type === "loyalty_card" ? "e.g. 10" : "e.g. 5"} value={formData.punch_count} onChange={(e) => setFormData({ ...formData, punch_count: e.target.value })} />
                    </div>
                  )}

                  {formData.type === "loyalty_card" && (
                    <div className="space-y-3">
                      <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Reward Description <span className="text-red-500">*</span></Label>
                      <Input className="h-14 rounded-2xl text-lg font-medium bg-secondary/20 border-border/40 focus:bg-background" placeholder="e.g. 1 Free Drink" value={formData.reward_description} onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })} />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-12 mt-12 border-t border-border/40">
            <Button type="button" variant="outline" className="h-14 px-8 rounded-full font-semibold" onClick={() => navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products&add-ons`, params: { eventId, workspaceSlug } })}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="h-14 px-8 rounded-full font-bold text-lg shadow-[var(--shadow-glow)]"
              style={{ background: "var(--gradient-primary)" }}
            >
              {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              Create Product
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
