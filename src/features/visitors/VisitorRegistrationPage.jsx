import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiArrowLeft, FiArrowRight, FiSave, FiTrash2 } from "react-icons/fi";
import { PageHeader } from "../../components/ui/PageHeader";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { visitorService } from "../../services/visitorService";
import { getApiError } from "../../utils/apiResponse";
import { visitorRegistrationRules } from "../../validation/visitorValidation";
import { VisitorDetailsStep } from "./VisitorDetailsStep";
import { VisitorIdentificationStep } from "./VisitorIdentificationStep";
import { VisitorVisitDetailsStep } from "./VisitorVisitDetailsStep";
import { VisitorCaptureStep } from "./VisitorCaptureStep";
import { VisitorAdditionalInfoStep } from "./VisitorAdditionalInfoStep";
import { VisitorRegistrationReviewStep } from "./VisitorRegistrationReviewStep";
import { VisitorRegistrationStepper } from "./VisitorRegistrationStepper";
import { RegistrationSuccess } from "./RegistrationSuccess";
import { VISITOR_REGISTRATION_DEFAULTS, VISITOR_REGISTRATION_STEPS } from "./visitorRegistrationSteps";

const localDate = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60_000;
  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
};

const localTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const freshDefaults = () => ({ ...VISITOR_REGISTRATION_DEFAULTS, appointmentDate: localDate(), appointmentTime: localTime() });
const clean = (value) => value?.trim() || null;

export const VisitorRegistrationPage = () => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(null);
  const {
    register, control, handleSubmit, reset, setError, clearErrors, trigger, watch, setValue,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: freshDefaults(), mode: "onTouched" });
  const values = watch();

  useEffect(() => {
    register("photograph", visitorRegistrationRules.photograph);
    register("signature", visitorRegistrationRules.signature);
  }, [register]);

  useEffect(() => {
    const preventLoss = (event) => {
      if (!isDirty || success) return;
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", preventLoss);
    return () => window.removeEventListener("beforeunload", preventLoss);
  }, [isDirty, success]);

  const mutation = useMutation({
    mutationFn: async (formValues) => {
      const stagedFiles = [];
      try {
        const upload = async (type, file) => {
          if (!file) return null;
          const uploaded = await visitorService.uploadFile(type, file);
          stagedFiles.push(uploaded.id);
          return uploaded.id;
        };
        const [idDocumentFileId, photographFileId, signatureFileId] = await Promise.all([
          upload("ID_DOCUMENT", formValues.idDocument),
          upload("PHOTOGRAPH", formValues.photograph),
          upload("SIGNATURE", formValues.signature),
        ]);
        const capturePayload = {
          idType: formValues.idType,
          idNumber: formValues.idNumber.trim(),
          idDocumentFileId,
          photographFileId,
          signatureFileId,
          vehicleNumber: clean(formValues.vehicleNumber),
          items: (formValues.items || []).map((item) => ({
            itemName: item.itemName.trim(),
            description: clean(item.description),
            quantity: Number(item.quantity) || 1,
            serialNumber: clean(item.serialNumber),
          })),
          termsAccepted: formValues.termsAccepted,
          termsVersion: formValues.termsVersion,
        };
        return visitorService.registerWorkflow({
          firstName: formValues.firstName.trim(),
          lastName: formValues.lastName.trim(),
          phoneNumber: formValues.phoneNumber.trim(),
          email: clean(formValues.email),
          company: clean(formValues.company),
          visitorType: formValues.visitorType,
          purpose: formValues.purpose.trim(),
          hostId: null,
          hostName: formValues.hostName.trim(),
          departmentName: formValues.departmentName.trim(),
          branchName: formValues.branchName.trim(),
          appointmentDate: formValues.appointmentDate,
          appointmentTime: formValues.appointmentTime,
          ...capturePayload,
          checkInNow: true,
        });
      } catch (error) {
        await Promise.allSettled(stagedFiles.map((id) => visitorService.deleteFile(id)));
        throw error;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      toast.success("Visitor registered and checked in successfully");
      setSuccess(result);
    },
    onError: (error) => {
      const apiError = getApiError(error);
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => setError(field, { message }));
      const errorStep = VISITOR_REGISTRATION_STEPS.findIndex((step) => step.fields.some((field) => apiError.fieldErrors[field]));
      if (errorStep >= 0) setCurrentStep(errorStep);
      setError("root", { message: apiError.message });
    },
  });

  const nextStep = async () => {
    clearErrors("root");
    const valid = await trigger(VISITOR_REGISTRATION_STEPS[currentStep].fields, { shouldFocus: true });
    if (valid) setCurrentStep((step) => Math.min(step + 1, VISITOR_REGISTRATION_STEPS.length - 1));
  };

  const previousStep = () => {
    clearErrors("root");
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const clearForm = () => {
    reset(freshDefaults());
    setCurrentStep(0);
    clearErrors();
  };

  const startAnother = () => {
    setSuccess(null);
    setCurrentStep(0);
    reset(freshDefaults());
  };

  if (success) return <RegistrationSuccess result={success} onAnother={startAnother} />;
  const stepContent = [
    <VisitorDetailsStep key="visitor" register={register} errors={errors} />,
    <VisitorVisitDetailsStep key="visit" register={register} errors={errors} />,
    <VisitorIdentificationStep key="identification" register={register} errors={errors} idDocument={values.idDocument} onIdDocumentChange={(file) => setValue("idDocument", file, { shouldDirty: true })} />,
    <VisitorCaptureStep key="capture" photograph={values.photograph} signature={values.signature} onPhotographChange={(file) => setValue("photograph", file, { shouldDirty: true, shouldValidate: true })} onSignatureChange={(file) => setValue("signature", file, { shouldDirty: true, shouldValidate: true })} errors={errors} />,
    <VisitorAdditionalInfoStep key="additional" control={control} register={register} errors={errors} />,
    <VisitorRegistrationReviewStep key="review" values={values} onEdit={setCurrentStep} register={register} errors={errors} />,
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Register Walk-in Visitor" description="Capture the visitor's details and complete their check-in." />
      <Card className="space-y-6">
          <VisitorRegistrationStepper steps={VISITOR_REGISTRATION_STEPS} currentStep={currentStep} onStepSelect={setCurrentStep} />
          <div className="border-t border-gray-100 dark:border-slate-800" />
          <form className="space-y-6" onSubmit={currentStep === VISITOR_REGISTRATION_STEPS.length - 1 ? handleSubmit((data) => mutation.mutate(data)) : (event) => { event.preventDefault(); nextStep(); }} noValidate>
            <div className="min-h-[300px]">{stepContent[currentStep]}</div>
            {errors.root && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{errors.root.message}</p>}
            <div className="flex flex-col-reverse justify-between gap-3 border-t border-gray-100 pt-5 sm:flex-row dark:border-slate-800">
              <Button variant="ghost" onClick={clearForm} disabled={mutation.isPending}><FiTrash2 /> Clear form</Button>
              <div className="flex justify-end gap-3">
                {currentStep > 0 && <Button variant="secondary" onClick={previousStep} disabled={mutation.isPending}><FiArrowLeft /> Back</Button>}
                {currentStep < VISITOR_REGISTRATION_STEPS.length - 1 ? <Button type="button" onClick={nextStep}>Continue <FiArrowRight /></Button> : <Button type="submit" disabled={mutation.isPending}><FiSave /> {mutation.isPending ? "Uploading and registering..." : "Complete registration"}</Button>}
              </div>
            </div>
          </form>
      </Card>
    </div>
  );
};
