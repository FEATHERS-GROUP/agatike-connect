import QRCode from "react-qr-code";
import { EmbeddedForm } from "./EmbeddedForm";
import { SpreadsheetEntryForm } from "./SpreadsheetEntryForm";

export function PreviewComponent({
  comp,
  themeColor,
  activeForms,
}: {
  comp: any;
  themeColor: string;
  activeForms: any[];
}) {
  if (comp.type === "text") {
    return (
      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl shadow-sm">
        <p className="whitespace-pre-wrap">{comp.content}</p>
      </div>
    );
  }

  if (comp.type === "image" && comp.url) {
    return (
      <div className="w-full rounded-2xl overflow-hidden shadow-sm">
        <img src={comp.url} alt="Content" className="w-full h-auto max-h-[400px] object-cover" />
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
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={comp.imageUrl}
              alt="Split Content"
              className="w-full h-auto max-h-[300px] object-cover"
            />
          </div>
        )}
        {comp.text && (
          <div className="w-full md:w-1/2 prose prose-sm dark:prose-invert">
            <p className="whitespace-pre-wrap">{comp.text}</p>
          </div>
        )}
      </div>
    );
  }

  if (comp.type === "button") {
    return (
      <div className="flex justify-center w-full px-4 py-4">
        <div
          className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center cursor-pointer"
          style={{ background: themeColor }}
        >
          {comp.label || "Click Here"}
        </div>
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
            <div
              key={idx}
              className="border border-border/60 rounded-2xl p-5 flex flex-col h-full"
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
                style={{ background: themeColor }}
              >
                {card.buttonLabel || "Register"}
              </div>
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
            style={{ background: themeColor }}
          >
            {linkedForm.title}
          </div>
        </div>
      );
    }
    return (
      <div className="bg-card border border-border/60 rounded-2xl p-5 flex flex-col md:flex-row items-center gap-5 pointer-events-none">
        {linkedForm.cover_image_url ? (
          <div className="w-full md:w-40 h-24 rounded-xl overflow-hidden shrink-0">
            <img src={linkedForm.cover_image_url} alt="" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-full md:w-40 h-24 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-3xl font-bold text-primary/30">{linkedForm.title.charAt(0)}</span>
          </div>
        )}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          <h3 className="text-xl font-bold mb-2">{linkedForm.title}</h3>
          {linkedForm.description && (
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {linkedForm.description}
            </p>
          )}
          <div
            className="mt-auto rounded-full py-1.5 px-4 text-xs font-medium text-white"
            style={{ background: themeColor }}
          >
            Fill Form
          </div>
        </div>
      </div>
    );
  }

  if (comp.type === "payment_button") {
    return (
      <div className="flex flex-col items-center justify-center w-full px-4 py-6 pointer-events-none">
        <div
          className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center flex flex-col items-center gap-1"
          style={{ background: themeColor }}
        >
          <span>{comp.label || "Pay Now"}</span>
          {comp.amount && <span className="text-xs opacity-90">{comp.amount} RWF</span>}
        </div>
        {comp.description && (
          <p className="mt-4 text-sm text-muted-foreground text-center max-w-sm">
            {comp.description}
          </p>
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

  return (
    <div className="py-8 text-center text-muted-foreground border-2 border-dashed border-border/50 rounded-xl">
      <p className="text-sm">Click "Edit Settings" to configure this block.</p>
    </div>
  );
}
