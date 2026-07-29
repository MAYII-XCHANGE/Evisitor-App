import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { sanitizeNigerianPhoneInput, VISITOR_TYPE_OPTIONS, visitorRegistrationRules } from "../../validation/visitorValidation";

export const VisitorDetailsStep = ({ register, errors }) => (
  <section aria-labelledby="visitor-details-heading">
    <h2 id="visitor-details-heading" className="text-lg font-bold text-gray-900 dark:text-slate-100">Visitor details</h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Enter the visitor's personal and contact information.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Input label="First name" required autoComplete="given-name" error={errors.firstName?.message} {...register("firstName", visitorRegistrationRules.firstName)} />
      <Input label="Last name" required autoComplete="family-name" error={errors.lastName?.message} {...register("lastName", visitorRegistrationRules.lastName)} />
      <Input
        label="Phone number"
        required
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        maxLength={14}
        placeholder="+2349059773535 or 09059773535"
        error={errors.phoneNumber?.message}
        onInput={(event) => { event.currentTarget.value = sanitizeNigerianPhoneInput(event.currentTarget.value); }}
        {...register("phoneNumber", visitorRegistrationRules.phoneNumber)}
      />
      <Input label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register("email", visitorRegistrationRules.email)} />
      <Input label="Company / organisation" autoComplete="organization" {...register("company")} />
      <Select label="Visitor type" required options={VISITOR_TYPE_OPTIONS} error={errors.visitorType?.message} {...register("visitorType", visitorRegistrationRules.visitorType)} />
    </div>
    <label className="mt-5 block"><span className="mb-2 block text-sm font-semibold text-gray-700 dark:text-slate-200">Purpose of visit<span className="ml-1 text-danger" aria-hidden="true">*</span><span className="sr-only"> (required)</span></span><textarea rows="4" required aria-required="true" className={`w-full rounded-xl border bg-white p-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary-100 dark:bg-slate-900 dark:text-slate-100 ${errors.purpose ? "border-danger" : "border-gray-300 dark:border-slate-700"}`} {...register("purpose", visitorRegistrationRules.purpose)} />{errors.purpose && <span className="mt-2 block text-sm text-danger">{errors.purpose.message}</span>}</label>
  </section>
);
