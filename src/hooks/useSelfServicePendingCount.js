import { useQuery } from "@tanstack/react-query";
import { USER_ROLES } from "../config/roles";
import { selfServiceService } from "../services/selfServiceService";

export const useSelfServicePendingCount = (user) => {
  const isFrontDesk = user?.role === USER_ROLES.FRONTDESK;
  const query = useQuery({
    queryKey: ["self-service-pending-count", user?.branch?.id],
    queryFn: selfServiceService.pendingCount,
    enabled: isFrontDesk && Boolean(user?.branch?.id),
    refetchInterval: 60_000,
    refetchIntervalInBackground: true,
    staleTime: 15_000,
    retry: 1,
  });

  return {
    ...query,
    isFrontDesk,
    pendingCount: query.data?.count || 0,
  };
};

export const formatPendingCount = (count) => count > 99 ? "99+" : count;
