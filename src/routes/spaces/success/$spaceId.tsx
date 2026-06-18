import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ArrowRight, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/site/Navbar";
import { z } from "zod";

const successSearchSchema = z.object({
  email: z.string().optional(),
});

export const Route = createFileRoute("/spaces/success/$spaceId")({
  component: SuccessPage,
  validateSearch: successSearchSchema,
});

function SuccessPage() {
  const { spaceId } = Route.useParams();
  const search = Route.useSearch();
  const navigate = useNavigate();
  
  const email = search.email;

  return (
    <div className="min-h-screen bg-background flex flex-col text-foreground">
      <Navbar hideOnMobile />
      
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 duration-500 fade-in">
          
          <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 relative">
            <div className="absolute inset-0 bg-emerald-500/20 rounded-full animate-ping" style={{ animationDuration: '3s' }}></div>
            <CheckCircle2 className="w-12 h-12 text-emerald-500 relative z-10" />
          </div>

          <h1 className="text-4xl font-bold tracking-tight">Booking Confirmed!</h1>
          
          <p className="text-muted-foreground text-lg">
            Your payment was successful and your space is secured.
          </p>

          <div className="bg-secondary/50 border border-border/40 rounded-2xl p-6 text-left shadow-sm">
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" /> What happens next?
            </h3>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>We've sent a <strong>booking confirmation</strong> to {email ? <span className="text-foreground">{email}</span> : "your email"}.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>An <strong>invoice</strong> has also been attached in a separate email for your records.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary font-bold mt-0.5">•</span>
                <span>The space organizer will be in touch shortly if any further details are required.</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 space-y-4">
            <Button
              className="w-full h-12 rounded-xl text-lg font-bold shadow-[var(--shadow-glow)]"
              onClick={() => navigate({ to: `/spaces/${spaceId}` })}
            >
              Back to Space
            </Button>
            <Button
              variant="outline"
              className="w-full h-12 rounded-xl font-medium"
              onClick={() => navigate({ to: "/venues" })}
            >
              Explore More Spaces <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>

        </div>
      </main>
    </div>
  );
}
