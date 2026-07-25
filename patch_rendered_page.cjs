const fs = require('fs');

let content = fs.readFileSync('src/components/page-builder/RenderedPage.tsx', 'utf8');

// 1. Add HideComponents prop
content = content.replace(/export function RenderedPage\(\{ slug, isPreview = false, children, hideHero = false \}: \{ slug: string; isPreview\?: boolean; children\?: React\.ReactNode; hideHero\?: boolean \}\) \{/,
  'export function RenderedPage({ slug, isPreview = false, children, hideHero = false, hideComponents = false }: { slug: string; isPreview?: boolean; children?: React.ReactNode; hideHero?: boolean; hideComponents?: boolean }) {');

// 2. Add Venue and Facility Checkout sheets
content = content.replace(/import \{ ProductCheckoutSheet \} from "@\/components\/page-builder\/ProductCheckoutSheet";/,
  'import { ProductCheckoutSheet } from "@/components/page-builder/ProductCheckoutSheet";\nimport { FacilityCheckoutSheet } from "@/components/page-builder/FacilityCheckoutSheet";\nimport { VenueCheckoutSheet } from "@/components/page-builder/VenueCheckoutSheet";');

// 3. Add state for venue and facility checkout
content = content.replace(/  const \[selectedProductForCheckout, setSelectedProductForCheckout\] = useState<any>\(null\);/,
  `  const [selectedProductForCheckout, setSelectedProductForCheckout] = useState<any>(null);\n\n  const [facilityCheckoutSheetOpen, setFacilityCheckoutSheetOpen] = useState(false);\n  const [selectedFacilityForCheckout, setSelectedFacilityForCheckout] = useState<any>(null);\n  const [selectedFacilityVenue, setSelectedFacilityVenue] = useState<any>(null);\n\n  const [venueCheckoutSheetOpen, setVenueCheckoutSheetOpen] = useState(false);\n  const [selectedVenueForCheckout, setSelectedVenueForCheckout] = useState<any>(null);`);

// 4. Update the loading state to render children if available
content = content.replace(/  if \(isLoadingPage && !isPreview\) \{\n    return \(\n      <div className="min-h-screen flex items-center justify-center bg-secondary\/30">\n        <Loader2 className="h-8 w-8 animate-spin text-primary" \/>\n      <\/div>\n    \);\n  \}/,
  `  if (isLoadingPage && !isPreview) {\n    if (children) {\n      return <div className="min-h-screen bg-background">{children}</div>;\n    }\n    return (\n      <div className="min-h-screen flex items-center justify-center bg-secondary/30">\n        <Loader2 className="h-8 w-8 animate-spin text-primary" />\n      </div>\n    );\n  }`);

// 5. Conditionally render actualComponents based on hideComponents
content = content.replace(/\{actualComponents\?\.map\(\(comp: any\) => \{/,
  `{!hideComponents && actualComponents?.map((comp: any) => {`);

// 6. Update the main wrapper to include --primary theme color
content = content.replace(/      <main className="flex-1 w-full relative z-10" style=\{mainStyle\}>/,
  `      {/* Use style var for custom color to ensure child components like Get Tickets button inherit it */}\n      <main className="flex-1 w-full relative z-10" style={{ ...mainStyle, "--primary": theme_color } as any}>`);

// 7. Update isProduct and CardWrapper logic
content = content.replace(/const isProduct = comp\.type === "product_list";\n[ \t]*const CardWrapper = isProduct \? "div" : "a";\n[ \t]*const wrapperProps = !isProduct[ \t]*\n[ \t]*\? \{ href: item\.is_facility \? `\/venues\/\$\{item\.venue_id\}\/facilities\/checkout\/\$\{item\.id\.split\('_'\)\.pop\(\)\}` : `\$\{linkPrefix\}\$\{item\.id\}` \}[ \t]*\n[ \t]*: \{\};/g,
  `const isProduct = comp.type === "product_list";\n                            const isVenueType = comp.type === "venue_list";\n                            const CardWrapper = isProduct || isVenueType ? "div" : "a";\n                            const wrapperProps = !isProduct && !isVenueType \n                              ? { href: item.is_facility ? \`/venues/\${item.venue_id}/facilities/checkout/\${item.id.split('_').pop()}\` : \`\${linkPrefix}\${item.id}\` } \n                              : {};`);

// 8. Update button click logic for venues and facilities
content = content.replace(/\{comp\.allowSelling !== false &&\n[ \t]*\(isProduct \? \(\n[ \t]*<Button\n[ \t]*size="sm"\n[ \t]*className="rounded-full shrink-0"\n[ \t]*style=\{\{ background: theme_color \}\}\n[ \t]*onClick=\{\(e\) => \{\n[ \t]*e\.preventDefault\(\);\n[ \t]*setSelectedProductForCheckout\(item\);\n[ \t]*setSelectedPaymentBlock\(comp\);\n[ \t]*setProductCheckoutSheetOpen\(true\);\n[ \t]*\}\}/g,
  `{comp.allowSelling !== false &&\n                                      (isProduct || isVenueType ? (\n                                      <Button\n                                        size="sm"\n                                        className="rounded-full shrink-0"\n                                        style={{ background: theme_color }}\n                                        onClick={(e) => {\n                                          e.preventDefault();\n                                          if (isProduct) {\n                                            setSelectedProductForCheckout(item);\n                                            setSelectedPaymentBlock(comp);\n                                            setProductCheckoutSheetOpen(true);\n                                          } else if (isVenueType) {\n                                            if (item.is_facility) {\n                                              const originalVenue = venues.find(v => v.id === item.venue_id);\n                                              setSelectedFacilityVenue(originalVenue);\n                                              setSelectedFacilityForCheckout(item);\n                                              setFacilityCheckoutSheetOpen(true);\n                                            } else {\n                                              setSelectedVenueForCheckout(item);\n                                              setVenueCheckoutSheetOpen(true);\n                                            }\n                                          }\n                                        }}`);

// 9. Add Sheet components at the end
content = content.replace(/        \{selectedProductForCheckout && \(\n[ \t]*<ProductCheckoutSheet\n[ \t]*product=\{selectedProductForCheckout\}\n[ \t]*isOpen=\{productCheckoutSheetOpen\}\n[ \t]*onClose=\{\(\) => setProductCheckoutSheetOpen\(false\)\}\n[ \t]*themeColor=\{theme_color \|\| undefined\}\n[ \t]*\/>\n[ \t]*\)\}/,
  `        {selectedProductForCheckout && (\n          <ProductCheckoutSheet\n            product={selectedProductForCheckout}\n            isOpen={productCheckoutSheetOpen}\n            onClose={() => setProductCheckoutSheetOpen(false)}\n            themeColor={theme_color || undefined}\n          />\n        )}\n\n        {selectedFacilityForCheckout && selectedFacilityVenue && (\n          <FacilityCheckoutSheet\n            venue={selectedFacilityVenue}\n            facility={selectedFacilityForCheckout}\n            isOpen={facilityCheckoutSheetOpen}\n            onClose={() => setFacilityCheckoutSheetOpen(false)}\n            themeColor={theme_color || undefined}\n          />\n        )}\n\n        {selectedVenueForCheckout && (\n          <VenueCheckoutSheet\n            venue={selectedVenueForCheckout}\n            isOpen={venueCheckoutSheetOpen}\n            onClose={() => setVenueCheckoutSheetOpen(false)}\n            themeColor={theme_color || undefined}\n          />\n        )}`);

fs.writeFileSync('src/components/page-builder/RenderedPage.tsx', content);
