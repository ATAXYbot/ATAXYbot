const fs = require('fs');
const buffer = fs.readFileSync('c:\\Users\\risha\\ATAXYbot\\character.glb');
// The GLB file contains a JSON chunk. Let's find it.
const magic = buffer.toString('utf8', 0, 4);
if (magic === 'glTF') {
    const chunkLength = buffer.readUInt32LE(12);
    const chunkType = buffer.toString('utf8', 16, 20);
    if (chunkType === 'JSON') {
        const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
        const json = JSON.parse(jsonStr);
        if (json.animations) {
            console.log("Animations found:");
            json.animations.forEach(a => console.log(a.name));
        } else {
            console.log("No animations found in JSON.");
        }
    }
} else {
    console.log("Not a valid GLB");
}
