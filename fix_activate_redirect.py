import sys

with open('src/routes/dashboard/workspace-user/$email.activate.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    'import { createFileRoute, useNavigate } from "@tanstack/react-router";',
    'import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";'
)

content = content.replace('throw { redirect: "/dashboard" };', 'throw redirect({ to: "/dashboard" });')
content = content.replace('throw { redirect: "/dashboard/login" };', 'throw redirect({ to: "/dashboard/login" });')

with open('src/routes/dashboard/workspace-user/$email.activate.tsx', 'w') as f:
    f.write(content)

print("Fixed redirect syntax.")

