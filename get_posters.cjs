const movies = [
  "Deadpool & Wolverine",
  "Inside Out 2",
  "Dune: Part Two",
  "Bad Boys: Ride or Die",
  "A Quiet Place: Day One",
  "Despicable Me 4",
  "Twisters (film)",
  "Gladiator II",
  "Furiosa: A Mad Max Saga",
  "Kingdom of the Planet of the Apes",
  "Alien: Romulus",
  "Wicked (2024 film)",
  "Moana 2",
  "Venom: The Last Dance",
  "Mufasa: The Lion King",
  "Spider-Man: Beyond the Spider-Verse",
  "Joker: Folie à Deux",
  "The Fall Guy (2024 film)",
  "Civil War (film)",
  "Kung Fu Panda 4",
];

async function getPoster(title) {
  try {
    const encodedTitle = encodeURIComponent(title);
    const url = `https://en.wikipedia.org/w/api.php?action=query&prop=pageimages&format=json&piprop=original&titles=${encodedTitle}`;
    const res = await fetch(url);
    const data = await res.json();
    const pages = data.query.pages;
    const pageId = Object.keys(pages)[0];
    if (pageId === "-1" || !pages[pageId].original) {
      if (!title.includes("(film)")) {
        return await getPoster(`${title} (film)`);
      }
      return null;
    }
    return pages[pageId].original.source;
  } catch (err) {
    return null;
  }
}

async function run() {
  const results = {};
  for (const movie of movies) {
    const url = await getPoster(movie);
    results[movie] = url || "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800";
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
