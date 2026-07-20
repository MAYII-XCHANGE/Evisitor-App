import { Card } from "../../components/ui/Card";
import { StatusBadge } from "../../components/ui/StatusBadge";
import { formatDateTime, titleCase } from "../../utils/formatters";

export const PassDetailsCard = ({ pass }) => {
  if (!pass) return null;
  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div><p className="text-sm font-semibold text-gray-500">Visitor pass</p><h3 className="mt-1 text-xl font-bold text-gray-900">{pass.passCode}</h3></div>
        <StatusBadge status={titleCase(pass.status)} />
      </div>
      <dl className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div><dt className="text-xs font-bold uppercase text-gray-500">Badge</dt><dd className="mt-1 font-semibold">{pass.badgeNumber}</dd></div>
        <div><dt className="text-xs font-bold uppercase text-gray-500">Visitor</dt><dd className="mt-1 font-semibold">{pass.visit?.visitor}</dd></div>
        <div><dt className="text-xs font-bold uppercase text-gray-500">Valid from</dt><dd className="mt-1 font-semibold">{formatDateTime(pass.validFrom)}</dd></div>
        <div><dt className="text-xs font-bold uppercase text-gray-500">Valid until</dt><dd className="mt-1 font-semibold">{formatDateTime(pass.validUntil)}</dd></div>
      </dl>
    </Card>
  );
};
