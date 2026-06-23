const fs = require('fs');

let content = fs.readFileSync('src/components/mobile/HomeMobile.tsx', 'utf8');

// 1. Add missing imports
content = content.replace(
  'import { getPublicEvents } from "@/api/events";',
  `import { getPublicEvents } from "@/api/events";
import { getPublicMovieSchedules } from "@/api/cinemas";
import { MOCK_MOVIES } from "@/lib/mock-movies";`
);

// 2. Replace the stubbed movies with movieStories
const stubbedMoviesRegex = /\/\/ Stubbed mock data\nconst movies: any\[\] = \[[\s\S]*?\];\nconst stories: any\[\] = \[[\s\S]*?\];/g;
const replacementStories = `const movieStories: any[] = [
  {
    id: "cs1",
    name: "Century Cinemax",
    avatar: "https://ui-avatars.com/api/?name=Century+Cinemax&background=000&color=fff",
    items: [
      { id: "cs1i1", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
      { id: "cs1i2", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
    ],
  },
  {
    id: "cs2",
    name: "Silverbird Cinemas",
    avatar: "https://ui-avatars.com/api/?name=Silverbird+Cinemas&background=1D4ED8&color=fff",
    items: [
      { id: "cs2i1", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
      { id: "cs2i2", image: "https://upload.wikimedia.org/wikipedia/en/8/8b/Bad_Boys_Ride_or_Die_%282024%29_poster.jpg" },
    ],
  },
  {
    id: "cs3",
    name: "Ster-Kinekor",
    avatar: "https://ui-avatars.com/api/?name=Ster-Kinekor&background=E11D48&color=fff",
    items: [
      { id: "cs3i1", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&fit=crop" },
      { id: "cs3i2", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
    ],
  },
  {
    id: "cs4",
    name: "Canal Olympia",
    avatar: "https://ui-avatars.com/api/?name=Canal+Olympia&background=047857&color=fff",
    items: [
      { id: "cs4i1", image: "https://upload.wikimedia.org/wikipedia/en/8/8b/Bad_Boys_Ride_or_Die_%282024%29_poster.jpg" },
      { id: "cs4i2", image: "https://images.unsplash.com/photo-1534158914592-062992fbe900?w=800&fit=crop" },
    ],
  },
  {
    id: "cs5",
    name: "Nu Metro",
    avatar: "https://ui-avatars.com/api/?name=Nu+Metro&background=7C3AED&color=fff",
    items: [
      { id: "cs5i1", image: "https://upload.wikimedia.org/wikipedia/en/4/4c/Deadpool_%26_Wolverine_poster.jpg" },
      { id: "cs5i2", image: "https://upload.wikimedia.org/wikipedia/en/f/f7/Inside_Out_2_poster.jpg" },
    ],
  },
];`;
content = content.replace(stubbedMoviesRegex, replacementStories);

// 3. Add fetching schedules inside HomeMobile
const schedulesHook = `
  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });

  const { data: schedules = [] } = useQuery({
    queryKey: ["public-movie-schedules-mobile"],
    queryFn: () => getPublicMovieSchedules(),
  });

  const dynamicMovieStories = useMemo(() => {
    if (!schedules || schedules.length === 0) return movieStories;
    const cinemasMap = new Map<string, any>();
    schedules.forEach((s: any) => {
      const c = s.cinema;
      const m = s.movie;
      if (!c || !m) return;
      if (!cinemasMap.has(c.id)) {
        cinemasMap.set(c.id, {
          id: c.id,
          name: c.name,
          avatar: c.logo_url || c.cover_url || \`https://ui-avatars.com/api/?name=\${encodeURIComponent(c.name)}&background=random\`,
          items: [],
          _movieIds: new Set(),
        });
      }
      const cinemaEntry = cinemasMap.get(c.id);
      if (!cinemaEntry._movieIds.has(m.id)) {
        cinemaEntry._movieIds.add(m.id);
        cinemaEntry.items.push({
          id: \`\${c.id}-\${m.id}\`,
          image: m.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=800",
        });
      }
    });
    
    const dynamicStories = Array.from(cinemasMap.values()).filter(c => c.items.length > 0);
    return dynamicStories.length > 0 ? [...dynamicStories, ...movieStories] : movieStories;
  }, [schedules]);

  const movies = useMemo(() => {
    const moviesMap = new Map();
    schedules.forEach((s: any) => {
      if (s.movie) {
        moviesMap.set(s.movie.id, {
          ...s.movie,
          cover: s.movie.cover_url || "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?w=600"
        });
      }
    });
    const realMovies = Array.from(moviesMap.values());
    const mockToAdd = MOCK_MOVIES.filter(mock => !realMovies.some(r => r.title === mock.title));
    return [...realMovies, ...mockToAdd];
  }, [schedules]);
`;

content = content.replace(
  `  const { data: dbEvents = [] } = useQuery({
    queryKey: ["public-events"],
    queryFn: () => getPublicEvents(),
  });`,
  schedulesHook
);

// 4. Update Stories to use dynamicMovieStories instead of stories
content = content.replace(/<Stories items=\{stories\} \/>/g, '<Stories items={dynamicMovieStories} />');

fs.writeFileSync('src/components/mobile/HomeMobile.tsx', content);
