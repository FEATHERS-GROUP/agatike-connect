import sys

with open('src/routes/dashboard.tsx', 'r') as f:
    content = f.read()

content = content.replace('const { workspaces, activeWorkspace, isLoaded } = useWorkspace();', 'const { workspaces, activeWorkspace, isLoaded, currentUser } = useWorkspace() as any;')

old_effect = """        const requiredModule = protectedModules[urlModule];
        if (requiredModule) {
          const allowed = 
            activeWorkspace.modules?.includes(requiredModule) || 
            activeWorkspace.modules?.includes(requiredModule.replace("_", "-"));
          
          if (!allowed && !activeWorkspace.modules?.includes("ALL")) {
            navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
          }
        }
      }
    }
  }, [isLoaded, workspaces, activeWorkspace, location.pathname, navigate]);"""

new_effect = """        const requiredModule = protectedModules[urlModule];
        if (requiredModule) {
          const allowed = 
            activeWorkspace.modules?.includes(requiredModule) || 
            activeWorkspace.modules?.includes(requiredModule.replace("_", "-"));
          
          if (!allowed && !activeWorkspace.modules?.includes("ALL")) {
            navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
            return;
          }
        }
      }
      
      // Page-level access check for workspace users
      if (currentUser && currentUser.pages && !currentUser.pages.includes("ALL")) {
        let subPath = location.pathname.substring(`/dashboard/${activeWorkspace.slug}`.length);
        if (subPath === "") subPath = "/";
        
        let isAllowed = false;
        if (subPath === "/" || subPath === "/settings") {
          isAllowed = true;
        } else {
          for (const p of currentUser.pages) {
            if (p === subPath) {
              isAllowed = true;
              break;
            }
            if (p.includes("/:")) {
              const base = p.split("/:")[0];
              if (subPath.startsWith(base + "/") && subPath.split("/").length === base.split("/").length + 1) {
                isAllowed = true;
                break;
              }
            }
          }
        }
        
        if (!isAllowed) {
          navigate({ to: `/dashboard/${activeWorkspace.slug}`, replace: true });
          return;
        }
      }
    }
  }, [isLoaded, workspaces, activeWorkspace, location.pathname, navigate, currentUser]);"""

content = content.replace(old_effect, new_effect)

with open('src/routes/dashboard.tsx', 'w') as f:
    f.write(content)

print("Updated dashboard.tsx with page-level protection.")
