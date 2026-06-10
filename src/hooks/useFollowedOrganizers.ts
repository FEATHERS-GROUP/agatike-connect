import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useUserAuth } from "@/contexts/UserAuthContext";
import { getFollowedOrganizers, followOrganizer, unfollowOrganizer } from "@/api/organizers";
import { toast } from "sonner";

export function useFollowedOrganizers() {
  const { isLoggedIn } = useUserAuth();
  const queryClient = useQueryClient();

  const { data: followedIds = [] } = useQuery({
    queryKey: ["followed-organizers"],
    queryFn: () => getFollowedOrganizers(),
    enabled: isLoggedIn,
    // Always re-fetch on mount so stale cache (from previous broken queries) is cleared
    staleTime: 0,
    refetchOnMount: "always",
  });

  const followMutation = useMutation({
    mutationFn: (organizerId: string) => followOrganizer({ data: { organizerId } } as any),
    onMutate: async (organizerId) => {
      await queryClient.cancelQueries({ queryKey: ["followed-organizers"] });
      const previous = queryClient.getQueryData<string[]>(["followed-organizers"]) || [];
      queryClient.setQueryData<string[]>(["followed-organizers"], [...previous, organizerId]);
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["followed-organizers"], context?.previous);
      toast.error("Failed to follow organizer");
    },
    onSuccess: () => {
      toast.success("Following organizer!");
      queryClient.invalidateQueries({ queryKey: ["followed-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (organizerId: string) => unfollowOrganizer({ data: { organizerId } } as any),
    onMutate: async (organizerId) => {
      await queryClient.cancelQueries({ queryKey: ["followed-organizers"] });
      const previous = queryClient.getQueryData<string[]>(["followed-organizers"]) || [];
      queryClient.setQueryData<string[]>(
        ["followed-organizers"],
        previous.filter((x) => x !== organizerId),
      );
      return { previous };
    },
    onError: (err, id, context) => {
      queryClient.setQueryData(["followed-organizers"], context?.previous);
      toast.error("Failed to unfollow organizer");
    },
    onSuccess: () => {
      toast.success("Unfollowed organizer");
      queryClient.invalidateQueries({ queryKey: ["followed-organizers"] });
      queryClient.invalidateQueries({ queryKey: ["organizers"] });
    },
  });

  const toggleFollow = (id: string) => {
    if (!isLoggedIn) {
      toast.error("Please sign in to follow organizers");
      return;
    }
    if (followedIds.includes(id)) {
      unfollowMutation.mutate(id);
    } else {
      followMutation.mutate(id);
    }
  };

  const isFollowing = (id: string) => followedIds.includes(id);

  return { followedIds, toggleFollow, isFollowing };
}
