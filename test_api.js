fetch('http://localhost:3000/api/geocoding/getPlacesAutocomplete', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'Nairobi' })
})
.then(res => res.json())
.then(console.log)
.catch(console.error);
