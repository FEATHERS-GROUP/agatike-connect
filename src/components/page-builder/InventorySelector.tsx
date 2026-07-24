import { useQuery } from "@tanstack/react-query";
import { getWorkspaceProducts } from "@/api/products";
import { getWorkspaceEvents } from "@/api/events";
import { getSpaces } from "@/api/spaces";
import { getWorkspaceVenueProjects } from "@/api/venues";
import { getMovies } from "@/api/cinema_management";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function InventorySelector({ type, workspace_id, comp, updateComponent, idx }: any) {
  const { data: products = [] } = useQuery({
    queryKey: ["workspace-products", workspace_id],
    queryFn: () => getWorkspaceProducts({ data: { workspace_id } } as any),
    enabled: type === "product_list" && !!workspace_id,
  });

  const { data: events = [] } = useQuery({
    queryKey: ["workspace-events", workspace_id],
    queryFn: () => getWorkspaceEvents({ data: { workspace_id } } as any),
    enabled: type === "event_list" && !!workspace_id,
  });

  const { data: spaces = [] } = useQuery({
    queryKey: ["workspace-spaces", workspace_id],
    queryFn: () => getSpaces({ data: { workspace_id } } as any),
    enabled: type === "space_list" && !!workspace_id,
  });

  const { data: venues = [] } = useQuery({
    queryKey: ["workspace-venues", workspace_id],
    queryFn: () => getWorkspaceVenueProjects({ data: { workspace_id } } as any),
    enabled: type === "venue_list" && !!workspace_id,
  });

  const { data: movies = [] } = useQuery({
    queryKey: ["workspace-movies", workspace_id],
    queryFn: () => getMovies({ data: { workspace_id } } as any),
    enabled: type === "movie_list" && !!workspace_id,
  });

  const items =
    type === "product_list"
      ? products
      : type === "event_list"
        ? events
        : type === "space_list"
          ? spaces
          : type === "venue_list"
            ? venues
            : type === "movie_list"
              ? movies
              : [];

  const selectedItemIds = comp.selectedItemIds || [];

  const toggleItem = (id: string) => {
    if (selectedItemIds.includes(id)) {
      updateComponent(
        idx,
        "selectedItemIds",
        selectedItemIds.filter((itemId: string) => itemId !== id)
      );
    } else {
      updateComponent(idx, "selectedItemIds", [...selectedItemIds, id]);
    }
  };

  return (
    <div className="space-y-4 pt-4 mt-4 border-t border-border/40">
      <div className="flex flex-col gap-2">
        <Label className="text-xs font-semibold">Select Specific Items (Optional)</Label>
        <p className="text-[10px] text-muted-foreground leading-tight">
          If none are selected, all available items will be shown automatically.
        </p>
        
        {items.length === 0 ? (
          <div className="p-3 bg-secondary/20 rounded-md border border-border/40 text-xs text-muted-foreground italic">
            No items found in this workspace.
          </div>
        ) : (
          <div className="border border-border/40 rounded-md overflow-hidden max-h-48 overflow-y-auto bg-background/50">
            {items.map((item: any) => (
              <div 
                key={item.id} 
                className="flex items-center gap-2 p-2.5 border-b border-border/40 last:border-0 hover:bg-secondary/40 transition-colors"
              >
                <Checkbox 
                  id={`item-${item.id}`} 
                  checked={selectedItemIds.includes(item.id)}
                  onCheckedChange={() => toggleItem(item.id)}
                />
                <label 
                  htmlFor={`item-${item.id}`} 
                  className="text-xs font-medium cursor-pointer flex-1 truncate"
                >
                  {item.name || item.title}
                </label>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <Label className="text-xs">Limit Display Count (Optional)</Label>
        <Input
          type="number"
          min="1"
          placeholder="e.g. 5"
          value={comp.limit || ""}
          onChange={(e) => updateComponent(idx, "limit", e.target.value ? parseInt(e.target.value) : undefined)}
          className="bg-background h-8 text-xs"
        />
        <p className="text-[10px] text-muted-foreground">
          Only show the most recent N items (ignored if specific items are selected).
        </p>
      </div>
    </div>
  );
}
