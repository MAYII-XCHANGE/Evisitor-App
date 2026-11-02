import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VISITOR_REGISTRATION_DEFAULTS, VISITOR_REGISTRATION_STEPS } from "../features/visitors/visitorRegistrationSteps.js";
import {
  sanitizeNigerianPhoneInput,
  validatePhotograph,
  visitorRegistrationRules,
} from "../validation/visitorValidation.js";

const source = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("registration uses the required six-step order and preserves form defaults", () => {
  assert.equal(VISITOR_REGISTRATION_STEPS.length, 6);
  assert.deepEqual(VISITOR_REGISTRATION_STEPS.map((step) => step.title), [
    "Visitor details", "Host & visit", "Identification", "Photo & signature", "Additional information", "Review & consent",
  ]);
  assert.equal(VISITOR_REGISTRATION_DEFAULTS.items.length, 0);
  assert.equal(VISITOR_REGISTRATION_DEFAULTS.termsAccepted, false);
});

test("registration progress uses an accessible responsive breadcrumb stepper", () => {
  const stepper = source("../features/visitors/VisitorRegistrationStepper.jsx");
  const registration = source("../features/visitors/VisitorRegistrationPage.jsx");
  assert.match(stepper, /aria-label="Visitor registration progress"/);
  assert.match(stepper, /clipPath/);
  assert.match(stepper, /aria-current=\{active \? "step"/);
  assert.match(stepper, /Step \{currentStep \+ 1\} of \{steps\.length\}/);
  assert.match(stepper, /lg:hidden/);
  assert.match(registration, /max-w-\[1320px\]/);
});

test("manually entered host details and consent are required while capture and signature are optional", () => {
  assert.equal(visitorRegistrationRules.hostName.required, "Host name is required");
  assert.equal(visitorRegistrationRules.departmentName.required, "Host department is required");
  assert.equal(visitorRegistrationRules.branchName.required, "Host branch is required");
  assert.equal(visitorRegistrationRules.photograph.required, undefined);
  assert.equal(visitorRegistrationRules.signature.required, undefined);
  assert.match(visitorRegistrationRules.termsAccepted.required, /must be accepted/);
});

test("phone numbers are limited to Nigerian local or international format", () => {
  const phonePattern = visitorRegistrationRules.phoneNumber.pattern.value;
  assert.equal(phonePattern.test("+2349059773535"), true);
  assert.equal(phonePattern.test("09059773535"), true);
  assert.equal(phonePattern.test("+234905977353"), false);
  assert.equal(phonePattern.test("0905977353"), false);
  assert.equal(phonePattern.test("0905-977-3535"), false);
  assert.equal(phonePattern.test("12345678901"), false);
  assert.equal(sanitizeNigerianPhoneInput("+234 905-977-3535 extra"), "+2349059773535");
  assert.equal(sanitizeNigerianPhoneInput("0905 977 353599"), "09059773535");
});

test("required registration fields display an accessible red asterisk", () => {
  const input = source("../components/ui/Input.jsx");
  const select = source("../components/ui/Select.jsx");
  const details = source("../features/visitors/VisitorDetailsStep.jsx");
  const visit = source("../features/visitors/VisitorVisitDetailsStep.jsx");
  const identification = source("../features/visitors/VisitorIdentificationStep.jsx");
  const review = source("../features/visitors/VisitorRegistrationReviewStep.jsx");
  assert.match(input, /text-danger/);
  assert.match(select, /text-danger/);
  assert.match(input, /\(required\)/);
  assert.match(details, /label="First name" required/);
  assert.match(visit, /label="Host full name" required/);
  assert.match(identification, /label="ID number" required/);
  assert.match(review, /termsAccepted[\s\S]*text-danger/);
  assert.doesNotMatch(details, /label="Email" required/);
});

test("camera and ID upload validation rejects unsupported or oversized files", () => {
  assert.equal(validatePhotograph({ type: "application/pdf", size: 100 }), "Use a JPEG, PNG, or WebP image");
  assert.equal(validatePhotograph({ type: "image/jpeg", size: 6 * 1024 * 1024 }), "Photograph must not exceed 5 MB");
  assert.equal(validatePhotograph({ type: "image/png", size: 1024 }), null);
});

test("visitor photograph upload uses protected storage and refreshes the frontend preview", () => {
  const page = source("../features/visitors/VisitorPhotographPage.jsx");
  const service = source("../services/visitorService.js");
  assert.match(service, /\/visitors\/\$\{id\}\/photograph/);
  assert.match(page, /storedFile\.url/);
  assert.match(page, /Image ID: \{uploadedFile\.id\}/);
  assert.match(page, /apiAssetUrl\(storedPath\)/);
  assert.match(page, /crossOrigin=\{localPreview \? undefined : "use-credentials"\}/);
  assert.match(page, /invalidateQueries\(\{ queryKey: \["visitors"\] \}\)/);
  assert.match(page, /storage folders are created automatically by the server/i);
});

test("Front Desk navigation exposes the authorized workflow entries including checkout", () => {
  const navigation = source("../config/navigation.js");
  const frontDesk = navigation.match(/\[USER_ROLES\.FRONTDESK\]: \[([\s\S]*?)\n {2}\],/)[1];
  const keys = [...frontDesk.matchAll(/MENU_ITEMS\.([A-Za-z]+)/g)].map((match) => match[1]);
  assert.deepEqual(new Set(keys), new Set(["dashboard", "registerVisitor", "appointments", "visitors", "selfServiceRegistrations", "physicalTags", "checkOut"]));
});

test("sidebar menu icons use a fixed left-aligned column", () => {
  const sidebar = source("../components/SideBar/SideBar.css");
  assert.match(sidebar, /\.sidebar-link\s*\{[\s\S]*?width:\s*100%/);
  assert.match(sidebar, /\.sidebar-link\s*\{[\s\S]*?justify-content:\s*flex-start/);
  assert.match(sidebar, /\.sidebar-link\s*>\s*svg:first-child\s*\{[\s\S]*?flex:\s*0 0 20px/);
  assert.doesNotMatch(sidebar, /\.sidebar-link\s*\{[\s\S]*?justify-content:\s*center/);
});

test("visitor checkout requires confirmation before the checkout API is called", () => {
  const page = source("../features/visits/ActiveVisitsPage.jsx");
  assert.match(page, /header: "Visitor tag", accessor: "tagNumber"/);
  assert.doesNotMatch(page, /header: "Visit", accessor: "visitCode"/);
  assert.match(page, /setCheckoutTarget\(visit\)/);
  assert.match(page, /title="Confirm visitor checkout"/);
  assert.match(page, /label="Physical-tag return status"/);
  assert.match(page, /physicalTagReturnStatus: returnStatus/);
  assert.match(page, /physicalTagComment: tagComment/);
  assert.match(page, /"RETURNED"/);
  assert.match(page, /"LOST"/);
  assert.match(page, /"DAMAGED"/);
  assert.match(page, /"NOT_RETURNED"/);
});

test("self-service registration is public while its review queue is Front Desk protected", () => {
  const router = source("../routes/router.jsx");
  const service = source("../services/selfServiceService.js");
  const selfServicePage = source("../features/selfservice/SelfServicePage.jsx");
  const staffRegistrationPage = source("../features/visitors/VisitorRegistrationPage.jsx");
  assert.match(router, /path: "\/", element: <SelfServicePage/);
  assert.match(router, /path: "\/self-service", element: <Navigate to="\/" replace/);
  assert.match(router, /path: "\/staff\/login", element: <LoginPage/);
  assert.match(router, /path: "\/login", element: <Navigate to="\/staff\/login" replace/);
  assert.match(router, /path: "self-service-registrations", element: secured\(frontDeskOnly/);
  assert.match(selfServicePage, /to="\/staff\/login"/);
  [
    /max-w-\[1320px\]/,
    /VisitorRegistrationStepper/,
    /overflow-hidden !p-0/,
    /min-h-\[420px\] max-w-5xl/,
    /Required fields/,
    /Clear form/,
  ].forEach((pattern) => {
    assert.match(staffRegistrationPage, pattern);
    assert.match(selfServicePage, pattern);
  });
  assert.doesNotMatch(selfServicePage, /SelfServiceStepRail|SelfServiceBadgePreview/);
  assert.doesNotMatch(selfServicePage, /logout\(\)/);
  assert.match(service, /post\("\/self-service\/registrations"/);
  assert.match(service, /\/approve/);
  assert.match(service, /\/reject/);
});

test("physical visitor tags are required at check-in and have a management workflow", () => {
  const visitStep = source("../features/visitors/VisitorVisitDetailsStep.jsx");
  const registration = source("../features/visitors/VisitorRegistrationPage.jsx");
  const selfService = source("../features/selfservice/SelfServicePage.jsx");
  const selfServiceApi = source("../services/selfServiceService.js");
  const reviewModal = source("../features/selfservice/SelfServiceReviewModal.jsx");
  const management = source("../features/physicaltags/PhysicalTagsPage.jsx");
  const service = source("../services/physicalTagService.js");
  assert.match(visitStep, /PhysicalTagSelect/);
  assert.match(registration, /physicalTagId: formValues\.physicalTagId/);
  assert.match(selfService, /showPhysicalTag=\{false\}/);
  assert.match(selfService, /field !== "physicalTagId"/);
  assert.doesNotMatch(selfServiceApi.match(/const request = \{[\s\S]*?\n\s{4}\};/)?.[0] || "", /physicalTagId/);
  assert.match(reviewModal, /PhysicalTagSelect/);
  assert.match(reviewModal, /onApprove\(registration\.id,physicalTagId\)/);
  assert.match(selfServiceApi, /\/approve.*physicalTagId/s);
  assert.match(management, /Physical Tag Management/);
  assert.match(management, /Mark lost/);
  assert.match(management, /Mark damaged/);
  assert.match(management, /History/);
  assert.match(service, /\/physical-tags\/available/);
  assert.match(service, /\/physical-tags\/\$\{id\}\/history/);
});

test("authenticated browser sessions are restored safely after a page reload", () => {
  const authContext = source("../context/AuthContext.jsx");
  const apiClient = source("../services/apiClient.js");
  assert.match(authContext, /restorationPromiseRef/);
  assert.match(authContext, /\[401, 403\]\.includes/);
  assert.match(authContext, /authService\.profile\(\{ skipAuthRefresh: true \}\)/);
  assert.match(authContext, /authService\.refresh\(\)/);
  assert.doesNotMatch(authContext, /authService\.me\(/);
  assert.match(apiClient, /request\?\.skipAuthRefresh/);
});

test("staff sign in can show and hide the password accessibly", () => {
  const login = source("../features/auth/LoginPage.jsx");
  const input = source("../components/ui/Input.jsx");
  assert.match(login, /passwordVisible \? "text" : "password"/);
  assert.match(login, /passwordVisible \? "Hide password" : "Show password"/);
  assert.match(login, /FiEyeOff/);
  assert.match(login, /FiEye/);
  assert.match(login, /type="button"/);
  assert.match(input, /trailing \? "pr-11"/);
});

test("registration submits only to the walk-in API", () => {
  const service = source("../services/visitorService.js");
  const appointments = source("../services/appointmentService.js");
  const registration = source("../features/visitors/VisitorRegistrationPage.jsx");
  assert.match(service, /post\("\/visitors\/walk-in"/);
  assert.doesNotMatch(appointments, /checkInPreRegistered|appointments\/\$\{id\}\/check-in/);
  assert.doesNotMatch(registration, /preRegistered|PreRegisteredSearchPanel/);
});

test("review, tag display, and accidental-loss protection are wired", () => {
  const registration = source("../features/visitors/VisitorRegistrationPage.jsx");
  const review = source("../features/visitors/VisitorRegistrationReviewStep.jsx");
  const success = source("../features/visitors/RegistrationSuccess.jsx");
  assert.match(registration, /beforeunload/);
  assert.match(review, /termsAccepted/);
  assert.match(success, /tagNumber/);
});

test("appointment actions use backend operations", () => {
  const page = source("../features/appointments/FrontDeskAppointmentsPage.jsx");
  assert.match(page, /markNoShow/);
  assert.match(page, /frontDeskReschedule/);
  assert.match(page, /from: today, to: today/);
  assert.doesNotMatch(page, /Upcoming Appointments|confirmArrival/);
  assert.match(page, /placeholder="Visitor name, tag, or reference"/);
  assert.doesNotMatch(page, /phone, email|host, or department/);
});

test("table pagination is fixed at ten rows without a page-size selector", () => {
  const pagination = source("../components/ui/Pagination.jsx");
  const hook = source("../hooks/usePagination.js");
  assert.match(hook, /size: 10/);
  assert.doesNotMatch(pagination, /Rows per page|onPageSizeChange|pageSizeOptions/);
});

test("top banner shows branch identity and a Front Desk pending-registration bell", () => {
  const banner = source("../components/Top Banner/TopBanner.jsx");
  const service = source("../services/selfServiceService.js");
  assert.doesNotMatch(banner, /FiKey|ChangePasswordModal|Change password/);
  assert.match(banner, /user\?\.branch\?\.name/);
  assert.match(banner, /ROLE_LABELS\[user\?\.role\]/);
  assert.match(banner, /USER_ROLES\.FRONTDESK/);
  assert.match(banner, /self-service-pending-count/);
  assert.match(banner, /refetchInterval: 60_000/);
  assert.match(banner, /99\+/);
  assert.match(banner, /self-service-registrations\?status=PENDING_APPROVAL/);
  assert.match(service, /self-service\/registrations\/pending-count/);
});

test("Super Admin dashboard hides recent activities and departments omit the code table column", () => {
  const dashboard = source("../features/dashboard/DashboardPage.jsx");
  const departments = source("../features/admin/DepartmentsPage.jsx");
  assert.match(dashboard, /hideRecentActivities = isSuperAdmin \|\| isBranchAdmin \|\| isFrontDesk/);
  const departmentColumns = departments.match(/const columns = useMemo\(\(\) => \[([\s\S]*?)\],\n\s+\[deleteMutation/)[1];
  assert.doesNotMatch(departmentColumns, /header:"Code"/);
  assert.match(departmentColumns, /header:"Name"/);
});

test("Branch Administrator dashboard hides active visitors and recent activities", () => {
  const dashboard = source("../features/dashboard/DashboardPage.jsx");
  assert.match(dashboard, /isBranchAdmin = user\?\.role === USER_ROLES\.BRANCH_ADMIN/);
  assert.match(dashboard, /hideActiveVisitors = isSuperAdmin \|\| isBranchAdmin/);
  assert.match(dashboard, /hideRecentActivities = isSuperAdmin \|\| isBranchAdmin/);
  assert.match(dashboard, /\(!hideActiveVisitors \|\| !hideRecentActivities\) &&/);
});

test("Branch Operations Report is branch scoped with presets, analytics, detail filters, and exports", () => {
  const router = source("../routes/router.jsx");
  const page = source("../features/reports/BranchReportsPage.jsx");
  const exportModal = source("../features/reports/BranchReportExportModal.jsx");
  const service = source("../services/reportService.js");
  assert.match(router, /path: "branch-reports".*<BranchReportsPage \/>/);
  assert.match(page, /Branch Operations Report —/);
  ["Today", "Last 7 days", "Last 30 days", "This month", "Custom range"].forEach((label) => assert.match(page, new RegExp(label)));
  ["Visitor traffic trend", "Visit status breakdown", "Visitor type breakdown", "Department traffic", "Physical tag accountability", "Detailed visitor report"].forEach((label) => assert.match(page, new RegExp(label)));
  assert.match(page, /VisitorDetailsModal/);
  assert.match(page, /Pagination/);
  assert.match(exportModal, /Current reporting period/);
  assert.match(exportModal, /Current filtered visitor table/);
  assert.match(exportModal, /Excel \(\.xlsx\)/);
  assert.match(service, /\/reports\/branch-summary/);
  assert.match(service, /\/reports\/branch-visitors/);
  assert.match(service, /\/reports\/branch-export/);
  assert.doesNotMatch(page, /Export audit CSV/);
});

test("visitor search, filters, details, pagination, and export are connected", () => {
  const page = source("../features/visitors/VisitorsPage.jsx");
  const exportModal = source("../features/visitors/VisitorExportModal.jsx");
  const service = source("../services/visitorService.js");
  assert.match(page, /useDebouncedValue/);
  assert.match(page, /appointmentStatus/);
  assert.match(page, /checkInFrom/);
  assert.match(page, /VisitorDetailsModal/);
  assert.match(page, /VisitorExportModal/);
  assert.match(page, /label="from"/);
  assert.match(page, /label="to"/);
  assert.match(page, /Export visitors/);
  assert.doesNotMatch(page, /Export current CSV|Export all CSV/);
  assert.match(exportModal, /All visitors/);
  assert.match(exportModal, /Current filtered results/);
  assert.match(exportModal, /Custom date range/);
  assert.match(exportModal, /Excel \(\.xlsx\)/);
  assert.match(exportModal, /export-count/);
  assert.match(exportModal, /totalElements/);
  assert.match(exportModal, /visitors-\$\{scopeName\}-\$\{today\(\)\}\.\$\{format\}/);
  assert.match(service, /format \}, responseType: "blob"/);
  assert.match(page, /Pagination/);
});

test("self-service reviews stay in their dedicated page and are absent from View All Visitors", () => {
  const selfServicePage = source("../features/selfservice/SelfServicePage.jsx");
  const visitorsPage = source("../features/visitors/VisitorsPage.jsx");
  const registrationsPage = source("../features/selfservice/SelfServiceRegistrationsPage.jsx");
  const dashboardPage = source("../features/dashboard/DashboardPage.jsx");
  const service = source("../services/selfServiceService.js");
  assert.match(service, /self-service\/registrations\/options/);
  assert.match(service, /self-service\/registrations\/reference/);
  assert.match(service, /departmentId: values\.departmentId/);
  assert.match(service, /branchId: values\.branchId/);
  assert.match(selfServicePage, /selfServiceService\.options/);
  assert.match(selfServicePage, /invalidateQueries\(\{ queryKey: \["self-service-registrations"\] \}\)/);
  assert.doesNotMatch(visitorsPage, /selfServiceService/);
  assert.doesNotMatch(visitorsPage, /Awaiting Front Desk Review/);
  assert.doesNotMatch(visitorsPage, /SelfServiceReviewModal/);
  assert.match(registrationsPage, /requestedStatus.*"PENDING_APPROVAL"/);
  assert.match(registrationsPage, /self-service-pending-count/);
  assert.match(registrationsPage, /selfServiceService\.list/);
  assert.match(registrationsPage, /SelfServiceReviewModal/);
  assert.match(registrationsPage, /selfServiceService\.approve/);
  assert.match(registrationsPage, /selfServiceService\.reject/);
  assert.match(service, /pendingCount/);
  assert.doesNotMatch(dashboardPage, /SelfServiceReviewModal/);
});

test("end-of-day handover exposes deadlines, Security queue, checkout, and controlled extensions", () => {
  const roles = source("../config/roles.js");
  const navigation = source("../config/navigation.js");
  const router = source("../routes/router.jsx");
  const visits = source("../features/visits/ActiveVisitsPage.jsx");
  const dashboard = source("../features/dashboard/DashboardPage.jsx");
  const service = source("../services/visitService.js");
  assert.match(roles, /SECURITY_OFFICER[\s\S]*PERMISSIONS\.CHECK_OUT/);
  assert.match(navigation, /After-Hours Visitors/);
  assert.match(router, /security\/after-hours[\s\S]*afterHoursOnly checkoutMode/);
  assert.match(visits, /expectedCheckOutAt/);
  assert.match(visits, /AFTER_HOURS_ONSITE/);
  assert.match(visits, /USER_ROLES\.EMPLOYEE_HOST, USER_ROLES\.BRANCH_ADMIN/);
  assert.match(service, /\/handover-status/);
  assert.match(service, /\/expected-checkout/);
  assert.match(dashboard, /handoverWarning/);
});
