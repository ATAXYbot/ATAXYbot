const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

const oldClasses1 = 'className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"';
const newClasses1 = 'className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"';

const oldClasses2 = 'className="w-full p-3 rounded-xl border border-gray-300 bg-gray-50 outline-none focus:ring-2 focus:ring-purple-500"';
const newClasses2 = 'className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white outline-none focus:ring-2 focus:ring-purple-500"';

let replaced = false;

if (code.includes(oldClasses1)) {
    code = code.replace(oldClasses1, newClasses1);
    replaced = true;
}
if (code.includes(oldClasses2)) {
    code = code.replace(oldClasses2, newClasses2);
    replaced = true;
}

if (replaced) {
    fs.writeFileSync('index.html', code);
    console.log('Fixed input text visibility');
} else {
    console.log('Could not find input classes');
}
