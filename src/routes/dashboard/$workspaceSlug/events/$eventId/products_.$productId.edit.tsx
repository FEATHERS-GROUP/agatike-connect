import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { ChevronLeft, Plus, ShoppingBag, Ticket, QrCode, Check, Loader2, Image as ImageIcon, Trash2, PlusCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getProduct, updateProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/$workspaceSlug/events/$eventId/products_/$productId/edit")({
  component: EditProductPage,
});

function EditProductPage() {
  const params = useParams({ strict: false });
  const eventId = params.eventId as string;
  const productId = params.productId as string;
  const workspaceSlug = params.workspaceSlug as string;
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } } as any),
  });

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

  const [sizes, setSizes] = useState<{ name: string; stock: number }[]>([]);
  const [colors, setColors] = useState<{ name: string; stock: number }[]>([]);
  const [specs, setSpecs] = useState<{ key: string; value: string }[]>([]);

  const [sizeInput, setSizeInput] = useState("");
  const [sizeStock, setSizeStock] = useState("");
  const [colorInput, setColorInput] = useState("");
  const [colorStock, setColorStock] = useState("");

  useEffect(() => {
    if (product) {
      setFormData({
        type: product.type || "physical",
        name: product.name || "",
        description: product.description || "",
        price: product.price || "",
        stock_limit: product.stock_limit || "",
        value_amount: product.value_amount || "",
        punch_count: product.punch_count || "",
        reward_description: product.reward_description || "",
        category: product.category || "",
      });
      setImagePreview(product.image_url || "");
      
      setSizes(Array.isArray(product.available_sizes) ? product.available_sizes.map((s: any) => typeof s === 'string' ? { name: s, stock: 0 } : s) : []);
      setColors(Array.isArray(product.available_colors) ? product.available_colors.map((c: any) => typeof c === 'string' ? { name: c, stock: 0 } : c) : []);
      setSpecs(Array.isArray(product.specs) ? product.specs : []);
    }
  }, [product]);

  const addSize = () => {
    if (sizeInput.trim() && !sizes.find(s => s.name === sizeInput.trim())) {
      setSizes([...sizes, { name: sizeInput.trim(), stock: parseInt(sizeStock) || 0 }]);
      setSizeInput("");
      setSizeStock("");
    }
  };

  const addColor = () => {
    if (colorInput.trim() && !colors.find(c => c.name === colorInput.trim())) {
      setColors([...colors, { name: colorInput.trim(), stock: parseInt(colorStock) || 0 }]);
      setColorInput("");
      setColorStock("");
    }
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
        id: productId,
        name: formData.name,
        description: formData.description,
        price: formData.type === "loyalty_card" ? "0" : formData.price || "0",
        stock_limit: formData.stock_limit ? String(formData.stock_limit) : null,
        value_amount: formData.type === "voucher" && formData.value_amount ? String(formData.value_amount) : null,
        punch_count: (formData.type === "punch_card" || formData.type === "loyalty_card") && formData.punch_count ? String(formData.punch_count) : null,
        reward_description: formData.type === "loyalty_card" ? formData.reward_description : null,
      };

      if (formData.type === "physical") {
        if (formData.category) payload.category = formData.category;
        payload.available_sizes = sizes.length > 0 ? sizes : null;
        payload.available_colors = colors.length > 0 ? colors : null;
        
        const validSpecs = specs.filter((s) => s.key.trim() && s.value.trim());
        payload.specs = validSpecs.length > 0 ? validSpecs : null;
      }

      if (imageFile) {
        payload.image_url = await uploadFileToStorage(imageFile, "events/products");
      }

      return await updateProduct({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Product updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      queryClient.invalidateQueries({ queryKey: ["event-products", eventId] });
      navigate({ to: `/dashboard/$workspaceSlug/events/$eventId/products&add-ons`, params: { eventId, workspaceSlug } });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update product");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || (formData.type !== "loyalty_card" && !formData.price)) {
      toast.error("Please fill in the required fields");
      return;
    }
    mutation.mutate();
  };

  if (isLoading) {
    return <div className="p-10 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>;
  }

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
          <h1 className="text-xl font-bold tracking-tight text-foreground/90">Edit Item</h1>
        </div>
      </header>

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
              <span className="text-xs text-muted-foreground uppercase tracking-widest font-semibold block mb-0.5">Editing</span>
              <span className="text-lg font-bold capitalize text-foreground">{formData.type.replace("_", " ")}</span>
            </div>
          </div>
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
                        <span className="text-sm font-semibold uppercase tracking-wider">Change Image</span>
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
                      <SelectItem value="other" className="py-3">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Available Sizes</Label>
                  <div className="flex flex-col gap-3 mb-4">
                    {sizes.map((size) => (
                      <div key={size.name} className="flex justify-between items-center bg-secondary/40 px-5 py-3.5 rounded-2xl border border-border/30 shadow-sm">
                        <span className="font-bold">{size.name}</span>
                        <div className="flex items-center gap-6">
                          <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Stock: <span className="text-foreground">{size.stock}</span></span>
                          <button type="button" onClick={() => setSizes(sizes.filter(s => s.name !== size.name))} className="text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center bg-secondary/10 p-2 rounded-[1.25rem] border border-border/20">
                    <Input placeholder="e.g. XL" value={sizeInput} onChange={e => setSizeInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} className="h-12 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                    <div className="h-8 w-px bg-border/40"></div>
                    <Input placeholder="Stock (e.g. 10)" type="number" value={sizeStock} onChange={e => setSizeStock(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSize())} className="h-12 rounded-xl w-32 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                    <Button type="button" variant="secondary" onClick={addSize} className="rounded-xl h-10 px-6 font-semibold bg-primary/10 text-primary hover:bg-primary/20">Add</Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-xs uppercase tracking-widest font-semibold text-muted-foreground">Available Colors</Label>
                  <div className="flex flex-col gap-3 mb-4">
                    {colors.map((color) => (
                      <div key={color.name} className="flex justify-between items-center bg-secondary/40 px-5 py-3.5 rounded-2xl border border-border/30 shadow-sm">
                        <span className="font-bold">{color.name}</span>
                        <div className="flex items-center gap-6">
                          <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">Stock: <span className="text-foreground">{color.stock}</span></span>
                          <button type="button" onClick={() => setColors(colors.filter(c => c.name !== color.name))} className="text-muted-foreground hover:text-red-500 transition-colors p-2 hover:bg-red-500/10 rounded-full"><Trash2 className="h-4 w-4" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-3 items-center bg-secondary/10 p-2 rounded-[1.25rem] border border-border/20">
                    <Input placeholder="e.g. Black" value={colorInput} onChange={e => setColorInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} className="h-12 rounded-xl flex-1 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                    <div className="h-8 w-px bg-border/40"></div>
                    <Input placeholder="Stock (e.g. 10)" type="number" value={colorStock} onChange={e => setColorStock(e.target.value)} onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addColor())} className="h-12 rounded-xl w-32 bg-transparent border-none shadow-none focus-visible:ring-0 px-4" />
                    <Button type="button" variant="secondary" onClick={addColor} className="rounded-xl h-10 px-6 font-semibold bg-primary/10 text-primary hover:bg-primary/20">Add</Button>
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
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
