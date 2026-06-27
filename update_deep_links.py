import re

def update_deep_links():
    with open('c:/Users/risha/ATAXYbot/index.html', 'r', encoding='utf-8') as f:
        code = f.read()

    # Find the rendering block for SATHEE Videos
    # We want to replace window.open(vid.url, '_blank') with window.open(generateSatheeLink(vid, 'video'), '_blank')
    # and dpp.url with generateSatheeLink(dpp, 'dpp')

    link_generator = """
                                        const generateSatheeLink = (item, type) => {
                                            const examParam = activeSatheeExam ? activeSatheeExam.name.toLowerCase() : 'jee';
                                            const batchParam = activeSatheeBatch ? encodeURIComponent(activeSatheeBatch.name) : '';
                                            const chapterParam = activeSatheeChapter ? encodeURIComponent(activeSatheeChapter.name) : '';
                                            // Construct a deep link that prompts login if needed, then redirects
                                            // This simulates the intelligent redirect the user asked for
                                            return `https://sathee.iitk.ac.in/login?exam=${examParam}&redirect=/dashboard/play?type=${type}&id=${item.id}&batch=${batchParam}&chapter=${chapterParam}`;
                                        };
"""
    
    chapter_render_start = code.find('{activeSatheeChapter && (() => {')
    if chapter_render_start != -1:
        # Find where to inject the generator (right after const dpps = ...)
        injection_point = code.find("const dpps = contents.filter(c => c.type === 'dpp');", chapter_render_start)
        if injection_point != -1:
            injection_point += len("const dpps = contents.filter(c => c.type === 'dpp');")
            if "generateSatheeLink" not in code[chapter_render_start:chapter_render_start+1000]:
                code = code[:injection_point] + link_generator + code[injection_point:]
        
        # Replace window.open(vid.url
        code = code.replace("window.open(vid.url, '_blank')", "window.open(generateSatheeLink(vid, 'video'), '_self')")
        # Replace window.open(dpp.url
        code = code.replace("window.open(dpp.url, '_blank')", "window.open(generateSatheeLink(dpp, 'dpp'), '_self')")
        
        with open('c:/Users/risha/ATAXYbot/index.html', 'w', encoding='utf-8') as f:
            f.write(code)
        
        print("Deep links updated!")
    else:
        print("Could not find the chapter render block.")

update_deep_links()
