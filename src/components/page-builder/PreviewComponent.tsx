import QRCode from "react-qr-code";
import { EmbeddedForm } from "./EmbeddedForm";
import { SpreadsheetEntryForm } from "./SpreadsheetEntryForm";
import { ResizableSubElement } from "./ResizableSubElement";

export function PreviewComponent({
  comp,
  idx,
  themeColor,
  activeForms,
  updateComponent,
  selectedElementId,
  setSelectedElementId,
}: {
  comp: any;
  idx?: number;
  themeColor: string;
  activeForms: any[];
  updateComponent?: (idx: number, key: string, val: any) => void;
  selectedElementId?: string | null;
  setSelectedElementId?: (id: string | null) => void;
}) {
  const wrap = (subKey: string, child: React.ReactNode, defaultWidth = "100%", defaultHeight = "auto", defaultPadding = "0px", defaultRadius = "0px", defaultBackgroundColor?: string) => {
    if (!updateComponent || !setSelectedElementId || typeof idx === 'undefined') {
      // If we are in real preview, we need to apply the default background color if present
      if (defaultBackgroundColor && React.isValidElement(child)) {
         return React.cloneElement(child, {
           style: { ...(child.props.style || {}), backgroundColor: defaultBackgroundColor }
         });
      }
      return child;
    }
    return (
      <ResizableSubElement
        comp={comp}
        idx={idx}
        subKey={subKey}
        selectedElementId={selectedElementId}
        setSelectedElementId={setSelectedElementId}
        updateComponent={updateComponent}
        defaultWidth={defaultWidth}
        defaultHeight={defaultHeight}
        defaultPadding={defaultPadding}
        defaultRadius={defaultRadius}
        defaultBackgroundColor={defaultBackgroundColor}
      >
        {child}
      </ResizableSubElement>
    );
  };
  if (comp.type === "text") {
    return (
      <div className="w-full">
        {wrap('text', 
          <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card w-full h-full">
            <p className="whitespace-pre-wrap">{comp.content}</p>
          </div>,
        "100%", "auto", "24px", "16px")}
      </div>
    );
  }

  if (comp.type === "image" && comp.url) {
    return (
      <div className="w-full overflow-hidden shadow-sm flex items-center justify-center">
        {wrap('image',
          <img src={comp.url} alt="Content" className="w-full h-full object-cover" />,
          "100%", "400px", "0px", "16px"
        )}
      </div>
    );
  }

  if (comp.type === "split_block") {
    return (
      <div
        className={`flex flex-col md:flex-row gap-6 items-center ${
          comp.imagePosition === "right" ? "md:flex-row-reverse" : ""
        }`}
      >
        {comp.imageUrl && (
          <div className="w-full md:w-1/2 flex justify-center shadow-sm">
            {wrap('split_image', 
              <img
                src={comp.imageUrl}
                alt="Split Content"
                className="w-full h-full object-cover"
              />,
              "100%", "300px", "0px", "16px"
            )}
          </div>
        )}
        {comp.text && (
          <div className="w-full md:w-1/2 flex items-center">
            {wrap('split_text',
              <div className="w-full h-full prose prose-sm dark:prose-invert">
                <p className="whitespace-pre-wrap">{comp.text}</p>
              </div>,
              "100%", "auto", "0px", "0px"
            )}
          </div>
        )}
      </div>
    );
  }

  if (comp.type === "button") {
    return (
      <div className="flex justify-center w-full px-4 py-4">
        {wrap('button',
          <div
            className="w-full h-full flex items-center justify-center text-sm font-bold shadow-md text-white text-center cursor-pointer"
          >
            {comp.label || "Click Here"}
          </div>,
          "auto", "auto", "16px", "9999px", themeColor
        )}
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
      <div className={`grid ${gridCols} gap-4 pointer-events-none`}>
        {comp.cards.map((card: any, idx: number) => {
          let linkedForm = activeForms.find((f: any) => f.id === card.formId);
          if (!linkedForm) {
            linkedForm = {
              id: "preview-id",
              title: "Select a Form",
              description: "Please link a form in the editor.",
              cover_image_url: "",
            };
          }
          return (
            <div key={idx} className="flex h-full">
              {wrap(`card_${idx}`, 
                <div
                  className="border border-border/60 p-5 flex flex-col h-full w-full"
                  style={{
                    backgroundColor: comp.cardBgColor || "var(--card)",
                    color: comp.cardTextColor || "inherit",
                  }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-xl font-bold">{card.customTitle || linkedForm.title}</h3>
                    {linkedForm.cover_image_url && (
                      <div className="w-12 h-12 rounded-lg overflow-hidden shrink-0 ml-3">
                        <img
                          src={linkedForm.cover_image_url}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                  {card.bulletPoints ? (
                    <div
                      className="prose prose-xs dark:prose-invert mb-6 flex-1 whitespace-pre-wrap"
                      style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}
                    >
                      {card.bulletPoints}
                    </div>
                  ) : linkedForm.description ? (
                    <p
                      className="line-clamp-3 mb-6 flex-1 text-sm"
                      style={{ color: comp.cardTextColor || "var(--muted-foreground)" }}
                    >
                      {linkedForm.description}
                    </p>
                  ) : (
                    <div className="flex-1" />
                  )}
                  <div
                    className="w-full rounded-full mt-auto py-2 text-center text-white text-sm font-medium"
                  >
                    {card.buttonLabel || "Register"}
                  </div>
                </div>, 
                "100%", "100%", "0px", "16px", comp.cardBgColor || "var(--card)"
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (comp.type === "sponsor_logos" && comp.logos?.length > 0) {
    return (
      <div className="py-4 pointer-events-none">
        {comp.title && <h3 className="text-lg font-bold text-center mb-4">{comp.title}</h3>}
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-4 items-center justify-items-center opacity-80">
          {comp.logos.map((logo: any, idx: number) => (
            <div
              key={idx}
              className="w-full max-w-[80px] aspect-video flex items-center justify-center grayscale"
            >
              <img src={logo.url} alt="" className="max-w-full max-h-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (comp.type === "form_link" && comp.content) {
    let linkedForm = activeForms.find((f: any) => f.id === comp.content);
    if (!linkedForm) {
      linkedForm = {
        id: "preview-id",
        title: "Select a Form",
        description: "Please link a form in the editor.",
        cover_image_url: "",
      };
    }

    if (comp.design === "embedded") {
      return (
        <div className="w-full pointer-events-none">
          <EmbeddedForm formId={linkedForm.id} />
        </div>
      );
    }

    if (comp.design === "button") {
      return (
        <div className="flex justify-center w-full px-4 py-4 pointer-events-none">
          <div
            className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center cursor-pointer"
            style={{ backgroundColor: themeColor }}
          >
            {linkedForm.title}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5">
        {linkedForm.cover_image_url ? (
          wrap('form_image',
            <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden shrink-0">
              <img src={linkedForm.cover_image_url} alt="" className="w-full h-full object-cover" />
            </div>,
            "160px", "96px", "0px", "12px"
          )
        ) : (
          wrap('form_image',
            <div className="w-full md:w-40 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <span className="text-3xl font-bold text-primary/30">{linkedForm.title.charAt(0)}</span>
            </div>,
            "160px", "96px", "0px", "12px"
          )
        )}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left w-full">
          {wrap('form_title',
            <h3 className="text-xl font-bold mb-2">{linkedForm.title}</h3>,
            "100%", "auto", "0px", "0px"
          )}
          {linkedForm.description && (
            wrap('form_desc',
              <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
                {linkedForm.description}
              </p>,
              "100%", "auto", "0px", "0px"
            )
          )}
          {wrap('form_button',
            <div
              className="mt-auto rounded-full py-1.5 px-4 text-xs font-medium text-white flex items-center justify-center"
            >
              Fill Form
            </div>,
            "auto", "auto", "6px", "9999px", themeColor
          )}
        </div>
      </div>
    );
  }

  if (comp.type === "payment_button") {
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 py-6">
        {wrap('pay_button',
          <div
            className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white flex flex-col items-center justify-center gap-1 h-full w-full"
          >
            <span>{comp.label || "Pay Now"}</span>
            {comp.amount && <span className="text-xs opacity-90">{comp.amount} RWF</span>}
          </div>,
          "auto", "auto", "16px", "9999px", themeColor
        )}
        {comp.description && (
          wrap('pay_desc',
            <p className="mt-4 text-sm text-muted-foreground text-center max-w-sm">
              {comp.description}
            </p>,
            "100%", "auto", "0px", "0px"
          )
        )}
      </div>
    );
  }

  if (comp.type === "qr_code") {
    const size = comp.size || 128;
    return (
      <div className="flex flex-col items-center justify-center w-full py-8 pointer-events-none gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-border/60">
          <QRCode value={comp.content || "https://agatike.com"} size={size} />
        </div>
        {comp.title && <p className="text-sm font-medium text-center">{comp.title}</p>}
      </div>
    );
  }

  if (comp.type === "budget_request" || comp.type === "damage_report") {
    return (
      <div className="w-full pointer-events-none opacity-80">
        <SpreadsheetEntryForm
          workspace_id="preview"
          themeColor={themeColor || "#000"}
          comp={comp}
        />
      </div>
    );
  }

  if (
    ["product_list", "event_list", "space_list", "venue_list", "movie_list"].includes(comp.type)
  ) {
    const isGrid = comp.layout !== "list";
    const typeLabels: Record<string, string> = {
      product_list: "Product",
      event_list: "Event",
      space_list: "Space",
      venue_list: "Venue",
      movie_list: "Movie",
    };
    const buttonLabels: Record<string, string> = {
      product_list: "Buy",
      event_list: "Get Tickets",
      space_list: "Book Space",
      venue_list: "Book Venue",
      movie_list: "Book Tickets",
    };

    return (
      <div className="space-y-6 pointer-events-none opacity-80">
        {comp.title && <h3 className="text-xl font-bold text-center">{comp.title}</h3>}
        <div
          className={`grid gap-4 ${isGrid ? "grid-cols-1 sm:grid-cols-2 md:grid-cols-3" : "grid-cols-1"}`}
        >
          {[1, 2, 3].map((i) => (
              <div key={i} className="flex">
                {wrap(`inv_${i}`,
                  <div
                    className={`bg-card border border-border/40 overflow-hidden shadow-sm flex w-full h-full ${isGrid ? "flex-col" : "flex-row"}`}
                  >
                    <div
                      className={`bg-secondary ${isGrid ? "w-full aspect-[4/3]" : "w-32 h-full min-h-[120px]"} flex items-center justify-center`}
                    >
                      <span className="text-muted-foreground text-sm font-medium">
                        {typeLabels[comp.type]} {i}
                      </span>
                    </div>
                    <div className="p-4 flex-1 flex flex-col">
                      <h4 className="font-semibold mb-1">Sample {typeLabels[comp.type]}</h4>
                      <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                        This is a placeholder for your workspace {typeLabels[comp.type].toLowerCase()}. It
                        will be populated with real data on the live page.
                      </p>
                      <div className="mt-auto flex items-center justify-between pt-2">
                        <span className="text-sm font-medium">$0.00</span>
                        {comp.allowSelling !== false && (
                          <div
                            className="px-3 py-1.5 rounded-md text-xs font-bold text-white shadow-sm"
                            style={{ backgroundColor: themeColor }}
                          >
                            {buttonLabels[comp.type]}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>,
                  "100%", "100%", "0px", "12px"
                )}
              </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
      <p className="text-sm">Click "Edit Settings" to configure this block.</p>
    </div>
  );
}
