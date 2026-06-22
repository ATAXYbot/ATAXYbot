const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const searchString = '<script type="text/babel" data-presets="react-classic" data-type="module">';
const scriptStart = html.indexOf(searchString);
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart + searchString.length, scriptEnd);
fs.writeFileSync('temp.jsx', script);
console.log('Saved temp.jsx');
