const fs = require('fs');
const lines = fs.readFileSync('index.html', 'utf8').split('\n');

let s = 0;
for(let i=7400; i<7500; i++) {
    if(lines[i].trim() === 'return (') {
        s = i;
        break;
    }
}
let end = 0;
for(let i=s; i<7700; i++) {
    if(lines[i].includes('showActionModal && showActionModal.type === \'options\'')) {
        end = i - 1; 
        break;
    }
}
console.log('Main Layout from', s, 'to', end);
