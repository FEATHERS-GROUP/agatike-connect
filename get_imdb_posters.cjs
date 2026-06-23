const movies = [
  "Deadpool Wolverine",
  "Inside Out 2",
  "Dune Part Two",
  "Bad Boys Ride or Die",
  "A Quiet Place Day One",
  "Despicable Me 4",
  "Twisters",
  "Gladiator II",
  "Furiosa",
  "Kingdom of the Planet of the Apes",
  "Alien Romulus",
  "Wicked",
  "Moana 2",
  "Venom The Last Dance",
  "Mufasa The Lion King",
  "Beyond the Spider-Verse",
  "Joker Folie",
  "The Fall Guy",
  "Civil War",
  "Kung Fu Panda 4"
];

async function getPoster(title) {
  try {
    const query = encodeURIComponent(title.toLowerCase().replace(/ /g, '_'));
    const letter = query.charAt(0);
    const url = `https://v3.sg.media-imdb.com/suggestion/x/${query}.json`;
    const res = await fetch(url);
    const data = await res.json();
    if (data.d && data.d.length > 0) {
      for (const item of data.d) {
        if (item.i && item.i.imageUrl) {
          return item.i.imageUrl;
        }
      }
    }
    return null;
  } catch (err) {
    return null;
  }
}

async function run() {
  const results = {};
  for (const movie of movies) {
    const url = await getPoster(movie);
    results[movie] = url;
  }
  console.log(JSON.stringify(results, null, 2));
}

run();
