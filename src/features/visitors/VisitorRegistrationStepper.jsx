import { FiCheck, FiChevronRight } from "react-icons/fi";

const crumbShape = (first, last) => ({
  clipPath: first
    ? "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%)"
    : last
      ? "polygon(0 0, 100% 0, 100% 100%, 0 100%, 14px 50%)"
      : "polygon(0 0, calc(100% - 14px) 0, 100% 50%, calc(100% - 14px) 100%, 0 100%, 14px 50%)",
});

export const VisitorRegistrationStepper = ({ steps, currentStep, onStepSelect }) => {
  const activeStep = steps[currentStep];
  const progress = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <nav aria-label="Visitor registration progress">
      <div className="mb-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary-700 dark:text-primary-100">Registration progress</p>
          <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">Complete each section before moving forward.</p>
        </div>
        <span className="shrink-0 rounded-full border border-primary-100 bg-white px-3 py-1.5 text-xs font-bold text-primary-700 shadow-subtle dark:border-slate-700 dark:bg-slate-900 dark:text-primary-100">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="lg:hidden">
        <div className="flex items-center gap-3 rounded-xl border border-primary-100 bg-white p-3 shadow-subtle dark:border-slate-700 dark:bg-slate-900">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary text-sm font-bold text-white">{currentStep + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-gray-900 dark:text-slate-100">{activeStep.title}</span>
            <span className="block truncate text-xs text-gray-500 dark:text-slate-400">{activeStep.description}</span>
          </span>
          <FiChevronRight className="shrink-0 text-primary" aria-hidden="true" />
        </div>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-gray-200 dark:bg-slate-700" aria-hidden="true">
          <div className="h-full rounded-full bg-primary transition-[width] duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <ol className="hidden overflow-hidden rounded-xl border border-white/80 bg-white shadow-subtle lg:flex dark:border-slate-700 dark:bg-slate-900">
        {steps.map((step, index) => {
          const complete = index < currentStep;
          const active = index === currentStep;
          const stateClass = active
            ? "bg-primary text-white"
            : complete
              ? "bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-slate-800 dark:text-primary-100"
              : "bg-gray-50 text-gray-500 dark:bg-slate-900 dark:text-slate-400";

          return (
            <li key={step.title} className={`min-w-0 flex-1 ${index > 0 ? "-ml-3" : ""}`}>
              <button
                type="button"
                className={`flex min-h-16 w-full items-center gap-2.5 pr-5 text-left transition-colors focus-visible:relative focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary-700 disabled:cursor-default ${index === 0 ? "pl-4" : "pl-7"} ${stateClass}`}
                style={crumbShape(index === 0, index === steps.length - 1)}
                onClick={() => complete && onStepSelect(index)}
                disabled={!complete}
                aria-current={active ? "step" : undefined}
                aria-label={`${step.title}${complete ? ", completed" : active ? ", current step" : ", not yet available"}`}
                title={step.description}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  active
                    ? "bg-white text-primary-700"
                    : complete
                      ? "bg-primary text-white"
                      : "border border-gray-300 bg-white text-gray-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
                }`}>
                  {complete ? <FiCheck aria-hidden="true" /> : index + 1}
                </span>
                <span className="min-w-0 text-xs font-bold leading-4 xl:text-sm">{step.title}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
