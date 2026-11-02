import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { FiArrowUpRight, FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion as Motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { Pagination } from "../../components/ui/Pagination";
import { USER_ROLES } from "../../config/roles";
import { dashboardService } from "../../services/dashboardService";
import { selfServiceService } from "../../services/selfServiceService";
import { visitService } from "../../services/visitService";
import { useAuth } from "../../hooks/useAuth";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";
import { SelfServiceReviewModal } from "../selfservice/SelfServiceReviewModal";

const clientPage = (rows, page, size) => {
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size));
  const number = Math.min(page, totalPages - 1);
  const content = rows.slice(number * size, number * size + size);
  return { content, number, size, numberOfElements: content.length, totalElements, totalPages, first: number === 0, last: number >= totalPages - 1 };
};

export const DashboardPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const activePagination = usePagination();
  const [reviewingRegistration, setReviewingRegistration] = useState(null);
  const { user } = useAuth();
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const isBranchAdmin = user?.role === USER_ROLES.BRANCH_ADMIN;
  const isFrontDesk = user?.role === USER_ROLES.FRONTDESK;
  const hideActiveVisitors = isSuperAdmin || isBranchAdmin;
  const hideRecentActivities = isSuperAdmin || isBranchAdmin || isFrontDesk || user?.role === USER_ROLES.SECURITY_OFFICER;
  const canReviewSelfService = user?.role === USER_ROLES.FRONTDESK;
  const canOpenActiveVisitors = [USER_ROLES.BRANCH_ADMIN, USER_ROLES.FRONTDESK, USER_ROLES.SECURITY_OFFICER, USER_ROLES.AUDITOR].includes(user?.role);
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["dashboard"],
    queryFn: () => dashboardService.get(),
    refetchInterval: canReviewSelfService ? 5000 : false,
  });
  const handover = useQuery({ queryKey: ["handover-status"], queryFn: visitService.handoverStatus, enabled: isFrontDesk, refetchInterval: 60_000 });
  const refreshAfterReview = () => {
    queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    queryClient.invalidateQueries({ queryKey: ["self-service-registrations"] });
    queryClient.invalidateQueries({ queryKey: ["visitors"] });
    queryClient.invalidateQueries({ queryKey: ["active-visits"] });
    setReviewingRegistration(null);
  };
  const approve = useMutation({
    mutationFn: selfServiceService.approve,
    onSuccess: () => { toast.success("Visitor approved and checked in"); refreshAfterReview(); },
    onError: (requestError) => toast.error(getApiError(requestError).message),
  });
  const reject = useMutation({
    mutationFn: ({ id, reason }) => selfServiceService.reject(id, reason),
    onSuccess: () => { toast.success("Registration rejected"); refreshAfterReview(); },
    onError: (requestError) => toast.error(getApiError(requestError).message),
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  if (error) return <ApiErrorState error={error} onRetry={refetch} />;
  const activeVisitorsPage = clientPage(data?.activeVisitors || [], activePagination.page, activePagination.size);

  return (
    <div className="space-y-6">
      {isFrontDesk && handover.data?.handoverWarning && <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800">Front Desk closes at {formatDateTime(handover.data.closesAt)}. Review or hand over {handover.data.activeVisitors} active visitor(s) to Security.</div>}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Dashboard Summary</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
            Real-time visibility into arrivals, onsite visitors, appointments, and branch traffic.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {(data?.kpis || []).map((kpi, index) => (
          <Motion.div key={kpi.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.04 }}>
            <Card>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-gray-500 dark:text-slate-400">{kpi.label}</p>
                  <p className="mt-3 text-3xl font-bold text-gray-900 dark:text-white">{kpi.value}</p>
                </div>
                <span className="rounded-lg bg-primary-50 p-2 text-primary">
                  <FiArrowUpRight />
                </span>
              </div>
              <p className={`mt-4 text-sm font-semibold ${kpi.tone === "warning" ? "text-amber-600" : "text-emerald-600"}`}>{kpi.delta}</p>
            </Card>
          </Motion.div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Visitor Trends</h3>
            <span className="text-sm text-gray-500">Last 7 days</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.visitorTrend || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="visitors" stroke="#01B0F1" strokeWidth={3} dot={false} />
                <Line type="monotone" dataKey="appointments" stroke="#10B981" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card>
          <div className="mb-5 flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Branch Statistics</h3>
            <span className="text-sm text-gray-500">Today</span>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.branchStats || []} layout="vertical" margin={{ left: 24 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#edf2f7" />
                <XAxis type="number" />
                <YAxis dataKey="branch" type="category" width={92} />
                <Tooltip />
                <Bar dataKey="visitors" fill="#01B0F1" radius={[0, 8, 8, 0]} />
                <Bar dataKey="active" fill="#0EA5E9" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {(!hideActiveVisitors || !hideRecentActivities) && (
      <div className={`grid gap-6 ${!hideActiveVisitors && !hideRecentActivities ? "xl:grid-cols-[1.2fr_0.8fr]" : ""}`}>
        {!hideRecentActivities && (
          <div className="space-y-6">
            <Card>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Activities</h3>
              <div className="mt-4 space-y-4">
                {(data?.recentActivities || []).map((activity) => (
                  <div key={activity.id} className="rounded-lg border border-gray-100 p-3 dark:border-slate-800">
                    <p className="text-sm text-gray-700 dark:text-slate-200">
                      <span className="font-bold">{activity.actor}</span> {activity.action}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">{formatDateTime(activity.time)}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}
      </div>
      )}
      {canReviewSelfService && <SelfServiceReviewModal
          registration={reviewingRegistration}
          onClose={() => setReviewingRegistration(null)}
          onApprove={(id, physicalTagId) => approve.mutate({ id, physicalTagId })}
          onReject={(id, reason) => reject.mutate({ id, reason })}
          isLoading={approve.isPending || reject.isPending}
        />}
    </div>
  );
};
