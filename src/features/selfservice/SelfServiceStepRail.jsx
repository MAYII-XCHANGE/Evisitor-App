import { FiCheck } from "react-icons/fi";

export const SelfServiceStepRail = ({ steps, currentStep, onStepSelect }) => (
  <nav className="self-service-rail" aria-label="Registration progress">
    <ol>
      {steps.map((step, index) => {
        const complete = index < currentStep;
        const active = index === currentStep;
        return <li key={step.title} className={`self-service-rail-item ${active ? "is-active" : ""} ${complete ? "is-complete" : ""}`}>
          <button type="button" onClick={() => complete && onStepSelect(index)} disabled={!complete} aria-current={active ? "step" : undefined}>
            <span className="self-service-rail-number">{complete ? <FiCheck aria-hidden="true"/> : index + 1}</span>
            <span><strong>{step.title}</strong><small>{step.description}</small></span>
          </button>
        </li>;
      })}
    </ol>
  </nav>
);
