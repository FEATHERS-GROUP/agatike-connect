import { getWorkspaceUsageStats } from './src/api/billing.ts';

async function run() {
  try {
    const res = await getWorkspaceUsageStats({ data: { workspace_id: 'c6d66072-b22e-4ecd-b8ec-bde0489f70da' } } as any);
    console.log("Success:", res);
  } catch (err) {
    console.error("Error:", err);
  }
}
run();
