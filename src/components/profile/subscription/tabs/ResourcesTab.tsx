import React from "react";
import { Building2, User, Clock, MapPin, ChevronRight } from "lucide-react";

interface ResourcesTabProps {
  resources: any[];
  onBookResource: (resource: any) => void;
}

export function ResourcesTab({ resources, onBookResource }: ResourcesTabProps) {
  return (
    <div className="bg-card border border-border/40 rounded-[32px] md:rounded-3xl p-6 md:p-8 shadow-sm animate-in slide-in-from-bottom-4 fade-in duration-500">
      <div className="mb-6 md:mb-8 max-w-xl">
        <h3 className="text-xl md:text-2xl font-bold mb-2">Available Resources</h3>
        <p className="text-muted-foreground text-sm md:text-base leading-relaxed">Book a desk, meeting room, or equipment for your next visit.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        {resources?.length > 0 ? (
          resources.map((res: any) => (
            <div key={res.id} className="group relative bg-secondary/5 rounded-2xl md:rounded-3xl p-5 md:p-6 border border-border/40 hover:border-primary/50 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between" onClick={() => onBookResource(res)}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  {res.type === "desk" ? <User className="h-5 w-5 md:h-6 md:w-6 text-primary" /> : <Building2 className="h-5 w-5 md:h-6 md:w-6 text-primary" />}
                </div>
                {res.capacity && (
                  <span className="text-[10px] md:text-xs font-bold px-2.5 py-1 rounded-full bg-secondary text-foreground">
                    Up to {res.capacity}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-bold text-base md:text-lg mb-1 group-hover:text-primary transition-colors">{res.name}</h4>
                <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-3">{res.description || `Book this ${res.type.replace(/_/g, " ")} for your work.`}</p>
                <div className="flex items-center gap-3 mt-auto">
                  {res.rules?.operatingHours && (
                    <span className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-muted-foreground bg-secondary/20 px-2 py-1 rounded-md">
                      <Clock className="w-3 h-3" />
                      {res.rules.operatingHours.start} - {res.rules.operatingHours.end}
                    </span>
                  )}
                  {res.rules?.locationId && (
                    <span className="flex items-center gap-1 text-[10px] md:text-xs font-medium text-muted-foreground bg-secondary/20 px-2 py-1 rounded-md">
                      <MapPin className="w-3 h-3" />
                      Location {res.rules.locationId}
                    </span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 right-4 md:bottom-6 md:right-6 opacity-0 translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                <div className="flex items-center gap-1.5 text-xs font-bold text-primary bg-primary/10 px-3 py-1.5 rounded-full">
                  Book <ChevronRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-12 md:py-16 bg-secondary/10 rounded-2xl md:rounded-3xl border border-dashed border-border/40">
            <Building2 className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground font-semibold text-base md:text-lg">No resources available.</p>
          </div>
        )}
      </div>
    </div>
  );
}
