import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { FiArrowLeft, FiArrowRight, FiBarChart2, FiDownload, FiEdit2, FiFilter, FiPlus, FiSave, FiSearch, FiSettings, FiUserPlus } from "react-icons/fi";
import toast from "react-hot-toast";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { DataTable } from "../../components/ui/DataTable";
import { Modal } from "../../components/ui/Modal";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { TableSkeleton } from "../../components/ui/Skeleton";
import { moduleCatalog } from "../../config/modules";
import { ROLE_LABELS, USER_ROLES } from "../../config/navigation";
import { branchStats, configurationItems, reportSummaries, systemBranches, systemUsers } from "../../data/mockData";
import { visitorService } from "../../services/visitorService";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Approved", value: "Approved" },
  { label: "Pending", value: "Pending" },
  { label: "Checked In", value: "Checked In" },
  { label: "Checked Out", value: "Checked Out" },
  { label: "Escalated", value: "Escalated" },
];

const adminRoutes = ["/users", "/branches", "/reports", "/analytics", "/configurations"];

export const ModulePage = () => {
  const location = useLocation();
  const module = moduleCatalog[location.pathname] || moduleCatalog["/appointments"];

  if (adminRoutes.includes(location.pathname)) {
    return <AdminModulePage module={module} pathname={location.pathname} />;
  }

  if (location.pathname === "/visitors/register") {
    return <VisitorRegistrationPage module={module} />;
  }

  return <OperationalModulePage module={module} pathname={location.pathname} />;
};

const VisitorRegistrationPage = ({ module }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formValues, setFormValues] = useState({
    visitorName: "",
    phoneNumber: "",
    email: "",
    company: "",
    idType: "National ID",
    idNumber: "",
    hostName: "",
    department: "Retail Banking",
    branch: "Head Office",
    visitDate: "",
    arrivalTime: "",
    visitType: "Walk-in",
    purpose: "",
  });

  const steps = [
    "Visitor Information",
    "Visit Details",
    "Review",
  ];

  const requiredFieldsByStep = [
    ["visitorName", "phoneNumber", "idType", "idNumber"],
    ["hostName", "department", "branch", "visitDate", "arrivalTime", "visitType", "purpose"],
    [],
  ];

  const updateField = (field, value) => {
    setFormValues((current) => ({ ...current, [field]: value }));
  };

  const isCurrentStepComplete = requiredFieldsByStep[currentStep].every((field) =>
    String(formValues[field] || "").trim(),
  );

  const goToNextStep = () => {
    if (!isCurrentStepComplete) return;
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
  };

  const goToPreviousStep = () => {
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const resetRegistrationForm = () => {
    setCurrentStep(0);
    setFormValues({
      visitorName: "",
      phoneNumber: "",
      email: "",
      company: "",
      idType: "National ID",
      idNumber: "",
      hostName: "",
      department: "Retail Banking",
      branch: "Head Office",
      visitDate: "",
      arrivalTime: "",
      visitType: "Walk-in",
      purpose: "",
    });
  };

  const registerVisitor = (event) => {
    event.preventDefault();
    toast.success(`${formValues.visitorName} registered successfully`);
    resetRegistrationForm();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{module.entityName}</p>
          <h2 className="page-title">{module.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-500">{module.description}</p>
        </div>
      </div>

      <Card>
        <form className="space-y-6" onSubmit={registerVisitor}>
          <div className="rounded-xl border border-gray-100 bg-surface-muted px-4 py-5">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              {steps.map((step, index) => {
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step} className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center">
                    {index < steps.length - 1 && (
                      <div
                        className={`absolute left-5 top-10 h-[calc(100%+20px)] w-0.5 sm:left-1/2 sm:top-5 sm:h-0.5 sm:w-full ${
                          isCompleted ? "bg-primary" : "bg-gray-200"
                        }`}
                      />
                    )}
                    <div
                      className={`relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                        isCompleted
                          ? "border-primary bg-primary text-white"
                          : isActive
                            ? "border-primary bg-white text-primary shadow-md"
                            : "border-gray-300 bg-white text-gray-400"
                      }`}
                    >
                      {isCompleted ? "✓" : index + 1}
                    </div>
                    <div className="min-w-0 sm:text-center">
                      <p
                        className={`text-sm font-bold ${
                          isActive ? "text-primary" : isCompleted ? "text-gray-900" : "text-gray-500"
                        }`}
                      >
                        {step}
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        {isCompleted ? "Completed" : isActive ? "In progress" : "Pending"}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {currentStep === 0 && (
            <div>
            <h3 className="text-base font-bold text-gray-900">Basic Details</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input label="Full Name" name="visitorName" placeholder="Enter visitor name" value={formValues.visitorName} onChange={(event) => updateField("visitorName", event.target.value)} required />
              <Input label="Phone Number" name="phoneNumber" placeholder="0800 000 0000" value={formValues.phoneNumber} onChange={(event) => updateField("phoneNumber", event.target.value)} required />
              <Input label="Email Address" name="email" type="email" placeholder="visitor@example.com" value={formValues.email} onChange={(event) => updateField("email", event.target.value)} />
              <Input label="Company / Organization" name="company" placeholder="Company name" value={formValues.company} onChange={(event) => updateField("company", event.target.value)} />
              <Select
                label="ID Type"
                name="idType"
                value={formValues.idType}
                onChange={(event) => updateField("idType", event.target.value)}
                options={[
                  { label: "National ID", value: "National ID" },
                  { label: "Driver's License", value: "Driver's License" },
                  { label: "International Passport", value: "International Passport" },
                  { label: "Voter's Card", value: "Voter's Card" },
                ]}
              />
              <Input label="ID Number" name="idNumber" placeholder="Enter ID number" value={formValues.idNumber} onChange={(event) => updateField("idNumber", event.target.value)} required />
            </div>
          </div>
          )}

          {currentStep === 1 && (
            <div>
            <h3 className="text-base font-bold text-gray-900">Visit Details</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Input label="Host Name" name="hostName" placeholder="NOVA Bank employee" value={formValues.hostName} onChange={(event) => updateField("hostName", event.target.value)} required />
              <Select
                label="Department"
                name="department"
                value={formValues.department}
                onChange={(event) => updateField("department", event.target.value)}
                options={[
                  { label: "Retail Banking", value: "Retail Banking" },
                  { label: "Corporate Banking", value: "Corporate Banking" },
                  { label: "Operations", value: "Operations" },
                  { label: "Compliance", value: "Compliance" },
                  { label: "IT Security", value: "IT Security" },
                ]}
              />
              <Select
                label="Branch"
                name="branch"
                value={formValues.branch}
                onChange={(event) => updateField("branch", event.target.value)}
                options={[
                  { label: "Head Office", value: "Head Office" },
                  { label: "Victoria Island", value: "Victoria Island" },
                  { label: "Ikeja", value: "Ikeja" },
                  { label: "Abuja Central", value: "Abuja Central" },
                  { label: "Port Harcourt", value: "Port Harcourt" },
                ]}
              />
              <Input label="Visit Date" name="visitDate" type="date" value={formValues.visitDate} onChange={(event) => updateField("visitDate", event.target.value)} required />
              <Input label="Expected Arrival Time" name="arrivalTime" type="time" value={formValues.arrivalTime} onChange={(event) => updateField("arrivalTime", event.target.value)} required />
              <Select
                label="Visit Type"
                name="visitType"
                value={formValues.visitType}
                onChange={(event) => updateField("visitType", event.target.value)}
                options={[
                  { label: "Walk-in", value: "Walk-in" },
                  { label: "Appointment", value: "Appointment" },
                  { label: "Vendor", value: "Vendor" },
                  { label: "Regulatory Visit", value: "Regulatory Visit" },
                ]}
              />
            </div>
            <label className="mt-4 block">
              <span className="mb-2 block text-sm font-semibold text-gray-700">Purpose of Visit</span>
              <textarea
                name="purpose"
                rows="4"
                className="w-full rounded-xl border border-gray-300 bg-white px-3 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-primary focus:ring-2 focus:ring-primary-100"
                placeholder="Briefly describe the purpose of the visit"
                value={formValues.purpose}
                onChange={(event) => updateField("purpose", event.target.value)}
                required
              />
            </label>
          </div>
          )}

          {currentStep === 2 && (
            <div>
              <h3 className="text-base font-bold text-gray-900">Preview Registration</h3>
              <p className="mt-1 text-sm text-gray-500">
                Review the details from steps 1 and 2 before submitting the visitor registration.
              </p>

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <PreviewSection
                  title="Step 1: Visitor Information"
                  items={[
                    ["Visitor", formValues.visitorName],
                    ["Phone", formValues.phoneNumber],
                    ["Email", formValues.email || "Not provided"],
                    ["Company", formValues.company || "Not provided"],
                    ["ID Type", formValues.idType],
                    ["ID Number", formValues.idNumber],
                  ]}
                />
                <PreviewSection
                  title="Step 2: Visit Details"
                  items={[
                    ["Host", formValues.hostName],
                    ["Department", formValues.department],
                    ["Branch", formValues.branch],
                    ["Visit Date", formValues.visitDate],
                    ["Arrival Time", formValues.arrivalTime],
                    ["Visit Type", formValues.visitType],
                    ["Purpose", formValues.purpose],
                  ]}
                />
              </div>
            </div>
          )}

          <div className="flex flex-col-reverse justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
            <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={resetRegistrationForm}>
              Clear Form
            </Button>
            {currentStep > 0 && (
              <Button variant="secondary" type="button" className="w-full sm:w-auto" onClick={goToPreviousStep}>
                <FiArrowLeft /> Back
              </Button>
            )}
            {currentStep < steps.length - 1 ? (
              <Button
                type="button"
                disabled={!isCurrentStepComplete}
                className="w-full border-[#00B0F0] bg-[#00B0F0] px-6 py-3 text-white shadow-lg hover:bg-[#0098cf] sm:w-auto"
                onClick={goToNextStep}
              >
                {currentStep === 1 ? "Review Registration" : "Next"} <FiArrowRight />
              </Button>
            ) : (
              <Button
                type="submit"
                className="w-full border-[#00B0F0] bg-[#00B0F0] px-6 py-3 text-white shadow-lg hover:bg-[#0098cf] sm:w-auto"
              >
                <FiSave /> Submit Registration
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  );
};

const PreviewSection = ({ title, items }) => (
  <div className="rounded-xl border border-gray-100 bg-surface-muted p-4">
    <h4 className="text-sm font-bold text-gray-900">{title}</h4>
    <div className="mt-3 space-y-3">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-lg bg-white p-3">
          <p className="text-xs font-bold uppercase tracking-wide text-gray-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-gray-900">{value}</p>
        </div>
      ))}
    </div>
  </div>
);

const OperationalModulePage = ({ module, pathname }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [status, setStatus] = useState("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["moduleRows", pathname],
    queryFn: visitorService.getModuleRows,
  });

  const rows = useMemo(() => {
    if (status === "all") return data;
    return data.filter((row) => row.status === status);
  }, [data, status]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">{module.entityName}</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">{module.title}</h2>
          <p className="mt-2 max-w-3xl text-sm text-gray-500 dark:text-slate-400">{module.description}</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="secondary" onClick={() => toast.success("Export queued")}>
            <FiDownload /> Export
          </Button>
          <Button onClick={() => toast.success(`${module.primaryAction} started`)}>
            <FiPlus /> {module.primaryAction}
          </Button>
        </div>
      </div>

      <Card>
        <div className="grid gap-4 lg:grid-cols-[1fr_220px_auto] lg:items-end">
          <Input icon={FiSearch} label="Search" placeholder="Search visitor, branch, department, host, or reference" value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} />
          <Select label="Status" options={statusOptions} value={status} onChange={(event) => setStatus(event.target.value)} />
          <Button variant="secondary" onClick={() => toast.success("Filters applied")}>
            <FiFilter /> Apply filters
          </Button>
        </div>
      </Card>

      <Card>
        {isLoading ? <TableSkeleton /> : <DataTable rows={rows} searchTerm={searchTerm} />}
      </Card>
    </div>
  );
};

const AdminModulePage = ({ module, pathname }) => (
  <div className="space-y-6">
    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
      <div>
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">{module.entityName}</p>
        <h2 className="page-title">{module.title}</h2>
        <p className="mt-2 max-w-3xl text-sm text-gray-500">{module.description}</p>
      </div>
    </div>

    {pathname === "/users" && <UserManagementPanel />}
    {pathname === "/branches" && <BranchManagementPanel />}
    {pathname === "/reports" && <ReportsPanel />}
    {pathname === "/analytics" && <AnalyticsPanel />}
    {pathname === "/configurations" && <ConfigurationsPanel />}
  </div>
);

const UserManagementPanel = () => {
  const [users, setUsers] = useState(systemUsers);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openUserModal = (user = null) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const saveUser = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      id: selectedUser?.id || `USR-${1000 + users.length + 1}`,
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      branch: formData.get("branch"),
      status: formData.get("status"),
    };

    setUsers((current) =>
      selectedUser ? current.map((user) => (user.id === selectedUser.id ? payload : user)) : [payload, ...current],
    );
    setIsModalOpen(false);
    toast.success(selectedUser ? "User updated" : "User created");
  };

  return (
    <>
      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">Application users</h3>
            <p className="text-sm text-gray-500">Create, add, and edit user access across NOVA Bank branches.</p>
          </div>
          <Button
            className="w-full bg-[#00B0F0] px-5 py-3 text-white shadow-md hover:bg-[#0098cf] sm:w-auto"
            onClick={() => openUserModal()}
          >
            <FiUserPlus /> Add New User
          </Button>
        </div>
        <AdminTable
          columns={["User", "Email", "Role", "Branch", "Status", "Action"]}
          rows={users.map((user) => [
            user.name,
            user.email,
            user.role,
            user.branch,
            <StatusBadge key={`${user.id}-status`} status={user.status} />,
            <Button key={`${user.id}-edit`} variant="secondary" className="px-3" onClick={() => openUserModal(user)}>
              <FiEdit2 /> Edit
            </Button>,
          ])}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={selectedUser ? "Edit User" : "Add New User"}
        description="Assign the user role, branch, and account status."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="user-form"
              className="w-full border-[#00B0F0] bg-[#00B0F0] px-6 py-3 text-white shadow-lg hover:bg-[#0098cf] sm:w-auto"
            >
              <FiSave /> Save
            </Button>
          </>
        }
      >
        <form id="user-form" className="grid gap-4 sm:grid-cols-2" onSubmit={saveUser}>
          <Input label="Full Name" name="name" defaultValue={selectedUser?.name} required />
          <Input label="Email" name="email" type="email" defaultValue={selectedUser?.email} required />
          <Select
            label="Role"
            name="role"
            defaultValue={selectedUser?.role || ROLE_LABELS[USER_ROLES.RECEPTIONIST]}
            options={Object.values(ROLE_LABELS).map((label) => ({ label, value: label }))}
          />
          <Input label="Branch" name="branch" defaultValue={selectedUser?.branch || "Head Office"} required />
          <Select
            label="Status"
            name="status"
            defaultValue={selectedUser?.status || "Active"}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
          />
        </form>
      </Modal>
    </>
  );
};

const BranchManagementPanel = () => {
  const [branches, setBranches] = useState(systemBranches);
  const [selectedBranch, setSelectedBranch] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openBranchModal = (branch = null) => {
    setSelectedBranch(branch);
    setIsModalOpen(true);
  };

  const saveBranch = (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      id: selectedBranch?.id || `BR-${String(branches.length + 1).padStart(3, "0")}`,
      name: formData.get("name"),
      city: formData.get("city"),
      administrator: formData.get("administrator"),
      status: selectedBranch?.status || "Active",
    };

    setBranches((current) =>
      selectedBranch ? current.map((branch) => (branch.id === selectedBranch.id ? payload : branch)) : [payload, ...current],
    );
    setIsModalOpen(false);
    toast.success(selectedBranch ? "Branch updated" : "Branch added");
  };

  return (
    <>
      <Card>
        <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div>
            <h3 className="text-base font-bold text-gray-900">NOVA Bank branches</h3>
            <p className="text-sm text-gray-500">Create, add, and edit branch records and local administrators.</p>
          </div>
          <Button
            className="w-full bg-[#00B0F0] px-5 py-3 text-white shadow-md hover:bg-[#0098cf] sm:w-auto"
            onClick={() => openBranchModal()}
          >
            <FiPlus /> Add New Branch
          </Button>
        </div>
        <AdminTable
          columns={["Branch Name", "Location", "Branch Administrator", "Action"]}
          rows={branches.map((branch) => [
            branch.name,
            branch.city,
            branch.administrator,
            <Button key={`${branch.id}-edit`} variant="secondary" className="px-3" onClick={() => openBranchModal(branch)}>
              <FiEdit2 /> Edit
            </Button>,
          ])}
        />
      </Card>

      <Modal
        isOpen={isModalOpen}
        title={selectedBranch ? "Edit Branch" : "Add New Branch"}
        description="Maintain branch details used by reception, security, and reporting teams."
        onClose={() => setIsModalOpen(false)}
        footer={
          <>
            <Button variant="secondary" className="w-full sm:w-auto" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button
              type="submit"
              form="branch-form"
              className="w-full border-[#00B0F0] bg-[#00B0F0] px-6 py-3 text-white shadow-lg hover:bg-[#0098cf] sm:w-auto"
            >
              <FiSave /> Save
            </Button>
          </>
        }
      >
        <form id="branch-form" className="grid gap-4 sm:grid-cols-2" onSubmit={saveBranch}>
          <Input label="Branch Name" name="name" defaultValue={selectedBranch?.name} required />
          <Input label="Location" name="city" defaultValue={selectedBranch?.city} required />
          <Input label="Branch Administrator" name="administrator" defaultValue={selectedBranch?.administrator} required />
        </form>
      </Modal>
    </>
  );
};

const ReportsPanel = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {reportSummaries.map((report) => (
        <Card key={report.title}>
          <p className="text-sm font-semibold text-gray-500">{report.title}</p>
          <p className="mt-3 text-3xl font-bold text-gray-900">{report.value}</p>
          <p className="mt-2 text-sm text-gray-500">{report.detail}</p>
        </Card>
      ))}
    </div>
    <Card>
      <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h3 className="text-base font-bold text-gray-900">User report generator</h3>
          <p className="text-sm text-gray-500">Generate reports for users on the Visitor Management Portal.</p>
        </div>
        <Button onClick={() => toast.success("User report generated")}>
          <FiDownload /> Generate User Report
        </Button>
      </div>
      <AdminTable
        columns={["Report", "Scope", "Format", "Owner"]}
        rows={[
          ["All users", "Roles, branches, status", "PDF / Excel", "Super Administrator"],
          ["Active users", "30-day login activity", "PDF / Excel", "Super Administrator"],
          ["Role distribution", "Access level by branch", "Excel", "Internal Control"],
          ["Inactive users", "Dormant and disabled accounts", "PDF", "Audit"],
        ]}
      />
    </Card>
  </div>
);

const AnalyticsPanel = () => (
  <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
    <Card>
      <div className="mb-5 flex items-center gap-2">
        <FiBarChart2 className="text-primary" />
        <h3 className="text-base font-bold text-gray-900">Application analytics</h3>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          ["Total users", "128"],
          ["Active branches", "27"],
          ["Daily visitors", "184"],
          ["Open approvals", "19"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-gray-100 bg-surface-muted p-4">
            <p className="text-sm font-semibold text-gray-500">{label}</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
          </div>
        ))}
      </div>
    </Card>
    <Card>
      <h3 className="mb-5 text-base font-bold text-gray-900">Branch Traffic</h3>
      <div className="space-y-4">
        {branchStats.map((branch) => (
          <div key={branch.branch}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="font-semibold text-gray-700">{branch.branch}</span>
              <span className="text-gray-500">{branch.visitors} visitors</span>
            </div>
            <div className="h-3 rounded-full bg-primary-100">
              <div className="h-3 rounded-full bg-primary" style={{ width: `${Math.min(branch.visitors, 60)}%` }} />
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const ConfigurationsPanel = () => (
  <Card>
    <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
      <div>
        <h3 className="text-base font-bold text-gray-900">System configuration</h3>
        <p className="text-sm text-gray-500">Manage visitor policies, approval rules, retention, and compliance defaults.</p>
      </div>
      <Button onClick={() => toast.success("Configurations saved")}>
        <FiSettings /> Save Configurations
      </Button>
    </div>
    <AdminTable
      columns={["Configuration", "Current Value", "Owner", "Action"]}
      rows={configurationItems.map((item) => [
        item.key,
        item.value,
        item.owner,
        <Button key={item.key} variant="secondary" className="px-3" onClick={() => toast.success(`${item.key} opened`)}>
          <FiEdit2 /> Edit
        </Button>,
      ])}
    />
  </Card>
);

const AdminTable = ({ columns, rows }) => (
  <div className="table-scroll overflow-x-auto">
    <table className="w-full min-w-[720px] text-left text-sm">
      <thead className="text-xs uppercase tracking-wide text-gray-500">
        <tr>
          {columns.map((column) => (
            <th key={column} className="border-b border-gray-100 bg-surface-muted px-4 py-3 font-bold">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex}>
            {row.map((cell, cellIndex) => (
              <td key={`${rowIndex}-${cellIndex}`} className="border-b border-gray-100 px-4 py-4 text-gray-700">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);
