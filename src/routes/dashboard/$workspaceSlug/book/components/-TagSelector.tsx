import { useState, KeyboardEvent } from "react";
import { X, Plus, Tag as TagIcon, Check } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

export interface Tag {
  label: string;
  color: string;
}

export const TAG_COLORS = [
  "bg-blue-500/15 text-blue-600",
  "bg-purple-500/15 text-purple-600",
  "bg-green-500/15 text-green-700",
  "bg-amber-500/15 text-amber-700",
  "bg-rose-500/15 text-rose-600",
  "bg-cyan-500/15 text-cyan-700",
  "bg-slate-500/15 text-slate-700",
];

interface TagSelectorProps {
  tags: Tag[];
  onChange: (tags: Tag[]) => void;
  availableTags: Tag[];
}

export function TagSelector({ tags, onChange, availableTags }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [selectingColor, setSelectingColor] = useState(false);

  const handleSelectExisting = (tag: Tag) => {
    if (!tags.find((t) => t.label === tag.label)) {
      onChange([...tags, tag]);
    }
    setInputValue("");
    setOpen(false);
    setSelectingColor(false);
  };

  const handleCreateNew = (color: string) => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    if (!tags.find((t) => t.label === trimmed)) {
      onChange([...tags, { label: trimmed, color }]);
    }
    setInputValue("");
    setOpen(false);
    setSelectingColor(false);
  };

  const handleRemove = (tagToRemove: Tag) => {
    onChange(tags.filter((t) => t.label !== tagToRemove.label));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue && !selectingColor) {
      e.preventDefault();
      // If it perfectly matches an existing tag, pick it. Otherwise, prompt color.
      const existing = availableTags.find(
        (t) => t.label.toLowerCase() === inputValue.trim().toLowerCase(),
      );
      if (existing) {
        handleSelectExisting(existing);
      } else {
        setSelectingColor(true);
      }
    }
  };

  // Filter out already selected tags from suggestions
  const suggestions = availableTags.filter(
    (t) =>
      !tags.find((st) => st.label === t.label) &&
      t.label.toLowerCase().includes(inputValue.toLowerCase()),
  );

  // Deduplicate available tags by label in case of accidental duplicates
  const uniqueSuggestions = Array.from(
    new Map(suggestions.map((item) => [item.label, item])).values(),
  );

  const exactMatchExists = uniqueSuggestions.find(
    (t) => t.label.toLowerCase() === inputValue.trim().toLowerCase(),
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 w-full">
      {tags.map((tag) => (
        <span
          key={tag.label}
          className={cn(
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium group",
            tag.color,
          )}
        >
          {tag.label}
          <button
            onClick={() => handleRemove(tag)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <Popover
        open={open}
        onOpenChange={(val) => {
          setOpen(val);
          if (!val) {
            setSelectingColor(false);
            setInputValue("");
          }
        }}
      >
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50 transition-colors",
              tags.length === 0 && "opacity-60 hover:opacity-100",
            )}
          >
            <Plus className="h-3 w-3" /> {tags.length === 0 ? "Add tag" : ""}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0 overflow-hidden" align="start">
          {selectingColor ? (
            <div className="p-3">
              <p className="text-xs font-semibold mb-3 text-muted-foreground">Select tag color</p>
              <div className="grid grid-cols-4 gap-2">
                {TAG_COLORS.map((color) => (
                  <button
                    key={color}
                    onClick={() => handleCreateNew(color)}
                    className={cn(
                      "h-6 w-full rounded-md border border-border/50 hover:ring-2 hover:ring-primary/40 transition-all",
                      color,
                    )}
                  />
                ))}
              </div>
              <button
                onClick={() => setSelectingColor(false)}
                className="text-xs text-muted-foreground hover:text-foreground mt-4 block w-full text-center"
              >
                Back
              </button>
            </div>
          ) : (
            <Command>
              <div className="flex items-center border-b px-3">
                <TagIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <input
                  className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Search or create tag..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={onKeyDown}
                  autoFocus
                />
              </div>
              <CommandList>
                <CommandEmpty className="py-2 text-center text-sm text-muted-foreground">
                  {inputValue ? (
                    <button
                      onClick={() => setSelectingColor(true)}
                      className="w-full text-left px-4 py-2 hover:bg-secondary/50"
                    >
                      Create <span className="font-semibold">"{inputValue}"</span>
                    </button>
                  ) : (
                    "Type to search or create"
                  )}
                </CommandEmpty>
                <CommandGroup>
                  {uniqueSuggestions.map((suggestion) => (
                    <CommandItem
                      key={suggestion.label}
                      onSelect={() => handleSelectExisting(suggestion)}
                      className="cursor-pointer flex items-center justify-between group/item"
                    >
                      <span>{suggestion.label}</span>
                      <span
                        className={cn(
                          "h-3 w-3 rounded-full opacity-50 group-hover/item:opacity-100",
                          suggestion.color,
                        )}
                      />
                    </CommandItem>
                  ))}
                  {inputValue && !exactMatchExists && (
                    <CommandItem
                      onSelect={() => setSelectingColor(true)}
                      className="cursor-pointer font-medium text-primary"
                    >
                      Create "{inputValue}"
                    </CommandItem>
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </div>
  );
}
