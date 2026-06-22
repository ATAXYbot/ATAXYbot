const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');
const scriptStart = html.lastIndexOf('<script type="text/babel" data-type="module">');
const scriptEnd = html.lastIndexOf('</script>');
const script = html.substring(scriptStart + 45, scriptEnd);
fs.writeFileSync('temp.jsx', script);
console.log('Saved temp.jsx');
