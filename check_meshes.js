const fs = require('fs');
const buffer = fs.readFileSync('c:\\Users\\risha\\ATAXYbot\\character.glb');
const magic = buffer.toString('utf8', 0, 4);
if (magic === 'glTF') {
    const chunkLength = buffer.readUInt32LE(12);
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const json = JSON.parse(jsonStr);
    
    if (json.meshes) {
        console.log("Meshes found:");
        json.meshes.forEach((mesh, index) => console.log(`Mesh ${index}:`, mesh.name || 'Unnamed'));
    }
    
    if (json.materials) {
        console.log("\nMaterials found:");
        json.materials.forEach((mat, index) => console.log(`Material ${index}:`, mat.name || 'Unnamed'));
    }
}
