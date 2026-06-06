import { experienceCategories } from "@/lib/mock-data";
import { Mountain, Waves, Route, HeartPulse, Palette, Map as MapIcon, Bike, BookOpen, Utensils, Footprints } from "lucide-react";

const categoryIcons: Record<string, any> = {
  "Hiking": Mountain,
  "Running": Footprints,
  "Surf": Waves,
  "Wellness": HeartPulse,
  "Drawing": Palette,
  "Art": Palette,
  "Trips": MapIcon,
  "Tourism": MapIcon,
  "Bike Rides": Bike,
  "Yoga": HeartPulse,
  "Book Clubs": BookOpen,
  "Food": Utensils,
};

export function CategorySelectStep({ 
  selectedCategory, 
  onSelectCategory 
}: { 
  selectedCategory: string, 
  onSelectCategory: (category: string) => void 
}) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
      <div>
        <h3 className="text-xl font-semibold mb-2">What kind of experience is this?</h3>
        <p className="text-sm text-muted-foreground">Select the category that best fits your activity.</p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {experienceCategories.map((category) => {
          const Icon = categoryIcons[category] || Route;
          const isSelected = selectedCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => onSelectCategory(category)}
              className={`flex flex-col items-center justify-center gap-3 p-6 rounded-[2rem] border transition-all duration-200 ${
                isSelected
                  ? "border-primary bg-primary/10 shadow-[0_0_15px_rgba(249,115,22,0.15)] scale-[1.02]"
                  : "border-border/60 bg-card hover:bg-secondary/40 hover:border-border hover:scale-[1.02]"
              }`}
            >
              <div className={`p-3 rounded-2xl ${isSelected ? "bg-primary text-primary-foreground" : "bg-secondary text-foreground"}`}>
                <Icon className="w-6 h-6" />
              </div>
              <span className={`font-semibold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>{category}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
