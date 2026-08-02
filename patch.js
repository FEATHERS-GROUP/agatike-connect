const fs = require("fs");
const file = "src/components/page-builder/PreviewComponent.tsx";
let code = fs.readFileSync(file, "utf8");

// Add import
code = 'import { ResizableSubElement } from "./ResizableSubElement";\n' + code;

// Update signature
const oldSig = `export function PreviewComponent({
  comp,
  themeColor,
  activeForms,
}: {
  comp: any;
  themeColor: string;
  activeForms: any[];
}) {`;

const newSig = `export function PreviewComponent({
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
  const wrap = (subKey: string, child: React.ReactNode, defaultWidth = "100%", defaultHeight = "auto", defaultPadding = "0px", defaultRadius = "0px") => {
    if (!updateComponent || !setSelectedElementId || typeof idx === 'undefined') return child;
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
      >
        {child}
      </ResizableSubElement>
    );
  };`;

code = code.replace(oldSig, newSig);

// Text
code = code.replace(
  `      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card p-6 rounded-2xl shadow-sm">
        <p className="whitespace-pre-wrap">{comp.content}</p>
      </div>`,
  `      {wrap('text', 
        <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none bg-card w-full h-full">
          <p className="whitespace-pre-wrap">{comp.content}</p>
        </div>,
      "100%", "auto", "24px", "16px")}`,
);

// Image
code = code.replace(
  `      <div className="w-full rounded-2xl overflow-hidden shadow-sm">
        <img src={comp.url} alt="Content" className="w-full h-auto max-h-[400px] object-cover" />
      </div>`,
  `      {wrap('image',
        <img src={comp.url} alt="Content" className="w-full h-full object-cover" />,
        "100%", "auto", "0px", "16px"
      )}`,
);

// Split block image and text
code = code.replace(
  `        {comp.imageUrl && (
          <div className="w-full md:w-1/2 rounded-2xl overflow-hidden shadow-sm">
            <img
              src={comp.imageUrl}
              alt="Split Content"
              className="w-full h-auto max-h-[300px] object-cover"
            />
          </div>
        )}`,
  `        {comp.imageUrl && (
          wrap('split_image', 
            <img
              src={comp.imageUrl}
              alt="Split Content"
              className="w-full h-full object-cover"
            />,
            "100%", "300px", "0px", "16px"
          )
        )}`,
);

code = code.replace(
  `        {comp.text && (
          <div className="w-full md:w-1/2 prose prose-sm dark:prose-invert">
            <p className="whitespace-pre-wrap">{comp.text}</p>
          </div>
        )}`,
  `        {comp.text && (
          wrap('split_text',
            <div className="w-full h-full prose prose-sm dark:prose-invert">
              <p className="whitespace-pre-wrap">{comp.text}</p>
            </div>,
            "100%", "auto", "0px", "0px"
          )
        )}`,
);

// Button
code = code.replace(
  `      <div className="flex justify-center w-full px-4 py-4">
        <div
          className="rounded-full px-8 py-4 text-sm font-bold shadow-md text-white text-center cursor-pointer"
          style={{ background: themeColor }}
        >
          {comp.label || "Click Here"}
        </div>
      </div>`,
  `      <div className="flex justify-center w-full px-4 py-4">
        {wrap('button',
          <div
            className="w-full h-full flex items-center justify-center text-sm font-bold shadow-md text-white text-center cursor-pointer"
            style={{ background: themeColor }}
          >
            {comp.label || "Click Here"}
          </div>,
          "auto", "auto", "16px", "9999px"
        )}
      </div>`,
);

// Form grid card
code = code.replace(
  `            <div
              key={idx}
              className="border border-border/60 rounded-2xl p-5 flex flex-col h-full"
              style={{
                backgroundColor: comp.cardBgColor || "var(--card)",
                color: comp.cardTextColor || "inherit",
              }}
            >`,
  `            <div key={idx} className="flex h-full">
              {wrap(\`card_\${idx}\`, 
                <div
                  className="border border-border/60 p-5 flex flex-col h-full w-full"
                  style={{
                    backgroundColor: comp.cardBgColor || "var(--card)",
                    color: comp.cardTextColor || "inherit",
                  }}
                >`,
);
code = code.replace(
  `              <div
                className="w-full rounded-full mt-auto py-2 text-center text-white text-sm font-medium"
                style={{ background: themeColor }}
              >
                {card.buttonLabel || "Register"}
              </div>
            </div>`,
  `              <div
                className="w-full rounded-full mt-auto py-2 text-center text-white text-sm font-medium"
                style={{ background: themeColor }}
              >
                {card.buttonLabel || "Register"}
              </div>
            </div>, "100%", "100%", "0px", "16px")}
            </div>`,
);

fs.writeFileSync(file, code);
