import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { getWorkspaceForms } from "@/api/rsvps";
import { getWorkspaceProducts } from "@/api/products";
import { getWorkspaceEvents } from "@/api/events";
import { getSpaces } from "@/api/spaces";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getMovies } from "@/api/cinema_management";
import { Loader2, ArrowRight, Package, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { EmbeddedForm } from "@/components/page-builder/EmbeddedForm";
import { SpreadsheetEntryForm } from "@/components/page-builder/SpreadsheetEntryForm";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useMutation } from "@tanstack/react-query";
import { PaymentModal } from "@/components/shared/PaymentModal";
import { ProductCheckoutModal } from "@/components/page-builder/ProductCheckoutModal";
import { initiatePawaPayDeposit, getPawaPayDepositStatus, cancelPendingPayment } from "@/api/pawapay";
import { toast } from "sonner";
import { Smartphone } from "lucide-react";

export function RenderedPage({ slug, isPreview = false }: { slug: string; isPreview?: boolean }) {
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

  const [productCheckoutModalOpen, setProductCheckoutModalOpen] = useState(false);
  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<any>(null);

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
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id } } as any),
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
          type: "page_builder_payment",
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

    const intervalId = setInterval(async () => {
      try {
        const res = await getPawaPayDepositStatus({ data: { depositId: pawapayDepositId } } as any);
        if (
          res?.status?.toLowerCase() === "completed" ||
          res?.status?.toLowerCase() === "success"
        ) {
          setIsPollingPawaPay(false);
          toast.success("Payment successful!");
        } else if (res?.status?.toLowerCase() === "failed") {
          setIsPollingPawaPay(false);
          toast.error("Mobile Money payment failed or was cancelled.");
        }
      } catch (err) {
        console.error("Polling error", err);
      }
    }, 5000);

    return () => clearInterval(intervalId);
  }, [isPollingPawaPay, pawapayDepositId]);

  if (isPollingPawaPay) {
    return (
      <div className="min-h-screen bg-background text-foreground relative flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-500">
          <Smartphone className="h-16 w-16 text-primary mb-6 animate-pulse" />
          <h1 className="text-2xl font-bold mb-3">Check Your Phone</h1>
          <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
            We've sent a payment request to your mobile number. Please enter your PIN to confirm the
            payment.
          </p>
          <div className="flex gap-2 mb-8 justify-center">
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-75" />
            <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-150" />
          </div>
          <Button
            variant="outline"
            onClick={async () => {
              setIsPollingPawaPay(false);
              if (pawapayDepositId) {
                try {
                  await cancelPendingPayment({ data: { depositId: pawapayDepositId } } as any);
                } catch (e) {
                  console.error("Cancel cleanup failed:", e);
                }
              }
            }}
            className="rounded-2xl h-12 px-8"
          >
            Cancel Payment
          </Button>
        </main>
      </div>
    );
  }

  if (isLoadingPage && !isPreview) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-secondary/30">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!page) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30">
        <h1 className="text-2xl font-bold mb-2">Page Not Found</h1>
        <p className="text-muted-foreground">
          This company page does not exist or is not published.
        </p>
        <Button asChild className="mt-6">
          <Link to="/">Return Home</Link>
        </Button>
      </div>
    );
  }

  const { title, description, header_image_url, logo_url, theme_color } = page;

  const settingsBlock = components?.find((c: any) => c.type === "page_settings");
  const logoPosition = settingsBlock?.logoPosition || "hero";
  const navbarStyle = settingsBlock?.navbarStyle || "transparent";
  const fontFamily = settingsBlock?.fontFamily || "Inter";
  const heroAlign = settingsBlock?.heroAlign || "center";
  const heroOverlayColor = settingsBlock?.heroOverlayColor || "#000000";
  const heroOverlayOpacity = settingsBlock?.heroOverlayOpacity ?? 40;
  const heroButtonText = settingsBlock?.heroButtonText || "";
  const heroButtonActionType = settingsBlock?.heroButtonActionType || "url";
  const heroButtonLink = settingsBlock?.heroButtonLink || "";
  const heroForegroundImageUrl = settingsBlock?.heroForegroundImageUrl || "";
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
      <div
        className="min-h-screen bg-background"
        style={
          {
            "--primary": theme_color,
            "--primary-foreground": "#fff",
            fontFamily: `'${fontFamily}', sans-serif`,
          } as React.CSSProperties
        }
      >
        {/* Sticky Navbar */}
        {hasNavbar && (
          <nav
            className={
              navbarStyle === "transparent"
                ? "absolute top-0 left-0 right-0 z-50 w-full bg-transparent border-b border-white/10"
                : "sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all"
            }
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                {logoPosition === "navbar" && logo_url ? (
                  <a href={siteLinks.length > 0 ? siteLinks[0].url : "#"}>
                    <img src={logo_url} alt="Logo" className="h-10 w-auto object-contain rounded" />
                  </a>
                ) : logoPosition === "navbar" && siteTitle ? (
                  <a
                    href={siteLinks.length > 0 ? siteLinks[0].url : "#"}
                    className={`font-bold text-xl tracking-tight truncate max-w-[200px] transition-colors ${
                      navbarStyle === "transparent"
                        ? "text-white hover:text-white/80"
                        : "text-foreground hover:text-primary"
                    }`}
                  >
                    {siteTitle}
                  </a>
                ) : (
                  <div />
                )}
              </div>

              {/* Menu Links */}
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {siteLinks.map((link: any) => (
                  <a
                    key={link.url}
                    href={link.url}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                      link.isActive
                        ? navbarStyle === "transparent"
                          ? "text-white"
                          : "text-primary"
                        : navbarStyle === "transparent"
                          ? "text-white/70 hover:text-white"
                          : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </a>
                ))}

                {menuLinks.length > 0 && siteLinks.length > 0 && (
                  <div className="w-px h-4 bg-border/60 mx-2" />
                )}

                {menuLinks.map((link: any) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`text-sm font-medium transition-colors whitespace-nowrap ${
                      navbarStyle === "transparent"
                        ? "text-white/70 hover:text-white"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </button>
                ))}
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
        <div
          className={`relative w-full min-h-[50vh] md:min-h-[60vh] bg-secondary flex flex-col p-8 md:p-16 ${
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
              className="absolute inset-0 w-full h-full object-cover transform scale-105"
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
              heroForegroundImageUrl && heroForegroundPosition === "left" ? "flex-row-reverse" : ""
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
              {logo_url && logoPosition === "hero" && (
                <div
                  className={`w-24 h-24 md:w-32 md:h-32 shadow-2xl overflow-hidden mb-4 bg-background border-4 border-background/50 backdrop-blur-sm ${elementShape}`}
                >
                  <img src={logo_url} alt="Logo" className="w-full h-full object-cover" />
                </div>
              )}
              {title && (
                <h1
                  className={`text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-lg leading-tight ${
                    heroAlign.includes("left")
                      ? "text-left"
                      : heroAlign.includes("right")
                        ? "text-right"
                        : "text-center"
                  }`}
                >
                  {title}
                </h1>
              )}
              {description && (
                <p
                  className={`text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl drop-shadow-md whitespace-pre-wrap leading-relaxed ${
                    heroAlign.includes("left")
                      ? "text-left"
                      : heroAlign.includes("right")
                        ? "text-right"
                        : "text-center"
                  }`}
                >
                  {description}
                </p>
              )}

              {heroButtonText && heroButtonLink && (
                <Button
                  asChild
                  size="lg"
                  className="mt-4 shadow-xl hover:scale-105 transition-transform rounded-full border border-white/20"
                >
                  <Link
                    to={heroButtonActionType === "page" ? (heroButtonLink as any) : undefined}
                    href={
                      heroButtonActionType === "phone"
                        ? heroButtonLink.startsWith("tel:")
                          ? heroButtonLink
                          : `tel:${heroButtonLink}`
                        : heroButtonActionType !== "page"
                          ? heroButtonLink
                          : undefined
                    }
                  >
                    {heroButtonText}
                  </Link>
                </Button>
              )}
            </div>

            {heroForegroundImageUrl && (
              <div className="flex-1 hidden md:flex items-center justify-center relative">
                <img
                  src={heroForegroundImageUrl}
                  alt="Foreground"
                  className={`w-full max-w-sm lg:max-w-md h-auto object-contain drop-shadow-2xl hover:scale-105 transition-transform duration-500`}
                />
              </div>
            )}
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24 relative z-10">
          {/* Dynamic Components */}
          <div className="space-y-16 md:space-y-24">
            {actualComponents?.map((comp: any) => {
              const renderComponent = () => {
                if (comp.type === "text") {
                  return (
                    <div
                      className={`prose prose-lg dark:prose-invert max-w-none bg-card p-8 shadow-sm ${elementShape}`}
                    >
                      <p className="whitespace-pre-wrap">{comp.content}</p>
                    </div>
                  );
                }

                if (comp.type === "image" && comp.url) {
                  return (
                    <div
                      key={comp.id}
                      className={`w-full overflow-hidden shadow-sm ${elementShape}`}
                    >
                      <img
                        src={comp.url}
                        alt="Content"
                        className="w-full h-auto max-h-[600px] object-cover"
                      />
                    </div>
                  );
                }

                if (comp.type === "split_block") {
                  return (
                    <div
                      key={comp.id}
                      className={`flex flex-col md:flex-row gap-8 items-center ${comp.imagePosition === "right" ? "md:flex-row-reverse" : ""}`}
                    >
                      {comp.imageUrl && (
                        <div
                          className={`w-full md:w-1/2 overflow-hidden shadow-sm ${elementShape}`}
                        >
                          <img
                            src={comp.imageUrl}
                            alt="Split Content"
                            className="w-full h-auto max-h-[500px] object-cover"
                          />
                        </div>
                      )}
                      {comp.text && (
                        <div className="w-full md:w-1/2 prose prose-lg dark:prose-invert">
                          <p className="whitespace-pre-wrap text-lg">{comp.text}</p>
                        </div>
                      )}
                    </div>
                  );
                }

                if (comp.type === "button") {
                  return (
                    <div key={comp.id} className="flex justify-center w-full px-4">
                      <Button
                        asChild
                        size="lg"
                        className="rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                        style={{ background: theme_color }}
                      >
                        <a href={comp.url} target="_blank" rel="noreferrer">
                          {comp.label || "Click Here"}
                        </a>
                      </Button>
                    </div>
                  );
                }

                if (comp.type === "form_grid" && comp.cards?.length > 0) {
                  const gridCols =
                    comp.columns === "1"
                      ? "grid-cols-1"
                      : comp.columns === "3"
                        ? "grid-cols-1 md:grid-cols-3"
                        : "grid-cols-1 md:grid-cols-2";

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
                          <div
                            key={idx}
                            className={`border border-border/60 p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col h-full group ${elementShape}`}
                            style={{
                              backgroundColor: comp.cardBgColor || "var(--card)",
                              color: comp.cardTextColor || "inherit",
                            }}
                          >
                            <div className="flex items-start justify-between mb-4">
                              <h3 className="text-2xl font-bold group-hover:opacity-80 transition-opacity">
                                {card.customTitle || linkedForm.title}
                              </h3>
                              {linkedForm.cover_image_url && (
                                <div
                                  className={`w-16 h-16 overflow-hidden shrink-0 ml-4 hidden sm:block ${elementShape}`}
                                >
                                  <img
                                    src={linkedForm.cover_image_url}
                                    alt={linkedForm.title}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              )}
                            </div>

                            {card.bulletPoints ? (
                              <div
                                className="prose prose-sm dark:prose-invert mb-8 flex-1 whitespace-pre-wrap"
                                style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}
                              >
                                {card.bulletPoints}
                              </div>
                            ) : linkedForm.description ? (
                              <p
                                className="line-clamp-3 mb-8 flex-1"
                                style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}
                              >
                                {linkedForm.description}
                              </p>
                            ) : (
                              <div className="flex-1" />
                            )}

                            {comp.openAction === "modal" ? (
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    className="w-full rounded-full mt-auto group-hover:shadow-md transition-all"
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
                                    className="w-full rounded-full mt-auto group-hover:shadow-md transition-all"
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
                                className="w-full rounded-full mt-auto group-hover:shadow-md transition-all"
                                style={{ background: theme_color }}
                              >
                                <Link to={`/f/${linkedForm.id}` as any}>
                                  {card.buttonLabel || "Register"}{" "}
                                  <ArrowRight className="w-4 h-4 ml-2" />
                                </Link>
                              </Button>
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

                if (comp.type === "form_link" && comp.content) {
                  let linkedForm = activeForms.find((f: any) => f.id === comp.content);

                  if (!linkedForm && isPreview) {
                    linkedForm = {
                      id: "preview-id",
                      title: "Select a Form",
                      description: "Please select a form in the editor to link it here.",
                      cover_image_url: "",
                    };
                  }

                  if (!linkedForm) return null;

                  if (comp.design === "embedded") {
                    return (
                      <div key={comp.id} className="w-full">
                        <EmbeddedForm formId={linkedForm.id} />
                      </div>
                    );
                  }

                  if (comp.design === "button") {
                    const buttonContent = (
                      <Button
                        size="lg"
                        className="rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center cursor-pointer"
                        style={{ background: theme_color }}
                      >
                        {linkedForm.title} <ArrowRight className="w-5 h-5 ml-2 md:ml-3 shrink-0" />
                      </Button>
                    );

                    let contentWrapper = buttonContent;
                    if (comp.openAction === "modal") {
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
                    } else if (comp.openAction === "drawer") {
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
                        <Link to={`/f/${linkedForm.id}` as any}>{buttonContent}</Link>
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
                      className={`bg-card border border-border/60 p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row items-center gap-6 ${elementShape} cursor-pointer w-full text-left`}
                    >
                      {linkedForm.cover_image_url ? (
                        <div
                          className={`w-full md:w-48 h-32 overflow-hidden shrink-0 ${elementShape}`}
                        >
                          <img
                            src={linkedForm.cover_image_url}
                            alt={linkedForm.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      ) : (
                        <div
                          className={`w-full md:w-48 h-32 bg-primary/10 flex items-center justify-center shrink-0 ${elementShape}`}
                        >
                          <span className="text-4xl font-bold text-primary/30">
                            {linkedForm.title.charAt(0)}
                          </span>
                        </div>
                      )}
                      <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
                        <h3 className="text-2xl font-bold mb-2 group-hover:text-primary transition-colors">
                          {linkedForm.title}
                        </h3>
                        {linkedForm.description && (
                          <p className="text-muted-foreground line-clamp-2 mb-4">
                            {linkedForm.description}
                          </p>
                        )}
                        <Button
                          className="mt-auto rounded-full w-full md:w-auto"
                          style={{ background: theme_color }}
                        >
                          Fill Form <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </div>
                  );

                  if (comp.openAction === "modal") {
                    return (
                      <div key={comp.id} className="group">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button className="w-full text-left focus:outline-none">
                              {cardContent}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="max-w-3xl w-full h-[85vh] overflow-y-auto p-0 border-0 bg-transparent shadow-none">
                            <DialogTitle className="sr-only">Form</DialogTitle>
                            <div className="bg-background rounded-xl overflow-hidden shadow-2xl h-full relative">
                              <EmbeddedForm formId={linkedForm.id} />
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    );
                  } else if (comp.openAction === "drawer") {
                    return (
                      <div key={comp.id} className="group">
                        <Sheet>
                          <SheetTrigger asChild>
                            <button className="w-full text-left focus:outline-none">
                              {cardContent}
                            </button>
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
                      </div>
                    );
                  } else {
                    return (
                      <Link key={comp.id} to={`/f/${linkedForm.id}` as any} className="block group">
                        {cardContent}
                      </Link>
                    );
                  }
                }

                if (comp.type === "payment_button") {
                  return (
                    <div key={comp.id} className="flex flex-col items-center justify-center w-full px-4 py-8">
                      {comp.paymentLink ? (
                        <a
                          href={comp.paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full px-12 py-5 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center gap-1 block"
                          style={{ background: theme_color }}
                        >
                          <span>{comp.label || "Pay Now"}</span>
                          {comp.amount && (
                            <span className="text-sm opacity-90">{comp.amount} RWF</span>
                          )}
                        </a>
                      ) : (
                        <Button
                          size="lg"
                          className="rounded-full px-12 py-8 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center gap-1 h-auto"
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
                      )}
                      {comp.description && (
                        <p className="mt-6 text-base text-muted-foreground text-center max-w-md">
                          {comp.description}
                        </p>
                      )}
                    </div>
                  );
                }

                if (comp.type === "qr_code") {
                  const size = comp.size || 192;
                  return (
                    <div className="flex flex-col items-center justify-center w-full py-12 gap-6">
                      <div
                        className={`bg-white p-6 shadow-lg border border-border/60 hover:shadow-xl transition-shadow ${elementShape}`}
                      >
                        <QRCode value={comp.content || "https://agatike.com"} size={size} />
                      </div>
                      {comp.title && (
                        <p className="text-lg font-medium text-center text-foreground">
                          {comp.title}
                        </p>
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
                        <p className="text-muted-foreground line-clamp-2 text-sm">{description}</p>
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
                            <button className="focus:outline-none w-full flex justify-center">
                              {triggerContent}
                            </button>
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
                            <button className="focus:outline-none w-full flex justify-center">
                              {triggerContent}
                            </button>
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

                if (["product_list", "event_list", "space_list", "venue_list", "movie_list"].includes(comp.type)) {
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
                    items = venues;
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
                    items = items.filter(item => comp.selectedItemIds.includes(item.id));
                  } else if (comp.limit && comp.limit > 0) {
                    items = items.slice(0, comp.limit);
                  }

                  if (items.length === 0) return null;

                  return (
                    <div key={comp.id} className="py-8 w-full max-w-6xl mx-auto px-4">
                      {comp.title && <h3 className="text-2xl font-bold text-center mb-8">{comp.title}</h3>}
                      <div className={`grid gap-6 ${isGrid ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4" : "grid-cols-1 max-w-4xl mx-auto"}`}>
                        {items.map((item: any) => (
                          <div key={item.id} className={`bg-card border border-border/40 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex ${isGrid ? "flex-col" : "flex-row"} group`}>
                            <div className={`${isGrid ? "w-full aspect-[4/3]" : "w-40 md:w-48 h-full min-h-[140px]"} relative bg-secondary overflow-hidden shrink-0`}>
                              {(item.image_url || item.cover || item.cover_image || item.poster_url || item.images?.[0]) ? (
                                <img src={item.image_url || item.cover || item.cover_image || item.poster_url || item.images?.[0]} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center opacity-50">
                                  <Package className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                            </div>
                            <div className="p-5 flex-1 flex flex-col min-w-0">
                              <h4 className="font-bold text-lg mb-1 line-clamp-1 group-hover:text-primary transition-colors">{item.name || item.title}</h4>
                              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description || item.synopsis || "No details provided."}</p>
                              <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                                <span className="font-semibold truncate mr-2">
                                  {item.price ? `${item.price} RWF` : itemType === "Product" ? "" : "Check Availability"}
                                </span>
                                {comp.allowSelling !== false && (
                                  comp.type === "product_list" ? (
                                    <Button size="sm" className="rounded-full shrink-0" style={{ background: theme_color }} onClick={() => {
                                      setSelectedProductForCheckout(item);
                                      setSelectedPaymentBlock(comp);
                                      setProductCheckoutModalOpen(true);
                                    }}>
                                      {btnLabel}
                                    </Button>
                                  ) : (
                                    <Button size="sm" className="rounded-full shrink-0" style={{ background: theme_color }} onClick={() => setEmbedUrl(`${linkPrefix}${item.id}?embed=true`)}>
                                      {btnLabel}
                                    </Button>
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
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

        {/* Footer Watermark */}
        <footer className="w-full py-8 mt-12 border-t border-border/40 bg-card/30">
          <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center">
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              Built with
              <span className="font-bold text-foreground flex items-center gap-1.5">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] text-primary-foreground">
                  A
                </span>
                Agatike Connect
              </span>
            </p>
            <a
              href="/"
              className="text-xs text-muted-foreground/60 hover:text-primary transition-colors mt-2"
            >
              Create your own page today
            </a>
          </div>
        </footer>

        <Dialog open={!!embedUrl} onOpenChange={(open) => !open && setEmbedUrl(null)}>
          <DialogContent className="max-w-4xl w-[95vw] h-[90vh] p-0 border-0 bg-background shadow-2xl rounded-xl overflow-hidden flex flex-col">
            <DialogTitle className="sr-only">Checkout</DialogTitle>
            <div className="h-12 border-b border-border/60 bg-secondary/50 flex items-center justify-between px-4 shrink-0">
              <span className="font-semibold text-sm">Checkout Flow</span>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setEmbedUrl(null)}>
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

        {/* Product Checkout Modal */}
        <ProductCheckoutModal
          product={selectedProductForCheckout}
          isOpen={productCheckoutModalOpen}
          onClose={() => setProductCheckoutModalOpen(false)}
          themeColor={theme_color}
          onProceedToPayment={(totalAmount, details) => {
            setProductCheckoutModalOpen(false);
            setSelectedPaymentBlock({
              ...selectedPaymentBlock,
              amount: totalAmount,
              label: `Buy ${selectedProductForCheckout?.name} (Qty: ${details.quantity}${details.size ? `, Size: ${details.size}` : ''})`,
            });
            setPaymentModalOpen(true);
          }}
        />
      </div>
    </>
  );
}
