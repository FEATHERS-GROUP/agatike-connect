import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getPricingPlans } from "@/api/billing";
import { getAllPaymentProviderFees } from "@/api/pawapay";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function OnboardingSlider() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const { activeWorkspace } = useWorkspace();

  const { data: pricingPlans = [] } = useQuery({
    queryKey: ["pricingPlans"],
    queryFn: async () => await getPricingPlans(),
  });

  const { data: providerFees = [] } = useQuery({
    queryKey: ["providerFees"],
    queryFn: async () => await getAllPaymentProviderFees(),
  });

  useEffect(() => {
    // Small delay to let the dashboard render before showing the popup
    const timer = setTimeout(() => {
      const hasSeen = localStorage.getItem("agatike_has_seen_onboarding");
      if (!hasSeen) {
        setIsOpen(true);
      }
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem("agatike_has_seen_onboarding", "true");
  };

  const nextSlide = () => {
    if (currentSlide < 4) {
      setCurrentSlide(currentSlide + 1);
    } else {
      handleClose();
    }
  };

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  // Calculate highest provider fee based on workspace country or fallback to absolute highest
  // Try to get country from workspace, fallback to "RWA" if none exists yet during onboarding
  const workspaceCountry = activeWorkspace?.country || activeWorkspace?.country_code || "RWA";
  const applicableFees = providerFees.filter((f: any) => f.country_code === workspaceCountry);

  let highestProviderFee = 0;
  let highestProviderFixedFee = 0;

  if (applicableFees.length > 0) {
    const worstProvider = applicableFees.reduce((prev: any, current: any) => {
      const prevPct = Number(prev.disbursement_percentage) || 0;
      const currPct = Number(current.disbursement_percentage) || 0;
      if (currPct > prevPct) return current;
      if (currPct === prevPct) {
        const prevFixed = Number(prev.disbursement_fixed_fee) || 0;
        const currFixed = Number(current.disbursement_fixed_fee) || 0;
        return currFixed > prevFixed ? current : prev;
      }
      return prev;
    }, applicableFees[0]);

    if (worstProvider) {
      highestProviderFee = Number(worstProvider.disbursement_percentage) || 0;
      highestProviderFixedFee = Number(worstProvider.disbursement_fixed_fee) || 0;
    }
  }

  useEffect(() => {
    if (pricingPlans.length > 0 || providerFees.length > 0) {
      console.groupCollapsed("=== Agatike Pricing & Fees Debug ===");
      console.log("Workspace Country:", workspaceCountry || "None (Using All)");
      console.log("Raw Provider Fees pulled:", providerFees);
      console.log("Applicable Provider Fees:", applicableFees);
      console.log("Highest Provider Disbursement % (Network):", highestProviderFee);
      console.log("Pricing Plans (Agatike Collection & Withdrawal):", pricingPlans);
      console.log("Calculated Breakdown for Slider:");
      pricingPlans.forEach((plan: any) => {
        const orgCollection = Number(plan.organizer_collection_fee_percentage) || 0;
        const withdrawalFee = Number(plan.withdrawal_fee_percentage) || 0;
        const orgCollectionFixed = Number(plan.organizer_collection_fee_fixed) || 0;
        const withdrawalFeeFixed = Number(plan.withdrawal_fee_fixed) || 0;
        const totalFixed = orgCollectionFixed + withdrawalFeeFixed + highestProviderFixedFee;
        console.log(
          `- ${plan.name}: ${orgCollection}% (Sale) + ${withdrawalFee}% (Withdraw) + ~${highestProviderFee}% (Network) = ${(orgCollection + withdrawalFee + highestProviderFee).toFixed(1)}% ${totalFixed > 0 ? `+ ${totalFixed} Fixed ` : ""}Total`,
        );
      });
      console.groupEnd();
    }
  }, [pricingPlans, providerFees, workspaceCountry, applicableFees, highestProviderFee]);

  const slides = [
    {
      title: "Welcome to Agatike Connect! 🎉",
      description:
        "Powering the next generation of live experiences. Manage your events, analyze data, and engage your audience all in one unified platform.",
      image: "/illustrations/slide_0.png",
    },
    {
      title: "Ticketing, Badges & Access",
      description:
        "Design custom digital tickets and staff badges. Use our Venue Designer to map seating, and securely scan attendees at the gate with the Agatike Scanner app.",
      image: "/illustrations/slide_1.png",
    },
    {
      title: "Forms, Books & Page Builder",
      description:
        "Gather data using custom RSVP forms. Track expenses and rosters in your Agatike Books, and launch beautiful branded event landing pages without writing code.",
      image: "/illustrations/slide_2.png",
    },
    {
      title: "Unified Wallets & Vendors",
      description:
        "Track all ticket sales, physical merch, and sponsored vouchers in one place. We integrate directly with Mobile Money for seamless customer checkouts.",
      image: "/illustrations/slide_3.png",
    },
    {
      title: "Transparent Pricing",
      description: "",
      image: "/illustrations/slide_4.png",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-4xl p-0 overflow-hidden rounded-[24px] border-0 shadow-2xl bg-white dark:bg-[#0a0a0a]">
        <DialogTitle className="sr-only">Welcome to Agatike Connect</DialogTitle>
        <div className="grid grid-cols-1 md:grid-cols-2 h-[600px]">
          {/* Left Side - Visuals */}
          <div className="hidden md:block bg-gray-50 dark:bg-white/[0.02] border-r border-gray-100 dark:border-white/5 relative h-full min-h-0 overflow-hidden">
            <div className="w-full h-full p-6 flex justify-center items-center">
              <img
                src={slides[currentSlide].image}
                alt={slides[currentSlide].title}
                className="max-w-full max-h-full object-contain rounded-2xl drop-shadow-2xl"
              />
            </div>
          </div>

          {/* Right Side - Content */}
          <div className="flex flex-col h-full min-h-0 overflow-hidden relative">
            <div className="absolute top-6 right-6 flex items-center gap-1.5">
              {[0, 1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentSlide === i ? "w-8 bg-primary" : "w-2 bg-gray-200 dark:bg-white/20"
                  }`}
                />
              ))}
            </div>

            <div
              className={`flex-1 min-h-0 overflow-y-auto p-8 flex flex-col ${currentSlide < 4 ? "justify-center pt-16" : "justify-start pt-10"}`}
            >
              {currentSlide < 4 ? (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500">
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                    {slides[currentSlide].title}
                  </h2>
                  <p className="text-lg text-gray-600 dark:text-white/70 leading-relaxed">
                    {slides[currentSlide].description}
                  </p>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-right-8 duration-500 space-y-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transparent Pricing
                  </h2>
                  <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 text-sm text-gray-700 dark:text-white/80 leading-relaxed">
                    Agatike uses transparent transaction pricing. Fees are calculated based on your
                    selected plan and payment method. Ticket sales fees and payout processing fees
                    are shown clearly before you create your account and before every withdrawal.
                  </div>

                  <div className="text-sm text-gray-600 dark:text-white/60">
                    Most ticket sellers charge a flat 8% fee and keep you in the dark. With Agatike,
                    our percentage is broken down into collection and withdrawal fees, plus your
                    local payment provider's fee.
                  </div>

                  <div className="space-y-3">
                    {pricingPlans.map((plan: any) => {
                      const orgCollection = Number(plan.organizer_collection_fee_percentage) || 0;
                      const withdrawalFee = Number(plan.withdrawal_fee_percentage) || 0;
                      const orgCollectionFixed = Number(plan.organizer_collection_fee_fixed) || 0;
                      const withdrawalFeeFixed = Number(plan.withdrawal_fee_fixed) || 0;

                      const totalRate = (
                        orgCollection +
                        withdrawalFee +
                        highestProviderFee
                      ).toFixed(1);
                      const totalFixed =
                        orgCollectionFixed + withdrawalFeeFixed + highestProviderFixedFee;
                      const isBasic = plan.name.toLowerCase().includes("basic");

                      return (
                        <div
                          key={plan.id}
                          className={`p-4 rounded-xl border ${isBasic ? "border-primary shadow-sm bg-primary/[0.02]" : "border-gray-200 dark:border-white/10"} flex justify-between items-center`}
                        >
                          <div>
                            <div className="font-bold text-gray-900 dark:text-white flex items-center gap-2">
                              {plan.name}
                              {isBasic && (
                                <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                                  Current Plan
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-white/50 mt-1">
                              {orgCollection}% (Sale) per ticket sold +{" "}
                              {parseFloat((withdrawalFee + highestProviderFee).toFixed(1))}%
                              (Withdraw){totalFixed > 0 && ` + ${totalFixed} RWF (Network)`}
                            </div>
                          </div>
                          <div className="text-xl font-extrabold text-primary flex items-end gap-1">
                            {totalRate}%{" "}
                            {totalFixed > 0 && (
                              <span className="text-sm font-medium text-gray-500 pb-0.5">
                                + {totalFixed}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[10px] text-gray-400 text-center">
                    * Customer collection fees are charged directly to the buyer on checkout and are
                    excluded from the above organizer rates.
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-between items-center bg-gray-50/50 dark:bg-white/[0.01]">
              <Button variant="ghost" onClick={handleClose} className="text-gray-500">
                Skip Intro
              </Button>
              <div className="flex gap-2">
                {currentSlide > 0 && (
                  <Button variant="outline" size="icon" onClick={prevSlide}>
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                )}
                <Button
                  onClick={nextSlide}
                  className="px-8 shadow-[0_0_15px_rgba(242,87,29,0.3)] hover:shadow-[0_0_20px_rgba(242,87,29,0.5)] transition-all"
                >
                  {currentSlide === 4 ? "Get Started" : "Next"}
                  {currentSlide < 4 && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
