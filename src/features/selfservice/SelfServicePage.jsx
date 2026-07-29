import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLogIn, FiRefreshCw, FiSend, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";
import logo from "../../assets/novabank_logo.png";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { PageHeader } from "../../components/ui/PageHeader";
import { useSelfServiceReset } from "../../hooks/useSelfServiceReset";
import { useUnsavedChanges } from "../../hooks/usePwa";
import { selfServiceService } from "../../services/selfServiceService";
import { getApiError } from "../../utils/apiResponse";
import { visitorRegistrationRules } from "../../validation/visitorValidation";
import { VisitorDetailsStep } from "../visitors/VisitorDetailsStep";
import { VisitorVisitDetailsStep } from "../visitors/VisitorVisitDetailsStep";
import { VisitorIdentificationStep } from "../visitors/VisitorIdentificationStep";
import { VisitorCaptureStep } from "../visitors/VisitorCaptureStep";
import { VisitorAdditionalInfoStep } from "../visitors/VisitorAdditionalInfoStep";
import { VisitorRegistrationReviewStep } from "../visitors/VisitorRegistrationReviewStep";
import { VisitorRegistrationStepper } from "../visitors/VisitorRegistrationStepper";
import { VISITOR_REGISTRATION_DEFAULTS, VISITOR_REGISTRATION_STEPS } from "../visitors/visitorRegistrationSteps";
import "./SelfServicePage.css";

const localDate = () => { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; return new Date(now.getTime() - offset).toISOString().slice(0, 10); };
const localTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const defaults = () => ({ ...VISITOR_REGISTRATION_DEFAULTS, appointmentDate: localDate(), appointmentTime: localTime(), website: "" });
const SELF_SERVICE_REGISTRATION_STEPS = VISITOR_REGISTRATION_STEPS.map((step) => ({
  ...step,
  fields: step.fields.filter((field) => field !== "physicalTagId"),
}));

export const SelfServicePage = () => {
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(null);
  const { register, control, handleSubmit, reset, setError, clearErrors, trigger, watch, setValue, formState: { errors, isDirty } } = useForm({ defaultValues: defaults(), mode: "onTouched" });
  const values = watch();
  const optionsQuery = useQuery({
    queryKey: ["self-service-registration-options"],
    queryFn: selfServiceService.options,
    staleTime: 5 * 60 * 1000,
  });
  const branches = useMemo(() => optionsQuery.data?.branches || [], [optionsQuery.data?.branches]);
  const branchOptions = useMemo(() => branches.map((branch) => ({ value: branch.name, label: branch.name })), [branches]);
  const selectedBranch = branches.find((branch) => branch.name === values.branchName);
  const departmentOptions = useMemo(
    () => (selectedBranch?.departments || []).map((department) => ({ value: department.name, label: department.name })),
    [selectedBranch],
  );
  const changeBranch = (branchName) => {
    const branch = branches.find((option) => option.name === branchName);
    setValue("branchId", branch?.id || "", { shouldDirty: true, shouldValidate: true });
    setValue("departmentId", "", { shouldDirty: true });
    setValue("departmentName", "", { shouldDirty: true });
  };
  const changeDepartment = (departmentName) => {
    const department = selectedBranch?.departments?.find((option) => option.name === departmentName);
    setValue("departmentId", department?.id || "", { shouldDirty: true, shouldValidate: true });
  };
  useUnsavedChanges(isDirty && !success);

  useEffect(() => { register("photograph", visitorRegistrationRules.photograph); register("signature", visitorRegistrationRules.signature); }, [register]);

  const resetScreen = useCallback(() => { reset(defaults()); setCurrentStep(0); setSuccess(null); clearErrors(); }, [clearErrors, reset]);
  useSelfServiceReset({ onReset: resetScreen, enabled: !success });
  useEffect(() => { if (!success) return undefined; const timer = window.setTimeout(resetScreen, 30000); return () => window.clearTimeout(timer); }, [resetScreen, success]);

  const mutation = useMutation({
    mutationFn: selfServiceService.submit,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["self-service-registrations"] });
      queryClient.invalidateQueries({ queryKey: ["visitors"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      reset(defaults());
      setCurrentStep(0);
      setSuccess(result);
      toast.success("Registration sent to the Front Desk");
    },
    onError: (error) => {
      const apiError = getApiError(error);
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => setError(field, { message }));
      const errorStep = SELF_SERVICE_REGISTRATION_STEPS.findIndex((step) => step.fields.some((field) => apiError.fieldErrors[field]));
      if (errorStep >= 0) setCurrentStep(errorStep);
      setError("root", { message: apiError.message });
    },
  });

  const nextStep = async () => { clearErrors("root"); if (await trigger(SELF_SERVICE_REGISTRATION_STEPS[currentStep].fields, { shouldFocus: true })) setCurrentStep((step) => Math.min(step + 1, SELF_SERVICE_REGISTRATION_STEPS.length - 1)); };
  const previousStep = () => { clearErrors("root"); setCurrentStep((step) => Math.max(step - 1, 0)); };
  const stepContent = [
    <VisitorDetailsStep key="visitor" register={register} errors={errors} />,
    <VisitorVisitDetailsStep
      key="visit"
      register={register}
      errors={errors}
      branchOptions={branchOptions}
      departmentOptions={departmentOptions}
      onBranchChange={changeBranch}
      onDepartmentChange={changeDepartment}
      locationOptionsLoading={optionsQuery.isLoading}
      showPhysicalTag={false}
    />,
    <VisitorIdentificationStep key="identification" register={register} errors={errors} idDocument={values.idDocument} onIdDocumentChange={(file) => setValue("idDocument", file, { shouldDirty: true })} />,
    <VisitorCaptureStep key="capture" photograph={values.photograph} signature={values.signature} onPhotographChange={(file) => setValue("photograph", file, { shouldDirty: true, shouldValidate: true })} onSignatureChange={(file) => setValue("signature", file, { shouldDirty: true, shouldValidate: true })} errors={errors} />,
    <VisitorAdditionalInfoStep key="additional" control={control} register={register} errors={errors} />,
    <VisitorRegistrationReviewStep key="review" values={values} onEdit={setCurrentStep} register={register} errors={errors} showPhysicalTag={false} />,
  ];

  if (success) {
    return (
      <main className="self-service-success">
        <section className="self-service-success-card">
          <FiCheckCircle className="mx-auto h-14 w-14 text-green-600" />
          <h1 className="mt-5 text-2xl font-bold text-gray-900">Registration submitted</h1>
          <p className="mt-3 text-gray-600">Please go to the Front Desk for verification and check-in.</p>
          <p className="mt-2 text-sm text-gray-500">A Front Desk officer will assign your physical visitor tag during approval.</p>
          <div className="mx-auto mt-6 max-w-sm rounded-xl bg-primary-50 p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-primary-600">Reference</p>
            <p className="mt-1 text-xl font-bold text-primary-900">{success.reference}</p>
          </div>
          <p className="mt-4 text-sm text-gray-500">This screen resets automatically to protect your information.</p>
          <Button className="mt-6" onClick={resetScreen}><FiRefreshCw /> Start another registration</Button>
        </section>
      </main>
    );
  }

  return (
    <main className="self-service-shell">
      <div className="self-service-public-bar">
        <img src={logo} alt="NOVA Bank" className="self-service-logo" />
        <Link to="/staff/login" className="self-service-staff-login" aria-label="Open the staff login">
          <FiLogIn /> Staff login
        </Link>
      </div>

      <div className="self-service-page">
        <div className="mx-auto w-full max-w-[1320px] space-y-6">
          <Card className="overflow-hidden !p-0">
            <div className="border-b border-primary-100 bg-gradient-to-r from-primary-50 via-white to-primary-50/40 px-5 py-5 sm:px-8 dark:border-slate-800 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
              <VisitorRegistrationStepper
                steps={SELF_SERVICE_REGISTRATION_STEPS}
                currentStep={currentStep}
                onStepSelect={setCurrentStep}
              />
            </div>

            <form
              onSubmit={currentStep === SELF_SERVICE_REGISTRATION_STEPS.length - 1
                ? handleSubmit((data) => mutation.mutate(data))
                : (event) => { event.preventDefault(); nextStep(); }}
              noValidate
            >
              <input type="text" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" {...register("website")} />
              <div className="mx-auto min-h-[420px] max-w-5xl px-5 py-8 sm:px-8 lg:px-10 lg:py-10">
                <p className="mb-5 text-right text-xs font-medium text-gray-500 dark:text-slate-400">
                  <span className="mr-1 text-danger" aria-hidden="true">*</span>
                  Required fields
                </p>
                <div key={currentStep}>{stepContent[currentStep]}</div>
                {currentStep === 1 && optionsQuery.error && (
                  <p role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-danger">
                    Branch and department options could not be loaded. Please check the connection and try again.
                  </p>
                )}
                {errors.root && (
                  <p role="alert" className="mt-6 rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-danger">
                    {errors.root.message}
                  </p>
                )}
              </div>

              <div className="border-t border-gray-100 bg-gray-50/80 px-5 py-4 sm:px-8 dark:border-slate-800 dark:bg-slate-900/80">
                <div className="mx-auto flex max-w-5xl flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
                  <Button variant="ghost" className="sm:justify-self-start" onClick={resetScreen} disabled={mutation.isPending}>
                    <FiTrash2 /> Clear form
                  </Button>
                  <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
                    {currentStep > 0
                      ? <Button variant="secondary" onClick={previousStep} disabled={mutation.isPending}><FiArrowLeft /> Back</Button>
                      : <span aria-hidden="true" />}
                    {currentStep < SELF_SERVICE_REGISTRATION_STEPS.length - 1
                      ? <Button type="button" onClick={nextStep}>Continue <FiArrowRight /></Button>
                      : (
                        <Button type="submit" className="col-span-2 sm:col-span-1" disabled={mutation.isPending}>
                          <FiSend /> {mutation.isPending ? "Submitting registration..." : "Submit for review"}
                        </Button>
                      )}
                  </div>
                </div>
              </div>
            </form>
          </Card>

          <p className="self-service-footer-note">For your privacy, the form clears automatically after inactivity.</p>
        </div>
      </div>
    </main>
  );
};
