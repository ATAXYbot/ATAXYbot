const fs = require('fs');

const index = fs.readFileSync('index.html', 'utf8');
const oldDash = fs.readFileSync('temp_dash.txt', 'utf8');
const oldAr = fs.readFileSync('temp_ar.txt', 'utf8');
const newDash = fs.readFileSync('new_dash.jsx', 'utf8');
const newAr = fs.readFileSync('new_ar.jsx', 'utf8');

let newIndex = index;

if (index.includes(oldDash)) {
    newIndex = newIndex.replace(oldDash, newDash);
    console.log("Successfully replaced renderDashboard.");
} else {
    console.log("Failed to find old renderDashboard in index.html");
}

if (index.includes(oldAr)) {
    newIndex = newIndex.replace(oldAr, newAr);
    console.log("Successfully replaced renderActiveRoom.");
} else {
    console.log("Failed to find old renderActiveRoom in index.html");
}

fs.writeFileSync('index.html', newIndex);
console.log("index.html updated.");
