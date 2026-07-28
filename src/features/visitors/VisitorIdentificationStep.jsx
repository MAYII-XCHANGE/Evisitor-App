import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ID_TYPE_OPTIONS, visitorRegistrationRules } from "../../validation/visitorValidation";
import { ImageCaptureField } from "./ImageCaptureField";

export const VisitorIdentificationStep = ({ register, errors, idDocument, onIdDocumentChange }) => (
  <section aria-labelledby="visitor-identification-heading">
    <h2 id="visitor-identification-heading" className="text-lg font-bold text-gray-900 dark:text-slate-100">Identification</h2>
    <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Capture the identity document presented by the visitor.</p>
    <div className="mt-6 grid gap-5 md:grid-cols-2">
      <Select label="ID type" required options={ID_TYPE_OPTIONS} error={errors.idType?.message} {...register("idType", visitorRegistrationRules.idType)} />
      <Input label="ID number" required autoComplete="off" error={errors.idNumber?.message} {...register("idNumber", visitorRegistrationRules.idNumber)} />
    </div>
    <div className="mt-5"><ImageCaptureField label="Scan or capture ID (optional)" value={idDocument} onChange={onIdDocumentChange} cameraFacingMode="environment" /></div>
    <p className="mt-5 rounded-xl bg-primary-50 p-4 text-sm text-primary-700">Identity numbers are encrypted by the backend and are masked when displayed after registration.</p>
  </section>
);
