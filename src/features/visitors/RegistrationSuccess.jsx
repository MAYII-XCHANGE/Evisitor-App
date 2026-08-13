import { useNavigate } from "react-router-dom";
import { FiCheckCircle, FiDownload, FiHome, FiPrinter, FiRefreshCw, FiUser } from "react-icons/fi";
import { Button } from "../../components/ui/Button";
import { Modal } from "../../components/ui/Modal";
import { downloadBlob } from "../../utils/download";

const value = (item, fallback = "Not available") => item || fallback;
const escapeHtml = (item) => String(value(item)).replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));

const tagMarkup = (result) => `<!doctype html>
<html><head><meta charset="utf-8"><title>Visitor tag - ${escapeHtml(result.tagNumber)}</title>
<style>
  @page { size: 86mm 54mm; margin: 0; }
  * { box-sizing: border-box; } body { margin: 0; font-family: Arial, sans-serif; color: #102a43; }
  .tag { width: 86mm; min-height: 54mm; overflow: hidden; border: .4mm solid #007aa8; border-radius: 3mm; background: #fff; }
  .header { padding: 4mm 5mm; color: #fff; background: linear-gradient(115deg, #007aa8, #00b0f0); }
  .eyebrow { margin: 0 0 1mm; font-size: 7pt; font-weight: 700; letter-spacing: 1.1pt; } h1 { margin: 0; font-size: 15pt; letter-spacing: .2pt; }
  .content { padding: 3.5mm 5mm 4mm; } .tag-number { margin: 0; color: #007aa8; font-size: 16pt; font-weight: 800; letter-spacing: 1pt; }
  .name { margin: 1.4mm 0 3mm; font-size: 12pt; font-weight: 700; } .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2.4mm 4mm; }
  .label { margin: 0 0 .6mm; color: #60758a; font-size: 6.5pt; font-weight: 700; letter-spacing: .6pt; text-transform: uppercase; }
  .detail { margin: 0; font-size: 8.5pt; font-weight: 600; overflow-wrap: anywhere; } .footer { margin-top: 3mm; padding-top: 2.2mm; border-top: .25mm solid #d8edf5; color: #60758a; font-size: 6.5pt; }
</style></head><body><section class="tag"><header class="header"><p class="eyebrow">NOVA BANK · VISITOR MANAGEMENT</p><h1>VISITOR PASS</h1></header><main class="content"><p class="tag-number">${escapeHtml(result.tagNumber || "TAG PENDING")}</p><p class="name">${escapeHtml(result.fullName)}</p><div class="grid"><div><p class="label">Host</p><p class="detail">${escapeHtml(result.host)}</p></div><div><p class="label">Department</p><p class="detail">${escapeHtml(result.department)}</p></div><div><p class="label">Visit date</p><p class="detail">${escapeHtml(result.appointmentDate)}</p></div><div><p class="label">Visit time</p><p class="detail">${escapeHtml(result.appointmentTime)}</p></div><div><p class="label">Physical tag</p><p class="detail">${escapeHtml(result.physicalTagCode || "Not assigned")}</p></div><div><p class="label">Status</p><p class="detail">${escapeHtml(result.status)}</p></div></div><p class="footer">Present this pass while on Nova Bank premises.</p></main></section></body></html>`;

export const RegistrationSuccess = ({ result, onAnother }) => {
  const navigate = useNavigate();
  const tagNumber = result.tagNumber || "TAG-PENDING";
  const download = () => downloadBlob(new Blob([tagMarkup(result)], { type: "text/html;charset=utf-8" }), `nova-visitor-pass-${tagNumber}.html`);
  const print = () => {
    const printWindow = window.open("", "_blank", "width=520,height=460");
    if (!printWindow) return;
    printWindow.addEventListener("load", () => printWindow.print(), { once: true });
    printWindow.document.write(tagMarkup(result));
    printWindow.document.close();
    printWindow.focus();
  };

  return <Modal isOpen title="Visitor Registered Successfully" description="The visitor has been checked in and their pass is ready." onClose={onAnother} size="lg" footer={<><Button variant="secondary" onClick={onAnother}>Done</Button><Button onClick={download}><FiDownload /> Download Visitor Tag</Button></>}>
    <div className="space-y-6">
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-gradient-to-br from-primary-50 to-white px-5 py-6 text-center dark:from-slate-800 dark:to-slate-900">
        <FiCheckCircle className="h-14 w-14 text-emerald-600" aria-hidden="true" />
        <div><p className="text-lg font-bold text-gray-900 dark:text-white">Registration complete</p><p className="mt-1 text-sm text-gray-500 dark:text-slate-300">A visitor tag has been assigned and is ready to print or download.</p></div>
      </div>
      <section aria-label="Visitor tag preview" className="overflow-hidden rounded-2xl border border-primary-100 bg-white shadow-card dark:border-slate-700 dark:bg-slate-900">
        <div className="bg-gradient-to-r from-primary-700 to-primary px-5 py-4 text-white"><p className="text-xs font-bold tracking-[0.18em]">NOVA BANK · VISITOR MANAGEMENT</p><p className="mt-1 text-xl font-bold">VISITOR PASS</p></div>
        <div className="p-5 sm:p-6"><p className="text-2xl font-black tracking-wider text-primary-700">{tagNumber}</p><p className="mt-1 text-xl font-bold text-gray-900 dark:text-white">{result.fullName}</p><dl className="mt-5 grid gap-4 border-t border-gray-100 pt-5 text-sm sm:grid-cols-2 dark:border-slate-700">
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Host</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.host)}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Department</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.department)}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Visit date</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.appointmentDate)}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Visit time</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.appointmentTime)}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Physical tag</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.physicalTagCode)}</dd></div>
          <div><dt className="text-xs font-bold uppercase tracking-wide text-gray-500">Visit status</dt><dd className="mt-1 font-semibold text-gray-800 dark:text-slate-100">{value(result.status)}</dd></div>
        </dl></div>
      </section>
      <div className="flex flex-wrap justify-center gap-3"><Button variant="secondary" onClick={print}><FiPrinter /> Print visitor tag</Button><Button variant="ghost" onClick={() => navigate("/visitors")}><FiUser /> View visitor details</Button><Button variant="ghost" onClick={onAnother}><FiRefreshCw /> Register another</Button><Button variant="ghost" onClick={() => navigate("/dashboard")}><FiHome /> Dashboard</Button></div>
    </div>
  </Modal>;
};
