import re

def fix_routing_crash():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    new_link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            const examParam = activeSatheeExam ? activeSatheeExam.name.toLowerCase() : 'jee';
                                            
                                            // SATHEE's React application crashes with an "[object Object]" Error Boundary
                                            // when deep-linking to internal routes like /syllabus/physics/ directly,
                                            // due to their missing Redux/Context state on direct navigation.
                                            // The deepest safe route that does not crash their app is their exam dashboard.
                                            
                                            if (type === 'video') {
                                                return `https://sathee.iitk.ac.in/sathee-${examParam}/`;
                                            } else {
                                                return `https://sathee.iitk.ac.in/dpp-subject-wise-tests`;
                                            }
                                        };
"""
    
    start_gen = code.find('const generateSatheeLink = (item, type) => {')
    if start_gen != -1:
        end_gen = code.find('};', start_gen) + 2
        code = code[:start_gen] + new_link_generator.strip() + code[end_gen:]

        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("Routing Fix Applied (Fallback to safe exam dashboard).")
    else:
        print("Could not find generateSatheeLink.")

fix_routing_crash()
