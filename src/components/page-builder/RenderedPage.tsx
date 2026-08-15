import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { getWorkspaceForms } from "@/api/rsvps";
import { getWorkspaceProducts } from "@/api/products";
import { getWorkspaceEvents } from "@/api/events";
import { getSpaces } from "@/api/spaces";
import { getRentableVenues } from "@/api/rentable_venues";
import { getMovies } from "@/api/cinema_management";
import { Loader2, ArrowRight, Package, X, MapPin, Menu } from "lucide-react";
import { StorefrontFooter } from "./StorefrontFooter";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { EmbeddedForm } from "@/components/page-builder/EmbeddedForm";
import { SpreadsheetEntryForm } from "@/components/page-builder/SpreadsheetEntryForm";
import { DynamicFontLoader } from "./DynamicFontLoader";
import { StaticSubElement } from "./StaticSubElement";
import { PageNotFound } from "./PageNotFound";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useMutation } from "@tanstack/react-query";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { ProductCheckoutSheet } from "@/components/page-builder/ProductCheckoutSheet";
import { FacilityCheckoutSheet } from "@/components/page-builder/FacilityCheckoutSheet";
import { VenueCheckoutSheet } from "@/components/page-builder/VenueCheckoutSheet";
import {
  initiatePawaPayDeposit,
  getPawaPayDepositStatus,
  cancelPendingPayment,
} from "@/api/pawapay";
import { CheckYourPhone } from "@/components/shared/CheckYourPhone";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

export function RenderedPage({
  slug,
  isPreview = false,
  children,
  hideHero = false,
  hideComponents = false,
}: {
  slug: string;
  isPreview?: boolean;
  children?: React.ReactNode;
  hideHero?: boolean;
  hideComponents?: boolean;
}) {
  const [previewData, setPreviewData] = useState<any>(() => {
    if (isPreview && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("page_preview_data");
        if (stored) return JSON.parse(stored);
      } catch (e) {
        console.error("Failed to load preview data", e);
      }
    }
    return null;
  });

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedPaymentBlock, setSelectedPaymentBlock] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("momo");
  const [pawapayDepositId, setPawapayDepositId] = useState<string | null>(null);
  const [isPollingPawaPay, setIsPollingPawaPay] = useState(false);

  const [productCheckoutSheetOpen, setProductCheckoutSheetOpen] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<any>(null);

  const [facilityCheckoutSheetOpen, setFacilityCheckoutSheetOpen] = useState(false);
  const [selectedFacilityForCheckout, setSelectedFacilityForCheckout] = useState<any>(null);
  const [selectedFacilityVenue, setSelectedFacilityVenue] = useState<any>(null);

  const [venueCheckoutSheetOpen, setVenueCheckoutSheetOpen] = useState(false);
  const [selectedVenueForCheckout, setSelectedVenueForCheckout] = useState<any>(null);

  const { data: dbPage, isLoading: isLoadingPage } = useQuery({
    queryKey: ["workspace-page-public", slug],
    queryFn: () => getWorkspacePageBySlug({ data: { slug } } as any),
    enabled: !!slug && !isPreview,
  });

  const page = isPreview ? previewData : dbPage;
  const workspace_id = page?.workspace_id || dbPage?.workspace_id;

  const { data: forms = [] } = useQuery({
    queryKey: ["workspace-forms", workspace_id],
    queryFn: () => getWorkspaceForms({ data: { workspace_id } } as any),
    enabled: !!workspace_id,
  });

  const components = page?.components || [];

  const hasProducts = components.some((c: any) => c.type === "product_list");
  const hasEvents = components.some((c: any) => c.type === "event_list");
  const hasSpaces = components.some((c: any) => c.type === "space_list");
  const hasVenues = components.some((c: any) => c.type === "venue_list");
  const hasMovies = components.some((c: any) => c.type === "movie_list");

  const { data: products = [] } = useQuery({
    queryKey: ["workspace-products", workspace_id],
    queryFn: () => getWorkspaceProducts({ data: { workspace_id } } as any),
    enabled: !!workspace_id && hasProducts,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", workspace_id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id } } as any),
    enabled: !!workspace_id && hasEvents,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["workspace-spaces", workspace_id],
    queryFn: () => getSpaces({ data: { workspace_id } } as any),
    enabled: !!workspace_id && hasSpaces,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["workspace-venues", workspace_id],
    queryFn: () => getRentableVenues({ data: { workspace_id } } as any),
    enabled: !!workspace_id && hasVenues,
  });

  const { data: movies = [] } = useQuery({
    queryKey: ["workspace-movies", workspace_id],
    queryFn: () => getMovies({ data: { workspace_id } } as any),
    enabled: !!workspace_id && hasMovies,
  });

  const [embedUrl, setEmbedUrl] = useState<string | null>(null);

  const { mutate: doPayment, isPending: isProcessingPayment } = useMutation({
    mutationFn: async (paymentDetails?: {
      phone?: string;
      network?: string;
      currency?: string;
      convertedAmount?: number;
      shortfall?: number;
    }) => {
      const isPawaPay =
        paymentMethod === "momo" && paymentDetails?.phone && paymentDetails?.network;

      if (!isPawaPay || !selectedPaymentBlock) throw new Error("Invalid payment details");
      const baseAmount = Number(selectedPaymentBlock.amount || 0);

      const pawaRes = await initiatePawaPayDeposit({
        data: {
          amount: paymentDetails?.convertedAmount || baseAmount,
          baseAmount: baseAmount,
          baseCurrency: "RWF",
          phone: paymentDetails!.phone,
          network: paymentDetails!.network,
          currency: paymentDetails?.currency || "RWF",
          type: `page_builder_checkout::${slug}`,
          referenceId: crypto.randomUUID(),
          workspaceId: workspace_id,
          reason: selectedPaymentBlock.label || "Page Payment",
          shortfall: paymentDetails?.shortfall || 0,
        },
      } as any);

      return { isPawaPay: true, depositId: pawaRes.depositId };
    },
    onSuccess: (data: any) => {
      if (data.isPawaPay) {
        setPawapayDepositId(data.depositId);
        setIsPollingPawaPay(true);
        setPaymentModalOpen(false);
      }
    },
    onError: (e: any) => {
      toast.error(e.message || "Payment failed");
    },
  });

  useEffect(() => {
    if (!isPollingPawaPay || !pawapayDepositId) return;

    let done = false;

    const intervalId = setInterval(async () => {
      if (done) return;
      try {
        const res = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
        if (
          res?.status?.toLowerCase() === "completed" ||
          res?.status?.toLowerCase() === "success"
        ) {
          if (done) return;
          done = true;
          clearInterval(intervalId);
          setIsPollingPawaPay(false);
          toast.success("Payment successful!");
        } else if (res?.status?.toLowerCase() === "failed") {
          if (done) return;
          done = true;
          clearInterval(intervalId);
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => {
      done = true;
      clearInterval(intervalId);
    };
  }, [isPollingPawaPay, pawapayDepositId]);

  // isPollingPawaPay will be rendered as an overlay to prevent full page remounts

  useEffect(() => {
    if (page) {
      document.title = page.title || "Page Builder";
      if (page.logo_url) {
        let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
        if (!link) {
          link = document.createElement("link");
          link.rel = "icon";
          document.head.appendChild(link);
        }
        link.href = page.logo_url;
      }
    }
  }, [page]);

  if (isLoadingPage && !isPreview) {
    if (children) {
      return <div className="min-h-screen bg-background">{children}</div>;
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Prevent direct access to subpages as if they were parent pages
  if (!page || (!isPreview && page.parent_id && !slug?.includes("/"))) {
    return <PageNotFound />;
  }

  // Prevent access if the organizer is blocked or subscription is expired (unless in preview)
  if (!isPreview && (page.organizer_active === false || page.is_expired === true)) {
    return (
      <PageNotFound
        isBlocked={page.organizer_active === false}
        isExpired={page.is_expired === true}
      />
    );
  }

  const { title, description, header_image_url } = page;

  // Uniform branding: inherit theme and logo from parent
  const theme_color = page.parent?.theme_color || page.theme_color || "#000000";
  const logo_url = page.parent?.logo_url || page.logo_url;
  const currency = page.currency || page.parent?.currency || page.workspaces?.currency || "RWF";

  const settingsBlock = components?.find((c: any) => c.type === "page_settings");
  const parentSettingsBlock = page.parent?.components?.find((c: any) => c.type === "page_settings");

  // Uniform navbar & background: inherit style, font, and bg from parent
  const logoPosition = parentSettingsBlock?.logoPosition || settingsBlock?.logoPosition || "hero";
  const navbarStyle =
    parentSettingsBlock?.navbarStyle || settingsBlock?.navbarStyle || "transparent";
  const navbarBackgroundColor =
    parentSettingsBlock?.navbarBackgroundColor || settingsBlock?.navbarBackgroundColor || "";
  const navbarTextColor =
    parentSettingsBlock?.navbarTextColor || settingsBlock?.navbarTextColor || "";
  const navbarAlignment =
    parentSettingsBlock?.navbarAlignment || settingsBlock?.navbarAlignment || "right";
  const fontFamily = parentSettingsBlock?.fontFamily || settingsBlock?.fontFamily || "Inter";
  const pageBackgroundColor =
    parentSettingsBlock?.pageBackgroundColor || settingsBlock?.pageBackgroundColor || "#ffffff";
  const pageBackgroundImageUrl =
    parentSettingsBlock?.pageBackgroundImageUrl || settingsBlock?.pageBackgroundImageUrl || "";
  const pageTextColor =
    parentSettingsBlock?.pageTextColor || settingsBlock?.pageTextColor || "#000000";

  // Hero settings remain specific to the sub-page
  const heroAlign = settingsBlock?.heroAlign || "center";
  const heroOverlayColor = settingsBlock?.heroOverlayColor || "#000000";
  const heroOverlayOpacity = settingsBlock?.heroOverlayOpacity ?? 40;
  const heroButtonText = settingsBlock?.heroButtonText || "";
  const heroButtonActionType = settingsBlock?.heroButtonActionType || "url";
  const heroButtonLink = settingsBlock?.heroButtonLink || "";
  const heroForegroundImageUrl = settingsBlock?.heroForegroundImageUrl || "";
  const shouldHideHero = hideHero || settingsBlock?.hideHero || false;
  const heroForegroundPosition = settingsBlock?.heroForegroundPosition || "right";
  const elementShape = settingsBlock?.elementShape || "rounded-2xl";

  const actualComponents = components?.filter((c: any) => c.type !== "page_settings") || [];

  const activeForms = forms.filter((f: any) => f.is_active);

  // Generate menu links
  const menuLinks = actualComponents
    .filter((comp: any) => comp.menuName?.trim())
    .map((comp: any) => ({
      name: comp.menuName.trim(),
      id: `section-${comp.id}`,
    }));

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Generate site links for multi-page hierarchy
  const siteLinks: { name: string; url: string; isActive: boolean }[] = [];
  let siteTitle = title;

  if (page?.parent) {
    siteTitle = page.parent.title || "Home";
    siteLinks.push({ name: "Home", url: `/p/${page.parent.slug}`, isActive: false });
    if (page.parent.children) {
      page.parent.children.forEach((child: any) => {
        siteLinks.push({
          name: child.title || "Untitled",
          url: `/p/${child.slug}`,
          isActive: child.slug === slug,
        });
      });
    }
  } else if (page?.children && page.children.length > 0) {
    siteTitle = page.title || "Home";
    siteLinks.push({ name: "Home", url: `/p/${page.slug}`, isActive: true });
    page.children.forEach((child: any) => {
      siteLinks.push({ name: child.title || "Untitled", url: `/p/${child.slug}`, isActive: false });
    });
  }

  const hasNavbar = logoPosition === "navbar" || menuLinks.length > 0 || siteLinks.length > 0;

  // Generate Google Fonts URL based on selected font
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, "+")}:wght@400;500;600;700;800&display=swap`;

  return (
    <>
      <style>{`@import url('${googleFontUrl}');`}</style>
      <DynamicFontLoader components={actualComponents} />
      <div
        className="min-h-screen"
        style={
          {
            "--primary": theme_color,
            "--primary-foreground": "#fff",
            "--custom-theme-color": theme_color,
            fontFamily: `'${fontFamily}', sans-serif`,
            backgroundColor: pageBackgroundColor,
            backgroundImage: pageBackgroundImageUrl ? `url(${pageBackgroundImageUrl})` : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundAttachment: "fixed",
            color: pageTextColor,
          } as React.CSSProperties
        }
      >
        {/* Sticky Navbar */}
        {hasNavbar && (
          <nav
            className={
              navbarStyle === "transparent"
                ? "absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-b border-white/10"
                : "sticky top-0 z-50 w-full backdrop-blur-xl border-b border-border/40 shadow-sm transition-all"
            }
            style={
              navbarStyle !== "transparent" && navbarBackgroundColor
                ? { backgroundColor: navbarBackgroundColor }
                : {}
            }
          >
            <div
              className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center ${navbarAlignment === "center" ? "justify-between relative" : "justify-between"}`}
            >
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center z-10">
                {logoPosition === "navbar" && logo_url ? (
                  <a href={siteLinks.length > 0 ? siteLinks[0].url : "#"}>
                    <img src={logo_url} alt="Logo" className="h-10 w-auto object-contain rounded" />
                  </a>
                ) : logoPosition === "navbar" && siteTitle ? (
                  <a
                    href={siteLinks.length > 0 ? siteLinks[0].url : "#"}
                    className={`font-bold text-xl tracking-tight truncate max-w-[200px] transition-colors`}
                    style={{
                      color:
                        navbarStyle !== "transparent" && navbarTextColor
                          ? navbarTextColor
                          : undefined,
                    }}
                  >
                    {siteTitle}
                  </a>
                ) : (
                  <div />
                )}
              </div>

              {/* Menu Links - Desktop */}
              <div
                className={`hidden md:flex items-center gap-6 z-10 ${
                  navbarAlignment === "center"
                    ? "absolute left-1/2 -translate-x-1/2"
                    : navbarAlignment === "left"
                      ? "flex-1 ml-8 justify-start"
                      : "flex-1 justify-end"
                }`}
              >
                {siteLinks.map((link: any) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className={`text-sm font-medium transition-colors whitespace-nowrap`}
                    style={{
                      color:
                        navbarStyle !== "transparent" && navbarTextColor
                          ? navbarTextColor
                          : navbarStyle === "transparent"
                            ? "rgba(255,255,255,0.9)"
                            : "inherit",
                    }}
                  >
                    {link.name}
                  </a>
                ))}

                {menuLinks.length > 0 && siteLinks.length > 0 && (
                  <div
                    className="w-px h-4 mx-2"
                    style={{
                      backgroundColor:
                        navbarStyle !== "transparent" && navbarTextColor
                          ? navbarTextColor
                          : "rgba(0,0,0,0.2)",
                    }}
                  />
                )}

                {menuLinks.map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap`}
                    style={{
                      color:
                        navbarStyle !== "transparent" && navbarTextColor
                          ? navbarTextColor
                          : navbarStyle === "transparent"
                            ? "rgba(255,255,255,0.9)"
                            : "inherit",
                    }}
                  >
                    {link.name}
                  </button>
                ))}
              </div>

              {/* Menu Links - Mobile */}
              <div className="md:hidden flex items-center z-10">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={
                        navbarStyle === "transparent"
                          ? "text-white hover:text-white hover:bg-white/10"
                          : ""
                      }
                      style={{
                        color:
                          navbarStyle !== "transparent" && navbarTextColor
                            ? navbarTextColor
                            : undefined,
                      }}
                    >
                      <Menu className="h-6 w-6" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="right" className="w-[85vw] max-w-[350px] p-6">
                    <SheetTitle className="text-lg font-bold mb-6 text-left">
                      {siteTitle || "Menu"}
                    </SheetTitle>
                    <div className="flex flex-col gap-6">
                      {siteLinks.map((link: any) => (
                        <a
                          key={link.url}
                          href={link.url}
                          className={`text-lg font-medium transition-colors ${
                            link.isActive
                              ? "text-primary"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          {link.name}
                        </a>
                      ))}
                      {menuLinks.length > 0 && siteLinks.length > 0 && (
                        <div className="h-px w-full bg-border" />
                      )}
                      {menuLinks.map((link: any) => (
                        <button
                          key={link.id}
                          onClick={() => scrollToSection(link.id)}
                          className="text-lg font-medium transition-colors text-left text-muted-foreground hover:text-foreground"
                        >
                          {link.name}
                        </button>
                      ))}
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </nav>
        )}

        {selectedPaymentBlock && (
          <PaymentModal
            isOpen={paymentModalOpen}
            onOpenChange={setPaymentModalOpen}
            paymentMethod={paymentMethod}
            setPaymentMethod={setPaymentMethod}
            isProcessing={isProcessingPayment}
            isGenerating={false}
            workspaceId={workspace_id}
            baseAmount={Number(selectedPaymentBlock.amount || 0)}
            itemLabel={selectedPaymentBlock.label || "Payment"}
            onProceed={(details) => {
              doPayment(details);
            }}
          />
        )}

        {/* Header Overlay Section */}
        {!shouldHideHero && (
          <div
            className={`relative w-full min-h-[50vh] md:min-h-[60vh] bg-secondary overflow-hidden flex flex-col p-8 md:p-16 ${
              heroAlign === "top-left"
                ? "justify-start items-start text-left"
                : heroAlign === "top-center"
                  ? "justify-start items-center text-center"
                  : heroAlign === "top-right"
                    ? "justify-start items-end text-right"
                    : heroAlign === "center-left"
                      ? "justify-center items-start text-left"
                      : heroAlign === "center"
                        ? "justify-center items-center text-center"
                        : heroAlign === "center-right"
                          ? "justify-center items-end text-right"
                          : heroAlign === "bottom-left"
                            ? "justify-end items-start text-left"
                            : heroAlign === "bottom-center"
                              ? "justify-end items-center text-center"
                              : "justify-end items-end text-right"
            } ${navbarStyle === "transparent" && hasNavbar ? "pt-24 md:pt-32" : ""}`}
          >
            {header_image_url ? (
              <img
                src={header_image_url}
                alt="Cover"
                className="absolute inset-0 w-full h-full object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
            )}

            {/* Overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundColor: heroOverlayColor,
                opacity: heroOverlayOpacity / 100,
              }}
            />

            <div
              className={`relative z-10 w-full max-w-5xl mx-auto flex items-center gap-8 ${
                heroForegroundImageUrl && heroForegroundPosition === "left"
                  ? "flex-row-reverse"
                  : ""
              }`}
            >
              <div
                className={`flex flex-col space-y-4 md:space-y-6 flex-1 ${
                  heroAlign.includes("left")
                    ? "items-start text-left"
                    : heroAlign.includes("right")
                      ? "items-end text-right"
                      : "items-center text-center"
                }`}
              >
                {logoPosition === "hero" && logo_url && (
                  <img src={logo_url} alt="Logo" className="h-20 w-auto object-contain rounded" />
                )}
                {logoPosition === "hero" && siteTitle && !logo_url && (
                  <h1 className="text-4xl font-black text-white tracking-tight">{siteTitle}</h1>
                )}
                {title && (
                  <h1 className="text-4xl md:text-5xl lg:text-7xl font-black text-white leading-tight">
                    {title}
                  </h1>
                )}
                {description && (
                  <p className="text-lg md:text-2xl text-white/90 font-medium max-w-2xl">
                    {description}
                  </p>
                )}

                {/* Hero Button Action */}
                {heroButtonText && (
                  <div className="mt-8">
                    {heroButtonActionType === "url" && (
                      <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                        style={{ background: theme_color, color: "#fff" }}
                      >
                        <a href={heroButtonLink} target="_blank" rel="noreferrer">
                          {heroButtonText}
                        </a>
                      </Button>
                    )}
                    {heroButtonActionType === "form" && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            size="lg"
                            className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
                            style={{ background: theme_color, color: "#fff" }}
                          >
                            {heroButtonText}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                          <DialogTitle className="sr-only">Form</DialogTitle>
                          <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                            {activeForms.find((f: any) => f.id === heroButtonLink) ? (
                              <EmbeddedForm formId={heroButtonLink} />
                            ) : (
                              <div className="p-12 text-center">
                                <h3 className="text-2xl font-bold">Form not found</h3>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                    {heroButtonActionType === "payment" && (
                      <Button
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
                        style={{ background: theme_color, color: "#fff" }}
                        onClick={() => {
                          const pBlock = actualComponents.find(
                            (c: any) => c.type === "payment_button" && c.id === heroButtonLink,
                          );
                          if (pBlock) {
                            setSelectedPaymentBlock(pBlock);
                            setPaymentModalOpen(true);
                          }
                        }}
                      >
                        {heroButtonText}
                      </Button>
                    )}
                    {heroButtonActionType === "section" && (
                      <Button
                        size="lg"
                        className="rounded-full px-8 py-6 text-lg font-bold shadow-xl hover:shadow-2xl hover:scale-105 transition-all cursor-pointer"
                        style={{ background: theme_color, color: "#fff" }}
                        onClick={() => scrollToSection(`section-${heroButtonLink}`)}
                      >
                        {heroButtonText}
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {heroForegroundImageUrl && (
                <div
                  className={`hidden md:block flex-1 flex ${heroForegroundPosition === "left" ? "justify-start" : "justify-end"}`}
                >
                  <img
                    src={heroForegroundImageUrl}
                    alt="Hero Foreground"
                    className="max-h-[400px] w-auto object-contain drop-shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {children ? (
          children
        ) : (
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
            {/* Dynamic Components */}
            <div className="space-y-16 md:space-y-24">
              {!hideComponents &&
                actualComponents?.map((comp: any) => {
                  const wrap = (
                    subKey: string,
                    child: React.ReactNode,
                    defaultWidth = "100%",
                    defaultHeight = "auto",
                    defaultPadding = "0px",
                    defaultRadius = "0px",
                    defaultBackgroundColor?: string,
                  ) => {
                    return (
                      <StaticSubElement
                        comp={comp}
                        subKey={subKey}
                        defaultWidth={defaultWidth}
                        defaultHeight={defaultHeight}
                        defaultPadding={defaultPadding}
                        defaultRadius={defaultRadius}
                        defaultBackgroundColor={defaultBackgroundColor}
                      >
                        {child}
                      </StaticSubElement>
                    );
                  };

                  const renderComponent = () => {
                    if (comp.type === "text") {
                      return (
                        <div key={comp.id} className="w-full">
                          {wrap(
                            "text",
                            <div className="w-full h-full text-base md:text-lg">
                              <p className="whitespace-pre-wrap m-0">{comp.content}</p>
                            </div>,
                            "100%",
                            "auto",
                            "24px",
                            "16px",
                          )}
                        </div>
                      );
                    }

                    if (comp.type === "image" && comp.url) {
                      return (
                        <div key={comp.id} className="w-full">
                          {wrap(
                            "img",
                            <img
                              src={comp.url}
                              alt="Content"
                              className="w-full h-full object-cover"
                            />,
                            "100%",
                            "400px",
                            "0px",
                            "16px",
                          )}
                        </div>
                      );
                    }

                    if (comp.type === "split_block") {
                      return (
                        <div key={comp.id} className="w-full relative group">
                          {wrap(
                            "split_wrapper",
                            <div
                              className={`flex flex-col md:flex-row gap-4 items-center w-full h-full ${comp.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}
                            >
                              {comp.imageUrl && (
                                <div className="flex-1 w-full h-full">
                                  {wrap(
                                    "split_image",
                                    <img
                                      src={comp.imageUrl}
                                      alt="Split Content"
                                      className="w-full h-full object-cover"
                                    />,
                                    "100%",
                                    "100%",
                                    "0px",
                                    "16px",
                                  )}
                                </div>
                              )}
                              {comp.text && (
                                <div className="flex-1 w-full h-full">
                                  {wrap(
                                    "split_text",
                                    <div className="w-full h-full flex flex-col justify-center text-sm md:text-base">
                                      <p className="whitespace-pre-wrap m-0">{comp.text}</p>
                                    </div>,
                                    "100%",
                                    "100%",
                                    "24px",
                                    "0px",
                                  )}
                                </div>
                              )}
                            </div>,
                            "100%",
                            "auto",
                            "16px",
                            "16px",
                            "#ffffff",
                          )}
                        </div>
                      );
                    }

                    if (comp.type === "button") {
                      return (
                        <div key={comp.id} className="w-full flex justify-center py-4">
                          {wrap(
                            "button",
                            <Button
                              asChild
                              size="lg"
                              className="w-full h-full shadow-lg text-white"
                            >
                              <a href={comp.url} target="_blank" rel="noreferrer">
                                {comp.label || "Click Here"}
                              </a>
                            </Button>,
                            "200px",
                            "56px",
                            "0px",
                            "9999px",
                            theme_color,
                          )}
                        </div>
                      );
                    }

                    if (comp.type === "form_grid" && comp.cards?.length > 0) {
                      const c = parseInt(comp.columns) || 2;
                      let gridCols = "grid-cols-1 md:grid-cols-2";
                      switch (c) {
                        case 1:
                          gridCols = "grid-cols-1";
                          break;
                        case 2:
                          gridCols = "grid-cols-1 md:grid-cols-2";
                          break;
                        case 3:
                          gridCols = "grid-cols-1 md:grid-cols-3";
                          break;
                        case 4:
                          gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
                          break;
                        case 5:
                          gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-5";
                          break;
                        case 6:
                          gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-6";
                          break;
                        case 7:
                          gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-7";
                          break;
                        case 8:
                          gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-8";
                          break;
                        case 9:
                          gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-9";
                          break;
                        case 10:
                          gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-10";
                          break;
                        case 11:
                          gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-11";
                          break;
                        case 12:
                          gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-12";
                          break;
                      }

                      return (
                        <div key={comp.id} className={`grid ${gridCols} gap-6 md:gap-8`}>
                          {comp.cards.map((card: any, idx: number) => {
                            let linkedForm = activeForms.find((f: any) => f.id === card.formId);

                            if (!linkedForm && isPreview) {
                              linkedForm = {
                                id: "preview-id",
                                title: "Select a Form",
                                description: "Please select a form in the editor to link it here.",
                                cover_image_url: "",
                              };
                            }
                            if (!linkedForm) return null;

                            return (
                              <div key={idx} className="flex h-full">
                                {wrap(
                                  "card_item",
                                  <div
                                    className={`border border-border/60 p-6 hover:border-primary/50 transition-all duration-300 flex flex-col h-full group ${elementShape}`}
                                    style={{
                                      backgroundColor: comp.cardBgColor || "var(--card)",
                                      color: comp.cardTextColor || "inherit",
                                    }}
                                  >
                                    <div className="flex items-start justify-between mb-4 w-full">
                                      {wrap(
                                        "card_item_title",
                                        <h3 className="text-2xl font-bold group-hover:opacity-80 transition-opacity m-0">
                                          {card.customTitle || linkedForm.title}
                                        </h3>,
                                        "100%",
                                        "auto",
                                        "0px",
                                        "0px",
                                      )}
                                      {linkedForm.cover_image_url &&
                                        wrap(
                                          "card_item_image",
                                          <div
                                            className={`w-16 h-16 overflow-hidden shrink-0 ml-4 hidden sm:block ${elementShape}`}
                                          >
                                            <img
                                              src={linkedForm.cover_image_url}
                                              alt={linkedForm.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>,
                                          "64px",
                                          "64px",
                                          "0px",
                                          "0px",
                                        )}
                                    </div>

                                    {card.bulletPoints ? (
                                      wrap(
                                        "card_item_desc",
                                        <div className="prose prose-sm dark:prose-invert mb-8 flex-1 whitespace-pre-wrap w-full">
                                          {card.bulletPoints}
                                        </div>,
                                        "100%",
                                        "auto",
                                        "0px",
                                        "0px",
                                      )
                                    ) : linkedForm.description ? (
                                      wrap(
                                        "card_item_desc",
                                        <p className="line-clamp-3 mb-8 flex-1 w-full m-0">
                                          {linkedForm.description}
                                        </p>,
                                        "100%",
                                        "auto",
                                        "0px",
                                        "0px",
                                      )
                                    ) : (
                                      <div className="flex-1" />
                                    )}

                                    {wrap(
                                      "card_item_button",
                                      comp.openAction === "modal" ? (
                                        <Dialog>
                                          <DialogTrigger asChild>
                                            <Button
                                              className="w-full rounded-full mt-auto group-hover:shadow-md transition-all text-white"
                                              style={{ background: theme_color }}
                                            >
                                              {card.buttonLabel || "Register"}{" "}
                                              <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                          </DialogTrigger>
                                          <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                            <DialogTitle className="sr-only">Form</DialogTitle>
                                            <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                                              <EmbeddedForm formId={linkedForm.id} />
                                            </div>
                                          </DialogContent>
                                        </Dialog>
                                      ) : comp.openAction === "drawer" ? (
                                        <Sheet>
                                          <SheetTrigger asChild>
                                            <Button
                                              className="w-full rounded-full mt-auto group-hover:shadow-md transition-all text-white"
                                              style={{ background: theme_color }}
                                            >
                                              {card.buttonLabel || "Register"}{" "}
                                              <ArrowRight className="w-4 h-4 ml-2" />
                                            </Button>
                                          </SheetTrigger>
                                          <SheetContent
                                            side="right"
                                            className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0"
                                          >
                                            <SheetTitle className="sr-only">Form</SheetTitle>
                                            <div className="h-full relative bg-background">
                                              <EmbeddedForm formId={linkedForm.id} />
                                            </div>
                                          </SheetContent>
                                        </Sheet>
                                      ) : (
                                        <Button
                                          asChild
                                          className="w-full rounded-full mt-auto group-hover:shadow-md transition-all text-white"
                                          style={{ background: theme_color }}
                                        >
                                          <Link to={`/f/${linkedForm.id}` as any}>
                                            {card.buttonLabel || "Register"}{" "}
                                            <ArrowRight className="w-4 h-4 ml-2" />
                                          </Link>
                                        </Button>
                                      ),
                                      "100%",
                                      "auto",
                                      "0px",
                                      "9999px",
                                      theme_color,
                                    )}
                                  </div>,
                                  "100%",
                                  "100%",
                                  "0px",
                                  "16px",
                                  comp.cardBgColor || "var(--card)",
                                )}
                              </div>
                            );
                          })}
                        </div>
                      );
                    }

                    if (comp.type === "sponsor_logos" && comp.logos?.length > 0) {
                      return (
                        <div key={comp.id} className="py-8">
                          {comp.title && (
                            <h3 className="text-2xl font-bold text-center mb-8">{comp.title}</h3>
                          )}
                          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-6 md:gap-10 items-center justify-items-center opacity-80 hover:opacity-100 transition-opacity">
                            {comp.logos.map((logo: any, idx: number) => (
                              <div
                                key={idx}
                                className="w-full max-w-[120px] aspect-video flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300"
                              >
                                <img
                                  src={logo.url}
                                  alt="Sponsor Logo"
                                  className="max-w-full max-h-full object-contain"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    }

                    const isFormLink = comp.type === "form_link" && comp.content;
                    const isPaymentForm =
                      comp.type === "payment_button" &&
                      comp.connectedFormId &&
                      comp.connectedFormId !== "none";

                    if (isFormLink || isPaymentForm) {
                      const targetFormId = isPaymentForm ? comp.connectedFormId : comp.content;
                      let linkedForm = activeForms.find((f: any) => f.id === targetFormId);

                      if (!linkedForm && isPreview) {
                        linkedForm = {
                          id: "preview-id",
                          title: "Select a Form",
                          description: "Please select a form in the editor to link it here.",
                          cover_image_url: "",
                        };
                      }

                      if (!linkedForm) return null;

                      const paymentConfig = isPaymentForm
                        ? {
                            amount: comp.amount,
                            label: comp.label || "Pay & Register",
                            description: comp.description,
                            workspace_id: workspace_id,
                            theme_color: theme_color,
                            slug: slug,
                          }
                        : undefined;

                      const embeddedFormProps = {
                        formId: linkedForm.id,
                        paymentConfig,
                        styleConfig: {
                          cardBgColor: comp.cardBgColor,
                          cardTextColor: comp.cardTextColor,
                          columns: comp.columns,
                        },
                      };

                      if (comp.design === "embedded") {
                        return (
                          <div key={comp.id} className="w-full">
                            <EmbeddedForm {...embeddedFormProps} />
                          </div>
                        );
                      }

                      const actualOpenAction =
                        isPaymentForm && (comp.openAction === "page" || !comp.openAction)
                          ? "page"
                          : comp.openAction || "page";

                      // Build query string for payment config when navigating to a new page
                      const paymentQueryString = isPaymentForm
                        ? `?pay=1&amount=${encodeURIComponent(comp.amount || "")}&label=${encodeURIComponent(comp.label || "")}&description=${encodeURIComponent(comp.description || "")}&workspace_id=${encodeURIComponent(workspace_id || "")}&color=${encodeURIComponent(theme_color || "")}&slug=${encodeURIComponent(slug || "")}`
                        : "";

                      const displayTitle =
                        (isPaymentForm ? comp.label || comp.title : null) || linkedForm.title;
                      const displayDesc =
                        (isPaymentForm ? comp.description : null) || linkedForm.description;

                      if (comp.design === "button") {
                        const buttonContent = (
                          <Button
                            size="lg"
                            className="rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
                            style={{ background: theme_color }}
                          >
                            {displayTitle} <ArrowRight className="w-5 h-5 ml-2 md:ml-3 shrink-0" />
                          </Button>
                        );

                        let contentWrapper = buttonContent;
                        if (actualOpenAction === "modal") {
                          contentWrapper = (
                            <Dialog>
                              <DialogTrigger asChild>{buttonContent}</DialogTrigger>
                              <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                <DialogTitle className="sr-only">Form</DialogTitle>
                                <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                                  <EmbeddedForm formId={linkedForm.id} />
                                </div>
                              </DialogContent>
                            </Dialog>
                          );
                        } else if (actualOpenAction === "drawer") {
                          contentWrapper = (
                            <Sheet>
                              <SheetTrigger asChild>{buttonContent}</SheetTrigger>
                              <SheetContent
                                side="right"
                                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0"
                              >
                                <SheetTitle className="sr-only">Form</SheetTitle>
                                <div className="h-full relative bg-background">
                                  <EmbeddedForm formId={linkedForm.id} />
                                </div>
                              </SheetContent>
                            </Sheet>
                          );
                        } else {
                          contentWrapper = (
                            <a href={`/f/${linkedForm.id}${paymentQueryString}`}>{buttonContent}</a>
                          );
                        }

                        return (
                          <div key={comp.id} className="flex justify-center w-full px-4 group">
                            {contentWrapper}
                          </div>
                        );
                      }

                      const cardContent = (
                        <div
                          className={`bg-card border border-border/60 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row items-center gap-6 ${elementShape} cursor-pointer w-full text-left`}
                          style={{
                            backgroundColor: comp.backgroundColor || undefined,
                            borderRadius: comp.borderRadius ? `${comp.borderRadius}px` : undefined,
                            padding: comp.padding ? `${comp.padding}rem` : "1.5rem",
                            color: comp.color || undefined,
                          }}
                        >
                          {linkedForm.cover_image_url
                            ? wrap(
                                "form_image",
                                <div
                                  className={`w-full md:w-48 h-32 overflow-hidden shrink-0 ${elementShape}`}
                                >
                                  <img
                                    src={linkedForm.cover_image_url}
                                    alt={linkedForm.title}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                  />
                                </div>,
                                "192px",
                                "128px",
                                "0px",
                                "0px",
                              )
                            : wrap(
                                "form_image",
                                <div
                                  className={`w-full md:w-48 h-32 bg-primary/10 flex items-center justify-center shrink-0 ${elementShape}`}
                                >
                                  <span className="text-4xl font-bold text-primary/30">
                                    {linkedForm.title.charAt(0)}
                                  </span>
                                </div>,
                                "192px",
                                "128px",
                                "0px",
                                "0px",
                              )}
                          <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full min-w-0">
                            {wrap(
                              "form_title",
                              <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors m-0 w-full">
                                {displayTitle}
                              </h3>,
                              "100%",
                              "auto",
                              "0px",
                              "0px",
                            )}
                            {displayDesc &&
                              wrap(
                                "form_desc",
                                <p className="text-muted-foreground line-clamp-2 mb-4 w-full m-0">
                                  {displayDesc}
                                </p>,
                                "100%",
                                "auto",
                                "0px",
                                "0px",
                              )}
                            {wrap(
                              "form_button",
                              <Button
                                className="mt-4 md:mt-auto !rounded-full w-fit md:w-full px-8 py-2"
                                style={{ background: theme_color }}
                              >
                                Fill Form <ArrowRight className="w-4 h-4 ml-2 shrink-0" />
                              </Button>,
                              "auto",
                              "auto",
                              "0px",
                              "9999px",
                              theme_color,
                            )}
                          </div>
                        </div>
                      );

                      if (actualOpenAction === "modal") {
                        return (
                          <div key={comp.id} className="group">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="w-full text-left focus:outline-none"
                                >
                                  {cardContent}
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                <DialogTitle className="sr-only">Form</DialogTitle>
                                <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                                  <EmbeddedForm {...embeddedFormProps} />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        );
                      } else if (actualOpenAction === "drawer") {
                        return (
                          <div key={comp.id} className="group">
                            <Sheet>
                              <SheetTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="w-full text-left focus:outline-none"
                                >
                                  {cardContent}
                                </div>
                              </SheetTrigger>
                              <SheetContent
                                side="right"
                                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0"
                              >
                                <SheetTitle className="sr-only">Form</SheetTitle>
                                <div className="h-full relative bg-background">
                                  <EmbeddedForm {...embeddedFormProps} />
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        );
                      } else {
                        return (
                          <a
                            key={comp.id}
                            href={`/f/${linkedForm.id}${paymentQueryString}`}
                            className="block group"
                          >
                            {cardContent}
                          </a>
                        );
                      }
                    }

                    if (
                      comp.type === "payment_button" &&
                      (!comp.connectedFormId || comp.connectedFormId === "none")
                    ) {
                      return (
                        <div
                          key={comp.id}
                          className="flex flex-col items-center justify-center w-full px-4 py-8"
                        >
                          {wrap(
                            "payment_btn",
                            comp.paymentLink ? (
                              <a
                                href={comp.paymentLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-full h-full text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center justify-center gap-1 block"
                                style={{ background: theme_color }}
                              >
                                <span>{comp.label || "Pay Now"}</span>
                                {comp.amount && (
                                  <span className="text-sm opacity-90">{comp.amount} {currency}</span>
                                )}
                              </a>
                            ) : (
                              <Button
                                className="w-full h-full text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center justify-center gap-1"
                                style={{ background: theme_color }}
                                onClick={() => {
                                  setSelectedPaymentBlock(comp);
                                  setPaymentModalOpen(true);
                                }}
                              >
                                <span>{comp.label || "Pay Now"}</span>
                                {comp.amount && (
                                  <span className="text-sm font-normal opacity-90">
                                    {comp.amount} RWF
                                  </span>
                                )}
                              </Button>
                            ),
                            "250px",
                            "64px",
                            "0px",
                            "9999px",
                            theme_color,
                          )}
                          {comp.description &&
                            wrap(
                              "payment_desc",
                              <p className="mt-6 text-base text-muted-foreground text-center w-full m-0">
                                {comp.description}
                              </p>,
                              "100%",
                              "auto",
                              "0px",
                              "0px",
                            )}
                        </div>
                      );
                    }

                    if (comp.type === "qr_code") {
                      const size = comp.size || 192;
                      return (
                        <div
                          key={comp.id}
                          className="flex flex-col items-center justify-center w-full py-12 gap-6"
                        >
                          {wrap(
                            "qr_container",
                            <div
                              className={`bg-white p-6 shadow-lg border border-border/60 hover:shadow-xl transition-shadow w-full h-full flex items-center justify-center ${elementShape}`}
                            >
                              <QRCode value={comp.content || "https://agatike.com"} size={size} />
                            </div>,
                            "256px",
                            "256px",
                            "0px",
                            "16px",
                          )}
                          {comp.title &&
                            wrap(
                              "qr_title",
                              <p className="text-lg font-medium text-center w-full m-0">
                                {comp.title}
                              </p>,
                              "100%",
                              "auto",
                              "0px",
                              "0px",
                            )}
                        </div>
                      );
                    }

                    if (comp.type === "budget_request" || comp.type === "damage_report") {
                      if (comp.design === "embedded" || !comp.design) {
                        return (
                          <div key={comp.id} className="w-full">
                            <SpreadsheetEntryForm
                              workspace_id={workspace_id}
                              themeColor={theme_color}
                              comp={comp}
                            />
                          </div>
                        );
                      }

                      const title =
                        comp.title ||
                        (comp.type === "budget_request" ? "Budget Request" : "Damage Report");
                      const description = comp.description || "Click to open form";

                      let triggerContent;
                      if (comp.design === "button") {
                        triggerContent = (
                          <Button
                            size="lg"
                            className="rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
                            style={{ background: theme_color }}
                          >
                            {title} <ArrowRight className="w-5 h-5 ml-2 md:ml-3 shrink-0" />
                          </Button>
                        );
                      } else {
                        triggerContent = (
                          <div
                            className={`bg-card border border-border/60 p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col items-center gap-4 ${elementShape} cursor-pointer w-full text-center max-w-sm mx-auto`}
                          >
                            <div
                              className={`w-16 h-16 bg-primary/10 flex items-center justify-center shrink-0 ${elementShape} mb-2`}
                            >
                              <span className="text-2xl font-bold text-primary/30">
                                {title.charAt(0)}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                              {title}
                            </h3>
                            <p className="text-muted-foreground line-clamp-2 text-sm">
                              {description}
                            </p>
                            <Button
                              className="mt-4 rounded-full w-full"
                              style={{ background: theme_color }}
                            >
                              Open Form <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                          </div>
                        );
                      }

                      const openAction = comp.openAction || "modal";

                      if (openAction === "modal") {
                        return (
                          <div key={comp.id} className="flex justify-center w-full px-4 group">
                            <Dialog>
                              <DialogTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="focus:outline-none w-full flex justify-center"
                                >
                                  {triggerContent}
                                </div>
                              </DialogTrigger>
                              <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                                <DialogTitle className="sr-only">{title}</DialogTitle>
                                <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                                  <SpreadsheetEntryForm
                                    workspace_id={workspace_id}
                                    themeColor={theme_color}
                                    comp={comp}
                                  />
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        );
                      } else {
                        return (
                          <div key={comp.id} className="flex justify-center w-full px-4 group">
                            <Sheet>
                              <SheetTrigger asChild>
                                <div
                                  role="button"
                                  tabIndex={0}
                                  className="focus:outline-none w-full flex justify-center"
                                >
                                  {triggerContent}
                                </div>
                              </SheetTrigger>
                              <SheetContent
                                side="right"
                                className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto p-0"
                              >
                                <SheetTitle className="sr-only">{title}</SheetTitle>
                                <div className="h-full relative bg-background">
                                  <SpreadsheetEntryForm
                                    workspace_id={workspace_id}
                                    themeColor={theme_color}
                                    comp={comp}
                                  />
                                </div>
                              </SheetContent>
                            </Sheet>
                          </div>
                        );
                      }
                    }

                    if (
                      [
                        "product_list",
                        "event_list",
                        "space_list",
                        "venue_list",
                        "movie_list",
                      ].includes(comp.type)
                    ) {
                      const isGrid = comp.layout !== "list";
                      let items: any[] = [];
                      let itemType = "";
                      let linkPrefix = "";
                      let btnLabel = "";

                      if (comp.type === "product_list") {
                        items = products;
                        itemType = "Product";
                        btnLabel = "Buy";
                      } else if (comp.type === "event_list") {
                        items = events;
                        itemType = "Event";
                        btnLabel = "Get Tickets";
                        linkPrefix = "/events/";
                      } else if (comp.type === "space_list") {
                        items = spaces;
                        itemType = "Space";
                        btnLabel = "Book Space";
                        linkPrefix = "/spaces/checkout/";
                      } else if (comp.type === "venue_list") {
                        items = venues.flatMap((v: any) => [
                          v,
                          ...(v.facilities_data || []).map((fac: any) => ({
                            ...fac,
                            id: `facility_${v.id}_${fac.id}`,
                            name: fac.name,
                            is_facility: true,
                            venue_id: v.id,
                            cover_url: fac.image_url || v.cover_url,
                            capacity: fac.max_capacity,
                            city: v.city,
                          })),
                        ]);
                        itemType = "Venue";
                        btnLabel = "Book Venue";
                        linkPrefix = "/venues/";
                      } else if (comp.type === "movie_list") {
                        items = movies;
                        itemType = "Movie";
                        btnLabel = "Book Tickets";
                        linkPrefix = "/movies/";
                      }

                      if (comp.selectedItemIds && comp.selectedItemIds.length > 0) {
                        items = items.filter((item) => comp.selectedItemIds.includes(item.id));
                      } else if (comp.limit && comp.limit > 0) {
                        items = items.slice(0, comp.limit);
                      }

                      if (items.length === 0) return null;

                      let gridCols = "grid-cols-1 md:grid-cols-4";
                      if (isGrid) {
                        const c = parseInt(comp.columns) || 4; // default to 4 for inventory
                        switch (c) {
                          case 1:
                            gridCols = "grid-cols-1";
                            break;
                          case 2:
                            gridCols = "grid-cols-1 md:grid-cols-2";
                            break;
                          case 3:
                            gridCols = "grid-cols-1 md:grid-cols-3";
                            break;
                          case 4:
                            gridCols = "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4";
                            break;
                          case 5:
                            gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-5";
                            break;
                          case 6:
                            gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-6";
                            break;
                          case 7:
                            gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-7";
                            break;
                          case 8:
                            gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-8";
                            break;
                          case 9:
                            gridCols = "grid-cols-1 sm:grid-cols-3 lg:grid-cols-9";
                            break;
                          case 10:
                            gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-10";
                            break;
                          case 11:
                            gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-11";
                            break;
                          case 12:
                            gridCols = "grid-cols-1 sm:grid-cols-4 lg:grid-cols-12";
                            break;
                        }
                      } else {
                        gridCols = "grid-cols-1 max-w-4xl mx-auto";
                      }

                      return (
                        <div key={comp.id} className="py-8 w-full max-w-6xl mx-auto px-4">
                          {comp.title && (
                            <h3 className="text-2xl font-bold text-center mb-8">{comp.title}</h3>
                          )}
                          <div className={`grid gap-6 ${gridCols}`}>
                            {items.map((item: any, itemIdx: number) => {
                              const isProduct = comp.type === "product_list";
                              const isVenueType = comp.type === "venue_list";
                              const CardWrapper = isProduct || isVenueType ? "div" : "a";
                              const wrapperProps =
                                !isProduct && !isVenueType
                                  ? {
                                      href: item.is_facility
                                        ? `/venues/${item.venue_id}/facilities/checkout/${item.id.split("_").pop()}`
                                        : `${linkPrefix}${item.id}`,
                                    }
                                  : {};

                              return (
                                <CardWrapper
                                  key={item.id}
                                  {...(wrapperProps as any)}
                                  className={`h-full flex flex-col group ${!isProduct && comp.allowSelling !== false ? "cursor-pointer block" : ""}`}
                                >
                                  {wrap(
                                    "inv_item",
                                    <div
                                      className={`bg-card border border-border/40 overflow-hidden shadow-sm hover:shadow-md transition-all flex h-full w-full ${isGrid ? "flex-col" : "flex-col sm:flex-row"}`}
                                    >
                                      {wrap(
                                        "inv_item_image",
                                        <div
                                          className={`${isGrid ? "w-full aspect-[4/3]" : "w-full h-48 sm:h-full sm:w-40 md:w-48 min-h-[140px]"} relative bg-secondary overflow-hidden shrink-0`}
                                        >
                                          {item.type === "digital" && (
                                            <div className="absolute top-3 left-3 z-10 bg-primary/90 text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-md backdrop-blur-sm">
                                              Digital Product
                                            </div>
                                          )}
                                          {item.image_url ||
                                          item.cover ||
                                          item.cover_url ||
                                          item.cover_image ||
                                          item.poster_url ||
                                          item.images?.[0] ? (
                                            <img
                                              src={
                                                item.image_url ||
                                                item.cover ||
                                                item.cover_url ||
                                                item.cover_image ||
                                                item.poster_url ||
                                                item.images?.[0]
                                              }
                                              alt=""
                                              className={`w-full h-full ${item.type === "digital" ? "object-contain bg-background/50 p-2" : "object-cover"} group-hover:scale-105 transition-transform duration-500`}
                                            />
                                          ) : (
                                            <div className="w-full h-full flex items-center justify-center opacity-50">
                                              <Package className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                          )}
                                        </div>,
                                        "100%",
                                        "auto",
                                        "0px",
                                        "0px",
                                      )}
                                      <div className="p-5 flex-1 flex flex-col min-w-0">
                                        {wrap(
                                          "inv_item_title",
                                          <h4 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors m-0 w-full">
                                            {item.name || item.title}
                                          </h4>,
                                          "100%",
                                          "auto",
                                          "0px",
                                          "0px",
                                        )}
                                        {isVenueType && (item.city || item.address) && (
                                          <div className="flex items-center text-xs text-muted-foreground mb-1 gap-1">
                                            <MapPin className="h-3 w-3" />
                                            <span>
                                              {item.city}
                                              {item.city && item.address ? ", " : ""}
                                              {item.address}
                                            </span>
                                          </div>
                                        )}
                                        {wrap(
                                          "inv_item_desc",
                                          <div className="text-sm text-muted-foreground mb-4 line-clamp-3 w-full m-0 relative z-10">
                                            {item.description ? (
                                              <div 
                                                className="prose prose-sm dark:prose-invert prose-p:my-0 prose-headings:my-0 prose-ul:my-0 prose-ol:my-0 max-w-none" 
                                                dangerouslySetInnerHTML={{ __html: item.description }} 
                                              />
                                            ) : (
                                              <p>
                                                {item.synopsis ||
                                                  (comp.type === "venue_list"
                                                    ? `${item.city ? item.city + " • " : ""}Up to ${item.capacity || "TBD"} guests`
                                                    : "No details provided.")}
                                              </p>
                                            )}
                                          </div>,
                                          "100%",
                                          "auto",
                                          "0px",
                                          "0px",
                                        )}
                                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                                          {wrap(
                                            "inv_item_price",
                                            <span className="font-bold text-lg truncate mr-2 w-full text-primary transition-colors">
                                              {(() => {
                                                if (item.price)
                                                  return `${Number(item.price).toLocaleString()} ${currency}`;
                                                if (comp.type === "event_list") {
                                                  if (
                                                    item.event_tickets &&
                                                    item.event_tickets.length > 0
                                                  ) {
                                                    const minPrice = Math.min(
                                                      ...item.event_tickets.map(
                                                        (t: any) => t.cost || 0,
                                                      ),
                                                    );
                                                    return minPrice === 0
                                                      ? "Free"
                                                      : `From ${minPrice.toLocaleString()} ${currency}`;
                                                  }
                                                  return "Free";
                                                }
                                                if (
                                                  comp.type === "space_list" ||
                                                  comp.type === "venue_list"
                                                )
                                                  return "Check Availability";
                                                return "";
                                              })()}
                                            </span>,
                                            "auto",
                                            "auto",
                                            "0px",
                                            "0px",
                                          )}
                                          {comp.allowSelling !== false &&
                                            (isProduct || isVenueType
                                              ? wrap(
                                                  "inv_item_button",
                                                  <Button
                                                    size="sm"
                                                    className="shrink-0 text-white shadow-md"
                                                    style={{ background: theme_color }}
                                                    onClick={(e) => {
                                                      e.preventDefault();
                                                      if (isProduct) {
                                                        setSelectedProductForCheckout(item);
                                                        setSelectedPaymentBlock(comp);
                                                        setProductCheckoutSheetOpen(true);
                                                      } else if (isVenueType) {
                                                        if (item.is_facility) {
                                                          const originalVenue = venues.find(
                                                            (v) => v.id === item.venue_id,
                                                          );
                                                          setSelectedFacilityVenue(originalVenue);
                                                          setSelectedFacilityForCheckout(item);
                                                          setFacilityCheckoutSheetOpen(true);
                                                        } else {
                                                          setSelectedVenueForCheckout(item);
                                                          setVenueCheckoutSheetOpen(true);
                                                        }
                                                      }
                                                    }}
                                                  >
                                                    {item.is_facility ? "Book Space" : btnLabel}
                                                  </Button>,
                                                  "auto",
                                                  "auto",
                                                  "0px",
                                                  "9999px",
                                                  theme_color,
                                                )
                                              : wrap(
                                                  "inv_item_button",
                                                  <Button
                                                    size="sm"
                                                    className="shrink-0 text-white shadow-md pointer-events-none"
                                                    style={{ background: theme_color }}
                                                  >
                                                    {item.is_facility ? "Book Space" : btnLabel}
                                                  </Button>,
                                                  "auto",
                                                  "auto",
                                                  "0px",
                                                  "9999px",
                                                  theme_color,
                                                ))}
                                        </div>
                                      </div>
                                    </div>,
                                    "100%",
                                    "auto",
                                    "0px",
                                    "16px",
                                  )}
                                </CardWrapper>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  };

                  return (
                    <div
                      key={comp.id}
                      id={`section-${comp.id}`}
                      className={comp.menuName?.trim() ? "scroll-mt-24" : ""}
                    >
                      {renderComponent()}
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        <StorefrontFooter />

        <Dialog open={!!embedUrl} onOpenChange={(open) => !open && setEmbedUrl(null)}>
          <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 border-0 bg-background shadow-2xl rounded-xl overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Checkout</DialogTitle>
            <div className="h-12 border-b border-border/60 bg-secondary/50 flex items-center justify-between px-4 shrink-0">
              <span className="font-semibold text-sm">Checkout Flow</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={() => setEmbedUrl(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex-1 w-full bg-background relative">
              {embedUrl && (
                <iframe src={embedUrl} className="absolute inset-0 w-full h-full border-0" />
              )}
            </div>
          </DialogContent>
        </Dialog>

        {/* Product Checkout Sheet */}
        {selectedProductForCheckout && (
          <ProductCheckoutSheet
            product={selectedProductForCheckout}
            isOpen={productCheckoutSheetOpen}
            onClose={() => setProductCheckoutSheetOpen(false)}
            themeColor={theme_color || undefined}
          />
        )}

        {selectedFacilityForCheckout && selectedFacilityVenue && (
          <FacilityCheckoutSheet
            venue={selectedFacilityVenue}
            facility={selectedFacilityForCheckout}
            isOpen={facilityCheckoutSheetOpen}
            onClose={() => setFacilityCheckoutSheetOpen(false)}
            themeColor={theme_color || undefined}
          />
        )}

        {selectedVenueForCheckout && (
          <VenueCheckoutSheet
            venue={selectedVenueForCheckout}
            isOpen={venueCheckoutSheetOpen}
            onClose={() => setVenueCheckoutSheetOpen(false)}
            themeColor={theme_color || undefined}
          />
        )}
      </div>
    </>
  );
}
