import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FiEye } from "react-icons/fi";
import toast from "react-hot-toast";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { Button } from "../../components/ui/Button";
import { ResourceTable } from "../../components/ui/ResourceTable";
import { Pagination } from "../../components/ui/Pagination";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { ApiErrorState } from "../../components/ui/ApiErrorState";
import { usePagination } from "../../hooks/usePagination";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { selfServiceService } from "../../services/selfServiceService";
import { formatDateTime, titleCase } from "../../utils/formatters";
import { getApiError } from "../../utils/apiResponse";
import { SelfServiceReviewModal } from "./SelfServiceReviewModal";

const STATUS_OPTIONS=[{value:"PENDING_APPROVAL",label:"Pending Approval"},{value:"APPROVED",label:"Approved"},{value:"REJECTED",label:"Rejected"}];

export const SelfServiceRegistrationsPage=()=>{
  const queryClient=useQueryClient();const pagination=usePagination();const[search,setSearch]=useState("");const[status,setStatus]=useState("PENDING_APPROVAL");const[viewing,setViewing]=useState(null);const debounced=useDebouncedValue(search);
  const result=useQuery({queryKey:["self-service-registrations",pagination.page,pagination.size,status,debounced],queryFn:()=>selfServiceService.list({page:pagination.page,size:pagination.size,status,search:debounced})});
  const refresh=(updated)=>{queryClient.invalidateQueries({queryKey:["self-service-registrations"]});queryClient.invalidateQueries({queryKey:["visitors"]});queryClient.invalidateQueries({queryKey:["active-visits"]});queryClient.invalidateQueries({queryKey:["dashboard"]});setViewing(updated);};
  const approve=useMutation({mutationFn:selfServiceService.approve,onSuccess:(data)=>{toast.success("Visitor approved and checked in");refresh(data);},onError:(error)=>toast.error(getApiError(error).message)});
  const reject=useMutation({mutationFn:({id,reason})=>selfServiceService.reject(id,reason),onSuccess:(data)=>{toast.success("Registration rejected");refresh(data);},onError:(error)=>toast.error(getApiError(error).message)});
  const columns=[{header:"Reference",accessor:"reference"},{header:"Visitor",accessor:"fullName"},{header:"Phone",accessor:"phoneNumber"},{header:"Host",accessor:"hostName"},{header:"Branch",accessor:"branchName"},{header:"Submitted",accessor:"submittedAt",cell:formatDateTime},{header:"Status",accessor:"status",cell:(value)=><StatusBadge status={titleCase(value)}/>},{header:"Action",accessor:(row)=>row,cell:(_,row)=><Button variant="secondary" className="px-3" onClick={()=>setViewing(row)}><FiEye/>Review</Button>}];
  return <div className="space-y-6"><PageHeader title="Self-Service Registrations" description="Review visitor-submitted registrations before approving check-in."/><Card className="grid gap-4 md:grid-cols-2"><Input label="Search" placeholder="Reference, visitor, host, branch..." value={search} onChange={(event)=>{setSearch(event.target.value);pagination.resetPage();}}/><Select label="Status" options={STATUS_OPTIONS} value={status} onChange={(event)=>{setStatus(event.target.value);pagination.resetPage();}}/></Card><Card>{result.isLoading?<TableSkeleton/>:result.error?<ApiErrorState error={result.error} onRetry={result.refetch}/>:<><ResourceTable columns={columns} rows={result.data?.content} emptyTitle="No self-service registrations" emptyMessage="New visitor submissions will appear here."/><Pagination page={result.data} onPageChange={pagination.setPage}/></>}</Card><SelfServiceReviewModal registration={viewing} onClose={()=>setViewing(null)} onApprove={(id,physicalTagId)=>approve.mutate({id,physicalTagId})} onReject={(id,reason)=>reject.mutate({id,reason})} isLoading={approve.isPending||reject.isPending}/></div>;
};
