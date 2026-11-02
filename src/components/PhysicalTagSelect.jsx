import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select } from "./ui/Select";
import { physicalTagService } from "../services/physicalTagService";

export const PhysicalTagSelect = ({ registration, value, onChange, error, disabled = false }) => {
  const result = useQuery({
    queryKey: ["physical-tags", "available"],
    queryFn: physicalTagService.available,
  });
  const options = useMemo(() => {
    return (result.data || [])
      .map((tag) => ({
        value: tag.id,
        label: `${tag.code}${tag.description ? ` — ${tag.description}` : ""} — ${tag.branch}`,
      }));
  }, [result.data]);

  return (
    <div className="space-y-3 md:col-span-2 xl:col-span-3">
      <Select
        label="Physical visitor tag"
        required
        placeholder={result.isLoading ? "Loading available tags..." : options.length ? "Select an available physical tag" : "No available physical tags"}
        options={options}
        disabled={disabled || result.isLoading || !options.length}
        error={error || result.error?.message}
        {...registration}
        {...(value !== undefined ? { value } : {})}
        {...(onChange ? { onChange } : {})}
      />
      <p className="text-xs text-gray-500 dark:text-slate-400">Only available physical tags belonging to your branch are shown.</p>
    </div>
  );
};
