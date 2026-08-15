import { createFileRoute, useParams, useNavigate, Link } from "@tanstack/react-router";
import {
  getProduct,
  getWorkspaceRecentOrders,
  getDigitalProductOrders,
  resendDigitalProductEmail,
} from "@/api/products";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Ticket,
  Loader2,
  Save,
  Ban,
  CheckCircle,
  Search,
  Wallet,
  Edit,
  Download,
  Copy,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { useWorkspace } from "@/contexts/WorkspaceContext";
import { format } from "date-fns";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import QRCode from "react-qr-code";

export const Route = createFileRoute("/dashboard/$workspaceSlug/products/$productId")({
  component: ProductDetailsView,
});

function GiftCardRow({
  order,
  currency,
  initialValue,
}: {
  order: any;
  currency: string;
  initialValue: number;
}) {
  const [isActive, setIsActive] = useState(order.status !== "disabled");
  const queryClient = useQueryClient();

  const currentBalance = Number(order.current_balance || 0);
  const totalUsed = initialValue - currentBalance;

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
      <td className="px-6 py-4">
        <span className="font-mono text-xs bg-secondary/50 px-2 py-1 rounded text-muted-foreground border border-border/30 shadow-inner">
          {order.qr_code_string || "N/A"}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className="font-semibold text-foreground">
          {order.user?.username || order.guest_name || order.user?.email || "Guest"}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{formatCurrency(initialValue, currency)}</td>
      <td className="px-6 py-4 font-bold text-green-500">
        {formatCurrency(totalUsed > 0 ? totalUsed : 0, currency)}
      </td>
      <td className="px-6 py-4">
        <span className="font-bold text-blue-500">{formatCurrency(currentBalance, currency)}</span>
      </td>
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isActive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"}`}
        >
          {isActive ? <CheckCircle className="h-3 w-3" /> : <Ban className="h-3 w-3" />}
          {isActive ? "Active" : "Disabled"}
        </span>
      </td>
      <td className="px-6 py-4 text-right flex justify-end items-center gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="bg-primary/5 hover:bg-primary/10 border-primary/20 text-primary"
            >
              View
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-transparent border-none shadow-none p-0">
            <div className="relative overflow-hidden rounded-3xl bg-card text-foreground p-8 shadow-2xl border border-border w-full max-w-sm mx-auto transition-colors">
              <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Ticket className="w-64 h-64 rotate-12 -translate-y-16 translate-x-16 text-foreground" />
              </div>
              <div className="relative z-10 flex flex-col items-center">
                <div className="w-full flex justify-between items-start mb-8">
                  <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-1">
                      Gift Card
                    </p>
                    <p className="text-3xl font-bold tracking-tight">
                      {formatCurrency(currentBalance, currency)}
                    </p>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase shadow-inner ${isActive ? "bg-green-500/10 text-green-600 dark:bg-green-500/20 dark:text-green-400 border border-green-500/20" : "bg-red-500/10 text-red-600 dark:bg-red-500/20 dark:text-red-400 border border-red-500/20"}`}
                  >
                    {isActive ? "Active" : "Disabled"}
                  </div>
                </div>

                <div className="bg-white p-5 rounded-3xl shadow-[0_0_40px_rgba(0,0,0,0.05)] dark:shadow-[0_0_40px_rgba(255,255,255,0.1)] w-56 h-56 flex items-center justify-center mb-8 relative group transform transition-transform hover:scale-105 duration-500 border border-border">
                  <QRCode
                    value={order.qr_code_string || "N/A"}
                    size={180}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                  />
                  {!isActive && (
                    <div className="absolute inset-0 bg-background/60 rounded-3xl flex items-center justify-center backdrop-blur-[2px]">
                      <Ban className="w-16 h-16 text-red-500 opacity-80" />
                    </div>
                  )}
                </div>

                <div className="w-full space-y-4">
                  <div className="bg-secondary/50 rounded-2xl p-4 border border-border/50 backdrop-blur-md">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-muted-foreground">Initial Value</span>
                      <span className="text-sm font-medium">
                        {formatCurrency(initialValue, currency)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Used</span>
                      <span className="text-sm font-medium text-green-600 dark:text-green-400">
                        {formatCurrency(totalUsed > 0 ? totalUsed : 0, currency)}
                      </span>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="font-mono text-xs text-muted-foreground tracking-widest break-all bg-secondary/80 py-3 px-4 rounded-xl border border-border shadow-inner">
                      {order.qr_code_string || "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </td>
    </tr>
  );
}

function DigitalProductRow({ order }: { order: any }) {
  const mutation = useMutation({
    mutationFn: () => resendDigitalProductEmail({ data: { order_id: order.id } } as any),
    onSuccess: () => {
      toast.success("Delivery email resent successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to resend email.");
    },
  });

  return (
    <tr className="border-b border-border/50 hover:bg-secondary/10 transition-colors">
      <td className="px-6 py-4">
        <span className="font-semibold text-foreground">
          {order.user?.username || order.guest_name || "Guest"}
        </span>
      </td>
      <td className="px-6 py-4 text-muted-foreground">{order.user?.email || "N/A"}</td>
      <td className="px-6 py-4 text-muted-foreground">
        {format(new Date(order.created_at), "MMM d, yyyy h:mm a")}
      </td>
      <td className="px-6 py-4">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-green-500/10 text-green-500">
          <CheckCircle className="h-3 w-3" /> Sent
        </span>
      </td>
      <td className="px-6 py-4 text-right">
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending}
        >
          {mutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4 text-primary" />
          )}
          Resend
        </Button>
      </td>
    </tr>
  );
}

function ProductDetailsView() {
  const { productId, workspaceSlug } = Route.useParams();
  const { activeWorkspace } = useWorkspace();
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 20;

  const { data: product, isLoading: isLoadingProduct } = useQuery({
    queryKey: ["product", productId],
    queryFn: () => getProduct({ data: { id: productId } } as any),
    enabled: !!productId,
  });

  const { data: allOrders = [], isLoading: isLoadingOrders } = useQuery({
    queryKey: ["workspace-recent-orders", activeWorkspace?.id],
    queryFn: () =>
      getWorkspaceRecentOrders({ data: { workspace_id: activeWorkspace?.id! } } as any),
    enabled: !!activeWorkspace?.id,
  });

  const { data: digitalOrders = [], isLoading: isLoadingDigitalOrders } = useQuery({
    queryKey: ["digital-product-orders", productId],
    queryFn: () => getDigitalProductOrders({ data: { product_id: productId } } as any),
    enabled: !!product && product.type === "digital",
  });

  if (isLoadingProduct || isLoadingOrders || isLoadingDigitalOrders) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] gap-4">
        <Wallet className="h-12 w-12 text-muted-foreground opacity-20" />
        <h2 className="text-xl font-semibold">Product Not Found</h2>
        <Link to="/dashboard/$workspaceSlug/products&add-ons" params={{ workspaceSlug }}>
          <Button variant="outline">Go Back</Button>
        </Link>
      </div>
    );
  }

  const productOrders = allOrders.filter((o: any) => o.product_id === product.id);

  const initialValue = Number(product.value_amount || 0);

  // Calculate stats
  let totalValue = 0;
  let remainingBalance = 0;

  productOrders.forEach((order: any) => {
    if (order.status !== "disabled") {
      totalValue += initialValue;
      remainingBalance += Number(order.current_balance || 0);
    }
  });

  const totalUsed = totalValue - remainingBalance;

  const filteredOrders = productOrders.filter(
    (o: any) =>
      o.qr_code_string?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.user?.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.guest_name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  return (
    <div className="space-y-6 max-w-[1400px] w-full mx-auto px-4 pb-10">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link to="/dashboard/$workspaceSlug/products&add-ons" params={{ workspaceSlug }}>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{product.name}</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-2">
              {product.type === "digital" ? (
                <>
                  <Download className="h-4 w-4" />
                  Digital Product
                </>
              ) : (
                <>
                  <Wallet className="h-4 w-4" />
                  Gift Card (Product)
                </>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          <Link
            to="/dashboard/$workspaceSlug/products/edit/$productId"
            params={{ workspaceSlug, productId }}
          >
            <Button
              variant="outline"
              className="gap-2 bg-card border-border/60 shadow-[var(--shadow-card)]"
            >
              <Edit className="h-4 w-4" />
              Edit {product.type === "digital" ? "Product" : "Gift Card"}
            </Button>
          </Link>
        </div>
      </header>

      {product.type === "digital" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)]">
            <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" /> Digital File
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-secondary/30 p-4 rounded-xl border border-border/40">
              <div className="flex-1 truncate">
                <p className="text-xs text-muted-foreground uppercase font-semibold mb-1">
                  File URL
                </p>
                <p className="font-mono text-sm truncate text-primary">
                  {product.specs?.digital_file_url || "No file uploaded"}
                </p>
              </div>
              <Button
                variant="outline"
                className="flex-shrink-0"
                onClick={() => {
                  if (product.specs?.digital_file_url) {
                    navigator.clipboard.writeText(product.specs.digital_file_url);
                    toast.success("Link copied to clipboard");
                  }
                }}
                disabled={!product.specs?.digital_file_url}
              >
                <Copy className="h-4 w-4 mr-2" /> Copy Link
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Total Downloads
            </p>
            <p className="text-3xl font-bold tracking-tight">{digitalOrders.length}</p>
            <p className="text-sm text-muted-foreground mt-2">Successful deliveries</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Total Value
            </p>
            <p className="text-3xl font-bold tracking-tight">
              {formatCurrency(totalValue, activeWorkspace?.currency || "RWF")}
            </p>
            <p className="text-sm text-muted-foreground mt-2">{productOrders.length} Sold</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent pointer-events-none" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Total Used
            </p>
            <p className="text-3xl font-bold tracking-tight text-green-500">
              {formatCurrency(totalUsed > 0 ? totalUsed : 0, activeWorkspace?.currency || "RWF")}
            </p>
            <p className="text-sm text-green-500/70 mt-2">Spent across vendors</p>
          </div>

          <div className="rounded-2xl border border-border/60 bg-card p-6 shadow-[var(--shadow-card)] flex flex-col justify-between relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent pointer-events-none" />
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
              Remaining Balance
            </p>
            <p className="text-3xl font-bold tracking-tight text-blue-500">
              {formatCurrency(remainingBalance, activeWorkspace?.currency || "RWF")}
            </p>
            <p className="text-sm text-blue-500/70 mt-2">Available to spend</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-border/60 bg-card shadow-[var(--shadow-card)] overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 pb-4 gap-4">
          <div>
            <h3 className="font-semibold text-lg">
              {product.type === "digital" ? "Downloads" : "Sold Gift Cards"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {product.type === "digital"
                ? "Track users who have purchased and downloaded this file."
                : "Manage and track all sold instances of this gift card."}
            </p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by QR or User..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setPage(1);
              }}
              className="w-full sm:w-64 pl-9 pr-4 py-2 bg-secondary/30 border border-border/40 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[800px]">
            <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
              {product.type === "digital" ? (
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">Buyer Name</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Email</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Date</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right font-medium tracking-wider">Actions</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-6 py-4 font-medium tracking-wider">QR Code</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Owner</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Initial Value</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-green-500">Used</th>
                  <th className="px-6 py-4 font-medium tracking-wider text-blue-500">Balance</th>
                  <th className="px-6 py-4 font-medium tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right font-medium tracking-wider">Actions</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-border/60">
              {product.type === "digital"
                ? digitalOrders.map((order: any) => (
                    <DigitalProductRow key={order.id} order={order} />
                  ))
                : paginatedOrders.map((order: any) => (
                    <GiftCardRow
                      key={order.id}
                      order={order}
                      currency={activeWorkspace?.currency || "RWF"}
                      initialValue={initialValue}
                    />
                  ))}
              {((product.type === "digital" && digitalOrders.length === 0) ||
                (product.type !== "digital" && productOrders.length === 0)) && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2">
                      {product.type === "digital" ? (
                        <Download className="h-8 w-8 opacity-20" />
                      ) : (
                        <Wallet className="h-8 w-8 opacity-20" />
                      )}
                      <p>
                        {product.type === "digital"
                          ? "No downloads yet."
                          : "No gift cards have been sold yet."}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {product.type !== "digital" && totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/60 bg-secondary/10">
            <span className="text-sm text-muted-foreground">
              Showing {(page - 1) * itemsPerPage + (filteredOrders.length > 0 ? 1 : 0)} to{" "}
              {Math.min(page * itemsPerPage, filteredOrders.length)} of {filteredOrders.length}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
