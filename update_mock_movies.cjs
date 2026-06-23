const fs = require('fs');

const data = {
  "Deadpool & Wolverine": "https://m.media-amazon.com/images/M/MV5BZTk5ODY0MmQtMzA3Ni00NGY1LThiYzItZThiNjFiNDM4MTM3XkEyXkFqcGc@._V1_.jpg",
  "Inside Out 2": "https://m.media-amazon.com/images/M/MV5BYWY3MDE2Y2UtOTE3Zi00MGUzLTg2MTItZjE1ZWVkMGVlODRmXkEyXkFqcGc@._V1_.jpg",
  "Dune: Part Two": "https://m.media-amazon.com/images/M/MV5BNTc0YmQxMjEtODI5MC00NjFiLTlkMWUtOGQ5NjFmYWUyZGJhXkEyXkFqcGc@._V1_.jpg",
  "Bad Boys: Ride or Die": "https://m.media-amazon.com/images/M/MV5BZWNjZWUwNDgtYTM4ZC00Zjk0LTg3ZWItNGEyZmVkZTIxZDk0XkEyXkFqcGc@._V1_.jpg",
  "A Quiet Place: Day One": "https://m.media-amazon.com/images/M/MV5BZmIwMmU4ZWQtOTczZi00ZWEwLThhNjgtZTkwZDRlYmYzNDhkXkEyXkFqcGc@._V1_.jpg",
  "Despicable Me 4": "https://m.media-amazon.com/images/M/MV5BNzY0ZTlhYzgtOTgzZC00ZTg2LTk4NTEtZDllM2E2NGE5Njg2XkEyXkFqcGc@._V1_.jpg",
  "Twisters": "https://m.media-amazon.com/images/M/MV5BNjM4MWEwMTEtNTcwYi00ZDI4LWEwMzUtNDMzODBhZmI5MWE1XkEyXkFqcGc@._V1_.jpg",
  "Gladiator 2": "https://m.media-amazon.com/images/M/MV5BMWYzZTM5ZGQtOGE5My00NmM2LWFlMDEtMGNjYjdmOWM1MzA1XkEyXkFqcGc@._V1_.jpg",
  "Furiosa: A Mad Max Saga": "https://m.media-amazon.com/images/M/MV5BNTcwYWE1NTYtOWNiYy00NzY3LWIwY2MtNjJmZDkxNDNmOWE1XkEyXkFqcGc@._V1_.jpg",
  "Kingdom of the Planet of the Apes": "https://m.media-amazon.com/images/M/MV5BZDRlZTc3YTItOTk3Yi00NmU4LWFiOGUtNjgwMDZjNjIzNTU1XkEyXkFqcGc@._V1_.jpg",
  "Alien: Romulus": "https://m.media-amazon.com/images/M/MV5BMDU0NjcwOGQtNjNjOS00NzQ3LWIwM2YtYWVmODZjMzQzN2ExXkEyXkFqcGc@._V1_.jpg",
  "Wicked": "https://m.media-amazon.com/images/M/MV5BOWMwYjYzYmMtMWQ2Ni00NWUwLTg2MzAtYzkzMDBiZDIwOTMwXkEyXkFqcGc@._V1_.jpg",
  "Moana 2": "https://m.media-amazon.com/images/M/MV5BMjJkZjE4NjMtNWVjMC00YzIzLWIwYmUtNTBmY2Q0OTQxYTVjXkEyXkFqcGc@._V1_.jpg",
  "Venom: The Last Dance": "https://m.media-amazon.com/images/M/MV5BZDMyYWU4NzItZDY0MC00ODE2LTkyYTMtMzNkNDdmYmFhZDg0XkEyXkFqcGc@._V1_.jpg",
  "Mufasa: The Lion King": "https://m.media-amazon.com/images/M/MV5BYjBkOWUwODYtYWI3YS00N2I0LWEyYTktOTJjM2YzOTc3ZDNlXkEyXkFqcGc@._V1_.jpg",
  "Spider-Man: Beyond the Spider-Verse": "https://m.media-amazon.com/images/M/MV5BYjkwOWViYzYtMDQzNi00N2U0LWIxYTktNWE2ZDYyM2FhN2M5XkEyXkFqcGc@._V1_.jpg",
  "Joker: Folie à Deux": "https://m.media-amazon.com/images/M/MV5BNTRlNmU1NzEtODNkNC00ZGM3LWFmNzQtMjBlMWRiYTcyMGRhXkEyXkFqcGc@._V1_.jpg",
  "The Fall Guy": "https://m.media-amazon.com/images/M/MV5BM2U0MTJiYTItMjNiZS00MzU4LTkxYTAtYTU0ZGY1ODJhMjRhXkEyXkFqcGc@._V1_.jpg",
  "Civil War": "https://m.media-amazon.com/images/M/MV5BYTkzMjc0YzgtY2E0Yi00NDBlLWI0MWUtODY1ZjExMDAyOWZiXkEyXkFqcGc@._V1_.jpg",
  "Kung Fu Panda 4": "https://m.media-amazon.com/images/M/MV5BMzJlNGYxYzQtOTg4MC00OTMyLTkwYzMtZDRlNTgwY2YwOWYxXkEyXkFqcGc@._V1_.jpg"
};

let content = fs.readFileSync('src/lib/mock-movies.ts', 'utf8');

for (const [title, url] of Object.entries(data)) {
  const regex = new RegExp(`(title: "${title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[\\s\\S]*?cover: )"[^"]+"`, 'g');
  content = content.replace(regex, `$1"${url}"`);
}

fs.writeFileSync('src/lib/mock-movies.ts', content);
