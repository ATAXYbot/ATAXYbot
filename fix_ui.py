import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove glass shine on Practice tab
shine_pattern = r'<div className="absolute inset-0 bg-\[linear-gradient\(45deg,rgba\(255,255,255,0\)_0%,rgba\(255,255,255,0\.2\)_50%,rgba\(255,255,255,0\)_100%\)\] bg-\[length:200%_200%\] animate-\[shimmer_3s_infinite\] pointer-events-none rounded-xl"></div>'
content = content.replace('<div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0)_0%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0)_100%)] bg-[length:200%_200%] animate-[shimmer_3s_infinite] pointer-events-none rounded-xl"></div>', '')

# 2. Fix NPC "Wait for me!" by initializing y to 0
content = content.replace('y: -200,', 'y: 0,')

# 3. Add CSS variables for safe-top and safe-bottom to a global style tag
style_inject = """    <style>
        :root {
            --safe-top: max(var(--tg-content-safe-area-inset-top, var(--tg-safe-area-inset-top, env(safe-area-inset-top, 24px))), 12px);
            --safe-bottom: max(var(--tg-safe-area-inset-bottom, env(safe-area-inset-bottom, 24px)), 12px);
        }
"""
content = content.replace('    <style>', style_inject, 1)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("UI fixes applied to index.html successfully.")
