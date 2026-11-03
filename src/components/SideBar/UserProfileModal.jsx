import { FiHash, FiMail, FiMapPin, FiShield, FiUser } from "react-icons/fi";
import { ROLE_LABELS, USER_ROLES } from "../../config/roles";
import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";

const profileInitials = (name) => (name || "NOVA User")
  .split(/\s+/)
  .filter(Boolean)
  .slice(0, 2)
  .map((part) => part.charAt(0).toUpperCase())
  .join("");

const ProfileField = ({ icon, label, value }) => (
  <div className="flex gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-sky-100 text-sky-700">
      {icon}
    </span>
    <div className="min-w-0">
      <dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-semibold text-slate-900">{value || "—"}</dd>
    </div>
  </div>
);

export const UserProfileModal = ({ isOpen, user, onClose }) => {
  const role = ROLE_LABELS[user?.role] || user?.role;
  const branch = user?.branch?.name
    || (user?.role === USER_ROLES.SUPER_ADMIN ? "All branches" : "No branch assigned");

  return (
    <Modal
      isOpen={isOpen}
      title="My profile"
      description="Your Visitor Management Portal account details."
      onClose={onClose}
      footer={<Button variant="secondary" onClick={onClose}>Close</Button>}
    >

      <dl className="grid gap-3 sm:grid-cols-2">
        <ProfileField icon={<FiUser aria-hidden="true" />} label="Full name" value={user?.name} />
        <ProfileField icon={<FiMail aria-hidden="true" />} label="Email address" value={user?.email} />
        <ProfileField icon={<FiShield aria-hidden="true" />} label="Role" value={role} />
        <ProfileField icon={<FiMapPin aria-hidden="true" />} label="Branch" value={branch} />
      </dl>
    </Modal>
  );
};
