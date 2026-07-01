const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

const oldCompDef = `const FloatingStudyPartner = ({ message, onClose, onAction }) => {`;
const newCompDef = `const FloatingStudyPartner = ({ message, onClose, onAction, config }) => {`;

const oldConfigRef1 = `const imgSrc = studyPartnerConfig?.character === 'asena' ? 'assets/characters/mia_spritesheet_16.png' : 'assets/characters/jack_spritesheet_16.png';`;
const newConfigRef1 = `const imgSrc = config?.character === 'asena' ? 'assets/characters/mia_spritesheet_16.png' : 'assets/characters/jack_spritesheet_16.png';`;

const oldConfigRef2 = `<span className="text-xs font-black text-[#00FFFF] tracking-widest uppercase">{studyPartnerConfig?.character === 'asena' ? 'ASENA' : 'ATAXY'}</span>`;
const newConfigRef2 = `<span className="text-xs font-black text-[#00FFFF] tracking-widest uppercase">{config?.character === 'asena' ? 'ASENA' : 'ATAXY'}</span>`;

const oldComponentRender = `<FloatingStudyPartner 
                        message={partnerMessage}`;
const newComponentRender = `<FloatingStudyPartner 
                        config={studyPartnerConfig}
                        message={partnerMessage}`;

if (content.includes(oldCompDef)) {
    content = content.replace(oldCompDef, newCompDef);
}

if (content.includes(oldConfigRef1)) {
    content = content.replace(oldConfigRef1, newConfigRef1);
}

if (content.includes(oldConfigRef2)) {
    content = content.replace(oldConfigRef2, newConfigRef2);
}

if (content.includes(oldComponentRender)) {
    content = content.replace(oldComponentRender, newComponentRender);
}

fs.writeFileSync('index.html', content, 'utf8');
console.log("Fixed config reference in FloatingStudyPartner");
