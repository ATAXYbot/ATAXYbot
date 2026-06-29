const fs = require('fs');
const buffer = fs.readFileSync('c:\\Users\\risha\\ATAXYbot\\character.glb');
const magic = buffer.toString('utf8', 0, 4);
if (magic === 'glTF') {
    const chunkLength = buffer.readUInt32LE(12);
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const json = JSON.parse(jsonStr);
    
    if (json.nodes) {
        console.log("Nodes found:");
        json.nodes.forEach(node => {
            if (node.name && (node.name.toLowerCase().includes('jaw') || node.name.toLowerCase().includes('mouth') || node.name.toLowerCase().includes('lip'))) {
                console.log(node.name);
            }
        });
    }
}
