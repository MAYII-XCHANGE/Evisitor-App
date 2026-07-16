import { useQuery } from "@tanstack/react-query";
import { FiArrowUpRight, FiPrinter } from "react-icons/fi";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion as Motion } from "framer-motion";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { USER_ROLES } from "../../config/navigation";
import { visitorService } from "../../services/visitorService";
import { useAuthStore } from "../../store/authStore";

export const DashboardPage = () => {
  const user = useAuthStore((state) => state.user);
  const isSuperAdmin = user?.role === USER_ROLES.SUPER_ADMIN;
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: visitorService.getDashboard,
  });

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">Dashboard Summary</h2>
          <p className="mt-2 max-w-2xl text-sm text-gray-500 dark:text-slate-400">
            Real-time visibility into arrivals, onsite visitors, appointments, and branch traffic.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map((kpi, index) => (
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
              <p className={`mt-4 text-sm font-semibold ${kpi.tone === "warning" ? "text-amber-600" : "text-emerald-600"}`}>{kpi.delta} vs yesterday</p>
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
              <LineChart data={data.visitorTrend}>
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
              <BarChart data={data.branchStats} layout="vertical" margin={{ left: 24 }}>
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

      <div className={`grid gap-6 ${isSuperAdmin ? "" : "xl:grid-cols-[1.2fr_0.8fr]"}`}>
        {!isSuperAdmin && (
          <Card>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">Active visitors</h3>
              <Button variant="secondary">View all</Button>
            </div>
            <div className="table-scroll overflow-x-auto">
              <table className="w-full min-w-[680px] text-left text-sm">
                <thead className="text-xs uppercase tracking-wide text-gray-500">
                  <tr>
                    {["Visitor", "Company", "Host", "Branch", "Check-in", "Status"].map((heading) => (
                      <th key={heading} className="border-b border-gray-100 bg-surface-muted px-4 py-3">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {data.activeVisitors.map((visitor) => (
                    <tr key={visitor.id}>
                      <td className="border-b border-gray-100 px-4 py-4 font-semibold text-gray-900 dark:text-white">{visitor.name}</td>
                      <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:text-slate-300">{visitor.company}</td>
                      <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:text-slate-300">{visitor.host}</td>
                      <td className="border-b border-gray-100 px-4 py-4 text-gray-600 dark:text-slate-300">{visitor.branch}</td>
                      <td className="border-b border-gray-100 px-4 py-4 text-gray-500">{visitor.checkIn}</td>
                      <td className="border-b border-gray-100 px-4 py-4"><StatusBadge status={visitor.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        <div className="space-y-6">
          <Card>
            <h3 className="text-base font-bold text-gray-900 dark:text-white">Recent Activities</h3>
            <div className="mt-4 space-y-4">
              {data.recentActivities.map((activity) => (
                <div key={activity.id} className="rounded-lg border border-gray-100 p-3 dark:border-slate-800">
                  <p className="text-sm text-gray-700 dark:text-slate-200">
                    <span className="font-bold">{activity.actor}</span> {activity.action}
                  </p>
                  <p className="mt-1 text-xs text-gray-500">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
