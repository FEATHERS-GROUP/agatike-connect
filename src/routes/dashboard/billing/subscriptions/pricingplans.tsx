import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { getPricingPlans, getPromotionalRules, PricingPlan, PromotionalRule } from "@/api/billing";
import { getOrganizerProfile } from "@/api/organizers";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/countries";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const Route = createFileRoute("/dashboard/billing/subscriptions/pricingplans")({
  component: PricingPlansPage,
});

function PricingPlansPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [rules, setRules] = useState<PromotionalRule[]>([]);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnually, setIsAnnually] = useState(false);
  
  // Sales Drawer State
  const [isSalesDrawerOpen, setIsSalesDrawerOpen] = useState(false);
  
  const { activeWorkspace, workspaces } = useWorkspace();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedPlans, fetchedRules, fetchedOrganizer] = await Promise.all([
          getPricingPlans(),
          getPromotionalRules(),
          getOrganizerProfile().catch(() => null),
        ]);
        setPlans(fetchedPlans);
        setRules(fetchedRules);
        setOrganizerProfile(fetchedOrganizer);
      } catch (error) {
        console.error("Failed to load plans:", error);
        toast.error("Failed to load pricing plans.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpgrade = (plan: PricingPlan) => {
    if (!activeWorkspace?.orgnizer_id) {
      toast.error("You must be logged in to upgrade.");
      return;
    }
    
    // Redirect to the checkout page instead of upgrading immediately
    navigate({
      to: "/dashboard/billing/subscriptions/checkout/$planId",
      params: { planId: plan.id },
      search: { cycle: isAnnually ? "annually" : "monthly" },
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Find the launch promo if it exists
  const launchPromo = rules.find((r) => r.name === "Launch Promo");

  return (
    <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500 py-8 px-4">
      <div className="flex justify-between items-start mb-6">
        <img src="/agatike-logo.svg" alt="Agatike" className="h-8 w-auto object-contain" />
        <Button variant="ghost" asChild className="text-muted-foreground hover:text-foreground">
          <Link to="/dashboard">Cancel & Go Back</Link>
        </Button>
      </div>
      <div className="text-center space-y-4 -mt-8">
        <h1 className="text-4xl font-bold tracking-tight">Choose the right plan for you</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Whether you're organizing a small meetup or managing multiple massive arenas, we have a plan that fits your needs.
        </p>
        
        {/* Toggle between Monthly and Annually */}
        <div className="flex items-center justify-center gap-3 pt-6">
          <Label htmlFor="billing-toggle" className={`text-sm ${!isAnnually ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </Label>
          <Switch
            id="billing-toggle"
            checked={isAnnually}
            onCheckedChange={setIsAnnually}
            className="data-[state=checked]:bg-primary"
          />
          <Label htmlFor="billing-toggle" className={`text-sm flex items-center gap-2 ${isAnnually ? "font-bold text-foreground" : "text-muted-foreground"}`}>
            Annually
            <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
              Save 20%
            </span>
          </Label>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-8 items-start">
        {plans.map((plan) => {
          // Calculate pricing based on cycle and rules
          let basePrice = plan.price;
          if (isAnnually && basePrice > 0) {
            // Apply a 20% discount for annual billing by default
            basePrice = basePrice * 0.8 * 12; 
          }
          
          let displayPrice = basePrice;
          let promoText = null;

          // Check if it's the enterprise plan
          const isEnterprise = plan.name.toLowerCase().includes("enterprise");

          // Apply promotional rules (like 50% off for the first 3 months)
          if (!isEnterprise && basePrice > 0 && launchPromo && launchPromo.applies_to_cycles.includes(isAnnually ? "annually" : "monthly")) {
            // If it's a monthly plan, they pay 50% for 3 months.
            // If it's an annual plan, maybe they get a straight discount on the first year, or the equivalent of 3 months at 50%.
            if (isAnnually) {
              // 3 months at 50%, 9 months at 100%
              const monthlyEquivalent = basePrice / 12;
              displayPrice = (monthlyEquivalent * 0.5 * 3) + (monthlyEquivalent * 9);
              promoText = `Includes ${launchPromo.name}: ${launchPromo.description}`;
            } else {
              displayPrice = basePrice * (1 - launchPromo.discount_percentage / 100);
              promoText = `${launchPromo.name}: ${launchPromo.discount_percentage}% off for ${launchPromo.duration_months} months!`;
            }
          }

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-3xl border bg-card p-8 shadow-sm transition-all duration-300 hover:shadow-md ${
                plan.is_popular ? "border-primary ring-1 ring-primary" : "border-border/60"
              }`}
            >
              {plan.is_popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <span className="flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                    <Sparkles className="h-3 w-3" /> Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-2 min-h-[40px]">
                  {plan.description}
                </p>
                {plan.name.toLowerCase().includes("basic") && (
                  <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-xs text-primary font-medium">
                    <span className="block font-bold mb-1">🎁 14-Day Free Trial</span>
                    Get 14 days of full access to all premium modules (limit 1 creation per module). 
                    After 14 days, premium features are locked until you upgrade.
                  </div>
                )}
              </div>

              <div className="mb-4 flex flex-col gap-1">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold">
                    {isEnterprise ? "Custom" : displayPrice === 0 ? "Free" : `$${displayPrice.toFixed(2)}`}
                  </span>
                  {!isEnterprise && plan.price > 0 && (
                    <span className="text-sm font-medium text-muted-foreground">
                      /{isAnnually ? "yr" : "mo"}
                    </span>
                  )}
                </div>
                
                {!isEnterprise && plan.price > 0 && (displayPrice !== basePrice || isAnnually) && (
                  <div className="text-xs text-muted-foreground line-through">
                    ${isAnnually ? (plan.price * 12).toFixed(2) : plan.price.toFixed(2)}/{isAnnually ? "yr" : "mo"}
                  </div>
                )}
                
                {!isEnterprise && promoText && (
                  <div className="text-xs font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-md inline-block w-fit mt-1">
                    {promoText}
                  </div>
                )}
              </div>

              <Button
                onClick={() => {
                  if (isEnterprise) {
                    setIsSalesDrawerOpen(true);
                  } else {
                    handleUpgrade(plan);
                  }
                }}
                variant={plan.is_popular ? "default" : "outline"}
                className={`w-full rounded-full mb-8 h-11 ${
                  plan.is_popular ? "shadow-md hover:scale-105 transition-transform" : ""
                }`}
                style={plan.is_popular ? { background: "var(--gradient-primary)" } : {}}
              >
                {isEnterprise ? "Contact Sales" : plan.price === 0 ? "Get Started" : "Upgrade Now"}
              </Button>

              <div className="space-y-4 flex-1">
                <h4 className="text-sm font-medium uppercase tracking-wider text-foreground">
                  What's included:
                </h4>
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          );
        })}
      </div>

      <SalesDrawer 
        isOpen={isSalesDrawerOpen} 
        onOpenChange={setIsSalesDrawerOpen} 
        organizerProfile={organizerProfile}
        workspaces={workspaces}
        activeWorkspace={activeWorkspace}
      />
    </div>
  );
}

function SalesDrawer({ 
  isOpen, 
  onOpenChange,
  organizerProfile,
  workspaces,
  activeWorkspace
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  organizerProfile: any;
  workspaces: any[];
  activeWorkspace: any;
}) {
  const [salesForm, setSalesForm] = useState({ 
    name: "", 
    email: "", 
    company: "", 
    message: "",
    communication: "Email",
    language: "English",
    country: "",
    phone: ""
  });
  const [isSubmittingSales, setIsSubmittingSales] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSalesForm(s => ({
        ...s,
        name: organizerProfile?.name || s.name,
        email: organizerProfile?.email || s.email,
        phone: organizerProfile?.phone || s.phone,
        company: workspaces?.length === 1 ? workspaces[0].name : activeWorkspace?.name || s.company,
      }));
    }
  }, [isOpen, organizerProfile, workspaces, activeWorkspace]);

  const handleCountryChange = (val: string) => {
    const countryObj = COUNTRIES.find((c) => c.name === val);
    const code = countryObj ? countryObj.dialCode : "";
    
    setSalesForm(s => {
      let newPhone = s.phone;
      if (!newPhone || (newPhone.startsWith("+") && newPhone.length <= 6 && code)) {
        newPhone = code + " ";
      }
      return { ...s, country: val, phone: newPhone };
    });
  };

  const handleSalesSubmit = async () => {
    if (!salesForm.name || !salesForm.email || !salesForm.company) {
      toast.error("Please fill in all required fields (Name, Email, Company).");
      return;
    }
    
    setIsSubmittingSales(true);
    try {
      await new Promise(r => setTimeout(r, 1000));
      toast.success("Thank you! Our sales team will contact you shortly.");
      onOpenChange(false);
      setSalesForm({ 
        name: "", email: "", company: "", message: "", 
        communication: "Email", language: "English", country: "", phone: "" 
      });
    } catch (error) {
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmittingSales(false);
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg w-[90vw] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Contact Enterprise Sales</SheetTitle>
          <SheetDescription>
            Fill out the form below and our dedicated sales team will reach out to tailor a custom plan for your large-scale operations.
          </SheetDescription>
        </SheetHeader>
        <div className="py-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sales-name">Full Name *</Label>
              <Input 
                id="sales-name" 
                placeholder="John Doe" 
                value={salesForm.name} 
                onChange={(e) => setSalesForm(s => ({ ...s, name: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-email">Work Email *</Label>
              <Input 
                id="sales-email" 
                type="email" 
                placeholder="john@company.com" 
                value={salesForm.email} 
                onChange={(e) => setSalesForm(s => ({ ...s, email: e.target.value }))} 
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-company">Company Name *</Label>
            {workspaces && workspaces.length > 0 ? (
              <Select value={salesForm.company} onValueChange={(v) => setSalesForm(s => ({ ...s, company: v }))}>
                <SelectTrigger id="sales-company">
                  <SelectValue placeholder="Select a company" />
                </SelectTrigger>
                <SelectContent>
                  {workspaces.map((ws: any) => (
                    <SelectItem key={ws.id} value={ws.name}>
                      {ws.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input 
                id="sales-company" 
                placeholder="Acme Corp" 
                value={salesForm.company} 
                onChange={(e) => setSalesForm(s => ({ ...s, company: e.target.value }))} 
              />
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales-communication">Preferred Contact Method</Label>
              <Select value={salesForm.communication} onValueChange={(v) => setSalesForm(s => ({ ...s, communication: v }))}>
                <SelectTrigger id="sales-communication">
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Email">Email</SelectItem>
                  <SelectItem value="Phone">Phone</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                  <SelectItem value="Zoom">Zoom / Video Call</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-language">Preferred Language</Label>
              <Select value={salesForm.language} onValueChange={(v) => setSalesForm(s => ({ ...s, language: v }))}>
                <SelectTrigger id="sales-language">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="Kinyarwanda">Kinyarwanda</SelectItem>
                  <SelectItem value="Swahili">Swahili</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-country">Country</Label>
            <Select value={salesForm.country} onValueChange={handleCountryChange}>
              <SelectTrigger id="sales-country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                {COUNTRIES.map((country) => (
                  <SelectItem key={country.code} value={country.name}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {(salesForm.communication === "Phone" || salesForm.communication === "WhatsApp") && (
            <div className="space-y-2">
              <Label htmlFor="sales-phone">Phone Number *</Label>
              <Input 
                id="sales-phone" 
                placeholder="+250 788 000 000" 
                value={salesForm.phone} 
                onChange={(e) => setSalesForm(s => ({ ...s, phone: e.target.value }))} 
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="sales-message">How can we help? (Optional)</Label>
            <Textarea 
              id="sales-message" 
              placeholder="Tell us a bit about your event volume and specific needs..." 
              rows={5}
              value={salesForm.message} 
              onChange={(e) => setSalesForm(s => ({ ...s, message: e.target.value }))} 
            />
          </div>
        </div>
        <SheetFooter className="mt-6 flex-row justify-end space-x-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button onClick={handleSalesSubmit} disabled={isSubmittingSales} style={{ background: "var(--gradient-primary)" }}>
            {isSubmittingSales ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</> : "Submit Request"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
