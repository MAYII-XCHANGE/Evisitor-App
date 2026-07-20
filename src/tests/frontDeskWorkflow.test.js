import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { VISITOR_REGISTRATION_DEFAULTS, VISITOR_REGISTRATION_STEPS } from "../features/visitors/visitorRegistrationSteps.js";
import { validatePhotograph, visitorRegistrationRules } from "../validation/visitorValidation.js";

const source = (relativePath) => readFileSync(new URL(relativePath, import.meta.url), "utf8");

test("registration uses the required six-step order and preserves form defaults", () => {
  assert.equal(VISITOR_REGISTRATION_STEPS.length, 6);
  assert.deepEqual(VISITOR_REGISTRATION_STEPS.map((step) => step.title), [
    "Visitor details", "Host & appointment", "Identification", "Photo & signature", "Additional information", "Review & consent",
  ]);
  assert.equal(VISITOR_REGISTRATION_DEFAULTS.items.length, 0);
  assert.equal(VISITOR_REGISTRATION_DEFAULTS.termsAccepted, false);
});

test("manually entered host details and consent are required while capture and signature are optional", () => {
  assert.equal(visitorRegistrationRules.hostName.required, "Host name is required");
  assert.equal(visitorRegistrationRules.departmentName.required, "Host department is required");
  assert.equal(visitorRegistrationRules.branchName.required, "Host branch is required");
  assert.equal(visitorRegistrationRules.photograph.required, undefined);
  assert.equal(visitorRegistrationRules.signature.required, undefined);
  assert.match(visitorRegistrationRules.termsAccepted.required, /must be accepted/);
});

test("camera and ID upload validation rejects unsupported or oversized files", () => {
  assert.equal(validatePhotograph({ type: "application/pdf", size: 100 }), "Use a JPEG, PNG, or WebP image");
  assert.equal(validatePhotograph({ type: "image/jpeg", size: 6 * 1024 * 1024 }), "Photograph must not exceed 5 MB");
  assert.equal(validatePhotograph({ type: "image/png", size: 1024 }), null);
});

test("Front Desk navigation exposes the authorized workflow entries including checkout", () => {
  const navigation = source("../config/navigation.js");
  const frontDesk = navigation.match(/\[USER_ROLES\.FRONTDESK\]: \[([\s\S]*?)\n {2}\],/)[1];
  const keys = [...frontDesk.matchAll(/MENU_ITEMS\.([A-Za-z]+)/g)].map((match) => match[1]);
  assert.deepEqual(keys, ["dashboard", "registerVisitor", "appointments", "visitors", "selfServiceRegistrations", "checkOut"]);
});

test("self-service registration is public while its review queue is Front Desk protected", () => {
  const router = source("../routes/router.jsx");
  const service = source("../services/selfServiceService.js");
  const selfServicePage = source("../features/selfservice/SelfServicePage.jsx");
  assert.match(router, /path: "\/", element: <SelfServicePage/);
  assert.match(router, /path: "\/self-service", element: <Navigate to="\/" replace/);
  assert.match(router, /path: "self-service-registrations", element: secured\(reception/);
  assert.match(selfServicePage, /to="\/login"/);
  assert.match(service, /post\("\/self-service\/registrations"/);
  assert.match(service, /\/approve/);
  assert.match(service, /\/reject/);
});

test("registration submits to real walk-in and pre-registered APIs", () => {
  const service = source("../services/visitorService.js");
  const appointments = source("../services/appointmentService.js");
  assert.match(service, /post\("\/visitors\/walk-in"/);
  assert.match(appointments, /appointments\/\$\{id\}\/check-in/);
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
  assert.match(page, /confirmArrival/);
  assert.match(page, /markNoShow/);
  assert.match(page, /frontDeskReschedule/);
});

test("visitor search, filters, details, pagination, and export are connected", () => {
  const page = source("../features/visitors/VisitorsPage.jsx");
  assert.match(page, /useDebouncedValue/);
  assert.match(page, /appointmentStatus/);
  assert.match(page, /checkInFrom/);
  assert.match(page, /VisitorDetailsModal/);
  assert.match(page, /exportCsv/);
  assert.match(page, /Pagination/);
});
