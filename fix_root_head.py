import sys

with open('src/routes/__root.tsx', 'r') as f:
    content = f.read()

head_script = """        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                let theme = localStorage.getItem('agatike-theme');
                if (!theme) {
                  theme = 'system';
                }
                if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {}
            `,
          }}
        />"""

content = content.replace('        <HeadContent />', head_script)

with open('src/routes/__root.tsx', 'w') as f:
    f.write(content)

print("Updated __root.tsx with theme script.")
