import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useAuth } from "../content/AuthContext";

const signupSchema = z
  .object({
    businessName: z.string().min(2, "Business name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();

  const [loading, setLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data) => {
    try {
      setLoading(true);
      setAuthError("");

      const result = await signUp(
        data.email,
        data.password,
        data.businessName
      );

      if (result?.error) {
        setAuthError(result.error.message);
        return;
      }

      navigate("/login", {
        state: {
          message: "Account created successfully. Please verify your email.",
        },
      });
    } catch (err) {
      setAuthError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-lg">

        <h1 className="text-3xl font-bold text-center text-indigo-600">
          BookEasy
        </h1>

        <p className="text-center text-gray-500 mt-2 mb-6">
          Create your account
        </p>

        {authError && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4">
            {authError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

          <input
            placeholder="Business Name"
            {...register("businessName")}
            className="w-full p-3 border rounded-lg"
          />
          <p className="text-red-500 text-sm">{errors.businessName?.message}</p>

          <input
            placeholder="Email"
            {...register("email")}
            className="w-full p-3 border rounded-lg"
          />
          <p className="text-red-500 text-sm">{errors.email?.message}</p>

          <input
            type="password"
            placeholder="Password"
            {...register("password")}
            className="w-full p-3 border rounded-lg"
          />
          <p className="text-red-500 text-sm">{errors.password?.message}</p>

          <input
            type="password"
            placeholder="Confirm Password"
            {...register("confirmPassword")}
            className="w-full p-3 border rounded-lg"
          />
          <p className="text-red-500 text-sm">
            {errors.confirmPassword?.message}
          </p>

          <button
            disabled={loading}
            className="w-full bg-indigo-600 text-white p-3 rounded-lg flex justify-center gap-2"
          >
            {loading && <Loader2 className="animate-spin" />}
            {loading ? "Creating..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm mt-4">
          Already have an account?{" "}
          <Link className="text-indigo-600" to="/login">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}