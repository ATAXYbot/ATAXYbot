const fs = require('fs');
const babel = require('@babel/core');
try {
    const content = fs.readFileSync('index.html', 'utf8');
    const startTag = '<script type="text/babel" data-presets="react-classic" data-type="module">';
    const babelStart = content.indexOf(startTag) + startTag.length;
    const babelEnd = content.lastIndexOf('</script>');
    const babelContent = content.substring(babelStart, babelEnd);

    babel.transformSync(babelContent, {
        presets: ['@babel/preset-react'],
        filename: 'index.jsx'
    });
    console.log('Babel transpilation successful - no syntax errors');
} catch(e) {
    console.error('Babel Error:', e.message);
}
