import { Link } from "react-router-dom";
import { FiShield } from "react-icons/fi";
import { Button } from "../components/ui/Button";

export const UnauthorizedPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-surface-muted p-6">
    <section className="max-w-md rounded-xl border border-gray-100 bg-white p-8 text-center shadow-card">
      <FiShield className="mx-auto h-12 w-12 text-primary" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Access restricted</h1>
      <p className="mt-2 text-sm text-gray-500">Your role does not have permission to open this module.</p>
      <Link to="/dashboard">
        <Button className="mt-6">Return to dashboard</Button>
      </Link>
    </section>
  </main>
);
