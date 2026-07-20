import { useQuery } from "@tanstack/react-query";
import { adminService } from "../services/adminService";
import { lookupService } from "../services/lookupService";

const toOptions = (rows, labelKey = "name") =>
  (rows || []).map((row) => ({ label: row[labelKey], value: row.id, ...row }));

export const useReferenceData = ({ includeVisitors = false, includeRecipients = false } = {}) => {
  const branches = useQuery({
    queryKey: ["reference", "branches"],
    queryFn: () => adminService.branches({ page: 0, size: 200 }),
  });
  const departments = useQuery({
    queryKey: ["reference", "departments"],
    queryFn: () => adminService.departments({ page: 0, size: 200 }),
  });
  const hosts = useQuery({ queryKey: ["reference", "hosts"], queryFn: lookupService.hosts });
  const visitors = useQuery({
    queryKey: ["reference", "visitors"],
    queryFn: () => lookupService.visitors(),
    enabled: includeVisitors,
  });
  const recipients = useQuery({
    queryKey: ["reference", "recipients"],
    queryFn: lookupService.recipients,
    enabled: includeRecipients,
  });

  return {
    branchOptions: toOptions(branches.data?.content),
    departmentOptions: toOptions(departments.data?.content),
    hostOptions: toOptions(hosts.data, "label"),
    visitorOptions: toOptions(visitors.data, "label"),
    recipientOptions: toOptions(recipients.data, "label"),
    isLoading: [branches, departments, hosts, visitors, recipients].some((query) => query.isLoading),
    error: [branches, departments, hosts, visitors, recipients].find((query) => query.error)?.error,
  };
};
