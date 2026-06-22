const fs = require('fs');

let code = fs.readFileSync('index.html', 'utf8');

const regex = /<div className="text-gray-900 dark:text-gray-100 font-medium mb-4"><FormattedText text=\{q\.question\} \/><\/div>\s*<div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">\s*\{q\.options\.map\(\(opt, oIdx\) => \{/m;

const newContent = `<div className="text-gray-900 dark:text-gray-100 font-medium mb-4">
                                                            <FormattedText text={q.question || q.text || q.question_text} />
                                                            {q.imageUrl && <div className="mt-4 max-w-full overflow-hidden rounded-md border border-gray-200"><img src={q.imageUrl} className="max-w-full h-auto object-contain max-h-[300px]" alt="Question" /></div>}
                                                        </div>
                                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                                                            {(q.options || []).map((opt, oIdx) => {`;

if (code.match(regex)) {
    code = code.replace(regex, newContent);
    fs.writeFileSync('index.html', code);
    console.log('Fixed analysis question text and options map.');
} else {
    console.log('Regex did not match.');
}
