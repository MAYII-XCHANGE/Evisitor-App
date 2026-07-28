import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { FiArrowLeft, FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Input } from "../../components/ui/Input";
import { useAuth } from "../../hooks/useAuth";
import { usePwa } from "../../hooks/usePwa";
import { getApiError } from "../../utils/apiResponse";
import { loginRules } from "../../validation/authValidation";
import logo from "../../assets/novabank_logo.png";
import backgroundImage from "../../assets/background.png";

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, status } = useAuth();
  const { isOnline } = usePwa();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    if (location.state?.sessionExpired) toast.error("Your session expired. Please sign in again.");
  }, [location.state]);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (values) => {
    try {
      await login(values);
      toast.success("Welcome to Visitor Management Portal");
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (error) {
      const apiError = getApiError(error, "Sign-in failed");
      setError("root", { message: apiError.message });
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10" style={{ backgroundImage: `linear-gradient(rgba(170, 205, 231, 0.9), rgba(247, 250, 252, 0.92)), url(${backgroundImage})` }}>
      <Motion.section initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md rounded-xl border border-white/70 bg-white p-8 shadow-card">
        <div className="text-center">
          <img src={logo} alt="NOVA Bank" className="mx-auto h-20 w-auto object-contain" />
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-primary">Staff portal</p>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">Staff sign in</h1>
          <p className="mt-2 text-sm text-gray-500">Use your staff account to open the tools available to your assigned role.</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          <Input label="Email" type="email" autoComplete="username" icon={FiMail} placeholder="name@novabank.ng" error={errors.email?.message} {...register("email", loginRules.email)} />
          <Input label="Password" type="password" autoComplete="current-password" icon={FiLock} placeholder="Enter password" error={errors.password?.message} {...register("password", loginRules.password)} />
          {errors.root && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-danger">{errors.root.message}</p>}
          <button type="submit" disabled={isSubmitting || status === "loading" || !isOnline} title={!isOnline ? "Internet connection required" : undefined} className="relative flex w-full transform justify-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-[1.02] hover:from-blue-700 hover:to-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
            {!isOnline ? "Internet connection required" : isSubmitting ? "Signing in..." : <span className="flex items-center">Sign in <FiArrowRight className="ml-2 h-4 w-4" /></span>}
          </button>
        </form>
        <Link to="/" className="mt-6 flex items-center justify-center gap-2 text-sm font-semibold text-gray-600 transition hover:text-primary">
          <FiArrowLeft aria-hidden="true" />
          Back to visitor registration
        </Link>
      </Motion.section>
    </main>
  );
};
