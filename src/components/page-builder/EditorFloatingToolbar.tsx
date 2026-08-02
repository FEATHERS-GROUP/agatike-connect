import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, ZoomIn, ZoomOut, Wand2, Plus } from "lucide-react";
import { Link } from "@tanstack/react-router";

export function EditorFloatingToolbar({ zoomLevel, setZoomLevel, activeWorkspace }: any) {
  const [wandActive, setWandActive] = useState(false);
  const [searchActive, setSearchActive] = useState(false);

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5 p-1.5 bg-card border border-border/60 shadow-lg rounded-full z-20">
      <Button 
        variant="ghost" 
        size="icon" 
        className={`w-8 h-8 rounded-full ${wandActive ? 'bg-primary/20 text-primary' : 'hover:bg-secondary text-muted-foreground'}`}
        onClick={() => setWandActive(!wandActive)}
      >
        <Wand2 className={`w-4 h-4 ${wandActive ? 'text-primary' : 'text-muted-foreground'}`} />
      </Button>
      <div className="w-px h-4 bg-border/60 mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className="w-8 h-8 rounded-full hover:bg-secondary"
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="w-px h-4 bg-border/60 mx-1" />
      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-secondary" onClick={() => setZoomLevel(Math.max(25, zoomLevel - 25))}>
        <ZoomOut className="w-4 h-4 text-muted-foreground" />
      </Button>
      <Button variant="ghost" className="h-8 px-2 text-xs font-medium text-muted-foreground rounded-full hover:bg-secondary" onClick={() => setZoomLevel(100)}>
        {zoomLevel}%
      </Button>
      <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full hover:bg-secondary" onClick={() => setZoomLevel(Math.min(200, zoomLevel + 25))}>
        <ZoomIn className="w-4 h-4 text-muted-foreground" />
      </Button>
      <div className="w-px h-4 bg-border/60 mx-1" />
      <Button 
        variant="ghost" 
        size="icon" 
        className={`w-8 h-8 rounded-full ${searchActive ? 'bg-secondary text-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
        onClick={() => setSearchActive(!searchActive)}
      >
        <Search className={`w-4 h-4 ${searchActive ? 'text-foreground' : 'text-muted-foreground'}`} />
      </Button>
      {activeWorkspace && (
        <Button 
          className="h-8 px-4 rounded-full bg-primary/10 text-primary hover:bg-primary/20 text-xs font-medium ml-1"
          asChild
        >
          <Link to={`/dashboard/${activeWorkspace.slug}/billing`}>
            Upgrade Plan
          </Link>
        </Button>
      )}
    </div>
  );
}
