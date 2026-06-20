const fs = require('fs');
const babel = require('@babel/core');

try {
  const content = fs.readFileSync('index.html', 'utf8');
  const start = content.indexOf('<script type="text/babel"');
  const end = content.lastIndexOf('</script>');
  if (start === -1 || end === -1) throw new Error('Not found');
  const code = content.substring(start, end).replace(/^[^>]+>/, '');
  
  babel.transformSync(code, {
    presets: ['@babel/preset-react'],
    filename: 'index.jsx'
  });
  console.log('BABEL COMPILE OK!');
} catch (e) {
  console.log(e.message);
  if (e.codeFrame) console.log(e.codeFrame);
}
