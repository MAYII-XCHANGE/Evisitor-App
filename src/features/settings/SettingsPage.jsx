import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FiEdit2, FiPlus } from "react-icons/fi";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { usePagination } from "../../hooks/usePagination";
import { settingService } from "../../services/settingService";
import { SettingFormModal } from "./SettingFormModal";

export const SettingsPage = () => {
  const pagination = usePagination();
  const [selected, setSelected] = useState(undefined);
  const [open, setOpen] = useState(false);
  const result = useQuery({ queryKey: ["settings", pagination.page, pagination.size], queryFn: () => settingService.list(pagination) });
  const columns = [{ header: "Setting", accessor: "key" }, { header: "Value", accessor: "value" }, { header: "Owner", accessor: "owner" }, { header: "Action", accessor: "id", cell: (_id, row) => <Button variant="secondary" className="px-3" onClick={() => { setSelected(row); setOpen(true); }}><FiEdit2 /> Edit</Button> }];
  return <div className="space-y-6"><PageHeader eyebrow="Administration" title="Settings" description="Manage visitor policies and operational defaults." actions={<Button onClick={() => { setSelected(undefined); setOpen(true); }}><FiPlus /> Add setting</Button>} /><Card>{result.isLoading ? <TableSkeleton /> : result.error ? <ApiErrorState error={result.error} onRetry={result.refetch} /> : <><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No settings configured" /><Pagination page={result.data} onPageChange={pagination.setPage} /></>}</Card><SettingFormModal setting={selected} isOpen={open} onClose={() => setOpen(false)} /></div>;
};
