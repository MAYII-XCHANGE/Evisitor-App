import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { FiDownload } from "react-icons/fi";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { visitorService } from "../../services/visitorService";
import { downloadBlob } from "../../utils/download";
import { getApiError } from "../../utils/apiResponse";

const SCOPES = [
  {
    value: "all",
    title: "All visitors",
    description: "Every visitor record in your permitted branch, ignoring current filters.",
  },
  {
    value: "filtered",
    title: "Current filtered results",
    description: "Every record matching the search and filters on the visitors page.",
  },
  {
    value: "date-range",
    title: "Custom date range",
    description: "Visitor records registered between the selected dates.",
  },
];

const FORMATS = [
  {
    value: "csv",
    title: "CSV",
    description: "Simple UTF-8 data for importing into other systems.",
  },
  {
    value: "xlsx",
    title: "Excel",
    description: "A styled spreadsheet with filters, widths, and frozen headings.",
  },
];

const instantStart = (date) => date ? new Date(`${date}T00:00:00.000`).toISOString() : "";
const instantEnd = (date) => date ? new Date(`${date}T23:59:59.999`).toISOString() : "";
const today = () => new Date().toISOString().slice(0, 10);

const Choice = ({ name, option, selected, onChange }) => (
  <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 transition ${selected ? "border-primary bg-primary-50 ring-2 ring-primary-100" : "border-gray-200 hover:border-primary-200"}`}>
    <input
      type="radio"
      name={name}
      value={option.value}
      checked={selected}
      onChange={() => onChange(option.value)}
      className="mt-1 h-4 w-4 accent-primary"
    />
    <span>
      <span className="block text-sm font-bold text-gray-900">{option.title}</span>
      <span className="mt-1 block text-xs leading-5 text-gray-500">{option.description}</span>
    </span>
  </label>
);

export const VisitorExportModal = ({
  isOpen,
  onClose,
  currentParams,
  currentFiltersValid,
}) => {
  const [scope, setScope] = useState("filtered");
  const [format, setFormat] = useState("csv");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setScope("filtered");
    setFormat("csv");
    setDateFrom("");
    setDateTo("");
  }, [isOpen]);

  const invalidDateRange = Boolean(dateFrom && dateTo && dateFrom > dateTo);
  const dateRangeIncomplete = scope === "date-range" && (!dateFrom || !dateTo);
  const selectionInvalid = (scope === "filtered" && !currentFiltersValid)
    || dateRangeIncomplete
    || invalidDateRange;

  const exportParams = useMemo(() => {
    if (scope === "all") return {};
    if (scope === "filtered") return currentParams;
    return {
      ...(dateFrom ? { createdFrom: instantStart(dateFrom) } : {}),
      ...(dateTo ? { createdTo: instantEnd(dateTo) } : {}),
    };
  }, [scope, currentParams, dateFrom, dateTo]);

  const countResult = useQuery({
    queryKey: ["visitors", "export-count", scope, exportParams],
    queryFn: () => visitorService.directory({ page: 0, size: 1, ...exportParams }),
    enabled: isOpen && !selectionInvalid,
  });
  const recordCount = countResult.data?.totalElements;

  const download = useMutation({
    mutationFn: () => visitorService.exportVisitors({ format, params: exportParams }),
    onSuccess: (blob) => {
      const scopeName = scope === "date-range"
        ? `${dateFrom}-to-${dateTo}`
        : scope;
      downloadBlob(blob, `visitors-${scopeName}-${today()}.${format}`);
      toast.success(`${format === "xlsx" ? "Excel" : "CSV"} visitor report downloaded`);
      onClose();
    },
    onError: (error) => toast.error(getApiError(error).message),
  });

  const summary = scope === "all"
    ? "All visitor records"
    : scope === "filtered"
      ? "Current search and filters"
      : dateFrom && dateTo
        ? `${dateFrom} to ${dateTo}`
        : "Select a start and end date";

  return (
    <Modal
      isOpen={isOpen}
      title="Export visitors"
      description="Choose which records to include and how the report should be downloaded."
      onClose={onClose}
      size="lg"
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={download.isPending}>Cancel</Button>
          <Button
            requiresOnline
            onClick={() => download.mutate()}
            disabled={selectionInvalid || countResult.isLoading || countResult.isError || !recordCount || download.isPending}
          >
            <FiDownload />
            {download.isPending ? "Preparing report..." : `Download ${format === "xlsx" ? "Excel" : "CSV"}`}
          </Button>
        </>
      )}
    >
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900">Export scope</legend>
          <div className="grid gap-3 md:grid-cols-3">
            {SCOPES.map((option) => (
              <Choice
                key={option.value}
                name="visitor-export-scope"
                option={option}
                selected={scope === option.value}
                onChange={setScope}
              />
            ))}
          </div>
        </fieldset>

        {scope === "date-range" && (
          <div className="grid gap-4 rounded-xl bg-gray-50 p-4 sm:grid-cols-2">
            <Input
              label="Registered from"
              type="date"
              required
              value={dateFrom}
              max={dateTo || undefined}
              onChange={(event) => setDateFrom(event.target.value)}
            />
            <Input
              label="Registered to"
              type="date"
              required
              value={dateTo}
              min={dateFrom || undefined}
              onChange={(event) => setDateTo(event.target.value)}
              error={invalidDateRange ? "The end date must be on or after the start date" : undefined}
            />
          </div>
        )}

        {scope === "filtered" && !currentFiltersValid && (
          <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-danger">
            Correct the registration date range on the visitors page before exporting filtered results.
          </p>
        )}

        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900">File format</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {FORMATS.map((option) => (
              <Choice
                key={option.value}
                name="visitor-export-format"
                option={option}
                selected={format === option.value}
                onChange={setFormat}
              />
            ))}
          </div>
        </fieldset>

        <div className="rounded-xl border border-primary-100 bg-primary-50 p-4">
          <p className="text-xs font-bold uppercase tracking-wide text-primary-700">Export summary</p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-3">
            <div><dt className="text-gray-500">Scope</dt><dd className="mt-1 font-semibold text-gray-900">{summary}</dd></div>
            <div><dt className="text-gray-500">Records</dt><dd className="mt-1 font-semibold text-gray-900">{selectionInvalid ? "—" : countResult.isLoading ? "Counting..." : countResult.isError ? "Unavailable" : Number(recordCount || 0).toLocaleString()}</dd></div>
            <div><dt className="text-gray-500">Format</dt><dd className="mt-1 font-semibold text-gray-900">{format === "xlsx" ? "Excel (.xlsx)" : "CSV (.csv)"}</dd></div>
          </dl>
          {!selectionInvalid && !countResult.isLoading && recordCount === 0 && (
            <p className="mt-3 text-sm text-amber-700">No visitor records match this export scope.</p>
          )}
          {countResult.isError && (
            <p className="mt-3 text-sm text-danger">The record count could not be loaded. Please try again.</p>
          )}
        </div>
      </div>
    </Modal>
  );
};
