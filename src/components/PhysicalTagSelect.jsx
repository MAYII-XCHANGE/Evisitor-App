import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { physicalTagService } from "../services/physicalTagService";

export const PhysicalTagSelect = ({ registration, value, onChange, error, disabled = false }) => {
  const [search, setSearch] = useState("");
  const result = useQuery({
    queryKey: ["physical-tags", "available"],
    queryFn: physicalTagService.available,
  });
  const options = useMemo(() => {
    const term = search.trim().toLowerCase();
    return (result.data || [])
      .filter((tag) => !term || [tag.code, tag.description, tag.branch].some((value) => value?.toLowerCase().includes(term)))
      .map((tag) => ({
        value: tag.id,
        label: `${tag.code}${tag.description ? ` — ${tag.description}` : ""} — ${tag.branch}`,
      }));
  }, [result.data, search]);

  return (
    <div className="space-y-3 md:col-span-2 xl:col-span-3">
      <Input
        label="Search available physical tags"
        placeholder="Search by tag code, description, or branch"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
        disabled={disabled || result.isLoading}
      />
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
