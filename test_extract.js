const fs = require('fs');
const content = fs.readFileSync('index.html', 'utf8');
const startTag = '<script type="text/babel" data-presets="react-classic" data-type="module">';
const babelStart = content.indexOf(startTag);
console.log('babelStart raw:', babelStart);
const babelEnd = content.lastIndexOf('</script>');
console.log('babelEnd raw:', babelEnd);
console.log('first 50 chars:\n' + content.substring(babelStart + startTag.length, babelStart + startTag.length + 50));
