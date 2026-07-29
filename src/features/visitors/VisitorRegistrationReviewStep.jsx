import { useEffect, useState } from "react";
import { Button } from "../../components/ui/Button";
import { ID_TYPE_OPTIONS, VISITOR_TYPE_OPTIONS } from "../../validation/visitorValidation";

const optionLabel = (options, value) => options.find((option) => option.value === value)?.label || "—";
const display = (value) => value || "—";
const maskedId = (value = "") => value ? `${"•".repeat(Math.max(4, value.length - 4))}${value.slice(-4)}` : "—";

const ReviewItem = ({ label, value }) => (
  <div>
    <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</dt>
    <dd className="mt-1 break-words text-sm font-medium text-gray-900 dark:text-slate-100">{display(value)}</dd>
  </div>
);

const FilePreview = ({ file, alt }) => {
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!file) return undefined;
    const next = URL.createObjectURL(file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [file]);
  return url
    ? <img src={url} alt={alt} className="h-28 max-w-full rounded-lg border border-gray-200 bg-white object-contain" />
    : <span className="text-sm text-gray-500">Not provided</span>;
};

const ReviewSection = ({ title, onEdit, children }) => (
  <section className="rounded-xl border border-gray-200 p-4 dark:border-slate-700">
    <div className="mb-4 flex items-center justify-between">
      <h3 className="font-bold text-gray-900 dark:text-slate-100">{title}</h3>
      {onEdit && <Button variant="ghost" className="min-h-8 px-3 py-1" onClick={onEdit}>Edit</Button>}
    </div>
    {children}
  </section>
);

export const VisitorRegistrationReviewStep = ({ values, onEdit, register, errors, showPhysicalTag = true }) => (
  <section>
    <h2 className="text-lg font-bold text-gray-900 dark:text-slate-100">Review and consent</h2>
    <p className="mt-1 text-sm text-gray-500">Confirm all information before completing registration.</p>
    <div className="mt-6 space-y-4">
      <ReviewSection title="Visitor information" onEdit={() => onEdit(0)}>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ReviewItem label="Full name" value={`${values.firstName} ${values.lastName}`} />
          <ReviewItem label="Phone" value={values.phoneNumber} />
          <ReviewItem label="Email" value={values.email} />
          <ReviewItem label="Company" value={values.company} />
          <ReviewItem label="Visitor type" value={optionLabel(VISITOR_TYPE_OPTIONS, values.visitorType)} />
          <ReviewItem label="Purpose" value={values.purpose} />
        </dl>
      </ReviewSection>
      <ReviewSection title="Host and visit" onEdit={() => onEdit(1)}>
        <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <ReviewItem label="Host" value={values.hostName} />
          <ReviewItem label="Department" value={values.departmentName} />
          <ReviewItem label="Branch" value={values.branchName} />
          <ReviewItem label="Date" value={values.appointmentDate} />
          <ReviewItem label="Time" value={values.appointmentTime} />
          {showPhysicalTag && <ReviewItem label="Physical tag selected" value={values.physicalTagId ? "Selected and reserved on completion" : null} />}
        </dl>
      </ReviewSection>
      <ReviewSection title="Identification" onEdit={() => onEdit(2)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <dl className="grid gap-4">
            <ReviewItem label="Means of identification" value={optionLabel(ID_TYPE_OPTIONS, values.idType)} />
            <ReviewItem label="ID number" value={maskedId(values.idNumber)} />
          </dl>
          <FilePreview file={values.idDocument} alt="ID document preview" />
        </div>
      </ReviewSection>
      <ReviewSection title="Photograph and signature" onEdit={() => onEdit(3)}>
        <div className="grid gap-5 sm:grid-cols-2">
          <div><p className="mb-2 text-xs font-semibold uppercase text-gray-500">Photograph</p><FilePreview file={values.photograph} alt="Visitor photograph" /></div>
          <div><p className="mb-2 text-xs font-semibold uppercase text-gray-500">Signature</p><FilePreview file={values.signature} alt="Visitor signature" /></div>
        </div>
      </ReviewSection>
      <ReviewSection title="Additional information" onEdit={() => onEdit(4)}>
        <dl className="grid gap-4"><ReviewItem label="Vehicle number" value={values.vehicleNumber} /></dl>
        <div className="mt-4 overflow-x-auto">
          {values.items?.length ? (
            <table className="w-full text-left text-sm">
              <thead><tr className="border-b"><th className="p-2">Item</th><th className="p-2">Description</th><th className="p-2">Quantity</th><th className="p-2">Serial</th></tr></thead>
              <tbody>{values.items.map((item, index) => <tr key={`${item.itemName}-${index}`} className="border-b"><td className="p-2">{item.itemName}</td><td className="p-2">{display(item.description)}</td><td className="p-2">{item.quantity}</td><td className="p-2">{display(item.serialNumber)}</td></tr>)}</tbody>
            </table>
          ) : <p className="text-sm text-gray-500">No items carried.</p>}
        </div>
      </ReviewSection>
      <label className={`flex items-start gap-3 rounded-xl border p-4 ${errors.termsAccepted ? "border-danger bg-red-50" : "border-primary-100 bg-primary-50"}`}>
        <input type="checkbox" required aria-required="true" className="mt-1 h-4 w-4" {...register("termsAccepted", { required: "Terms and Conditions must be accepted" })} />
        <span className="text-sm text-gray-700">I confirm that the visitor has reviewed and accepted the current Terms and Conditions (version {values.termsVersion}).<span className="ml-1 text-danger" aria-hidden="true">*</span><span className="sr-only"> (required)</span>{errors.termsAccepted && <span className="mt-1 block text-danger">{errors.termsAccepted.message}</span>}</span>
      </label>
    </div>
  </section>
);
