import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiPlus } from "react-icons/fi";
import ConfirmModal from "../../components/ConfirmModal";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { PageHeader } from "../../components/ui/PageHeader";
import { Pagination } from "../../components/ui/Pagination";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Select } from "../../components/ui/Select";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { useAdminOptions } from "../../hooks/useAdminOptions";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { usePagination } from "../../hooks/usePagination";
import { adminService } from "../../services/adminService";
import { getApiError } from "../../utils/apiResponse";
import { formatDate, titleCase } from "../../utils/formatters";
import { AdminTableActions } from "./AdminTableActions";
import { DepartmentFormModal } from "./DepartmentFormModal";
import { ResourceDetailsModal } from "./ResourceDetailsModal";

export const DepartmentsPage = () => {
  const queryClient = useQueryClient();
  const pagination = usePagination();
  const options = useAdminOptions();
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({ status: "", branchId: "", sort: "createdAt,desc" });
  const [editing, setEditing] = useState(undefined);
  const [viewing, setViewing] = useState(undefined);
  const [confirm, setConfirm] = useState(undefined);
  const params = { ...pagination, ...filters, search: useDebouncedValue(search) };
  const result = useQuery({ queryKey: ["admin-departments", params], queryFn: () => adminService.adminDepartments(params) });
  const deleteMutation = useMutation({
    mutationFn: (row) => adminService.deleteDepartment(row.id),
    onSuccess: () => { queryClient.invalidateQueries({queryKey:["admin-departments"]}); queryClient.invalidateQueries({queryKey:["admin-options","departments"]}); toast.success("Department deleted"); setConfirm(undefined); },
    onError: (error) => toast.error(getApiError(error).message),
  });
  const columns = useMemo(() => [
    {header:"Code",accessor:"code"},{header:"Name",accessor:"name"},{header:"Branch",accessor:"branch"},{header:"Status",accessor:"status",cell:(value)=><StatusBadge status={titleCase(value)}/>},{header:"Assigned users",accessor:"assignedUsers"},{header:"Created",accessor:"createdAt",cell:formatDate},{header:"Actions",accessor:(row)=>row,cell:(_,row)=><AdminTableActions row={row} onView={setViewing} onEdit={setEditing} onDelete={setConfirm} disabled={deleteMutation.isPending} showStatus={false}/>}],
    [deleteMutation.isPending],
  );
  const updateFilter=(name,value)=>{setFilters((current)=>({...current,[name]:value}));pagination.resetPage();};
  return <div className="space-y-6"><PageHeader eyebrow="Super Admin" title="Department Management" description="Manage department records and their branch assignment." actions={<Button type="button" onClick={()=>setEditing(null)}><FiPlus/> Create New Department</Button>}/><Card className="grid gap-4 md:grid-cols-4"><Input label="Search" placeholder="Name or code..." value={search} onChange={(event)=>{setSearch(event.target.value);pagination.resetPage();}}/><Select label="Status" options={[{value:"",label:"All statuses"},{value:"ACTIVE",label:"Active"},{value:"INACTIVE",label:"Inactive"}]} value={filters.status} onChange={(event)=>updateFilter("status",event.target.value)}/><Select label="Branch" options={[{value:"",label:"All branches"},...options.branchOptions]} value={filters.branchId} onChange={(event)=>updateFilter("branchId",event.target.value)}/><Select label="Sort" options={[{value:"createdAt,desc",label:"Newest"},{value:"createdAt,asc",label:"Oldest"},{value:"name,asc",label:"Name A–Z"},{value:"code,asc",label:"Code A–Z"}]} value={filters.sort} onChange={(event)=>updateFilter("sort",event.target.value)}/></Card><Card>{result.isLoading?<TableSkeleton/>:result.error?<ApiErrorState error={result.error} onRetry={result.refetch}/>:<><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No departments found"/><Pagination page={result.data} onPageChange={pagination.setPage}/></>}</Card><DepartmentFormModal isOpen={editing!==undefined} department={editing||undefined} onClose={()=>setEditing(undefined)}/><ResourceDetailsModal isOpen={Boolean(viewing)} title={viewing?.name||"Department details"} onClose={()=>setViewing(undefined)} fields={viewing?[{label:"Code",value:viewing.code},{label:"Branch",value:viewing.branch},{label:"Status",value:titleCase(viewing.status)},{label:"Assigned users",value:String(viewing.assignedUsers)},{label:"Created",value:formatDate(viewing.createdAt)}]:[]}/><ConfirmModal requiresOnline isOpen={Boolean(confirm)} title="Delete department" message={`Delete ${confirm?.name||"this department"}? Departments with active assigned users cannot be deleted.`} confirmText="Delete department" variant="danger" isLoading={deleteMutation.isPending} onCancel={()=>setConfirm(undefined)} onConfirm={()=>deleteMutation.mutate(confirm)}/></div>;
};
