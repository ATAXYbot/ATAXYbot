import re

def fix_routing():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    new_link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            const examParam = activeSatheeExam ? activeSatheeExam.name.toLowerCase() : 'jee';
                                            
                                            // Safely determine subject name for URL routing
                                            let subName = 'physics';
                                            if (activeSatheeSubject && activeSatheeSubject.name) {
                                                const lowerName = activeSatheeSubject.name.toLowerCase();
                                                if (lowerName.includes('math') || lowerName.includes('quant')) subName = 'mathematics';
                                                else if (lowerName.includes('chem')) subName = 'chemistry';
                                                else if (lowerName.includes('bio')) subName = 'biology';
                                                else if (lowerName.includes('reasoning') || lowerName.includes('intelligence')) subName = 'reasoning';
                                                else subName = lowerName.replace(/[^a-z0-9]/g, '-');
                                            }

                                            // Deep link to specific subject syllabus
                                            if (type === 'video') {
                                                return `https://sathee.iitk.ac.in/sathee-${examParam}/syllabus/${subName}/`;
                                            } else {
                                                // DPP tests deep link
                                                return `https://sathee.iitk.ac.in/dpp-subject-wise-tests`;
                                            }
                                        };
"""
    
    start_gen = code.find('const generateSatheeLink = (item, type) => {')
    if start_gen != -1:
        end_gen = code.find('};', start_gen) + 2
        
        # Ensure we don't accidentally match another block, we know the previous generator ended with return `https://sathee.iitk.ac.in/`;
        code = code[:start_gen] + new_link_generator.strip() + code[end_gen:]

        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("Routing Fix Applied.")
    else:
        print("Could not find generateSatheeLink.")

fix_routing()
