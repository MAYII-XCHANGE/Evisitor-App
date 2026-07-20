import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiMail, FiPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { notificationService } from "../../services/notificationService";
import { usePagination } from "../../hooks/usePagination";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";
import { NotificationFormModal } from "./NotificationFormModal";

export const NotificationsPage = () => {
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const [formOpen, setFormOpen] = useState(false);
  const result = useQuery({ queryKey: ["notifications", pagination.page], queryFn: () => notificationService.list(pagination) });
  const markRead = useMutation({ mutationFn: notificationService.markRead, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["notifications"] }); toast.success("Marked as read"); }, onError: (error) => toast.error(getApiError(error).message) });
  const columns = [{ header: "Type", accessor: "type", cell: titleCase }, { header: "Title", accessor: "title" }, { header: "Message", accessor: "message" }, { header: "Sent", accessor: "sentAt", cell: formatDateTime }, { header: "Status", accessor: "read", cell: (value) => <StatusBadge status={value ? "Read" : "Unread"} /> }, { header: "Action", accessor: "id", cell: (id, row) => row.read ? "—" : <Button variant="secondary" className="px-3" disabled={markRead.isPending} onClick={() => markRead.mutate(id)}><FiMail /> Mark read</Button> }];
  return <div className="space-y-6"><PageHeader eyebrow="Inbox" title="Notifications" description="Review arrival alerts and operational notices." actions={<Button onClick={() => setFormOpen(true)}><FiPlus /> Send notice</Button>} /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No notifications" /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card><NotificationFormModal isOpen={formOpen} onClose={() => setFormOpen(false)} /></div>;
};
