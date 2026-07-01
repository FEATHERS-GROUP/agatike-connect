import * as fs from "fs";

const file = "src/routes/dashboard/$workspaceSlug/book/procurement.tsx";
// Wait, the file is README.md!
const readmePath = "README.md";
let content = fs.readFileSync(readmePath, "utf8");

const newContent = `
---

## 25. Procurement & Document Management (Agatike Book)

**Files:** \`src/routes/dashboard.$workspaceSlug.book.procurement.tsx\`, \`src/routes/dashboard.$workspaceSlug.book.procurement_.create.tsx\`, \`src/routes/dashboard.$workspaceSlug.book.procurement_.$id.tsx\`

The **Procurement Module** within Agatike Book allows organizers to generate, organize, and preview professional financial documents natively without needing external tools like Canva or Word.

### Core Architecture

- **Document Variety:** Supports generating \`quote\`, \`proforma\`, \`invoice\`, \`receipt\`, \`purchase_order\`, and \`credit_note\`.
- **Dynamic Theming:** The styling of the PDF/Print preview is fully dynamic. E.g., Receipts use emerald greens with a "PAID" watermark; Purchase Orders use bold slate headers; Credit Notes use red accents.
- **Canva-like Rendering:** The preview screen (\`/procurement/$id\`) forces an A4-sized web canvas (\`210mm\` x \`297mm\`) on screen with \`@media print\` rules. When the user hits "Print" or "Download PDF", the browser accurately prints the exact UI shown on screen, guaranteeing WYSIWYG (What You See Is What You Get) fidelity.
- **Custom Metadata & Asset Injection:** Organizers can upload their Logos, Signatures, and Stamps via the \`storage\` API. These are dynamically placed in absolute positions on the final A4 canvas.

### Folder Management System

To prevent clutter as organizers generate hundreds of documents, the Procurement system implements a strict **Folder Infrastructure**.

- **Structure:** Uses a flat \`agatike_book_folders\` table holding \`name\` and \`workspace_id\`.
- **Linking:** \`agatike_book_invoices\` has a nullable \`folder_id\` foreign key.
- **UX (Right-Click Organization):** The UI uses Radix UI Context Menus. Users can right-click the background to "Create Folder" (opening a Dialog modal) or right-click any specific document to move it to a specific folder. 
- **Bulk Operations:** Users can select multiple documents at once via Checkboxes and trigger a "Bulk Move" or "Bulk Delete" dropdown menu.
- **Safety Constraints:** The system prevents the deletion of a folder if there are any documents inside it, requiring the organizer to move them out first.

\`\`\`mermaid
flowchart TD
    Proc[Procurement Page] --> |Right Click| Ctx[Context Menu]
    Ctx --> |Create Folder| Modal[Dialog Modal]
    Modal --> DB[(agatike_book_folders)]
    Proc --> |Right Click Invoice| Move[Move to Folder]
    Move --> Update[Update invoice folder_id]
    Proc --> |Checkboxes| Bulk[Bulk Actions Toolbar]
    Bulk --> BulkMove[Promise.all Move]
    Bulk --> BulkDel[Promise.all Delete]
\`\`\`

---

## 26. Page Builder & Dynamic Layouts

**Route:** \`/dashboard/$workspaceSlug/page-builder\`

The **Page Builder** has been enhanced to offer advanced block-based website creation tools for organizers building public-facing event hubs. 
- Organizers can dynamically stack layout blocks (Hero, Features, Pricing, Testimonials).
- State is strictly controlled via a centralized \`editorState\` context, persisting changes to JSONB layouts in the database.
- It seamlessly integrates with the \`b.$qrString.tsx\` verification endpoints to ensure all public routing retains the organizer's exact stylistic choices.

`;

content = content.replace("---

_Last updated: June 2026 — Agatike Connect_", newContent + "\n---\n\n_Last updated: July 2026 — Agatike Connect_");

fs.writeFileSync(readmePath, content);
console.log("README updated");
