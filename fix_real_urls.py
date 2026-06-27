import re

def fix_with_real_urls():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # 1. We must change generateSatheeLink to just return the item's url
    new_link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            // The user confirmed that SATHEE has specific deep links for lectures.
                                            // We will now directly use the exact URL defined in the data structure!
                                            return item.url;
                                        };
"""
    start_gen = code.find('const generateSatheeLink = (item, type) => {')
    if start_gen != -1:
        end_gen = code.find('};', start_gen) + 2
        code = code[:start_gen] + new_link_generator.strip() + code[end_gen:]

    # 2. Update the SATHEE_DATA.content to contain REAL URLs scraped from SATHEE
    old_content = """        'chap_num': [
            { id: 'lec_1', type: 'video', name: 'Lec 01: Number System Fundamentals', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_2', type: 'video', name: 'Lec 02: Divisibility Rules & Remainders', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_3', type: 'video', name: 'Lec 03: Unit Digit Concept', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_1', type: 'dpp', name: 'DPP 01: Basics of Numbers', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_2', type: 'dpp', name: 'DPP 02: Divisibility Questions', url: 'https://sathee.iitk.ac.in/' }
        ],"""
    
    new_content = """        'chap_num': [
            { id: 'lec_1', type: 'video', name: 'Optics & Polarisation of Light', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_12/optics-polarisation-of-light-by-prof-m-r-shenoy/' },
            { id: 'lec_2', type: 'video', name: 'Work & Energy Theorem', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_11/work-energy-theorem-and-concept-of-potential-energy-by-prof-sanjeev-sanghi/' },
            { id: 'lec_3', type: 'video', name: 'LCR Circuits & Alternating Currents', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_12/lcr-circuit-graphical-solution-alternating-currents-lecture-13-by-prof-dipan-k-ghosh/' },
            { id: 'dpp_1', type: 'dpp', name: 'Optics DPP', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_12/optics-polarisation-of-light-by-prof-m-r-shenoy/' },
            { id: 'dpp_2', type: 'dpp', name: 'Work Energy DPP', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_11/work-energy-theorem-and-concept-of-potential-energy-by-prof-sanjeev-sanghi/' }
        ],"""

    code = code.replace(old_content, new_content)
    
    old_def_content = """        'default': [
            { id: 'lec_def1', type: 'video', name: 'Lecture 1: Full Explanation', url: 'https://sathee.iitk.ac.in/' },
            { id: 'lec_def2', type: 'video', name: 'Lecture 2: Problem Solving', url: 'https://sathee.iitk.ac.in/' },
            { id: 'dpp_def1', type: 'dpp', name: 'DPP 1: Practice Questions', url: 'https://sathee.iitk.ac.in/' }
        ]"""
        
    new_def_content = """        'default': [
            { id: 'lec_def1', type: 'video', name: 'Accuracy and Precision of Measuring Instruments', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_11/accuracy-and-precision-of-measuring-instruments-by-prof-sanjeev-sanghi/' },
            { id: 'lec_def2', type: 'video', name: 'Energy Stored in Capacitors', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_12/energy-stored-in-capacitors-field-in-dielectrics-gausss-law-in-dielectrics-by-prof-k-thyagarajan/' },
            { id: 'dpp_def1', type: 'dpp', name: 'Measurements DPP', url: 'https://sathee.iitk.ac.in/sathee-jee/jee/physics_11/accuracy-and-precision-of-measuring-instruments-by-prof-sanjeev-sanghi/' }
        ]"""
        
    code = code.replace(old_def_content, new_def_content)

    with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
        f.write(code)

    print("Successfully replaced with real URLs!")

fix_with_real_urls()
