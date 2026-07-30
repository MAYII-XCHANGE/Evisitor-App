import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { FiDownload } from "react-icons/fi";
import toast from "react-hot-toast";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { reportService } from "../../services/reportService";
import { downloadBlob } from "../../utils/download";
import { getApiError } from "../../utils/apiResponse";

const Choice = ({ name, value, selected, title, description, onChange }) => (
  <label className={`flex cursor-pointer gap-3 rounded-xl border p-4 ${selected ? "border-primary bg-primary-50 ring-2 ring-primary-100" : "border-gray-200"}`}>
    <input type="radio" name={name} value={value} checked={selected} onChange={() => onChange(value)} className="mt-1 h-4 w-4 accent-primary" />
    <span>
      <span className="block text-sm font-bold text-gray-900">{title}</span>
      <span className="mt-1 block text-xs leading-5 text-gray-500">{description}</span>
    </span>
  </label>
);

const lagosDate = () => new Date(Date.now() + 60 * 60 * 1000).toISOString().slice(0, 10);

export const BranchReportExportModal = ({
  isOpen,
  onClose,
  range,
  filters,
  periodCount,
  filteredCount,
}) => {
  const [scope, setScope] = useState("period");
  const [format, setFormat] = useState("xlsx");
  const count = scope === "filtered" ? filteredCount : periodCount;
  const params = {
    ...range,
    ...(scope === "filtered" ? filters : {}),
  };
  const download = useMutation({
    mutationFn: () => reportService.exportBranchReport({ format, params }),
    onSuccess: (blob) => {
      downloadBlob(blob, `branch-operations-${range.startDate}-to-${range.endDate}-${lagosDate()}.${format}`);
      toast.success(`${format === "xlsx" ? "Excel" : "CSV"} branch report downloaded`);
      onClose();
    },
    onError: (error) => toast.error(getApiError(error).message),
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export branch report"
      description="Download visitor records for the selected reporting period."
      footer={(
        <>
          <Button variant="secondary" onClick={onClose} disabled={download.isPending}>Cancel</Button>
          <Button requiresOnline onClick={() => download.mutate()} disabled={download.isPending || !count}>
            <FiDownload /> {download.isPending ? "Preparing report..." : `Download ${format === "xlsx" ? "Excel" : "CSV"}`}
          </Button>
        </>
      )}
      size="lg"
    >
      <div className="space-y-6">
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900">Records to include</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice name="branch-export-scope" value="period" selected={scope === "period"} title="Current reporting period" description="All branch visitors within the selected dates." onChange={setScope} />
            <Choice name="branch-export-scope" value="filtered" selected={scope === "filtered"} title="Current filtered visitor table" description="Apply the visitor-table search and filters." onChange={setScope} />
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-3 text-sm font-bold text-gray-900">File format</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <Choice name="branch-export-format" value="csv" selected={format === "csv"} title="CSV" description="UTF-8 data for importing into other systems." onChange={setFormat} />
            <Choice name="branch-export-format" value="xlsx" selected={format === "xlsx"} title="Excel (.xlsx)" description="Styled spreadsheet with filters and frozen headings." onChange={setFormat} />
          </div>
        </fieldset>
        <div className="grid gap-3 rounded-xl bg-primary-50 p-4 text-sm sm:grid-cols-3">
          <div><p className="text-gray-500">Period</p><p className="mt-1 font-bold text-gray-900">{range.startDate} to {range.endDate}</p></div>
          <div><p className="text-gray-500">Matching records</p><p className="mt-1 font-bold text-gray-900">{Number(count || 0).toLocaleString()}</p></div>
          <div><p className="text-gray-500">Format</p><p className="mt-1 font-bold text-gray-900">{format === "xlsx" ? "Excel" : "CSV"}</p></div>
        </div>
        {!count && <p className="text-sm text-amber-700">No visitor records match this export selection.</p>}
      </div>
    </Modal>
  );
};
