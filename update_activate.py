import sys
import os

os.rename('src/routes/dashboard/workspace-user/activate.tsx', 'src/routes/dashboard/workspace-user/$email.activate.tsx')

with open('src/routes/dashboard/workspace-user/$email.activate.tsx', 'r') as f:
    content = f.read()

# Update Route declaration
old_route = 'export const Route = createFileRoute("/dashboard/workspace-user/activate")({'
new_route = """import { getSession } from "@/api/auth";
import { checkWorkspaceUserStatus } from "@/api/workspace_users";

export const Route = createFileRoute("/dashboard/workspace-user/$email/activate")({
  beforeLoad: async ({ params, location }) => {
    try {
      const email = decodeURIComponent(params.email);
      const status = await checkWorkspaceUserStatus({ data: { email } } as any);
      
      if (status === "active") {
        const session = await getSession();
        if (session) {
          throw { redirect: "/dashboard" };
        } else {
          throw { redirect: "/dashboard/login" };
        }
      }
    } catch (err: any) {
      if (err.redirect) {
        throw err;
      }
      // If user not found, we can just let the page load or show error later
    }
  },"""

content = content.replace(old_route, new_route)

# Update state initialization
old_state = """function ActivatePage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");"""

new_state = """function ActivatePage() {
  const navigate = useNavigate();
  const { email: emailParam } = Route.useParams();
  const decodedEmail = decodeURIComponent(emailParam);
  
  const [email, setEmail] = useState(decodedEmail);"""

content = content.replace(old_state, new_state)

# Make email input readOnly
old_input = """              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />"""

new_input = """              <Input 
                id="email" 
                type="email" 
                placeholder="name@example.com" 
                value={email}
                readOnly
                className="bg-secondary/50 text-muted-foreground"
                required
              />"""

content = content.replace(old_input, new_input)

with open('src/routes/dashboard/workspace-user/$email.activate.tsx', 'w') as f:
    f.write(content)

print("Updated activate.tsx successfully!")
