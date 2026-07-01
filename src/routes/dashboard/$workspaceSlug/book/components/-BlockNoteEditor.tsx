import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";
import { useEffect, useState, useRef } from "react";

export default function BlockNoteEditor({ value, onChange }: { value: string; onChange: (val: string) => void }) {
  const editor = useCreateBlockNote();
  const [isLoaded, setIsLoaded] = useState(false);
  const isUpdatingRef = useRef(false);

  useEffect(() => {
    if (!isLoaded) {
      async function loadInitial() {
        if (value) {
          const blocks = await editor.tryParseHTMLToBlocks(value);
          editor.replaceBlocks(editor.document, blocks);
        }
        setIsLoaded(true);
      }
      loadInitial();
    }
  }, [editor, value, isLoaded]);

  if (!isLoaded) return <div className="h-full min-h-[300px] animate-pulse bg-muted/10 rounded-xl mx-4" />;

  return (
    <div className="h-full mt-4 [&_.bn-editor]:px-0">
      <BlockNoteView
        editor={editor}
        onChange={async () => {
          isUpdatingRef.current = true;
          const html = await editor.blocksToHTMLLossy(editor.document);
          onChange(html);
          isUpdatingRef.current = false;
        }}
      />
    </div>
  );
}
