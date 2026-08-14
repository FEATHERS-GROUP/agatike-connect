import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, ArrowLeft, ImageIcon, Package, Wallet, Ticket, Gift } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useState, lazy, Suspense, useEffect } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { getProduct, updateProduct } from "@/api/products";
import { toast } from "sonner";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { uploadFileToStorage } from "@/lib/firebase-storage";
import { buildStoragePath } from "@/api/storage";
import { cn } from "@/lib/utils";
import { getWorkspaceEvents } from "@/api/events";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";

const ReactQuill = lazy(() => import("react-quill-new"));
import "react-quill-new/dist/quill.snow.css";

export const Route = createFileRoute("/dashboard/$workspaceSlug/products/edit/$productId")({
  component: EditProductView,
});

const PRODUCT_TYPES = [
  {
    id: "physical",
    title: "Physical Merchandise",
    description: "Sell t-shirts, caps, or any physical goods.",
    icon: Package,
  },
  {
    id: "voucher",
    title: "Consumable Wallet / Voucher",
    description: "A pre-loaded balance that users can spend.",
    icon: Wallet,
  },
  {
    id: "punch_card",
    title: "Pre-paid Punch Card",
    description: "Users pre-pay for a number of items.",
    icon: Ticket,
  },
  {
    id: "loyalty_card",
    title: "Earned Loyalty Card",
    description: "Users earn stamps to get a reward.",
    icon: Gift,
  },
];

function EditProductView() {
  const { activeWorkspace } = useWorkspace();
  const navigate = useNavigate();
  const { productId } = Route.useParams();
  const queryClient = useQueryClient();

  const { data: product, isLoading: isFetching } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } } as any),
    enabled: !!productId,
  });

  const [step, setStep] = useState(2); // Start at step 2 for editing
  const [formData, setFormData] = useState({
    type: "physical",
    name: "",
    description: "",
    price: "",
    stock_limit: "",
    value_amount: "",
    punch_count: "",
    reward_description: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [linkedEvents, setLinkedEvents] = useState<string[]>([]);
  const [linkedVenues, setLinkedVenues] = useState<string[]>([]);

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", activeWorkspace?.id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["workspace-venues", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceVenueProjects({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

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
      });
      if (product.image_url) {
        setImagePreview(product.image_url);
      }
      if (product.specs?.linked_assets) {
        const events = product.specs.linked_assets
          .filter((a: any) => a.type === "event")
          .map((a: any) => a.id);
        const venues = product.specs.linked_assets
          .filter((a: any) => a.type === "venue")
          .map((a: any) => a.id);
        setLinkedEvents(events);
        setLinkedVenues(venues);
      }
    }
  }, [product]);

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        id: productId,
        type: formData.type,
        name: formData.name,
        description: formData.description,
        price: formData.type === "loyalty_card" ? "0" : String(formData.price || "0"),
        stock_limit: formData.stock_limit ? String(formData.stock_limit) : null,
        value_amount:
          formData.type === "voucher" && formData.value_amount
            ? String(formData.value_amount)
            : null,
        punch_count:
          (formData.type === "punch_card" || formData.type === "loyalty_card") &&
          formData.punch_count
            ? String(formData.punch_count)
            : null,
        reward_description: formData.type === "loyalty_card" ? formData.reward_description : null,
        specs: {
          ...(product?.specs || {}),
          linked_assets: [
            ...linkedEvents.map((id) => ({ type: "event", id })),
            ...linkedVenues.map((id) => ({ type: "venue", id })),
          ],
        },
        event_id: linkedEvents.length > 0 ? linkedEvents[0] : null,
      };

      if (imageFile) {
        const folderPath = buildStoragePath(activeWorkspace?.slug, "products", formData.name, "image");
        payload.image_url = await uploadFileToStorage(imageFile, folderPath);
      }

      return await updateProduct({ data: payload } as any);
    },
    onSuccess: () => {
      toast.success("Campaign item updated successfully!");
      queryClient.invalidateQueries({ queryKey: ["workspace-products", activeWorkspace?.id] });
      queryClient.invalidateQueries({ queryKey: ["product", productId] });
      navigate({ to: `/dashboard/${activeWorkspace?.slug}/products&add-ons` });
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update campaign item");
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

  if (isFetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto w-full">
      <header className="flex flex-col gap-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-fit text-muted-foreground -ml-2"
          onClick={() => {
            if (step === 2) {
              setStep(1);
            } else {
              navigate({ to: `/dashboard/${activeWorkspace?.slug}/products&add-ons` });
            }
          }}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> {step === 2 ? "Back to Types" : "Back to Products"}
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Edit Workspace Campaign</h1>
          <p className="text-sm text-muted-foreground">
            {step === 1
              ? "Select the type of campaign you want to edit."
              : "Edit the details for your campaign."}
          </p>
        </div>
      </header>

      <div className="bg-card rounded-2xl border border-border/60 p-6 sm:p-8 shadow-[var(--shadow-card)]">
        {step === 1 ? (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {PRODUCT_TYPES.map((pt) => {
                const Icon = pt.icon;
                const isSelected = formData.type === pt.id;
                return (
                  <div
                    key={pt.id}
                    onClick={() => setFormData({ ...formData, type: pt.id })}
                    className={cn(
                      "cursor-pointer rounded-xl border-2 p-5 transition-all flex flex-col gap-3",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border/60 hover:border-primary/50 hover:bg-secondary/20",
                    )}
                  >
                    <div
                      className={cn(
                        "p-3 rounded-lg w-fit",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "bg-secondary text-secondary-foreground",
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{pt.title}</h3>
                      <p className="text-sm text-muted-foreground">{pt.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="pt-4 flex justify-end">
              <Button onClick={() => setStep(2)} style={{ background: "var(--gradient-primary)" }}>
                Next Step
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-6 animate-in fade-in slide-in-from-right-2"
          >
            {formData.type === "physical" && (
              <div className="flex flex-col items-center gap-2 mb-2">
                <label className="relative flex h-24 w-24 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-border bg-secondary/40 transition hover:border-primary">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground opacity-50" />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      if (f.size > 5 * 1024 * 1024) {
                        toast.error("Image must be smaller than 5MB");
                        return;
                      }
                      setImageFile(f);
                      setImagePreview(URL.createObjectURL(f));
                    }}
                  />
                </label>
                <p className="text-xs text-muted-foreground">Campaign Image (Optional)</p>
              </div>
            )}

            <div className="space-y-3">
              <Label>
                Item Name <span className="text-red-500">*</span>
              </Label>
              <Input
                placeholder="e.g. VIP Drink Pass"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            {formData.type !== "loyalty_card" && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label>
                    Price <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div className="space-y-3">
                  <Label>Total Stock (Optional)</Label>
                  <Input
                    type="number"
                    placeholder="Unlimited"
                    value={formData.stock_limit}
                    onChange={(e) => setFormData({ ...formData, stock_limit: e.target.value })}
                  />
                </div>
              </div>
            )}

            {formData.type === "voucher" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label>
                  Starting Wallet Balance <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder="e.g. 100"
                  value={formData.value_amount}
                  onChange={(e) => setFormData({ ...formData, value_amount: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  The amount of money loaded onto this voucher for spending.
                </p>
              </div>
            )}

            {(formData.type === "punch_card" || formData.type === "loyalty_card") && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label>
                  {formData.type === "loyalty_card"
                    ? "Target Stamps to Reward"
                    : "Number of Pre-paid Items"}{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <Input
                  type="number"
                  placeholder={formData.type === "loyalty_card" ? "e.g. 10" : "e.g. 5"}
                  value={formData.punch_count}
                  onChange={(e) => setFormData({ ...formData, punch_count: e.target.value })}
                />
              </div>
            )}

            {formData.type === "loyalty_card" && (
              <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                <Label>
                  Reward Description <span className="text-red-500">*</span>
                </Label>
                <Input
                  placeholder="e.g. 1 Free Drink"
                  value={formData.reward_description}
                  onChange={(e) => setFormData({ ...formData, reward_description: e.target.value })}
                />
                <p className="text-xs text-muted-foreground">
                  What the user gets when they collect all stamps.
                </p>
              </div>
            )}

            <div className="space-y-4 pt-4 border-t border-border/50">
              <div className="space-y-1">
                <h3 className="text-sm font-medium leading-none">
                  Link to Workspace Assets{" "}
                  <span className="text-muted-foreground font-normal">(Optional)</span>
                </h3>
                <p className="text-xs text-muted-foreground">
                  Select events or venues where this item is valid or can be redeemed.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {events.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Events
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {events.map((event: any) => {
                        const isSelected = linkedEvents.includes(event.id);
                        return (
                          <div
                            key={event.id}
                            onClick={() => {
                              if (isSelected)
                                setLinkedEvents(linkedEvents.filter((id) => id !== event.id));
                              else setLinkedEvents([...linkedEvents, event.id]);
                            }}
                            className={cn(
                              "cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-secondary/30 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:border-border",
                            )}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {venues.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      Venues
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {venues.map((venue: any) => {
                        const isSelected = linkedVenues.includes(venue.id);
                        return (
                          <div
                            key={venue.id}
                            onClick={() => {
                              if (isSelected)
                                setLinkedVenues(linkedVenues.filter((id) => id !== venue.id));
                              else setLinkedVenues([...linkedVenues, venue.id]);
                            }}
                            className={cn(
                              "cursor-pointer px-4 py-2 rounded-xl border text-sm font-medium transition-all duration-200",
                              isSelected
                                ? "bg-primary/10 border-primary text-primary shadow-sm"
                                : "bg-secondary/30 border-border/60 text-muted-foreground hover:bg-secondary/60 hover:border-border",
                            )}
                          >
                            {venue.name}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Description</Label>
              <div className="rounded-xl overflow-hidden border border-border/60 [&_.ql-toolbar]:bg-secondary/40 [&_.ql-container]:min-h-[120px] [&_.ql-editor]:min-h-[120px] [&_.ql-editor]:text-base">
                <Suspense
                  fallback={
                    <div className="h-[150px] flex items-center justify-center text-muted-foreground">
                      Loading editor...
                    </div>
                  }
                >
                  <ReactQuill
                    theme="snow"
                    value={formData.description}
                    onChange={(val) => setFormData({ ...formData, description: val })}
                    placeholder="Details about this item..."
                  />
                </Suspense>
              </div>
            </div>

            <div className="pt-6 flex justify-end gap-3 border-t">
              <Button variant="ghost" type="button" onClick={() => setStep(1)}>
                Back
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
                style={{ background: "var(--gradient-primary)" }}
              >
                {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
