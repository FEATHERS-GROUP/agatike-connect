import { createFileRoute, useSearch } from "@tanstack/react-router";
import { RenderedPage } from "@/components/page-builder/RenderedPage";

export const Route = createFileRoute("/p/$slug")({
  component: PublicCompanyPage,
});

function PublicCompanyPage() {
  const { slug } = Route.useParams();
  
  // Extract ?preview=true from URL
  const search = useSearch({ strict: false });
  const isPreview = (search as any).preview === "true" || (search as any).preview === true;

  return <RenderedPage slug={slug} isPreview={isPreview} />;
}
