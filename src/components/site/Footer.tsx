import { Link } from "@tanstack/react-router";

export function Footer() {
  return (
    <footer className="hidden md:block mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-14 grid gap-10 md:grid-cols-5">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <img src="/agatike-logo.png" alt="Agatike" className="h-8 w-auto object-contain" />
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Africa's premium social event platform. Discover, share and live the moments that
            matter.
          </p>
          <div className="mt-5 flex gap-3 text-sm">
            <a
              className="rounded-full border border-border bg-background px-4 py-2 hover:bg-secondary transition"
              href="#"
            >
              App Store
            </a>
            <a
              className="rounded-full border border-border bg-background px-4 py-2 hover:bg-secondary transition"
              href="#"
            >
              Google Play
            </a>
          </div>
        </div>
        {[
          { title: "Company", links: ["About", "Press", "Contact"] },
          { title: "Organizers", links: ["Create & Host", "Pricing", "Scanning", "Analytics"] },
          { title: "Legal", links: ["Terms", "Privacy", "Cookies", "Refunds"] },
        ].map((col) => (
          <div key={col.title}>
            <p className="text-sm font-semibold">{col.title}</p>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {col.links.map((l) => (
                <li key={l}>
                  {l === "Terms" ? (
                    <Link to="/terms" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "Privacy" ? (
                    <Link to="/privacy" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "Refunds" ? (
                    <Link to="/refunds" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "About" ? (
                    <Link to="/about" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "Contact" ? (
                    <Link to="/contact" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "Pricing" ? (
                    <Link to="/pricing" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : l === "Scanning" ? (
                    <Link to="/scanning" className="hover:text-foreground transition">
                      {l}
                    </Link>
                  ) : (
                    <a href="#" className="hover:text-foreground transition">
                      {l}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60 py-5 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} Agatike. Made with rhythm across Africa.
      </div>
    </footer>
  );
}
