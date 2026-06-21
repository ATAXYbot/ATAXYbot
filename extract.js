const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const startTag = '<script type="text/babel" data-presets="react-classic" data-type="module">';
const babelStart = content.indexOf(startTag) + startTag.length;
const babelEnd = content.lastIndexOf('</script>');
const babelContent = content.substring(babelStart, babelEnd);
fs.writeFileSync('debug.jsx', babelContent);
console.log('Saved to debug.jsx');
