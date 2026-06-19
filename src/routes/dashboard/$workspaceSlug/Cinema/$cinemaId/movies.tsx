import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Plus, Edit2, Trash2, Calendar, Film } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from "@/components/ui/drawer";

const MOCK_MOVIES = [
  {
    id: "m1",
    cinema: "Century Cinema",
    title: "Dune: Part Two",
    genre: "Sci-Fi",
    duration: "2h 46m",
    cover: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800",
    rating: "PG-13",
    synopsis: "Paul Atreides unites with Chani and the Fremen while on a warpath of revenge against the conspirators who destroyed his family.",
    showtimes: ["11:00", "14:30", "18:00", "21:30"],
    price: 10000,
    currency: "RWF",
    status: "now_showing",
  },
  {
    id: "m2",
    cinema: "Century Cinema",
    title: "Deadpool & Wolverine",
    genre: "Action/Comedy",
    duration: "2h 07m",
    cover: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800",
    rating: "R",
    synopsis: "Deadpool's peaceful existence is crashing down when the Time Variance Authority recruits him to help safeguard the multiverse.",
    showtimes: ["12:00", "15:00", "19:00", "22:00"],
    price: 10000,
    currency: "RWF",
    status: "now_showing",
  },
  {
    id: "m3",
    cinema: "Century Cinema",
    title: "Joker: Folie à Deux",
    genre: "Drama/Thriller",
    duration: "2h 18m",
    cover: "https://images.unsplash.com/photo-1571752726703-5e7d1f6a986d?auto=format&fit=crop&q=80&w=800",
    rating: "R",
    synopsis: "Failed comedian Arthur Fleck meets the love of his life, Harley Quinn, while incarcerated at Arkham State Hospital.",
    showtimes: ["19:30"],
    price: 12000,
    currency: "RWF",
    status: "coming_soon",
  },
];

export const Route = createFileRoute("/dashboard/$workspaceSlug/Cinema/$cinemaId/movies")({
  component: CinemaMovies,
});

function CinemaMovies() {
  const [selectedMovie, setSelectedMovie] = useState<(typeof MOCK_MOVIES)[0] | null>(null);

  const nowShowing = MOCK_MOVIES.filter((m) => m.status === "now_showing");
  const comingSoon = MOCK_MOVIES.filter((m) => m.status === "coming_soon");

  return (
    <div className="space-y-16 animate-in fade-in duration-500 max-w-6xl mx-auto">
      {/* Now Showing */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Now Showing</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Manage movies currently screening.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl gap-2 shadow-sm border-primary/20 text-primary hover:bg-primary/10">
            <Plus className="h-4 w-4" /> Add Movie
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {nowShowing.map((movie) => (
            <div
              key={movie.id}
              className="group flex flex-col h-full bg-card/40 border border-border/40 hover:border-border/80 rounded-3xl p-3 transition-all duration-300 relative"
            >
              {/* Management Hover Overlay */}
              <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-black shadow-md" onClick={() => setSelectedMovie(movie)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm mb-4">
                <img
                  src={movie.cover}
                  alt={movie.title}
                  className="w-full h-full object-cover transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-colors duration-300" />
                <span className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/10">
                  {movie.rating}
                </span>
              </div>
              <div className="flex-1 flex flex-col">
                <h3 className="font-bold text-base md:text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                  {movie.title}
                </h3>
                <p className="text-xs text-muted-foreground mb-3">
                  {movie.genre} • {movie.duration}
                </p>

                <div className="mt-auto">
                  <div className="flex flex-wrap gap-1 mb-3">
                    {movie.showtimes.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 bg-secondary text-[10px] font-semibold rounded-md border border-border/60"
                      >
                        {t}
                      </span>
                    ))}
                    {movie.showtimes.length > 3 && (
                      <span className="px-2 py-1 bg-secondary text-[10px] font-semibold rounded-md border border-border/60 text-muted-foreground">
                        +{movie.showtimes.length - 3}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(movie.price, movie.currency)}
                    </span>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="h-7 text-xs rounded-lg"
                      onClick={() => setSelectedMovie(movie)}
                    >
                      Manage
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Coming Soon / Premieres */}
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Coming Soon & Premieres</h2>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Schedule future screenings and premiere events.
            </p>
          </div>
          <Button variant="outline" className="rounded-xl gap-2 shadow-sm">
            <Calendar className="h-4 w-4" /> Schedule Premiere
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {comingSoon.map((movie) => (
             <div
             key={movie.id}
             className="group flex flex-col h-full bg-card/40 border border-border/40 hover:border-border/80 rounded-3xl p-3 transition-all duration-300 relative"
           >
             <div className="absolute top-5 right-5 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-20">
               <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full bg-white/90 hover:bg-white text-black shadow-md" onClick={() => setSelectedMovie(movie)}>
                 <Edit2 className="h-3.5 w-3.5" />
               </Button>
               <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full shadow-md">
                 <Trash2 className="h-3.5 w-3.5" />
               </Button>
             </div>

             <div className="relative aspect-[2/3] rounded-2xl overflow-hidden shadow-sm mb-4">
               <img
                 src={movie.cover}
                 alt={movie.title}
                 className="w-full h-full object-cover transition-transform duration-700"
               />
               <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-colors duration-300" />
               <span className="absolute top-2 left-2 rounded bg-black/60 backdrop-blur-md px-1.5 py-0.5 text-[10px] font-bold text-white border border-white/10">
                 {movie.rating}
               </span>
             </div>
             <div className="flex-1 flex flex-col">
               <h3 className="font-bold text-base md:text-lg leading-tight mb-1 group-hover:text-primary transition-colors">
                 {movie.title}
               </h3>
               <p className="text-xs text-muted-foreground mb-3">
                 {movie.genre} • {movie.duration}
               </p>

               <div className="mt-auto">
                 <div className="flex flex-wrap gap-1 mb-3">
                   {movie.showtimes.slice(0, 3).map((t) => (
                     <span
                       key={t}
                       className="px-2 py-1 bg-secondary text-[10px] font-semibold rounded-md border border-border/60"
                     >
                       {t}
                     </span>
                   ))}
                 </div>
                 <div className="flex items-center justify-between mt-2 pt-3 border-t border-border/40">
                   <span className="text-sm font-bold text-foreground">
                     {formatCurrency(movie.price, movie.currency)}
                   </span>
                   <Button
                     size="sm"
                     variant="secondary"
                     className="h-7 text-xs rounded-lg"
                     onClick={() => setSelectedMovie(movie)}
                   >
                     Manage
                   </Button>
                 </div>
               </div>
             </div>
           </div>
          ))}
        </div>
      </div>

      {/* Movie Details / Edit Drawer */}
      <Drawer open={!!selectedMovie} onOpenChange={(open) => !open && setSelectedMovie(null)}>
        <DrawerContent
          className="max-h-[90vh] p-0 border-border/60 mx-auto md:max-w-2xl"
          aria-describedby="cinema-movie-desc"
        >
          {selectedMovie && (
            <div className="overflow-y-auto hide-scrollbar pb-safe">
              <DrawerHeader className="sr-only">
                <DrawerTitle>Edit {selectedMovie.title}</DrawerTitle>
                <DrawerDescription id="cinema-movie-desc">
                  Update movie details and schedules.
                </DrawerDescription>
              </DrawerHeader>

              <div className="relative aspect-video w-full">
                <img
                  src={selectedMovie.cover}
                  alt={selectedMovie.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
                <Button variant="secondary" className="absolute bottom-4 right-4 rounded-xl shadow-md gap-2">
                  <Edit2 className="h-4 w-4" /> Update Cover
                </Button>
              </div>

              <div className="px-5 -mt-4 relative z-10 pb-8">
                <div className="bg-card border border-border/60 rounded-3xl p-6 shadow-sm space-y-6">
                  
                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Movie Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Title</Label>
                        <Input defaultValue={selectedMovie.title} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Genre</Label>
                        <Input defaultValue={selectedMovie.genre} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Duration</Label>
                        <Input defaultValue={selectedMovie.duration} className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Rating</Label>
                        <Input defaultValue={selectedMovie.rating} className="rounded-xl" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Synopsis</Label>
                      <Textarea defaultValue={selectedMovie.synopsis} className="rounded-xl min-h-[100px] resize-y" />
                    </div>
                  </div>

                  <hr className="border-border/40" />

                  <div className="space-y-4">
                    <h3 className="font-bold text-lg">Ticketing & Schedule</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Base Ticket Price ({selectedMovie.currency})</Label>
                        <Input defaultValue={selectedMovie.price} type="number" className="rounded-xl" />
                      </div>
                      <div className="space-y-2">
                        <Label>Status</Label>
                        <select className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                          <option value="now_showing" selected={selectedMovie.status === "now_showing"}>Now Showing</option>
                          <option value="coming_soon" selected={selectedMovie.status === "coming_soon"}>Coming Soon</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <Label className="flex justify-between items-center">
                        <span>Showtimes</span>
                        <button className="text-primary text-xs font-bold hover:underline">Add Showtime</button>
                      </Label>
                      <div className="flex flex-wrap gap-2">
                        {selectedMovie.showtimes.map((t, i) => (
                          <div key={i} className="flex items-center bg-secondary/50 border border-border/60 rounded-lg pl-3 pr-1 py-1 gap-2">
                            <span className="text-sm font-semibold">{t}</span>
                            <button className="text-muted-foreground hover:text-destructive p-1 rounded-md transition-colors">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-6 border-t border-border/40 mt-6">
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl h-11"
                      onClick={() => setSelectedMovie(null)}
                    >
                      Cancel
                    </Button>
                    <Button
                      className="flex-1 rounded-xl h-11 shadow-[var(--shadow-glow)]"
                      style={{ background: "var(--gradient-primary)" }}
                    >
                      Save Changes
                    </Button>
                  </div>
                  
                </div>
              </div>
            </div>
          )}
        </DrawerContent>
      </Drawer>
    </div>
  );
}
