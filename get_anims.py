import json
import struct

def get_glb_animations(filepath):
    with open(filepath, 'rb') as f:
        # Read header (12 bytes)
        magic, version, length = struct.unpack('<4sII', f.read(12))
        if magic != b'glTF':
            print("Not a valid GLB file")
            return
            
        # Read JSON chunk header (8 bytes)
        chunk_length, chunk_type = struct.unpack('<II', f.read(8))
        if chunk_type != 0x4E4F534A: # 'JSON'
            print("First chunk is not JSON")
            return
            
        # Read JSON data
        json_data = f.read(chunk_length).decode('utf-8')
        data = json.loads(json_data)
        
        animations = data.get('animations', [])
        names = [anim.get('name', f'Animation_{i}') for i, anim in enumerate(animations)]
        
        print("Animations found:")
        for name in names:
            print(f"- {name}")

get_glb_animations('character.glb')
