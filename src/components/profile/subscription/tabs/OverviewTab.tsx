import React from "react";
import { format } from "date-fns";
import { Building2, MapPin, Phone, MessageCircle, Instagram, Receipt } from "lucide-react";

interface OverviewTabProps {
  space: any;
  subscription: any;
}

export function OverviewTab({ space, subscription }: OverviewTabProps) {
  return (
    <div className="space-y-4 md:space-y-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="bg-card border border-border/40 rounded-[32px] md:rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg md:text-xl font-bold mb-4">Space Information</h3>
        <p className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap mb-6">
          {space?.description || "No description provided."}
        </p>

        {space?.type && (
          <div className="pt-4 border-t border-border/40">
            <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
              Facility Type
            </h4>
            <div className="flex items-center gap-2 text-sm font-medium">
              <Building2 className="h-4 w-4 text-primary" />
              <span className="capitalize">{space.type.replace(/_/g, " ")}</span>
            </div>
          </div>
        )}

        {space?.locations && space.locations.length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
              Locations
            </h4>
            <div className="space-y-3">
              {space.locations.map((loc: any, i: number) => (
                <div key={i} className="flex items-start gap-2 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                  <span>{[loc.address, loc.city, loc.country].filter(Boolean).join(", ")}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {space?.socials && Object.keys(space.socials).length > 0 && (
          <div className="pt-4 border-t border-border/40">
            <h4 className="text-xs uppercase font-bold tracking-wider text-muted-foreground mb-3">
              Contact & Socials
            </h4>
            <div className="flex flex-wrap gap-4">
              {space.socials.phone && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>{space.socials.phone}</span>
                </div>
              )}
              {space.socials.whatsapp && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <MessageCircle className="h-4 w-4 text-primary" />
                  <span>{space.socials.whatsapp}</span>
                </div>
              )}
              {space.socials.instagram && (
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Instagram className="h-4 w-4 text-primary" />
                  <span>{space.socials.instagram}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="bg-card border border-border/40 rounded-[32px] md:rounded-3xl p-6 md:p-8 shadow-sm">
        <h3 className="text-lg md:text-xl font-bold flex items-center gap-2 mb-4">
          <Receipt className="h-4 w-4 text-primary" />
          Recent Invoices
        </h3>
        {subscription?.invoices?.length > 0 ? (
          <div className="space-y-4">
            {subscription.invoices.map((inv: any) => (
              <div
                key={inv.id}
                className="flex items-center justify-between p-4 rounded-2xl bg-secondary/20 border border-transparent"
              >
                <div>
                  <p className="text-sm font-bold text-foreground">{inv.invoice_number}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(inv.created_at), "MMM d, yyyy")}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500 shadow-sm">
                  {inv.status}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-secondary/10 rounded-2xl">
            <p className="text-sm text-muted-foreground font-medium">No invoices yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
