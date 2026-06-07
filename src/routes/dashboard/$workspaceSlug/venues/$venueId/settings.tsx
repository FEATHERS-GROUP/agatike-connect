import { createFileRoute, useParams } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { rentableVenues } from "@/lib/mock-data";

export const Route = createFileRoute("/dashboard/$workspaceSlug/venues/$venueId/settings")({
  component: VenueSettingsPage,
});

function VenueSettingsPage() {
  const { venueId } = useParams({ strict: false });
  const venue = rentableVenues.find((v) => v.id === venueId);
  const [rentalType, setRentalType] = useState(venue?.rentalType || "Per Day");

  if (!venue) return <div>Venue not found</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-6 rounded-3xl border border-border/60">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Venue Settings</h2>
          <p className="text-muted-foreground mt-1 text-sm">
            Update your property's public listing information.
          </p>
        </div>
        <Button
          className="rounded-full gap-2 shadow-[var(--shadow-glow)]"
          style={{ background: "var(--gradient-primary)" }}
        >
          <Save className="h-4 w-4" /> Save Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          {/* General Info */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">General Information</h3>

            <div className="space-y-1.5">
              <Label>Venue Name</Label>
              <Input defaultValue={venue.name} className="h-10 rounded-xl bg-secondary/50" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Type</Label>
                <select className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="Stadium">Stadium</option>
                  <option value="Arena">Arena</option>
                  <option value="Conference Room">Conference Room</option>
                  <option value="Wedding Garden">Wedding Garden</option>
                  <option value="Basketball Court">Basketball Court</option>
                  <option value="Football Pitch">Football Pitch</option>
                  <option value="Gaming Lounge">Gaming Lounge</option>
                  <option value="Park">Park</option>
                  <option value="Museum">Museum</option>
                  <option value="Playground">Playground</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label>City / Location</Label>
                <Input defaultValue={venue.city} className="h-10 rounded-xl bg-secondary/50" />
              </div>
            </div>
          </div>

          {/* Pricing & Capacity */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Pricing & Capacity</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Maximum Capacity (Guests)</Label>
                <Input
                  type="number"
                  defaultValue={venue.capacity}
                  className="h-10 rounded-xl bg-secondary/50"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Rental Type Allowed</Label>
                <select
                  value={rentalType}
                  onChange={(e) => setRentalType(e.target.value)}
                  className="w-full h-10 rounded-xl bg-secondary/50 border border-input px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="Per Day">Per Day Only</option>
                  <option value="Per Hour">Per Hour Only</option>
                  <option value="Per Week">Per Week</option>
                  <option value="Annually">Annually</option>
                  <option value="Entrance Fee">Entrance Fee (Tickets)</option>
                  <option value="Multiple">Multiple Options</option>
                  <option value="Both">Both (Day & Hour)</option>
                </select>
              </div>
              
              {(rentalType === "Entrance Fee" || rentalType === "Multiple") && (
                <div className="space-y-1.5">
                  <Label>Entrance Fee (Per Person)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {venue.currency}
                    </span>
                    <Input
                      type="number"
                      defaultValue={venue.entranceFee || 0}
                      className="pl-8 h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
              
              {(rentalType === "Per Hour" || rentalType === "Both" || rentalType === "Multiple") && (
                <div className="space-y-1.5">
                  <Label>Price per Hour</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {venue.currency}
                    </span>
                    <Input
                      type="number"
                      defaultValue={venue.pricePerHour || 0}
                      className="pl-8 h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
              
              {(rentalType === "Per Day" || rentalType === "Both" || rentalType === "Multiple") && (
                <div className="space-y-1.5">
                  <Label>Price per Day</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {venue.currency}
                    </span>
                    <Input
                      type="number"
                      defaultValue={venue.pricePerDay || 0}
                      className="pl-8 h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
              
              {(rentalType === "Per Week" || rentalType === "Multiple") && (
                <div className="space-y-1.5">
                  <Label>Price per Week</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {venue.currency}
                    </span>
                    <Input
                      type="number"
                      defaultValue={venue.pricePerWeek || 0}
                      className="pl-8 h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
              
              {(rentalType === "Annually" || rentalType === "Multiple") && (
                <div className="space-y-1.5">
                  <Label>Price Annually</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {venue.currency}
                    </span>
                    <Input
                      type="number"
                      defaultValue={venue.priceAnnually || 0}
                      className="pl-8 h-10 rounded-xl bg-secondary/50"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amenities */}
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Amenities</h3>
            <p className="text-sm text-muted-foreground">
              List the amenities included in the rental price.
            </p>
            <Input
              defaultValue={venue.amenities.join(", ")}
              className="h-10 rounded-xl bg-secondary/50"
            />
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Listing Status</h3>
            <div className="space-y-3">
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  defaultChecked={venue.status === "Active"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Active</p>
                  <p className="text-xs text-muted-foreground">Visible and bookable</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  defaultChecked={venue.status === "Draft"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Draft</p>
                  <p className="text-xs text-muted-foreground">Hidden from public</p>
                </div>
              </label>
              <label className="flex items-center gap-3 p-3 border border-border/60 rounded-xl cursor-pointer hover:bg-secondary/20 transition-colors">
                <input
                  type="radio"
                  name="status"
                  defaultChecked={venue.status === "Maintenance"}
                  className="accent-primary"
                />
                <div>
                  <p className="font-medium text-sm">Maintenance</p>
                  <p className="text-xs text-muted-foreground">Temporarily unavailable</p>
                </div>
              </label>
            </div>
          </div>

          <div className="bg-card p-6 rounded-3xl border border-border/60 space-y-4">
            <h3 className="font-semibold text-lg">Cover Photo</h3>
            <div className="aspect-video rounded-xl overflow-hidden bg-secondary">
              <img src={venue.cover} alt="Cover" className="w-full h-full object-cover" />
            </div>
            <Button variant="outline" className="w-full rounded-xl">
              Upload New Photo
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
