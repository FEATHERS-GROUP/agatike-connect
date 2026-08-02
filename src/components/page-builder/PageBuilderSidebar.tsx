import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Search,
  LayoutTemplate,
  Type,
  Image as ImageIcon,
  Columns,
  Link2,
  Grid,
  Users2,
  CreditCard,
  QrCode,
  Package,
  CalendarDays,
  Building,
  Film,
  MapPin,
  FileText,
  AlertTriangle,
  DollarSign,
  Monitor,
  Menu,
  ChevronRight,
  Plus,
} from "lucide-react";
import { PAGE_TEMPLATES } from "@/lib/page-templates";
import { Link } from "@tanstack/react-router";

export function PageBuilderSidebar({
  addComponent,
  addComponents,
  allPages = [],
  activeWorkspace,
}: {
  addComponent: (type: string) => void;
  addComponents: (comps: any[]) => void;
  allPages: any[];
  activeWorkspace: any;
}) {
  const [activeTab, setActiveTab] = useState<
    "elements" | "pages" | "sections" | "navigations" | null
  >(null);
  const [searchQuery, setSearchQuery] = useState("");

  const basicsItems = [
    { type: "pages", icon: FileText, label: "Pages" },
    { type: "sections", icon: LayoutTemplate, label: "Sections" },
    { type: "navigations", icon: Menu, label: "Navigations" },
  ];

  const elementsItems = [
    { type: "text", icon: Type, label: "Text" },
    { type: "image", icon: ImageIcon, label: "Image" },
    { type: "split_block", icon: Columns, label: "Split" },
    { type: "button", icon: Link2, label: "Button" },
    { type: "form_grid", icon: Grid, label: "Form Grid", highlight: true },
    { type: "sponsor_logos", icon: Users2, label: "Logos" },
    { type: "payment_button", icon: CreditCard, label: "Pay" },
    { type: "qr_code", icon: QrCode, label: "QR" },
    { type: "form_link", icon: LayoutTemplate, label: "Form Link" },
  ];

  const cmsItems = [
    { type: "product_list", icon: Package, label: "Products" },
    { type: "event_list", icon: CalendarDays, label: "Events" },
    { type: "space_list", icon: Building, label: "Spaces" },
    { type: "venue_list", icon: MapPin, label: "Venues" },
    { type: "movie_list", icon: Film, label: "Movies" },
    { type: "damage_report", icon: AlertTriangle, label: "Damage Report" },
    { type: "budget_request", icon: DollarSign, label: "Budget Request" },
  ];

  const filteredTemplates = PAGE_TEMPLATES.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="flex h-full relative">
      <div className="flex flex-col w-full h-full bg-card">
        {/* Search */}
        <div className="p-4 border-b border-border/60 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 bg-secondary/30 border-0 h-9 text-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <ScrollArea className="flex-1">
          <Accordion type="multiple" defaultValue={["basics", "elements", "cms"]} className="px-2">
            {/* Basics */}
            <AccordionItem value="basics" className="border-none">
              <AccordionTrigger className="py-3 px-2 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Basics
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-1">
                <div className="flex flex-col gap-0.5">
                  {basicsItems.map((item) => (
                    <Button
                      key={item.type}
                      variant="ghost"
                      className={`justify-start gap-3 h-9 px-3 text-sm font-medium rounded-md w-full ${
                        activeTab === item.type
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-secondary/60"
                      }`}
                      onClick={() => {
                        setActiveTab(activeTab === item.type ? null : (item.type as any));
                      }}
                    >
                      <item.icon
                        className={`h-4 w-4 ${activeTab === item.type ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span>{item.label}</span>
                      <ChevronRight
                        className={`w-4 h-4 ml-auto transition-transform ${activeTab === item.type ? "opacity-100" : "opacity-50"}`}
                      />
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Elements */}
            <AccordionItem value="elements" className="border-none">
              <AccordionTrigger className="py-3 px-2 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Elements
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-1">
                <div className="grid grid-cols-1 gap-1">
                  {elementsItems.map((item) => (
                    <Button
                      key={item.type}
                      variant="ghost"
                      className={`justify-start gap-2 h-8 px-2.5 text-xs font-medium rounded-md transition-colors ${
                        item.highlight
                          ? "bg-primary/5 text-primary hover:bg-primary/10"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      }`}
                      onClick={() => addComponent(item.type)}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* CMS / Inventory */}
            <AccordionItem value="cms" className="border-none">
              <AccordionTrigger className="py-3 px-2 hover:no-underline text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                CMS
              </AccordionTrigger>
              <AccordionContent className="pb-4 px-1">
                <div className="grid grid-cols-1 gap-1">
                  {cmsItems.map((item) => (
                    <Button
                      key={item.type}
                      variant="ghost"
                      className="justify-start gap-2 h-8 px-2.5 text-xs font-medium rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60 transition-colors"
                      onClick={() => addComponent(item.type)}
                    >
                      <item.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Button>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ScrollArea>
      </div>

      {/* Slide-out Panel for Pages/Templates */}
      {activeTab === "pages" && (
        <div className="absolute top-0 left-full h-full w-[280px] bg-card border-r border-border/60 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 flex flex-col">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Pages & Templates</h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setActiveTab(null)}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Existing Pages */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Your Pages
                  </h4>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 hover:bg-secondary/40"
                    asChild
                  >
                    <Link
                      to="/dashboard/$workspaceSlug/page-builder/editor"
                      params={{ workspaceSlug: activeWorkspace?.slug || "" }}
                      search={{}}
                      onClick={() => setActiveTab(null)}
                    >
                      <Plus className="w-4 h-4" />
                    </Link>
                  </Button>
                </div>
                {allPages.length > 0 ? (
                  <div className="space-y-2">
                    {allPages
                      .filter((p) => !p.parent_id)
                      .map((page) => {
                        const subPages = allPages.filter((p) => p.parent_id === page.id);
                        return (
                          <div key={page.id} className="space-y-1">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="outline"
                                className="flex-1 justify-start h-auto p-3 bg-secondary/20 min-w-0"
                                asChild
                              >
                                <Link
                                  to="/dashboard/$workspaceSlug/page-builder/editor"
                                  params={{ workspaceSlug: activeWorkspace?.slug || "" }}
                                  search={{ pageId: page.id }}
                                  onClick={() => setActiveTab(null)}
                                >
                                  <FileText className="w-4 h-4 mr-2 text-muted-foreground shrink-0" />
                                  <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="truncate font-medium w-full text-left">
                                      {page.title || "Untitled"}
                                    </span>
                                    <span className="text-[10px] text-muted-foreground truncate w-full text-left">
                                      /p/{page.slug}
                                    </span>
                                  </div>
                                </Link>
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 shrink-0 hover:bg-secondary/40"
                                asChild
                              >
                                <Link
                                  to="/dashboard/$workspaceSlug/page-builder/editor"
                                  params={{ workspaceSlug: activeWorkspace?.slug || "" }}
                                  search={{ parentId: page.id }}
                                  onClick={() => setActiveTab(null)}
                                  title="Add Sub-page"
                                >
                                  <Plus className="w-4 h-4 text-muted-foreground" />
                                </Link>
                              </Button>
                            </div>
                            {subPages.length > 0 && (
                              <div className="pl-4 space-y-1 mt-1 border-l border-border/40 ml-2">
                                {subPages.map((subPage) => (
                                  <Button
                                    key={subPage.id}
                                    variant="ghost"
                                    className="w-full justify-start h-auto p-2 hover:bg-secondary/40"
                                    asChild
                                  >
                                    <Link
                                      to="/dashboard/$workspaceSlug/page-builder/editor"
                                      params={{ workspaceSlug: activeWorkspace?.slug || "" }}
                                      search={{ pageId: subPage.id }}
                                      onClick={() => setActiveTab(null)}
                                    >
                                      <FileText className="w-3.5 h-3.5 mr-2 text-muted-foreground shrink-0" />
                                      <div className="flex flex-col items-start min-w-0">
                                        <span className="truncate font-medium w-full text-left text-xs">
                                          {subPage.title || "Untitled"}
                                        </span>
                                        <span className="text-[9px] text-muted-foreground truncate w-full text-left">
                                          /p/{subPage.slug}
                                        </span>
                                      </div>
                                    </Link>
                                  </Button>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-xs text-muted-foreground text-center py-4 bg-secondary/10 rounded-md border border-dashed border-border/40">
                    No pages yet. Click + to create one!
                  </div>
                )}
              </div>{" "}
              {/* Templates */}
              <div>
                <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                  Templates
                </h4>
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template.id}
                      className="group border border-border/60 rounded-xl overflow-hidden bg-card hover:border-primary/50 transition-colors cursor-pointer"
                    >
                      <Link
                        to="/dashboard/$workspaceSlug/page-builder/editor"
                        params={{ workspaceSlug: activeWorkspace?.slug || "" }}
                        search={{ templateId: template.id }}
                        onClick={() => setActiveTab(null)}
                      >
                        <div className="h-28 bg-secondary flex items-center justify-center relative overflow-hidden">
                          <img
                            src={template.headerImageUrl || `/page-templates/${template.id}.png`}
                            alt={template.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
                          <div className="absolute bottom-2 left-2 right-2 text-white font-semibold text-sm">
                            {template.name}
                          </div>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Slide-out Panel for Sections */}
      {activeTab === "sections" && (
        <div className="absolute top-0 left-full h-full w-[280px] bg-card border-r border-border/60 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 flex flex-col">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Sections Library</h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setActiveTab(null)}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {[
                {
                  name: "Split Feature",
                  icon: Columns,
                  desc: "Image next to text block",
                  components: [
                    {
                      type: "split_block",
                      title: "Amazing Feature",
                      content: "Describe this feature.",
                      imagePosition: "right",
                    },
                  ],
                },
                {
                  name: "Call to Action",
                  icon: Link2,
                  desc: "Text banner with button",
                  components: [
                    { type: "text", content: "<h2 style='text-align:center'>Ready to start?</h2>" },
                    { type: "button", label: "Get Started", alignment: "center" },
                  ],
                },
                {
                  name: "Logo Grid",
                  icon: Users2,
                  desc: "Trusted by section",
                  components: [{ type: "sponsor_logos", title: "Trusted by the Best", logos: [] }],
                },
              ].map((section, i) => (
                <div
                  key={i}
                  onClick={() => {
                    addComponents(section.components);
                    setActiveTab(null);
                  }}
                  className="group flex gap-3 p-3 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                    <section.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <span className="text-sm font-semibold truncate">{section.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {section.desc}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 self-center opacity-0 group-hover:opacity-100 -mr-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Slide-out Panel for Navigations */}
      {activeTab === "navigations" && (
        <div className="absolute top-0 left-full h-full w-[280px] bg-card border-r border-border/60 shadow-[4px_0_24px_rgba(0,0,0,0.05)] z-20 flex flex-col">
          <div className="p-4 border-b border-border/60 flex items-center justify-between">
            <h3 className="font-semibold text-sm">Navigations</h3>
            <Button
              variant="ghost"
              size="icon"
              className="w-6 h-6"
              onClick={() => setActiveTab(null)}
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
            </Button>
          </div>
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
              {[
                {
                  name: "Simple Links",
                  icon: Menu,
                  desc: "Horizontal link row",
                  components: [
                    {
                      type: "navigations",
                      links: [
                        { label: "Home", url: "/" },
                        { label: "About", url: "/about" },
                        { label: "Contact", url: "/contact" },
                      ],
                    },
                  ],
                },
              ].map((section, i) => (
                <div
                  key={i}
                  onClick={() => {
                    addComponents(section.components);
                    setActiveTab(null);
                  }}
                  className="group flex gap-3 p-3 border border-border/60 rounded-xl hover:border-primary/50 hover:bg-secondary/20 transition-all cursor-pointer"
                >
                  <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0 group-hover:bg-primary/10">
                    <section.icon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="flex flex-col flex-1 min-w-0 justify-center">
                    <span className="text-sm font-semibold truncate">{section.name}</span>
                    <span className="text-[10px] text-muted-foreground truncate">
                      {section.desc}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-6 h-6 self-center opacity-0 group-hover:opacity-100 -mr-1 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
