import { useQuery } from "@tanstack/react-query";
import {
  getActiveSubscription,
  getOrganizerUsageStats,
  getWorkspaceUsageStats,
} from "@/api/billing";
import { useWorkspace } from "@/contexts/WorkspaceContext";

export function useSubscriptionLimits(
  organizerId: string | undefined,
  workspaceId?: string | undefined,
) {
  const { data: subscription, isLoading: subLoading } = useQuery({
    queryKey: ["active-subscription", organizerId],
    queryFn: () => getActiveSubscription({ data: { organizer_id: organizerId! } }),
    enabled: !!organizerId,
  });

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["organizer-stats", organizerId],
    queryFn: () => getOrganizerUsageStats({ data: { organizer_id: organizerId! } }),
    enabled: !!organizerId,
  });

  const { data: workspaceStats, isLoading: wsStatsLoading } = useQuery({
    queryKey: ["workspace-stats", workspaceId],
    queryFn: () => getWorkspaceUsageStats({ data: { workspace_id: workspaceId! } }),
    enabled: !!workspaceId,
  });

  // usage_limits is stored as jsonb – may need parsing
  const rawLimits = subscription?.pricing_plan?.usage_limits;
  const dbLimits: Record<string, any> =
    typeof rawLimits === "string"
      ? (() => {
        try {
          return JSON.parse(rawLimits);
        } catch {
          return {};
        }
      })()
      : rawLimits || {};

  const { currentUser } = useWorkspace() as any;
  const isTrial = currentUser?.isTrialActive;

  const limits: Record<string, any> = isTrial
    ? new Proxy(
      {},
      {
        get: (target, prop) => {
          if (typeof prop === "string" && (prop.startsWith("has_") || prop.startsWith("can_"))) {
            return true;
          }
          return -1;
        },
      },
    )
    : dbLimits;

  const isLoading = subLoading || statsLoading || (!!workspaceId && wsStatsLoading);

  /** Helper: returns true when limit is -1/undefined (unlimited) or count is within limit */
  const within = (current: number, limitKey: string, useWorkspace = true) => {
    if (isLoading) return true;
    const limit = limits[limitKey];
    if (limit === -1 || limit === undefined || limit === null) return true;
    const count = useWorkspace
      ? (workspaceStats?.[limitKey.replace("max_", "") as keyof typeof workspaceStats] ?? 0)
      : (stats?.[limitKey.replace("max_", "") as keyof typeof stats] ?? 0);
    return count < limit;
  };

  // --- Workspace-level (organizer-wide) ---
  const canCreateWorkspace = () => {
    if (isLoading) return true;
    const limit = limits.max_workspaces;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (stats?.workspaces || 0) < limit;
  };

  const canInviteUser = () => {
    if (isLoading) return true;
    const limit = limits.max_workspace_users;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (stats?.users || 0) < limit;
  };

  const canCreateInvoice = () => {
    if (isLoading) return true;
    const limit = limits.max_invoices;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (stats?.invoices || 0) < limit;
  };

  // --- Per-workspace limits (uses workspaceStats) ---
  const canCreateEvent = () => {
    if (isLoading) return true;
    const limit = limits.max_events;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.events || 0) < limit;
  };

  const canCreateCinema = () => {
    if (isLoading) return true;
    const limit = limits.max_cinemas;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.cinemas || 0) < limit;
  };

  const canCreateSpace = () => {
    if (isLoading) return true;
    const limit = limits.max_spaces;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.spaces || 0) < limit;
  };

  const canCreateVenue = () => {
    if (isLoading) return true;
    const limit = limits.max_venues;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.venues || 0) < limit;
  };

  const canCreatePageBuilder = () => {
    if (isLoading) return true;
    const limit = limits.max_page_builders;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.page_builders || 0) < limit;
  };

  const canCreateCustomerForm = () => {
    if (isLoading) return true;
    // stored as max_custom_forms in usage_limits
    const limit = limits.max_custom_forms;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.custom_forms || 0) < limit;
  };

  const canCreateTask = () => {
    if (isLoading) return true;
    const limit = limits.max_tasks;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.tasks || 0) < limit;
  };

  const canCreateRsvp = () => {
    if (isLoading) return true;
    const limit = limits.max_rsvps;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.rsvps || 0) < limit;
  };

  const canCreateTicketTier = (currentTiersCount: number) => {
    if (isLoading) return true;
    const limit = limits.max_ticket_tiers_per_event;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentTiersCount < limit;
  };

  const canCreateVenueDesign = () => {
    if (isLoading) return true;
    const limit = limits.max_ticket_designs; // venue designs share ticket_designs limit
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.venue_designs || 0) < limit;
  };

  const canCreateBadgeDesign = () => {
    if (isLoading) return true;
    const limit = limits.max_badge_designs;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.badge_designs || 0) < limit;
  };

  const canCreateTicketDesign = () => {
    if (isLoading) return true;
    const limit = limits.max_ticket_designs;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return (workspaceStats?.ticket_designs || 0) < limit;
  };

  const canCreateProduct = () => {
    if (isLoading) return true;
    if (limits.max_products === -1 || limits.max_products === undefined) return true;
    return (workspaceStats?.products || 0) < limits.max_products;
  };

  const canCreateCampaign = () => {
    if (isLoading) return true;
    if (limits.max_campaigns === -1 || limits.max_campaigns === undefined) return true;
    return (workspaceStats?.campaigns || 0) < limits.max_campaigns;
  };

  const canCreateGiftCard = () => {
    if (isLoading) return true;
    if (limits.max_gift_cards === -1 || limits.max_gift_cards === undefined) return true;
    return (workspaceStats?.gift_cards || 0) < limits.max_gift_cards;
  };

  const canCreatePunchCard = () => {
    if (isLoading) return true;
    if (limits.max_punch_cards === -1 || limits.max_punch_cards === undefined) return true;
    return (workspaceStats?.punch_cards || 0) < limits.max_punch_cards;
  };

  const canCreateMovie = () => {
    if (isLoading) return true;
    if (limits.max_movies === -1 || limits.max_movies === undefined) return true;
    return (workspaceStats?.movies || 0) < limits.max_movies;
  };

  const canCreateCinemaScreen = () => {
    if (isLoading) return true;
    if (limits.max_cinema_screens === -1 || limits.max_cinema_screens === undefined) return true;
    return (workspaceStats?.screens || 0) < limits.max_cinema_screens;
  };

  const canCreatePostComment = () => {
    if (isLoading) return true;
    if (limits.max_comments === -1 || limits.max_comments === undefined) return true;
    return (workspaceStats?.comments || 0) < limits.max_comments;
  };

  const canAddIntegration = (currentIntegrationsCount: number) => {
    if (isLoading) return true;
    if (limits.max_integrations === -1 || limits.max_integrations === undefined) return true;
    return currentIntegrationsCount < limits.max_integrations;
  };

  const canCreateProcurement = () => {
    if (isLoading) return true;
    if (limits.max_procurements === -1 || limits.max_procurements === undefined) return true;
    return (workspaceStats?.procurements || 0) < limits.max_procurements;
  };

  const canCreateCustomerBook = () => {
    if (isLoading) return true;
    if (limits.max_customer_books === -1 || limits.max_customer_books === undefined) return true;
    return (workspaceStats?.books || 0) < limits.max_customer_books;
  };

  const canCreateNote = () => {
    if (isLoading) return true;
    if (limits.max_notes === -1 || limits.max_notes === undefined) return true;
    return (workspaceStats?.notes || 0) < limits.max_notes;
  };

  const canCreateExperience = () => {
    if (isLoading) return true;
    if (limits.max_experiences === -1 || limits.max_experiences === undefined) return true;
    return (workspaceStats?.experiences || 0) < limits.max_experiences;
  };

  const canCreateMembershipPlan = () => {
    if (isLoading) return true;
    if (limits.max_membership_plans === -1 || limits.max_membership_plans === undefined)
      return true;
    return (workspaceStats?.membership_plans || 0) < limits.max_membership_plans;
  };

  const canCreateLocation = () => {
    if (isLoading) return true;
    if (limits.max_locations === -1 || limits.max_locations === undefined) return true;
    return (workspaceStats?.locations || 0) < limits.max_locations;
  };

  const hasStudioAccess = () => {
    if (isLoading) return true;
    return !!limits.has_studio_access;
  };

  const canInviteContributors = () => {
    if (isLoading) return true;
    return !!limits.can_invite_contributors;
  };

  const canLinkModules = () => {
    if (isLoading) return true;
    return !!limits.can_link_modules;
  };

  const canImportStaff = () => {
    if (isLoading) return true;
    return !!limits.can_import_staff;
  };

  const canUseFormIntegration = () => {
    if (isLoading) return true;
    return !!limits.can_use_form_integration;
  };

  const canAccessEventSections = () => {
    if (isLoading) return true;
    return !!limits.can_access_event_sections;
  };

  const canUseVenueIntegration = () => {
    if (isLoading) return true;
    return !!limits.can_use_venue_integration;
  };

  const canShareFeedbackLink = () => {
    if (isLoading) return true;
    return !!limits.can_share_feedback_link;
  };

  const canAddEventStaff = (currentStaffCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_staff;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentStaffCount + quantityToAdd <= limit;
  };

  const canCreateEventStory = (currentStoriesCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_stories;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentStoriesCount + quantityToAdd <= limit;
  };

  const canCreateEventPost = (currentPostsCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_posts;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentPostsCount + quantityToAdd <= limit;
  };

  const canAddPlanningItem = (currentItemsCount: number) => {
    if (isLoading) return true;
    const limit = limits.max_planning_items;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentItemsCount < limit;
  };

  const canCreateSection = (currentCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_sections;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentCount + quantityToAdd <= limit;
  };

  const canCreateVendor = (currentCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_vendors;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentCount + quantityToAdd <= limit;
  };

  const canCreateVoucher = (currentCount: number, quantityToAdd = 1) => {
    if (isLoading) return true;
    const limit = limits.max_event_vouchers;
    if (limit === -1 || limit === undefined || limit === null) return true;
    return currentCount + quantityToAdd <= limit;
  };

  return {
    isLoading,
    subscription,
    limits,
    stats,
    workspaceStats,
    // Organizer-wide
    canCreateWorkspace,
    canInviteUser,
    canCreateInvoice,
    // Per-workspace entities
    canCreateEvent,
    canCreateCinema,
    canCreateSpace,
    canCreateVenue,
    canCreatePageBuilder,
    canCreateCustomerForm,
    canCreateTask,
    canCreateRsvp,
    canCreateTicketTier,
    canCreateVenueDesign,
    canCreateBadgeDesign,
    canCreateTicketDesign,
    canCreateProduct,
    canCreateCampaign,
    canCreateGiftCard,
    canCreatePunchCard,
    canCreateMovie,
    canCreateCinemaScreen,
    canCreatePostComment,
    canAddIntegration,
    canCreateProcurement,
    canCreateCustomerBook,
    canCreateNote,
    canCreateExperience,
    canCreateMembershipPlan,
    canCreateLocation,
    // Access flags
    hasStudioAccess,
    canInviteContributors,
    canLinkModules,
    canImportStaff,
    canUseFormIntegration,
    canAccessEventSections,
    canUseVenueIntegration,
    canShareFeedbackLink,
    canAddEventStaff,
    canCreateSection,
    canCreateVendor,
    canCreateVoucher,
    canCreateEventStory,
    canCreateEventPost,
    canAddPlanningItem,
  };
}
