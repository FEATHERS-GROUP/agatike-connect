import { LayoutTemplate, Users } from "lucide-react";
import { CustomForm } from "@/api/rsvps";

interface RsvpSummaryCardsProps {
  forms: CustomForm[];
}

export function RsvpSummaryCards({ forms }: RsvpSummaryCardsProps) {
  const activeFormsCount = forms.filter((f) => f.is_active).length;
  const totalRsvpsCount = forms.reduce((acc, f) => acc + (f.rsvps?.length || 0), 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Active Forms</p>
            <h3 className="text-3xl font-bold mt-2">{activeFormsCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <LayoutTemplate className="h-6 w-6" />
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Total RSVPs</p>
            <h3 className="text-3xl font-bold mt-2">{totalRsvpsCount}</h3>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
            <Users className="h-6 w-6" />
          </div>
        </div>
      </div>
    </div>
  );
}
