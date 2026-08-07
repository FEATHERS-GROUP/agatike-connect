import { ChevronLeft, Download, Loader2, Briefcase } from "lucide-react";
import QRCode from "react-qr-code";
import { DynamicPass } from "./DynamicPass";

export function SelectedCardView({
  selectedCard,
  setSelectedCard,
  handleDownload,
  isDownloading,
}: {
  selectedCard: any;
  setSelectedCard: (card: any) => void;
  handleDownload: () => void;
  isDownloading: boolean;
}) {
  if (!selectedCard) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col items-center justify-between overflow-hidden animate-in fade-in slide-in-from-right-8 duration-300 md:static md:z-auto md:bg-transparent md:w-full md:flex-1 md:sticky md:top-12 md:justify-start md:overflow-visible">
      <style>{`
        @media (max-width: 768px) {
          #mobile-nav-container { display: none !important; }
        }
      `}</style>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center w-full px-5 py-6 shrink-0">
        <button
          onClick={() => setSelectedCard(null)}
          className="w-10 h-10 bg-white/[0.08] backdrop-blur-xl rounded-2xl flex items-center justify-center hover:bg-white/[0.15] border border-white/10 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-white/90" />
        </button>
        <span className="ml-4 font-bold text-lg text-white">
          {selectedCard.type === "ticket"
            ? "Ticket Details"
            : selectedCard.type === "voucher"
              ? "Voucher Details"
              : "Product Details"}
        </span>
      </div>

      {/* Desktop Header */}
      <div className="hidden md:flex w-full justify-center mb-8 shrink-0">
        <h2 className="text-white text-3xl font-black tracking-tight drop-shadow-md">
          {selectedCard.type === "ticket"
            ? "Ticket Details"
            : selectedCard.type === "voucher"
              ? "Voucher Details"
              : "Product Details"}
        </h2>
      </div>

      {/* Card Content - Centered & Scaled to fit */}
      <div className="flex-1 flex flex-col items-center justify-center w-full max-w-[380px] mx-auto min-h-0 px-4">
        {selectedCard.type === "ticket" ? (
          <div className="w-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem] transform transition-transform hover:scale-[1.02]">
            <DynamicPass ticket={selectedCard.data} />
          </div>
        ) : selectedCard.type === "voucher" ? (
          <div
            id={`voucher-${selectedCard.id}`}
            className={`relative w-[280px] h-[360px] rounded-[2rem] shadow-2xl ${selectedCard.color} flex flex-col items-center p-6 text-white overflow-hidden border border-white/10`}
          >
            <div
              className="absolute left-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
              style={{ boxShadow: "inset -3px 0px 5px rgba(0,0,0,0.5)" }}
            />
            <div
              className="absolute right-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
              style={{ boxShadow: "inset 3px 0px 5px rgba(0,0,0,0.5)" }}
            />
            <div className="absolute left-6 right-6 top-[60%] border-t-2 border-dashed border-white/30 translate-y-[15px]" />

            <div className="flex flex-col items-center justify-center flex-1 w-full pb-8">
              {selectedCard.icon}
              <p
                className={`tracking-[0.2em] text-[10px] font-bold uppercase mb-1 opacity-90 ${selectedCard.isSponsored ? "text-yellow-200" : ""}`}
              >
                {selectedCard.brand}
              </p>

              <div className="flex items-baseline gap-1 my-1">
                <span className="text-3xl font-black">
                  {Number(selectedCard.value).toLocaleString()}
                </span>
                <span className="text-sm font-bold opacity-80">RWF</span>
              </div>
              {Number(selectedCard.price) > 0 && (
                <p className="text-[10px] opacity-75 font-medium mb-1">
                  Purchased for {Number(selectedCard.price).toLocaleString()} RWF
                </p>
              )}

              {selectedCard.total > 1 && (
                <p className="text-[10px] opacity-70 mb-4 font-mono mt-1">
                  Item {selectedCard.index} of {selectedCard.total}
                </p>
              )}

              <div className="mt-2 w-full h-12 flex items-center justify-center px-4">
                {Array.from({ length: 35 }).map((_, i) => {
                  const w = (i * 13) % 4 === 0 ? "4px" : (i * 7) % 3 === 0 ? "1px" : "2px";
                  const mr = (i * 5) % 2 === 0 ? "1px" : "3px";
                  return (
                    <div
                      key={i}
                      className="h-full bg-white opacity-90"
                      style={{ width: w, marginRight: mr }}
                    />
                  );
                })}
              </div>
              <p className="mt-2 text-[10px] tracking-widest font-mono opacity-80 break-all px-4 text-center">
                {selectedCard.qrCode}
              </p>
            </div>

            <div className="absolute bottom-6 w-full px-8">
              <div
                className={`w-full backdrop-blur-sm font-bold py-3.5 rounded-full text-[13px] border text-center uppercase tracking-widest ${selectedCard.isSponsored ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-white/10 text-white border-white/20 shadow-sm"}`}
              >
                {selectedCard.isSponsored ? "Sponsored Gift" : "Gift Card"}
              </div>
            </div>
          </div>
        ) : selectedCard.type === "physical" ? (
          <div className="w-full max-w-[360px] bg-white/[0.03] border border-white/10 rounded-[2rem] p-8 flex flex-col items-center justify-center backdrop-blur-2xl shadow-2xl">
            {/* Product image */}
            <div className="w-24 h-24 rounded-full overflow-hidden mb-6 border-4 border-white/10 bg-black/50 flex items-center justify-center">
              {selectedCard.data.product?.image_url ? (
                <img
                  src={selectedCard.data.product.image_url}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase className="w-10 h-10 text-white/40" />
              )}
            </div>

            <h3 className="text-2xl font-bold text-white mb-2 text-center drop-shadow-md">
              {selectedCard.data.product?.name || "Product"}
            </h3>
            <p className="text-xs font-bold text-white/50 mb-8 tracking-widest uppercase">
              QTY: {selectedCard.data.qty || 1} • {selectedCard.data.size || "Standard"}
            </p>

            <div className="bg-white p-4 rounded-2xl mb-8 shadow-[0_0_30px_rgba(255,255,255,0.2)]">
              <QRCode
                value={selectedCard.data.qr_code_string || selectedCard.data.id}
                size={160}
              />
            </div>

            <p className="text-xs font-mono tracking-widest text-white/60 mb-8 break-all text-center px-4">
              {selectedCard.data.qr_code_string || selectedCard.data.id}
            </p>

            <div
              className={`w-full py-3 rounded-full text-center font-bold text-sm tracking-widest uppercase border ${selectedCard.data.picked ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.2)]" : "bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]"}`}
            >
              {selectedCard.data.picked ? "Item Picked Up" : "Pending Pickup"}
            </div>
          </div>
        ) : null}
      </div>

      {/* Footer / Save PDF */}
      <div className="w-full px-5 pb-8 pt-4 shrink-0 md:max-w-[380px] mx-auto md:p-0 md:mt-8">
        {selectedCard.type !== "physical" && (
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="group relative w-full overflow-hidden bg-primary text-primary-foreground font-bold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 shadow-[0_8px_30px_rgb(var(--primary)_/_0.4)] hover:shadow-[0_8px_40px_rgb(var(--primary)_/_0.6)] hover:-translate-y-1 transition-all duration-300 text-[15px] disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:scale-[0.98]"
            style={{ background: "var(--gradient-primary)" }}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <div className="relative flex items-center gap-2">
              {isDownloading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Download className="w-5 h-5" />
              )}
              {isDownloading ? "Generating PDF..." : "Save PDF"}
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
