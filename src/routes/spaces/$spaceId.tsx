import { createFileRoute } from "@tanstack/react-router";
import { getSpaceById } from "@/api/spaces";
import { getPublicWorkspacePageById } from "@/api/workspace-pages";
import { SpaceDetailsMobile } from "@/components/mobile/SpaceDetailsMobile";
import { SpaceDetailsDesktop } from "@/components/desktop/SpaceDetailsDesktop";

export const Route = createFileRoute("/spaces/$spaceId")({
  loader: async ({ params }) => {
    // 1. Fetch space data
    const space = await getSpaceById({ data: { id: params.spaceId } });

    // 2. Fetch linked page if available
    let linkedPage = null;
    if (space?.page_id) {
      linkedPage = await getPublicWorkspacePageById({ data: { id: space.page_id } } as any).catch(
        () => null,
      );
    }

    return { space, linkedPage };
  },
  component: SpaceDetails,
});

function SpaceDetails() {
  const { space, linkedPage } = Route.useLoaderData();

  return (
    <>
      <div className="md:hidden">
        <SpaceDetailsMobile space={space} linkedPage={linkedPage} />
      </div>
      <div className="hidden md:block">
        <SpaceDetailsDesktop space={space} linkedPage={linkedPage} />
      </div>
    </>
  );
}
