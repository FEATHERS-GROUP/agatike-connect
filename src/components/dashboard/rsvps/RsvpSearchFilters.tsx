import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RsvpSearchFiltersProps {
  search: string;
  setSearch: (search: string) => void;
}

export function RsvpSearchFilters({ search, setSearch }: RsvpSearchFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-2xl border border-border/60 shadow-sm">
      <div className="relative flex-1 w-full max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search forms by name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 rounded-full bg-secondary/50 border-transparent focus-visible:ring-primary/20"
        />
      </div>
      <div className="flex gap-3 w-full sm:w-auto">
        <Button variant="outline" className="rounded-full shadow-sm w-full sm:w-auto">
          <Filter className="mr-2 h-4 w-4" /> Filter
        </Button>
      </div>
    </div>
  );
}
