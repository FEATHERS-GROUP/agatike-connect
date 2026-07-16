import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  getPricingPlans,
  getPromotionalRules,
  PricingPlan,
  PromotionalRule,
  createEnterpriseLead,
} from "@/api/billing";
import { getSession } from "@/api/auth";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { COUNTRIES } from "@/lib/countries";
import { Navbar } from "@/components/site/Navbar";
import { Footer } from "@/components/site/Footer";
import { FloatingFeeCalculator } from "@/components/shared/FeeCalculatorModal";
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

import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing Plans — Agatike Connect" },
      {
        name: "description",
        content: "Transparent pricing plans for organizers of all sizes. Start for free.",
      },
    ],
  }),
  component: PublicPricingPage,
});

function PublicPricingPage() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [rules, setRules] = useState<PromotionalRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnnually, setIsAnnually] = useState(false);
  const [isSalesDrawerOpen, setIsSalesDrawerOpen] = useState(false);
  const [organizerProfile, setOrganizerProfile] = useState<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedPlans, fetchedRules, session] = await Promise.all([
          getPricingPlans(),
          getPromotionalRules(),
          getSession().catch(() => null),
        ]);

        // Keep all plans including Basic/Free (price = 0)
        setPlans(fetchedPlans);
        setRules(fetchedRules);

        if (session) {
          setOrganizerProfile({
            id: session.sub,
            email: "",
            name: "",
          });
        }
      } catch (error) {
        console.error("Failed to load plans:", error);
        toast.error("Failed to load pricing plans.");
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSelectPlan = (plan: PricingPlan) => {
    // Navigate to the organizer dashboard subscription page
    navigate({ to: "/dashboard/billing/subscriptions/pricingplans" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col animate-in fade-in duration-300">
        <Navbar />
        <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
          {/* Header Skeleton */}
          <div className="text-center space-y-4 mb-16 flex flex-col items-center">
            <Skeleton className="h-10 w-2/3 sm:w-1/2 md:w-1/3 mb-2 rounded-xl" />
            <Skeleton className="h-6 w-3/4 sm:w-2/3 md:w-1/2 rounded-xl" />
            <div className="pt-6 flex items-center justify-center gap-3">
              <Skeleton className="h-4 w-12 rounded" />
              <Skeleton className="h-6 w-12 rounded-full" />
              <Skeleton className="h-4 w-20 rounded" />
            </div>
          </div>

          {/* Grid Skeleton */}
          <div className="grid md:grid-cols-4 gap-8 items-stretch max-w-7xl mx-auto">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="relative flex flex-col rounded-3xl border border-border/60 bg-card p-8 shadow-[var(--shadow-card)] h-[480px]"
              >
                <div className="mb-6 space-y-3">
                  <Skeleton className="h-6 w-1/3 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-5/6 rounded" />
                    <Skeleton className="h-4 w-2/3 rounded" />
                  </div>
                </div>

                <div className="mb-6 space-y-2 mt-2">
                  <Skeleton className="h-10 w-1/2 rounded-xl" />
                  <Skeleton className="h-3 w-1/3 rounded" />
                </div>

                <Skeleton className="h-11 w-full rounded-full mb-8" />

                <div className="space-y-4 flex-1">
                  <Skeleton className="h-3 w-1/4 rounded mb-2" />
                  <div className="space-y-3">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <div key={j} className="flex items-center gap-3">
                        <Skeleton className="h-4 w-4 rounded-full shrink-0" />
                        <Skeleton className="h-4 w-5/6 rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // Find launch promo
  const launchPromo = rules.find((r) => r.name === "Launch Promo");

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header Section */}
        <div className="text-center space-y-4 mb-16">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-foreground via-foreground/90 to-muted-foreground bg-clip-text text-transparent">
            Simple, transparent pricing
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Choose the perfect plan to grow your community, sell tickets, and manage unforgettable
            experiences.
          </p>

          {/* Toggle between Monthly and Annually */}
          <div className="flex items-center justify-center gap-3 pt-6">
            <Label
              htmlFor="billing-toggle"
              className={`text-sm ${!isAnnually ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              Monthly
            </Label>
            <Switch
              id="billing-toggle"
              checked={isAnnually}
              onCheckedChange={setIsAnnually}
              className="data-[state=checked]:bg-primary"
            />
            <Label
              htmlFor="billing-toggle"
              className={`text-sm flex items-center gap-2 ${isAnnually ? "font-bold text-foreground" : "text-muted-foreground"}`}
            >
              Annually
              <span className="rounded-full bg-primary/20 text-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </Label>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid md:grid-cols-4 gap-8 items-stretch max-w-7xl mx-auto">
          {plans.map((plan) => {
            const isEnterprise = plan.name.toLowerCase().includes("enterprise");
            const isBasic = plan.price === 0;

            let basePrice = plan.price;
            if (isAnnually && basePrice > 0) {
              basePrice = basePrice * 0.8;
            }

            let displayPrice = basePrice;
            let promoText = null;

            if (!isEnterprise && basePrice > 0 && launchPromo) {
              if (isAnnually) {
                // Equivalent promo pricing calculations
                const monthlyEquivalent = basePrice;
                displayPrice = monthlyEquivalent * 0.5 * (3 / 12) + monthlyEquivalent * (9 / 12);
                promoText = `Includes ${launchPromo.name}: ${launchPromo.description}`;
              } else {
                displayPrice = basePrice * (1 - launchPromo.discount_percentage / 100);
                promoText = `${launchPromo.name}: ${launchPromo.discount_percentage}% off for ${launchPromo.duration_months} months!`;
              }
            }

            return (
              <div
                key={plan.id}
                className={`relative flex flex-col rounded-3xl border bg-card p-8 shadow-[var(--shadow-card)] transition-all duration-300 hover:translate-y-[-4px] hover:shadow-lg ${
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
                  <p className="text-sm text-muted-foreground mt-2 min-h-[48px]">
                    {plan.description}
                  </p>
                </div>

                <div className="mb-6 flex flex-col gap-1">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-extrabold tracking-tight">
                      {isEnterprise ? "Custom" : isBasic ? "Free" : `$${displayPrice.toFixed(2)}`}
                    </span>
                    {!isEnterprise && !isBasic && (
                      <span className="text-sm font-medium text-muted-foreground">/mo</span>
                    )}
                  </div>

                  {!isEnterprise && !isBasic && (displayPrice !== basePrice || isAnnually) && (
                    <div className="text-xs text-muted-foreground line-through">
                      ${isAnnually ? (plan.price * 0.8).toFixed(2) : plan.price.toFixed(2)}/mo
                    </div>
                  )}

                  {!isEnterprise && promoText && (
                    <div className="text-[11px] font-semibold text-green-500 bg-green-500/10 px-2 py-1 rounded-md inline-block w-fit mt-1.5">
                      {promoText}
                    </div>
                  )}
                </div>

                <Button
                  onClick={() => {
                    if (isEnterprise) {
                      setIsSalesDrawerOpen(true);
                    } else {
                      handleSelectPlan(plan);
                    }
                  }}
                  variant={plan.is_popular ? "default" : "outline"}
                  className={`w-full rounded-full mb-8 h-11 text-sm font-semibold transition-transform hover:scale-[1.02] ${
                    plan.is_popular ? "shadow-md bg-gradient-to-r from-primary to-primary/95" : ""
                  }`}
                  style={plan.is_popular ? { background: "var(--gradient-primary)" } : {}}
                >
                  {isEnterprise
                    ? "Contact Sales"
                    : isBasic
                      ? "Get Started for Free"
                      : "Choose Plan"}
                </Button>

                <div className="space-y-4 flex-1">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-foreground/90">
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
      </main>

      <SalesDrawer
        isOpen={isSalesDrawerOpen}
        onOpenChange={setIsSalesDrawerOpen}
        organizerProfile={organizerProfile}
      />
      <FloatingFeeCalculator />
      <Footer />
    </div>
  );
}

function SalesDrawer({
  isOpen,
  onOpenChange,
  organizerProfile,
}: {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  organizerProfile: any;
}) {
  const [salesForm, setSalesForm] = useState({
    name: "",
    email: "",
    company: "",
    message: "",
    communication: "Email",
    language: "English",
    country: "",
    phone: "",
  });
  const [isSubmittingSales, setIsSubmittingSales] = useState(false);

  useEffect(() => {
    if (isOpen && organizerProfile) {
      setSalesForm((s) => ({
        ...s,
        name: organizerProfile.name || s.name,
        email: organizerProfile.email || s.email,
      }));
    }
  }, [isOpen, organizerProfile]);

  const handleCountryChange = (val: string) => {
    const countryObj = COUNTRIES.find((c) => c.name === val);
    const code = countryObj ? countryObj.dialCode : "";

    setSalesForm((s) => {
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
      await createEnterpriseLead({
        data: {
          name: salesForm.name,
          email: salesForm.email,
          company: salesForm.company,
          communication_method: salesForm.communication,
          language: salesForm.language,
          country: salesForm.country,
          phone: salesForm.phone,
          message: salesForm.message,
        },
      });
      toast.success("Thank you! Our sales team will contact you shortly.");
      onOpenChange(false);
      setSalesForm({
        name: "",
        email: "",
        company: "",
        message: "",
        communication: "Email",
        language: "English",
        country: "",
        phone: "",
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
            Fill out the form below and our dedicated sales team will reach out to tailor a custom
            plan for your large-scale operations.
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
                onChange={(e) => setSalesForm((s) => ({ ...s, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sales-email">Work Email *</Label>
              <Input
                id="sales-email"
                type="email"
                placeholder="john@company.com"
                value={salesForm.email}
                onChange={(e) => setSalesForm((s) => ({ ...s, email: e.target.value }))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sales-company">Company Name *</Label>
            <Input
              id="sales-company"
              placeholder="Acme Corp"
              value={salesForm.company}
              onChange={(e) => setSalesForm((s) => ({ ...s, company: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sales-communication">Preferred Contact Method</Label>
              <Select
                value={salesForm.communication}
                onValueChange={(v) => setSalesForm((s) => ({ ...s, communication: v }))}
              >
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
              <Select
                value={salesForm.language}
                onValueChange={(v) => setSalesForm((s) => ({ ...s, language: v }))}
              >
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
                onChange={(e) => setSalesForm((s) => ({ ...s, phone: e.target.value }))}
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
              onChange={(e) => setSalesForm((s) => ({ ...s, message: e.target.value }))}
            />
          </div>
        </div>
        <SheetFooter className="mt-6 flex-row justify-end space-x-2">
          <SheetClose asChild>
            <Button variant="outline">Cancel</Button>
          </SheetClose>
          <Button
            onClick={handleSalesSubmit}
            disabled={isSubmittingSales}
            style={{ background: "var(--gradient-primary)" }}
          >
            {isSubmittingSales ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
