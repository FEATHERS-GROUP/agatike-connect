const fs = require('fs');
let data = fs.readFileSync('src/lib/mock-data.ts', 'utf8');
data = data.replace(/  "Bike Rides",\n  "Yoga",\n  "Book Clubs",\n/g, '');
data = data.replace(/export const experienceCategories = \[([\s\S]*?)\];/g, (match, inner) => {
  if (!inner.includes('"Bike Rides"')) {
    inner = inner.replace(/"Trips"/, '"Trips",\n  "Bike Rides",\n  "Yoga",\n  "Book Clubs"');
  }
  return `export const experienceCategories = [${inner}];`;
});
fs.writeFileSync('src/lib/mock-data.ts', data);
