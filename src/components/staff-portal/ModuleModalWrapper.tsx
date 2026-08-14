import React from "react";
import { X } from "lucide-react";

interface ModuleModalWrapperProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export function ModuleModalWrapper({ title, onClose, children }: ModuleModalWrapperProps) {
  return (
    <div className="fixed inset-0 z-[200] bg-background/80 backdrop-blur-sm flex flex-col justify-end">
      <div className="absolute inset-0 z-0" onClick={onClose} />
      
      <div className="relative z-10 w-full h-[90vh] bg-background border-t border-border/50 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.1)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-full duration-300">
        <div className="w-full flex justify-center py-3" onClick={onClose}>
          <div className="w-12 h-1.5 rounded-full bg-border" />
        </div>
        
        <div className="px-6 pb-4 flex items-center justify-between border-b border-border/50">
          <h2 className="text-2xl font-black">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 bg-secondary/50 hover:bg-secondary rounded-full active:scale-95 transition-all"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6 pb-safe">
          {children}
        </div>
      </div>
    </div>
  );
}
