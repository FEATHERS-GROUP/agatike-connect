import { createFileRoute, useRouter } from "@tanstack/react-router";
import { getAdminOrganizerWallets, updateAdminWalletNetworks } from "@/api/admin_organizer_control";
import { getPawaPayNetworks } from "@/api/pawapay";
import { Wallet, Building2, Globe, Check, AlertTriangle, RefreshCw, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/internal/control/admin/organizers/$organizerId/wallets")({
  loader: async ({ params }) => {
    const [workspaces, pawaNetworks] = await Promise.all([
      getAdminOrganizerWallets({ data: { organizerId: params.organizerId } } as any),
      getPawaPayNetworks() as any,
    ]);
    return { workspaces, pawaNetworks };
  },
  component: OrganizerWallets,
});

function OrganizerWallets() {
  const { workspaces, pawaNetworks = [] } = Route.useLoaderData();
  const router = useRouter();

  const [editingWallet, setEditingWallet] = useState<string | null>(null);
  const [selectedNetworks, setSelectedNetworks] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const startEditing = (walletId: string, currentNetworks: string[]) => {
    setEditingWallet(walletId);
    setSelectedNetworks(currentNetworks || []);
  };

  const toggleNetwork = (network: string) => {
    setSelectedNetworks((prev) =>
      prev.includes(network) ? prev.filter((n) => n !== network) : [...prev, network],
    );
  };

  const saveNetworks = async () => {
    if (!editingWallet) return;
    setLoading(true);
    try {
      await updateAdminWalletNetworks({
        data: { walletId: editingWallet, networks: selectedNetworks },
      } as any);
      toast.success("Networks updated successfully");
      setEditingWallet(null);
      router.invalidate();
    } catch (e: any) {
      toast.error(e.message || "Failed to update networks");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="font-sans text-sm pb-10">
      <div className="flex items-center gap-2 py-4 px-0 border-b border-[#333333] mb-5">
        <Wallet className="h-5 w-5 text-[#569cd6]" />
        <h2 className="text-base font-medium text-white">Workspaces &amp; Wallets</h2>
      </div>

      <div className="space-y-4">
        {workspaces.map((ws: any) => {
          const wallet = ws.wallet;
          if (!wallet) {
            return (
              <div
                key={ws.id}
                className="bg-[#1a1a1a] border border-[#333333] p-5 flex items-center justify-between"
              >
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-[#797775]" />
                    {ws.name}
                  </h3>
                  <p className="text-[#797775] text-xs mt-1">
                    {ws.city || "Unknown City"}, {ws.country || "Unknown Country"}
                  </p>
                </div>
                <div className="text-[#f43f5e] text-xs flex items-center gap-1 bg-[#f43f5e]/10 px-2 py-1 rounded-sm border border-[#f43f5e]/30">
                  <AlertTriangle className="h-3 w-3" /> No wallet created yet
                </div>
              </div>
            );
          }

          const isEditing = editingWallet === wallet.id;
          const currentNetworks = isEditing ? selectedNetworks : wallet.supported_networks || [];

          return (
            <div key={ws.id} className="bg-[#1a1a1a] border border-[#333333] overflow-hidden">
              <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#333333] bg-[#252526]">
                <div>
                  <h3 className="text-white font-medium flex items-center gap-2 text-base">
                    <Building2 className="h-4 w-4 text-[#569cd6]" />
                    {ws.name}
                  </h3>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[#797775] text-xs">
                    <span className="font-mono text-[#569cd6] bg-[#569cd6]/10 px-1.5 py-0.5 border border-[#569cd6]/20">
                      ID: {String(wallet.id).substring(0, 8)}...
                    </span>
                    <span>No: {wallet.walletNumber || "Not setup"}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[#797775] text-xs uppercase tracking-wider mb-1">
                    Current Balance
                  </p>
                  <p className="text-[#84c87e] text-2xl font-bold">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: wallet.currency || "RWF",
                    }).format(wallet.amount || 0)}
                  </p>
                </div>
              </div>

              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-white font-medium flex items-center gap-2">
                    <Globe className="h-4 w-4 text-[#c586c0]" /> Supported Networks
                  </h4>
                  {!isEditing && (
                    <button
                      onClick={() => startEditing(wallet.id, wallet.supported_networks)}
                      className="text-[#569cd6] text-xs hover:underline"
                    >
                      Edit Networks
                    </button>
                  )}
                </div>

                {isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {pawaNetworks.map((net: any) => {
                        const active = selectedNetworks.includes(net.id);
                        return (
                          <button
                            key={net.id}
                            onClick={() => toggleNetwork(net.id)}
                            className={`px-3 py-1.5 text-xs rounded-sm border flex flex-col items-start gap-1 transition-colors ${
                              active
                                ? "bg-[#84c87e]/10 border-[#84c87e]/40 text-[#84c87e]"
                                : "bg-[#111] border-[#333] text-[#797775] hover:border-[#555] hover:text-white"
                            }`}
                          >
                            <div className="flex items-center gap-1.5 w-full">
                              <div
                                className={`h-3 w-3 shrink-0 rounded-full border ${active ? "bg-[#84c87e] border-[#84c87e]" : "border-[#555]"}`}
                              />
                              <span className="capitalize font-medium truncate max-w-[120px]">
                                {net.name}
                              </span>
                            </div>
                            <span className="text-[10px] uppercase opacity-70 ml-4.5">
                              {net.country} · {net.currency}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-2 pt-2">
                      <button
                        onClick={() => setEditingWallet(null)}
                        className="px-3 py-1.5 text-xs border border-[#333333] text-[#797775] hover:text-white transition-colors flex items-center gap-1 rounded-sm"
                      >
                        <X className="h-3 w-3" /> Cancel
                      </button>
                      <button
                        onClick={saveNetworks}
                        disabled={loading}
                        className="px-3 py-1.5 text-xs bg-[#569cd6] text-white hover:bg-[#4a8cc0] transition-colors flex items-center gap-1 rounded-sm disabled:opacity-50"
                      >
                        {loading ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Check className="h-3 w-3" />
                        )}
                        Save Networks
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {currentNetworks.length === 0 ? (
                      <span className="text-[#797775] text-xs italic">No networks configured.</span>
                    ) : (
                      currentNetworks.map((n: string) => {
                        const networkObj = pawaNetworks.find((pn: any) => pn.id === n);
                        return (
                          <span
                            key={n}
                            className="px-2.5 py-1 text-[11px] bg-[#333333] text-[#cccccc] rounded-sm capitalize border border-[#444444]"
                          >
                            {networkObj ? `${networkObj.name} (${networkObj.country})` : n}
                          </span>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
        {workspaces.length === 0 && (
          <div className="text-center py-10 text-[#797775] italic bg-[#1a1a1a] border border-[#333333]">
            No workspaces found for this organizer.
          </div>
        )}
      </div>
    </div>
  );
}
