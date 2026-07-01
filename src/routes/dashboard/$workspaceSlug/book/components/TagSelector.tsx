import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { cn } from "@/lib/utils";

const TAG_COLORS = [
  "bg-blue-500/15 text-blue-600",
  "bg-purple-500/15 text-purple-600",
  "bg-green-500/15 text-green-700",
  "bg-amber-500/15 text-amber-700",
  "bg-rose-500/15 text-rose-600",
  "bg-cyan-500/15 text-cyan-700",
];

export function tagColor(tag: string) {
  let hash = 0;
  for (const c of tag) hash = (hash * 31 + c.charCodeAt(0)) & 0xffff;
  return TAG_COLORS[hash % TAG_COLORS.length];
}

interface TagSelectorProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  availableTags: string[];
}

export function TagSelector({ tags, onChange, availableTags }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [inputValue, setInputValue] = useState("");

  const handleAdd = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) return;
    if (!tags.includes(trimmed)) {
      onChange([...tags, trimmed]);
    }
    setInputValue("");
    setOpen(false);
  };

  const handleRemove = (tagToRemove: string) => {
    onChange(tags.filter((t) => t !== tagToRemove));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && inputValue) {
      e.preventDefault();
      handleAdd(inputValue);
    }
  };

  // Filter out already selected tags from suggestions
  const suggestions = availableTags.filter(
    (t) => !tags.includes(t) && t.toLowerCase().includes(inputValue.toLowerCase())
  );

  return (
    <div className="flex flex-wrap items-center gap-1.5 w-full">
      {tags.map((tag) => (
        <span
          key={tag}
          className={cn(
            "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium group",
            tagColor(tag)
          )}
        >
          {tag}
          <button
            onClick={() => handleRemove(tag)}
            className="opacity-50 hover:opacity-100 transition-opacity"
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={cn(
              "flex items-center gap-1 text-xs px-2 py-0.5 rounded-md font-medium text-muted-foreground hover:bg-secondary/50 transition-colors",
              tags.length === 0 && "opacity-60 hover:opacity-100"
            )}
          >
            <Plus className="h-3 w-3" /> {tags.length === 0 ? "Add tag" : ""}
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-[200px] p-0" align="start">
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
                    onClick={() => handleAdd(inputValue)}
                    className="w-full text-left px-4 py-2 hover:bg-secondary/50"
                  >
                    Create <span className="font-semibold">"{inputValue}"</span>
                  </button>
                ) : (
                  "Type to search or create"
                )}
              </CommandEmpty>
              <CommandGroup>
                {suggestions.map((suggestion) => (
                  <CommandItem
                    key={suggestion}
                    onSelect={() => handleAdd(suggestion)}
                    className="cursor-pointer"
                  >
                    {suggestion}
                  </CommandItem>
                ))}
                {inputValue && !suggestions.includes(inputValue) && (
                  <CommandItem onSelect={() => handleAdd(inputValue)} className="cursor-pointer font-medium text-primary">
                    Create "{inputValue}"
                  </CommandItem>
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
