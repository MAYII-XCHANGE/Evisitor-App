import { FiCheck } from "react-icons/fi";

export const VisitorRegistrationStepper = ({ steps, currentStep, onStepSelect }) => (
  <nav aria-label="Visitor registration progress" className="overflow-x-auto pb-2">
    <ol className="flex min-w-[680px] items-start">
      {steps.map((step, index) => {
        const complete = index < currentStep;
        const active = index === currentStep;
        return (
          <li key={step.title} className="relative flex flex-1 items-start">
            {index < steps.length - 1 && (
              <span className={`absolute left-10 right-2 top-5 h-0.5 ${complete ? "bg-primary" : "bg-gray-200 dark:bg-slate-700"}`} />
            )}
            <button
              type="button"
              className="relative z-10 flex max-w-[170px] items-start gap-3 text-left disabled:cursor-default"
              onClick={() => complete && onStepSelect(index)}
              disabled={!complete}
              aria-current={active ? "step" : undefined}
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-bold ${
                complete || active
                  ? "border-primary bg-primary text-white"
                  : "border-gray-300 bg-white text-gray-500 dark:border-slate-600 dark:bg-slate-900"
              }`}>
                {complete ? <FiCheck aria-hidden="true" /> : index + 1}
              </span>
              <span className="pt-0.5">
                <span className={`block text-sm font-bold ${active ? "text-primary-700" : "text-gray-800 dark:text-slate-100"}`}>{step.title}</span>
                <span className="mt-1 block text-xs leading-4 text-gray-500 dark:text-slate-400">{step.description}</span>
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  </nav>
);
