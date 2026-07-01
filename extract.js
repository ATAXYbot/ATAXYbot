const fs = require('fs');
const html = fs.readFileSync('index.html', 'utf8');

const regex = /<script type="text\/babel"[^>]*>/;
const match = html.match(regex);
if(match) {
    const start = match.index + match[0].length;
    const end = html.indexOf('</script>', start);
    const script = html.substring(start, end);
    fs.writeFileSync('extracted.jsx', script);
    console.log('Extracted successfully!');
} else {
    console.log('Not found');
}
