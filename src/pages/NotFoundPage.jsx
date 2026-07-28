import { Link } from "react-router-dom";
import { FiSearch } from "react-icons/fi";

export const NotFoundPage = () => (
  <main className="flex min-h-screen items-center justify-center bg-surface-muted p-6 text-center">
    <div className="max-w-md rounded-xl bg-white p-8 shadow-card">
      <FiSearch className="mx-auto h-10 w-10 text-primary" />
      <h1 className="mt-4 text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-sm text-gray-500">The page you requested does not exist or has moved.</p>
      <Link to="/" className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white">Return to visitor registration</Link>
    </div>
  </main>
);
