import { useState } from "react";
import { Ticket as TicketIcon, Gift, Sparkles, Navigation } from "lucide-react";
import { DynamicPass } from "./DynamicPass";

export function CarouselStack({ tickets, vouchers, onCardClick, isCompressed }: { tickets: any[]; vouchers: any[]; onCardClick: (card: any) => void; isCompressed?: boolean }) {
  // Map tickets and vouchers to a single cards array.
  // Tickets are placed first, vouchers last so tickets render on top initially (since activeIndex starts at 0).
  const cards = [
    ...tickets.map((t, i) => ({
      id: t.id || `t-${i}`,
      type: "ticket" as const,
      data: t,
    })),
    ...vouchers.flatMap((v, i) => {
      const qty = v.qty || 1;
      return Array.from({ length: qty }).map((_, j) => {
        const isSponsored = (v.product?.name || "").toLowerCase().includes("sponsored");
        return {
          id: `${v.id || `v-${i}`}-${j}`,
          type: "voucher" as const,
          color: isSponsored ? "bg-orange-600" : "bg-orange-500",
          brand: v.product?.name || "Voucher",
          icon: v.product?.image_url ? (
            <img
              src={v.product.image_url}
              alt=""
              className="w-12 h-12 rounded-full object-cover border-2 border-white/20 mb-3"
            />
          ) : (
            <TicketIcon className="w-10 h-10 text-white mb-3" />
          ),
          qrCode: v.qr_code_string || v.id,
          data: v,
          index: j + 1,
          total: qty,
          isSponsored,
          value: Number(v.product?.value_amount) || Number(v.product?.price) || (Number(v.amount_paid) / Number(qty)) || 0,
          price: Number(v.product?.price) || (Number(v.amount_paid) / Number(qty)) || 0,
        };
      });
    }),
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="flex flex-col items-center justify-center w-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 fill-mode-both">
      <div className={`relative w-full h-[380px] flex justify-center items-end perspective-[1000px] mb-8 mt-2 pb-6 transition-all duration-500 origin-bottom ${isCompressed ? "scale-[0.65] md:scale-75 opacity-70" : "scale-[0.82] md:scale-100 opacity-100"}`}>
        {cards.map((card, index) => {
          const offset = index - activeIndex;
          const absOffset = Math.abs(offset);
          const isVisible = absOffset <= 3;

          if (!isVisible) return null;

          // Fan-out effect: Rotate Z and translate slightly to create a spread hand of cards
          const rotateZ = offset * 12; // Spread degrees
          const translateY = Math.abs(offset) * 15; // Push sides down slightly
          const translateX = offset * 10; // Push sides outward slightly
          const scale = 1 - absOffset * 0.05;
          const zIndex = 20 - absOffset;

          return (
            <div
              key={card.id}
              onClick={() => {
                if (activeIndex === index) {
                  onCardClick(card);
                } else {
                  setActiveIndex(index);
                }
              }}
              className="absolute bottom-0 transition-all duration-[600ms] ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer"
              style={{
                transform: `translateX(${translateX}px) translateY(${translateY}px) rotateZ(${rotateZ}deg) scale(${scale})`,
                transformOrigin: "50% 120%", // Pivot point near the bottom
                zIndex,
                opacity: absOffset > 2 ? 0 : 1,
                pointerEvents: absOffset > 2 ? "none" : "auto",
              }}
            >
              {card.type === "voucher" ? (
                <div
                  className={`relative w-[280px] h-[360px] rounded-[2rem] shadow-2xl ${card.color} flex flex-col items-center p-6 text-white overflow-hidden border border-white/10`}
                >
                  {/* Punch holes matched to dark ambient background color */}
                  <div
                    className="absolute left-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset -3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div
                    className="absolute right-[-16px] top-[60%] w-8 h-8 bg-[#1a1a1a] rounded-full z-10"
                    style={{ boxShadow: "inset 3px 0px 5px rgba(0,0,0,0.5)" }}
                  />
                  <div className="absolute left-6 right-6 top-[60%] border-t-2 border-dashed border-white/30 translate-y-[15px]" />

                  {/* Content */}
                  <div className="flex flex-col items-center justify-center flex-1 w-full pb-8">
                    {card.icon}
                    <p
                      className={`tracking-[0.2em] text-[10px] font-bold uppercase mb-1 opacity-90 ${card.isSponsored ? "text-yellow-200" : ""}`}
                    >
                      {card.brand}
                    </p>
                    
                    {/* Value and Price */}
                    <div className="flex items-baseline gap-1 my-1">
                      <span className="text-3xl font-black">
                        {Number(card.value).toLocaleString()}
                      </span>
                      <span className="text-sm font-bold opacity-80">RWF</span>
                    </div>
                    {Number(card.price) > 0 && (
                      <p className="text-[10px] opacity-75 font-medium mb-1">
                        Purchased for {Number(card.price).toLocaleString()} RWF
                      </p>
                    )}

                    {card.total > 1 && (
                      <p className="text-[10px] opacity-70 mb-4 font-mono mt-1">
                        Item {card.index} of {card.total}
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
                      {card.qrCode}
                    </p>
                  </div>

                  <div className="absolute bottom-6 w-full px-8">
                    <div
                      className={`w-full backdrop-blur-sm font-bold py-3.5 rounded-full text-[13px] border text-center uppercase tracking-widest ${card.isSponsored ? "bg-yellow-500/20 text-yellow-200 border-yellow-500/40 shadow-[0_0_15px_rgba(234,179,8,0.2)]" : "bg-white/10 text-white border-white/20 shadow-sm"}`}
                    >
                      {card.isSponsored ? "Sponsored Gift" : "Gift Card"}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-[340px] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2rem]">
                  <DynamicPass ticket={card.data} />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Dots */}
      <div className="flex items-center justify-center gap-2">
        {cards.map((_, idx) => (
          <div
            key={idx}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              activeIndex === idx ? "w-8 bg-white" : "w-4 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}

