import { useEffect, useState } from "react";
import { X } from "lucide-react";

type Story = { id: string; name: string; avatar: string; items: { id: string; image: string }[] };

export function StoryViewer({
  stories,
  initialIndex,
  onClose,
  onStoryFinished,
}: {
  stories: Story[];
  initialIndex: number;
  onClose: () => void;
  onStoryFinished?: (orgId: string) => void;
}) {
  const [currentOrgIndex, setCurrentOrgIndex] = useState(initialIndex);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);

  const duration = 5000; // 5 seconds per story
  const currentOrg = stories[currentOrgIndex];
  const currentItem = currentOrg.items[currentStoryIndex];

  useEffect(() => {
    setProgress(0);
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          handleNext();
          return 100;
        }
        return prev + 100 / (duration / 50);
      });
    }, 50);

    return () => clearInterval(interval);
  }, [currentOrgIndex, currentStoryIndex]);

  const handleNext = () => {
    if (currentStoryIndex < currentOrg.items.length - 1) {
      // Next story for this organizer
      setCurrentStoryIndex((prev) => prev + 1);
    } else if (currentOrgIndex < stories.length - 1) {
      // Next organizer
      onStoryFinished?.(currentOrg.id);
      setCurrentOrgIndex((prev) => prev + 1);
      setCurrentStoryIndex(0);
    } else {
      // All done
      onStoryFinished?.(currentOrg.id);
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStoryIndex > 0) {
      // Previous story for this organizer
      setCurrentStoryIndex((prev) => prev - 1);
    } else if (currentOrgIndex > 0) {
      // Previous organizer
      setCurrentOrgIndex((prev) => prev - 1);
      setCurrentStoryIndex(stories[currentOrgIndex - 1].items.length - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black">
      <div className="relative w-full h-full max-w-md bg-black">
        {/* Progress Bars for the current organizer */}
        <div className="absolute top-0 inset-x-0 z-20 flex gap-1 p-4 pt-safe-top">
          {currentOrg.items.map((item, i) => (
            <div
              key={item.id}
              className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden backdrop-blur-sm"
            >
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{
                  width: `${i === currentStoryIndex ? progress : i < currentStoryIndex ? 100 : 0}%`,
                }}
              />
            </div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute top-8 inset-x-0 z-20 flex items-center justify-between px-4 pt-safe-top">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full overflow-hidden border border-white/20">
              <img
                src={currentOrg.avatar}
                alt={currentOrg.name}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-sm font-semibold text-white drop-shadow-md">
              {currentOrg.name}
            </span>
          </div>
          <button onClick={onClose} className="text-white hover:text-white/80 p-2 drop-shadow-md">
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Story Content */}
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            key={currentItem.id}
            src={currentItem.image}
            alt="Story"
            className="w-full h-full object-cover"
          />
          {/* Overlay gradient for text readability */}
          <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-black/80 to-transparent pointer-events-none" />

          <div className="absolute bottom-10 inset-x-6 text-white z-20">
            <h2 className="text-2xl font-bold mb-2 shadow-black drop-shadow-lg">
              {currentOrg.name}
            </h2>
            <p className="text-sm text-white/90 shadow-black drop-shadow-md">
              Live moment from {currentOrg.name}
            </p>
          </div>
        </div>

        {/* Navigation Touch Zones */}
        <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={handlePrev} />
        <div className="absolute inset-y-0 right-0 w-2/3 z-10" onClick={handleNext} />
      </div>
    </div>
  );
}
