const fs = require('fs');
fetch('https://restcountries.com/v3.1/all?fields=name,cca2,idd')
  .then(res => res.json())
  .then(data => {
    const countries = data.map(c => {
      let dialCode = '';
      if (c.idd && c.idd.root) {
        dialCode = c.idd.root + (c.idd.suffixes ? c.idd.suffixes[0] : '');
      }
      return {
        name: c.name.common,
        code: c.cca2,
        dialCode: dialCode
      };
    }).filter(c => c.name && c.code);
    
    // Sort alphabetically
    countries.sort((a, b) => a.name.localeCompare(b.name));
    
    const fileContent = `export const COUNTRIES = ${JSON.stringify(countries, null, 2)};\n`;
    fs.writeFileSync('src/lib/countries.ts', fileContent);
    console.log("Successfully generated all countries!");
  })
  .catch(console.error);
