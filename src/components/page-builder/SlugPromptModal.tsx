import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { checkWorkspacePageSlugAvailability } from "@/api/workspace-pages";

interface SlugPromptModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  workspaceSlug: string | undefined;
  selectedTemplate: string | null;
}

export function SlugPromptModal({ open, setOpen, workspaceSlug, selectedTemplate }: SlugPromptModalProps) {
  const navigate = useNavigate();
  const [newSlug, setNewSlug] = useState("");
  const [isCheckingSlug, setIsCheckingSlug] = useState(false);
  const [slugError, setSlugError] = useState<string | null>(null);
  const [slugSuggestions, setSlugSuggestions] = useState<string[]>([]);

  const submitSlugAndContinue = async () => {
    setSlugError(null);
    setSlugSuggestions([]);

    if (!newSlug.trim()) {
      toast.error("Please enter a slug.");
      return;
    }
    const slugRegex = /^[a-z0-9-]+$/;
    if (!slugRegex.test(newSlug)) {
      toast.error("Slug can only contain lowercase letters, numbers, and hyphens.");
      return;
    }

    setIsCheckingSlug(true);
    try {
      const isAvailable = await checkWorkspacePageSlugAvailability({ data: { slug: newSlug } } as any);
      
      if (!isAvailable) {
        toast.error("That URL is already taken.");
        
        // Generate advanced template-based suggestions
        const getRandomItems = (arr: string[], count: number) => [...arr].sort(() => 0.5 - Math.random()).slice(0, count);
        
        const numbers = ["1", "24", new Date().getFullYear().toString(), Math.floor(Math.random() * 1000).toString()];
        const prefixes = ["my-", "get-", "go-", "try-", "join-", "the-"];
        const brandSuffixes = ["hq", "pro", "plus", "now", "live", "hub", "labs", "studio", "works", "co", "group", "official"];
        const categorySuffixes = ["-app", "-site", "-web", "-online", "-blog", "-shop", "-store", "-events", "-products", "-services", "-support", "-docs", "-api"];

        const potentialSuggestions = [
          ...getRandomItems(numbers, 2).map(n => `${newSlug}${n}`),
          ...getRandomItems(prefixes, 2).map(p => `${p}${newSlug}`),
          ...getRandomItems(brandSuffixes, 3).map(s => `${newSlug}${s}`),
          ...getRandomItems(categorySuffixes, 2).map(c => `${newSlug}${c}`)
        ];
        
        const availabilityChecks = await Promise.all(
          potentialSuggestions.map(async (s) => {
            const avail = await checkWorkspacePageSlugAvailability({ data: { slug: s } } as any);
            return { slug: s, isAvailable: avail };
          })
        );
        
        const availableSuggestions = availabilityChecks
          .filter(c => c.isAvailable)
          .map(c => c.slug)
          .slice(0, 8); // Display up to 8 suggestions

        setSlugError("This URL is already taken.");
        setSlugSuggestions(availableSuggestions);
        setIsCheckingSlug(false);
        return;
      }

      setOpen(false);
      navigate({
        to: `/dashboard/${workspaceSlug}/page-builder/editor`,
        search: selectedTemplate ? { templateId: selectedTemplate, slug: newSlug } : { slug: newSlug },
      });
    } catch (error) {
      toast.error("Failed to verify URL availability. Please try again.");
    } finally {
      setIsCheckingSlug(false);
    }
  };

  const getBaseDomain = () => {
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname;
      if (hostname.includes("localhost") || hostname.includes("127.0.0.1")) {
        const port = window.location.port ? `:${window.location.port}` : "";
        return `${hostname}${port}`;
      }
      return "agatike.com";
    }
    return "agatike.com";
  };
  const baseDomain = getBaseDomain();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Set your Page URL</DialogTitle>
          <DialogDescription>
            Choose a unique URL slug for your new page. You can change this later in page settings.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="slug">Page URL Slug</Label>
            <div className="flex items-center gap-2">
              <Input
                id="slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                placeholder="e.g. my-awesome-project"
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Your page will be available at: <strong>{newSlug ? `${newSlug}.${baseDomain}` : `[slug].${baseDomain}`}</strong>
            </p>
            {slugError && (
              <div className="mt-4 p-4 bg-destructive/5 rounded-xl border border-destructive/10">
                <p className="text-sm text-destructive font-medium mb-3">{slugError}</p>
                {slugSuggestions.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Available alternatives</p>
                    <div className="flex flex-wrap gap-2">
                      {slugSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => {
                            setNewSlug(suggestion);
                            setSlugError(null);
                            setSlugSuggestions([]);
                          }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-background hover:bg-secondary text-foreground transition-all border shadow-sm hover:shadow active:scale-95"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isCheckingSlug}>Cancel</Button>
          <Button onClick={submitSlugAndContinue} disabled={isCheckingSlug}>
            {isCheckingSlug ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
