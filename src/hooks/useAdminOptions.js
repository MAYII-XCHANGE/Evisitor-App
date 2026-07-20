import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { ROLE_LABELS } from "../config/roles";

const options = (rows, label = "name") => (rows || []).map((row) => ({ value: row.id, label: row[label], branchId: row.branchId }));

export const useAdminOptions = () => {
  const branches = useQuery({ queryKey: ["admin-options", "branches"], queryFn: () => adminService.adminBranches({ page: 0, size: 200, status: "ACTIVE", sort: "name,asc" }) });
  const departments = useQuery({ queryKey: ["admin-options", "departments"], queryFn: () => adminService.adminDepartments({ page: 0, size: 200, status: "ACTIVE", sort: "name,asc" }) });
  const roles = useQuery({ queryKey: ["admin-options", "roles"], queryFn: adminService.roles });
  return {
    branchOptions: options(branches.data?.content),
    departmentOptions: options(departments.data?.content),
    roleOptions: (roles.data || []).map((value) => ({ value, label: ROLE_LABELS[value] || value })),
    isLoading: branches.isLoading || departments.isLoading || roles.isLoading,
  };
};
