import os
import glob

files = [
    'src/routes/dashboard/$workspaceSlug/users/index.tsx',
    'src/routes/dashboard/$workspaceSlug/users/add-user.tsx',
    'src/routes/dashboard/$workspaceSlug/users/$userId.edit.tsx'
]

for file_path in files:
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Replace the usage of getUserWorkspaces
    content = content.replace('await getUserWorkspaces();', '(await getUserWorkspaces()).workspaces;')
    
    with open(file_path, 'w') as f:
        f.write(content)

print("Fixed other callers of getUserWorkspaces.")
