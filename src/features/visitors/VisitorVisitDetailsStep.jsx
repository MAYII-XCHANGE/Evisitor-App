import { Input } from "../../components/ui/Input";
import { visitorRegistrationRules } from "../../validation/visitorValidation";

export const VisitorVisitDetailsStep = ({ register, errors }) => (
  <section aria-labelledby="visitor-visit-heading">
    <h2 id="visitor-visit-heading" className="text-lg font-bold text-gray-900 dark:text-slate-100">Host and visit</h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
      Enter the host's full name, department, and branch for this visit.
    </p>
    <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
      <Input label="Host full name" placeholder="e.g. Mayowa Oyeniran" error={errors.hostName?.message} {...register("hostName", visitorRegistrationRules.hostName)} />
      <Input label="Host department" placeholder="e.g. Information Technology" error={errors.departmentName?.message} {...register("departmentName", visitorRegistrationRules.departmentName)} />
      <Input label="Host branch" placeholder="e.g. Head Office" error={errors.branchName?.message} {...register("branchName", visitorRegistrationRules.branchName)} />
      <Input label="Visit date" type="date" readOnly error={errors.appointmentDate?.message} {...register("appointmentDate", visitorRegistrationRules.appointmentDate)} />
      <Input label="Arrival time" type="time" error={errors.appointmentTime?.message} {...register("appointmentTime", visitorRegistrationRules.appointmentTime)} />
    </div>
    <p className="mt-4 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">These details will be stored exactly as entered and will not be matched against staff records.</p>
  </section>
);
