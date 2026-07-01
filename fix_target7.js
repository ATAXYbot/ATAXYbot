const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const optionsRegex = /<option value="Physics" className="bg-slate-900">Physics<\/option>[\s\S]*?<option value="Other" className="bg-slate-900">Other<\/option>/;

const newOptionsStr = `<option value="Physics" className="bg-slate-900">Physics</option>
                                        <option value="Chemistry" className="bg-slate-900">Chemistry</option>
                                        <option value="Mathmatics" className="bg-slate-900">Mathmatics</option>
                                        <option value="Botany" className="bg-slate-900">Botany</option>
                                        <option value="Zoology" className="bg-slate-900">Zoology</option>
                                        <option value="Other" className="bg-slate-900">Other</option>`;

if (optionsRegex.test(content)) {
    content = content.replace(optionsRegex, newOptionsStr);
    console.log("Successfully replaced options.");
} else {
    console.log("Could not find options.");
}

fs.writeFileSync('index.html', content, 'utf8');
