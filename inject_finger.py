import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Add magicFingerRef
old_refs = """const widgetRef = useRef(null);"""
new_refs = """const widgetRef = useRef(null);\n            const magicFingerRef = useRef(null);"""
content = content.replace(old_refs, new_refs, 1) # Only first match in StudyPartnerWidget, but maybe there are others. Let's be safe.

# Let's do it safer:
content = content.replace(
    'const StudyPartnerWidget = ({ partnerConfig, partnerMessage, setPartnerMessage, currentTab, showQuiz, tourStep, tourTargetId, onTourNext }) => {\n            const widgetRef = useRef(null);',
    'const StudyPartnerWidget = ({ partnerConfig, partnerMessage, setPartnerMessage, currentTab, showQuiz, tourStep, tourTargetId, onTourNext }) => {\n            const widgetRef = useRef(null);\n            const magicFingerRef = React.useRef(null);'
)

# 2. Update physicsLoop to control magicFingerRef
old_dist_check = """                                if (dist < 15) {
                                    p.state = 'greet';
                                } else {
                                    p.state = 'falling';
                                }"""
new_dist_check = """                                if (dist < 15) {
                                    p.state = 'greet';
                                    if (magicFingerRef.current) {
                                        magicFingerRef.current.style.opacity = '1';
                                        magicFingerRef.current.style.left = `${targetX}px`;
                                        magicFingerRef.current.style.top = `${rect.top - 10}px`;
                                    }
                                } else {
                                    p.state = 'falling';
                                    if (magicFingerRef.current) magicFingerRef.current.style.opacity = '0';
                                }"""
content = content.replace(old_dist_check, new_dist_check)

# Also handle the else branch where tourStep > -1 doesn't match
old_gravity = """                        } else {
                            p.vy += 0.6; // Gravity
                        }"""
new_gravity = """                        } else {
                            p.vy += 0.6; // Gravity
                            if (magicFingerRef.current) magicFingerRef.current.style.opacity = '0';
                        }"""
content = content.replace(old_gravity, new_gravity)

# 3. Add the JSX element in the return statement
old_jsx_end = """                        <div 
                            className="relative flex flex-col items-center drop-shadow-xl pointer-events-none" 
                            style={{ 
                                transformOrigin: 'bottom center',
                                width: '300px',
                                height: '300px',
                            }}
                        >
                            <canvas ref={canvasRef} style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))' }}></canvas>
                        </div>
                        
                        

                        
                    </div>"""
new_jsx_end = """                        <div 
                            className="relative flex flex-col items-center drop-shadow-xl pointer-events-none" 
                            style={{ 
                                transformOrigin: 'bottom center',
                                width: '300px',
                                height: '300px',
                            }}
                        >
                            <canvas ref={canvasRef} style={{ pointerEvents: 'none', filter: 'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))' }}></canvas>
                        </div>
                        
                    </div>
                    
                    <div 
                        ref={magicFingerRef} 
                        className="fixed z-[9999999] pointer-events-none text-5xl opacity-0 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce" 
                        style={{ top: 0, left: 0, transform: 'translate(-50%, -100%)' }}
                    >
                        👇
                    </div>"""
content = content.replace(old_jsx_end, new_jsx_end)

# Fallback replace just in case the newlines are slightly different
if "👇" not in content:
    content = content.replace(
        '<canvas ref={canvasRef} style={{ pointerEvents: \'none\', filter: \'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))\' }}></canvas>\n                        </div>',
        '<canvas ref={canvasRef} style={{ pointerEvents: \'none\', filter: \'drop-shadow(0px 8px 6px rgba(0,0,0,0.4))\' }}></canvas>\n                        </div>\n<div ref={magicFingerRef} className="fixed z-[9999999] pointer-events-none text-5xl opacity-0 transition-opacity duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-bounce" style={{ top: 0, left: 0, transform: \'translate(-50%, -100%)\' }}>👇</div>'
    )


with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)
print("Magic finger injected.")
