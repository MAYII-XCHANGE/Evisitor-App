import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiCheckCircle, FiLogIn, FiRefreshCw, FiSend } from "react-icons/fi";
import toast from "react-hot-toast";
import logo from "../../assets/novabank_logo.png";
import { Button } from "../../components/ui/Button";
import { useSelfServiceReset } from "../../hooks/useSelfServiceReset";
import { selfServiceService } from "../../services/selfServiceService";
import { getApiError } from "../../utils/apiResponse";
import { visitorRegistrationRules } from "../../validation/visitorValidation";
import { VisitorDetailsStep } from "../visitors/VisitorDetailsStep";
import { VisitorVisitDetailsStep } from "../visitors/VisitorVisitDetailsStep";
import { VisitorIdentificationStep } from "../visitors/VisitorIdentificationStep";
import { VisitorCaptureStep } from "../visitors/VisitorCaptureStep";
import { VisitorAdditionalInfoStep } from "../visitors/VisitorAdditionalInfoStep";
import { VisitorRegistrationReviewStep } from "../visitors/VisitorRegistrationReviewStep";
import { VISITOR_REGISTRATION_DEFAULTS, VISITOR_REGISTRATION_STEPS } from "../visitors/visitorRegistrationSteps";
import { SelfServiceStepRail } from "./SelfServiceStepRail";
import { SelfServiceBadgePreview } from "./SelfServiceBadgePreview";
import "./SelfServicePage.css";

const localDate = () => { const now = new Date(); const offset = now.getTimezoneOffset() * 60000; return new Date(now.getTime() - offset).toISOString().slice(0, 10); };
const localTime = () => new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", hour12: false });
const defaults = () => ({ ...VISITOR_REGISTRATION_DEFAULTS, appointmentDate: localDate(), appointmentTime: localTime(), website: "" });

export const SelfServicePage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [success, setSuccess] = useState(null);
  const { register, control, handleSubmit, reset, setError, clearErrors, trigger, watch, setValue, formState: { errors } } = useForm({ defaultValues: defaults(), mode: "onTouched" });
  const values = watch();

  useEffect(() => { register("photograph", visitorRegistrationRules.photograph); register("signature", visitorRegistrationRules.signature); }, [register]);

  const resetScreen = useCallback(() => { reset(defaults()); setCurrentStep(0); setSuccess(null); clearErrors(); }, [clearErrors, reset]);
  useSelfServiceReset({ onReset: resetScreen, enabled: !success });
  useEffect(() => { if (!success) return undefined; const timer = window.setTimeout(resetScreen, 30000); return () => window.clearTimeout(timer); }, [resetScreen, success]);

  const mutation = useMutation({
    mutationFn: selfServiceService.submit,
    onSuccess: (result) => { reset(defaults()); setCurrentStep(0); setSuccess(result); toast.success("Registration sent to the Front Desk"); },
    onError: (error) => {
      const apiError = getApiError(error);
      Object.entries(apiError.fieldErrors).forEach(([field, message]) => setError(field, { message }));
      const errorStep = VISITOR_REGISTRATION_STEPS.findIndex((step) => step.fields.some((field) => apiError.fieldErrors[field]));
      if (errorStep >= 0) setCurrentStep(errorStep);
      setError("root", { message: apiError.message });
    },
  });

  const next = async () => { clearErrors("root"); if (await trigger(VISITOR_REGISTRATION_STEPS[currentStep].fields, { shouldFocus: true })) setCurrentStep((step) => Math.min(step + 1, VISITOR_REGISTRATION_STEPS.length - 1)); };
  const previous = () => { clearErrors("root"); setCurrentStep((step) => Math.max(step - 1, 0)); };
  const steps = [
    <VisitorDetailsStep key="visitor" register={register} errors={errors} />,
    <VisitorVisitDetailsStep key="visit" register={register} errors={errors} />,
    <VisitorIdentificationStep key="identification" register={register} errors={errors} idDocument={values.idDocument} onIdDocumentChange={(file) => setValue("idDocument", file, { shouldDirty: true })} />,
    <VisitorCaptureStep key="capture" photograph={values.photograph} signature={values.signature} onPhotographChange={(file) => setValue("photograph", file, { shouldDirty: true, shouldValidate: true })} onSignatureChange={(file) => setValue("signature", file, { shouldDirty: true, shouldValidate: true })} errors={errors} />,
    <VisitorAdditionalInfoStep key="additional" control={control} register={register} errors={errors} />,
    <VisitorRegistrationReviewStep key="review" values={values} onEdit={setCurrentStep} register={register} errors={errors} />,
  ];

  if (success) return <main className="self-service-success"><section className="self-service-success-card"><FiCheckCircle className="mx-auto h-14 w-14 text-green-600"/><h1 className="mt-5 text-2xl font-bold text-gray-900">Registration submitted</h1><p className="mt-3 text-gray-600">Please go to the Front Desk for verification and check-in.</p><div className="mx-auto mt-6 max-w-sm rounded-xl bg-primary-50 p-4"><p className="text-xs font-bold uppercase tracking-wide text-primary-600">Reference</p><p className="mt-1 text-xl font-bold text-primary-900">{success.reference}</p></div><p className="mt-4 text-sm text-gray-500">This screen resets automatically to protect your information.</p><Button className="self-service-primary-button mt-6" onClick={resetScreen}><FiRefreshCw/>Start another registration</Button></section></main>;

  return <main className="self-service-shell"><div className="self-service-page"><div className="self-service-topbar"><Link to="/login" className="self-service-staff-login"><FiLogIn/>Staff login</Link></div><header className="self-service-header"><img src={logo} alt="NOVA Bank" className="self-service-logo"/><p className="self-service-eyebrow">Visitor self-service</p><h1>Register your visit</h1><p>Complete this form, then present your reference at the Front Desk for approval and check-in.</p></header><div className="self-service-layout"><SelfServiceStepRail steps={VISITOR_REGISTRATION_STEPS} currentStep={currentStep} onStepSelect={setCurrentStep}/><section className="self-service-form-card"><form className="space-y-6" onSubmit={currentStep===VISITOR_REGISTRATION_STEPS.length-1?handleSubmit((data)=>mutation.mutate(data)):(event)=>{event.preventDefault();next();}} noValidate><input type="text" tabIndex="-1" autoComplete="off" className="hidden" aria-hidden="true" {...register("website")}/><div className="min-h-[300px]">{steps[currentStep]}</div>{errors.root&&<p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{errors.root.message}</p>}<div className="self-service-form-actions"><span className="self-service-step-note">Step {currentStep+1} of {VISITOR_REGISTRATION_STEPS.length}</span><div className="self-service-form-buttons">{currentStep>0&&<Button variant="secondary" onClick={previous} disabled={mutation.isPending}><FiArrowLeft/>Back</Button>}{currentStep<VISITOR_REGISTRATION_STEPS.length-1?<Button type="button" className="self-service-primary-button" onClick={next}>Continue<FiArrowRight/></Button>:<Button type="submit" className="self-service-primary-button" disabled={mutation.isPending}><FiSend/>{mutation.isPending?"Submitting...":"Submit for review"}</Button>}</div></div></form></section><SelfServiceBadgePreview values={values}/></div><p className="self-service-footer-note">For your privacy, the form clears automatically after inactivity.</p></div></main>;
};
