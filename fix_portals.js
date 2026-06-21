const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf8');

// The `z-[200000]` and `z-[60]` ones are modals. Let's make sure they are portals.
code = code.replace(
    /return \(\s*<div className=\"fixed inset-0/g,
    'return ReactDOM.createPortal(\\n<div className="fixed inset-0'
);

code = code.replace(
    /<\/div>\s*\);\s*};/g,
    '</div>,\\ndocument.body\\n);\\n};'
);

// We should be careful. I will use a precise match for each modal.
