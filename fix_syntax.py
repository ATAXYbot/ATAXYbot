import re

def fix_practice_batches():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # The corrupted section is:
    # const PRACTICE_BATCHES = [
    # ...
    # ] },
    # { id: 'pb_others', name: 'Others', type: 'others', sourceTable: null, files: [] }
    # ];
    
    # Let's extract everything from "const PRACTICE_BATCHES" to "];" and replace it cleanly.
    start_idx = code.find('const PRACTICE_BATCHES = [')
    end_idx = code.find('];', start_idx) + 2
    
    clean_batches = """const PRACTICE_BATCHES = [
                        { id: 'pb_neet_bank', name: 'NEET Bank', type: 'neet', sourceTable: 'basic_mathmatics_&_vector', files: [{ id: 'pf_basic_math_1', name: 'Basic Math' }] },
                        { id: 'pb_jee_bank', name: 'JEE Bank', type: 'jee', sourceTable: 'coming_soon', files: [] },
                        { id: 'pb_others', name: 'Others', type: 'others', sourceTable: null, files: [] }
                    ];"""
                    
    code = code[:start_idx] + clean_batches + code[end_idx:]

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)

    print("Fixed syntax error in PRACTICE_BATCHES!")

fix_practice_batches()
