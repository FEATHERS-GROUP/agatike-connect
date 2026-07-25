export function StorefrontFooter() {
  return (
    <footer className="w-full py-8 mt-12 border-t border-border/40 bg-card/30 shrink-0">
      <div className="max-w-5xl mx-auto px-4 flex flex-col items-center justify-center text-center">
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          Built with
          <span className="font-bold text-foreground flex items-center gap-1.5">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-primary text-[10px] text-primary-foreground">
              A
            </span>
            Agatike Connect
          </span>
        </p>
        <a
          href="/"
          className="text-xs text-muted-foreground/60 hover:text-primary transition-colors mt-2"
        >
          Create your own page today
        </a>
      </div>
    </footer>
  );
}
