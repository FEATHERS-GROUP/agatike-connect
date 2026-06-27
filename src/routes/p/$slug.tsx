import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { getWorkspacePageBySlug } from "@/api/workspace-pages";
import { getWorkspaceForms } from "@/api/rsvps";
import { Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import QRCode from "react-qr-code";
import { EmbeddedForm } from "@/components/page-builder/EmbeddedForm";

export const Route = createFileRoute("/p/$slug")({
  component: PublicCompanyPage,
});

function PublicCompanyPage() {
  const { slug } = Route.useParams();

  // Extract ?preview=true from URL
  const search = useSearch({ strict: false });
  const isPreview = (search as any).preview === "true" || (search as any).preview === true;

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

  const { title, description, header_image_url, logo_url, theme_color, components } = page;

  // Extract settings from components
  const settingsBlock = components?.find((c: any) => c.type === "page_settings");
  const logoPosition = settingsBlock?.logoPosition || "hero";
  const fontFamily = settingsBlock?.fontFamily || "Inter";
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

  const hasNavbar = logoPosition === "navbar" || menuLinks.length > 0;

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
          <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl border-b border-border/40 shadow-sm transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-20 flex items-center justify-between">
              {/* Logo */}
              <div className="flex-shrink-0 flex items-center">
                {logoPosition === "navbar" && logo_url ? (
                  <img src={logo_url} alt="Logo" className="h-10 w-auto object-contain rounded" />
                ) : logoPosition === "navbar" && title ? (
                  <span className="font-bold text-xl tracking-tight truncate max-w-[200px]">
                    {title}
                  </span>
                ) : (
                  <div />
                )}
              </div>

              {/* Menu Links */}
              <div className="flex items-center gap-6 overflow-x-auto no-scrollbar">
                {menuLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors whitespace-nowrap"
                  >
                    {link.name}
                  </button>
                ))}
              </div>
            </div>
          </nav>
        )}

        {/* Header Overlay Section */}
        <div className="relative w-full min-h-[50vh] md:min-h-[60vh] bg-secondary flex flex-col items-center justify-center text-center p-6 md:p-12 overflow-hidden">
          {header_image_url ? (
            <img
              src={header_image_url}
              alt="Cover"
              className="absolute inset-0 w-full h-full object-cover transform scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-primary/80 to-primary/40" />
          )}
          <div className="absolute inset-0 bg-black/60" />

          <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center mt-12 md:mt-0">
            {logo_url && logoPosition === "hero" && (
              <div className="w-28 h-28 md:w-40 md:h-40 rounded-3xl shadow-2xl overflow-hidden mb-8 bg-background border-4 border-background/50 backdrop-blur-sm">
                <img src={logo_url} alt="Logo" className="w-full h-full object-cover" />
              </div>
            )}
            {title && (
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight mb-6 text-white drop-shadow-lg leading-tight">
                {title}
              </h1>
            )}
            {description && (
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 max-w-3xl drop-shadow-md whitespace-pre-wrap leading-relaxed">
                {description}
              </p>
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
                    <div className="prose prose-lg dark:prose-invert max-w-none bg-card p-8 rounded-3xl shadow-sm">
                      <p className="whitespace-pre-wrap">{comp.content}</p>
                    </div>
                  );
                }

                if (comp.type === "image" && comp.url) {
                  return (
                    <div key={comp.id} className="w-full rounded-3xl overflow-hidden shadow-sm">
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
                        <div className="w-full md:w-1/2 rounded-3xl overflow-hidden shadow-sm">
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
                            className="border border-border/60 rounded-3xl p-6 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col h-full group"
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
                                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 ml-4 hidden sm:block">
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
                    return (
                      <div key={comp.id} className="flex justify-center w-full px-4">
                        <Button
                          asChild
                          size="lg"
                          className="rounded-full px-8 md:px-12 py-6 md:py-8 text-lg md:text-xl font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 w-full sm:w-auto text-center"
                          style={{ background: theme_color }}
                        >
                          <Link to={`/f/${linkedForm.id}` as any}>
                            {linkedForm.title}{" "}
                            <ArrowRight className="w-5 h-5 ml-2 md:ml-3 shrink-0" />
                          </Link>
                        </Button>
                      </div>
                    );
                  }

                  return (
                    <Link key={comp.id} to={`/f/${linkedForm.id}` as any} className="block group">
                      <div className="bg-card border border-border/60 rounded-3xl p-6 md:p-8 hover:border-primary/50 transition-all duration-300 hover:shadow-lg flex flex-col md:flex-row items-center gap-6">
                        {linkedForm.cover_image_url ? (
                          <div className="w-full md:w-48 h-32 rounded-2xl overflow-hidden shrink-0">
                            <img
                              src={linkedForm.cover_image_url}
                              alt={linkedForm.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          </div>
                        ) : (
                          <div className="w-full md:w-48 h-32 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-4xl font-bold text-primary/30">
                              {linkedForm.title.charAt(0)}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
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
                    </Link>
                  );
                }

                if (comp.type === "payment_button") {
                  return (
                    <div className="flex flex-col items-center justify-center w-full px-4 py-8">
                      {comp.paymentLink ? (
                        <a
                          href={comp.paymentLink}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full px-12 py-5 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center gap-1 block"
                          style={{ background: theme_color }}
                        >
                          <span>{comp.label || "Pay Now"}</span>
                          {comp.amount && <span className="text-sm opacity-90">{comp.amount} RWF</span>}
                        </a>
                      ) : (
                        <Button
                          size="lg"
                          className="rounded-full px-12 py-8 text-lg font-bold shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 text-white text-center flex flex-col items-center gap-1 h-auto"
                          style={{ background: theme_color }}
                          onClick={() => {
                            alert("Internal checkout modal will open here!");
                          }}
                        >
                          <span>{comp.label || "Pay Now"}</span>
                          {comp.amount && <span className="text-sm font-normal opacity-90">{comp.amount} RWF</span>}
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
                      <div className="bg-white p-6 rounded-2xl shadow-lg border border-border/60 hover:shadow-xl transition-shadow">
                        <QRCode value={comp.content || "https://agatike.com"} size={size} />
                      </div>
                      {comp.title && (
                        <p className="text-lg font-medium text-center text-foreground">{comp.title}</p>
                      )}
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
      </div>
    </>
  );
}
