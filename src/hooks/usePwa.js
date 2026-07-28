import { useContext, useEffect, useId } from "react";
import { PwaContext } from "../context/pwaContextValue";

export const usePwa = () => {
  const context = useContext(PwaContext);
  if (!context) throw new Error("usePwa must be used within PwaProvider");
  return context;
};

export const useUnsavedChanges = (isDirty) => {
  const sourceId = useId();
  const { reportUnsavedChanges } = usePwa();

  useEffect(() => {
    reportUnsavedChanges(sourceId, Boolean(isDirty));
    return () => reportUnsavedChanges(sourceId, false);
  }, [isDirty, reportUnsavedChanges, sourceId]);
};
