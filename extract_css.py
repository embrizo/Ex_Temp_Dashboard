import re

with open('UiSkill-Claude.md', 'r', encoding='utf-8') as f:
    md = f.read()

css_blocks = re.findall(r'```css\n(.*?)```', md, re.DOTALL)

with open('src/index.css', 'w', encoding='utf-8') as f:
    f.write('@import "tailwindcss";\n\n')
    f.write('\n\n'.join(css_blocks))
