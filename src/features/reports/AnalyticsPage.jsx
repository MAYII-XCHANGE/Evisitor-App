import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { dashboardService } from "../../services/dashboardService";

export const AnalyticsPage = () => {
  const result = useQuery({ queryKey: ["analytics"], queryFn: () => dashboardService.get() });
  if (result.isLoading) return <TableSkeleton />;
  if (result.error) return <ApiErrorState error={result.error} onRetry={result.refetch} />;
  return <div className="space-y-6"><PageHeader eyebrow="Analytics" title="Visitor Analytics" description="Real-time branch traffic and visitor throughput from the operational dashboard." /><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{(result.data?.kpis || []).map((kpi) => <Card key={kpi.label}><p className="text-sm font-semibold text-gray-500">{kpi.label}</p><p className="mt-3 text-3xl font-bold">{kpi.value}</p></Card>)}</div><Card><h3 className="mb-5 font-bold">Branch traffic</h3><div className="h-80"><ResponsiveContainer width="100%" height="100%"><BarChart data={result.data?.branchStats || []}><CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="branch" /><YAxis /><Tooltip /><Bar dataKey="visitors" fill="#01B0F1" /><Bar dataKey="active" fill="#10B981" /></BarChart></ResponsiveContainer></div></Card></div>;
};
