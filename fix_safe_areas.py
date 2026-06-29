import re

with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace pt-[24px] when next to fixed top-0
content = content.replace('fixed top-0 pt-[24px]', 'fixed top-0 pt-safe-top')
content = content.replace('fixed inset-x-0 bottom-0 top-0 pt-[24px]', 'fixed inset-x-0 bottom-0 top-0 pt-safe-top')

# Replace specific hardcoded top values
content = content.replace('top-[80px]', 'top-[calc(80px+var(--safe-top))]')

# Replace safe-area bottom logic with the new Tailwind class/var
content = content.replace('pb-[env(safe-area-inset-bottom,_12px)]', 'pb-safe-bottom')
content = content.replace('bottom-[65px]', 'bottom-[calc(65px+var(--safe-bottom))]')
content = content.replace('bottom-[calc(72px_+_env(safe-area-inset-bottom,_0px))]', 'bottom-[calc(72px+var(--safe-bottom))]')
content = content.replace('bottom-[80px]', 'bottom-[calc(80px+var(--safe-bottom))]')
content = content.replace('bottom-[120px]', 'bottom-[calc(120px+var(--safe-bottom))]')

# Fix h-[max(env...)]
content = content.replace('h-[max(env(safe-area-inset-top),_24px)]', 'h-safe-top')

# Also fix the top nav bar's manual calc
content = content.replace(
    'h-[calc(60px_+_max(var(--tg-content-safe-area-inset-top,env(safe-area-inset-top)),_24px))] pt-[max(var(--tg-content-safe-area-inset-top,env(safe-area-inset-top)),_24px)]',
    'h-[calc(60px+var(--safe-top))] pt-safe-top'
)

# And the main container's padding
content = content.replace(
    'pt-[calc(60px_+_max(var(--tg-content-safe-area-inset-top,env(safe-area-inset-top)),_24px))]',
    'pt-[calc(60px+var(--safe-top))]'
)
content = content.replace(
    'pt-[max(var(--tg-content-safe-area-inset-top,env(safe-area-inset-top)),_24px)]',
    'pt-safe-top'
)

# And the bottom nav's manual calc
content = content.replace(
    'pb-[calc(16px_+_var(--tg-content-safe-area-inset-bottom,env(safe-area-inset-bottom,0px)))] pt-3',
    'pb-[calc(12px+var(--safe-bottom))] pt-3'
)

with open('index.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Applied safe-area fixes to index.html successfully.")
