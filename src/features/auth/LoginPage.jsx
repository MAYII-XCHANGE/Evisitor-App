import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FiArrowRight, FiLock, FiMail } from "react-icons/fi";
import toast from "react-hot-toast";
import { motion as Motion } from "framer-motion";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Select } from "../../components/ui/Select";
import { ROLE_LABELS, USER_ROLES } from "../../config/navigation";
import { useAuthStore } from "../../store/authStore";
import logo from "../../assets/novabank_logo.png";
import backgroundImage from "../../assets/background.png";

export const LoginPage = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "mayowa.oyeniran@novabank.ng",
      password: "password",
      role: USER_ROLES.SUPER_ADMIN,
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    window.setTimeout(() => {
      login(values);
      toast.success("Welcome to Visitor Management Portal");
      setIsSubmitting(false);
      navigate("/dashboard");
    }, 500);
  };

  return (
    <main
      className="flex min-h-screen items-center justify-center bg-cover bg-center px-4 py-10"
      style={{
        backgroundImage: `linear-gradient(rgba(170, 205, 231, 0.9), rgba(247, 250, 252, 0.92)), url(${backgroundImage})`,
      }}
    >
      <Motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md rounded-xl border border-white/70 bg-white p-8 shadow-card"
      >
        <div className="text-center">
          <img src={logo} alt="NOVA Bank" className="mx-auto h-20 w-auto object-contain" />
          <h1 className="mt-8 text-2xl font-bold text-gray-900">Visitor Management Portal</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage branch visits securely.</p>
        </div>
        <form className="mt-8 space-y-5" onSubmit={handleSubmit(onSubmit)}>
          <Input
            label="Email"
            type="email"
            icon={FiMail}
            placeholder="name@novabank.ng"
            error={errors.email?.message}
            {...register("email", { required: "Email is required" })}
          />
          <Input
            label="Password"
            type="password"
            icon={FiLock}
            placeholder="Enter password"
            error={errors.password?.message}
            {...register("password", { required: "Password is required" })}
          />
          <Select
            label="Demo Role"
            options={Object.values(USER_ROLES).map((role) => ({
              label: ROLE_LABELS[role],
              value: role,
            }))}
            {...register("role", { required: true })}
          />
          <button
            type="submit"
            disabled={isSubmitting}
            className="relative flex w-full transform justify-center rounded-xl border border-transparent bg-gradient-to-r from-blue-600 to-blue-600 px-4 py-3 text-sm font-medium text-white transition-all duration-200 hover:scale-105 hover:from-blue-700 hover:to-blue-600 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <div className="mr-2 h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
                Signing in...
              </div>
            ) : (
              <div className="flex items-center">
                Sign in
                <FiArrowRight className="ml-2 h-4 w-4" />
              </div>
            )}
          </button>
        </form>
      </Motion.section>
    </main>
  );
};
