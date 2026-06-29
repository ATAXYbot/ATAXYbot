const fs = require('fs');
const buffer = fs.readFileSync('c:\\Users\\risha\\ATAXYbot\\character.glb');
const magic = buffer.toString('utf8', 0, 4);
if (magic === 'glTF') {
    const chunkLength = buffer.readUInt32LE(12);
    const jsonStr = buffer.toString('utf8', 20, 20 + chunkLength);
    const json = JSON.parse(jsonStr);
    
    let hasMorphs = false;
    if (json.meshes) {
        json.meshes.forEach(mesh => {
            if (mesh.primitives) {
                mesh.primitives.forEach(prim => {
                    if (prim.targets) {
                        hasMorphs = true;
                        if (mesh.extras && mesh.extras.targetNames) {
                            console.log("Morph Targets:", mesh.extras.targetNames);
                        } else if (prim.extras && prim.extras.targetNames) {
                            console.log("Morph Targets:", prim.extras.targetNames);
                        } else {
                            console.log("Morph Targets exist but names not found in extras. Checking attributes...");
                        }
                    }
                });
            }
        });
    }
    if (!hasMorphs) console.log("No morph targets found.");
}
