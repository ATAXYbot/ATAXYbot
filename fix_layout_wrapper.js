const fs = require('fs');

try {
    let content = fs.readFileSync('index.html', 'utf8');

    content = content.replace(
        `className="fixed inset-0 z-[1500000] bg-[#010B1C] flex flex-col animate-in slide-in-from-bottom duration-300"`,
        `className="fixed inset-0 z-[1500000] bg-black/80 backdrop-blur-sm flex flex-col animate-in slide-in-from-bottom duration-300"`
    );
    
    fs.writeFileSync('index.html', content);
    console.log("Success");
} catch (e) {
    console.error(e);
}
