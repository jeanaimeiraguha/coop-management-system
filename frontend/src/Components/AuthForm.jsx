import React, { useState, useContext } from "react";
import { useForm } from "react-hook-form";
import { AuthContext } from "../contexts/AuthContext";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useContext(AuthContext);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  // Handle login submit
  const onLoginSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      // After login, navigate to dashboard
      window.location.href = "/dashboard"; // or use react-router's navigate if inside router
    } catch (error) {
      alert(error.response?.data?.message || "Login failed");
    }
  };

  // Handle register submit
  const onRegisterSubmit = async (data) => {
    try {
      // Use your api.js axios instance directly
      const api = (await import("../services/api")).default;
      await api.post("/members/register", data);
      alert("Registration successful! Please login.");
      setIsRegister(false);
      reset();
    } catch (error) {
      alert(error.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-md bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">
        {isRegister ? "Create Account" : "Member Login"}
      </h2>

      {isRegister ? (
        <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-6" key="register">
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: "Full name is required" })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.name && <p className="text-red-600 mt-1">{errors.name.message}</p>}

          <input
            type="email"
            placeholder="Email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^\S+@\S+$/i,
                message: "Invalid email address",
              },
            })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.email && <p className="text-red-600 mt-1">{errors.email.message}</p>}

          <input
            type="text"
            placeholder="Phone Number"
            {...register("phone", { required: "Phone number is required" })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.phone && <p className="text-red-600 mt-1">{errors.phone.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
          />
          {errors.password && <p className="text-red-600 mt-1">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-green-600 text-white py-3 rounded hover:bg-green-700 transition"
          >
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-6" key="login">
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-600 mt-1">{errors.email.message}</p>}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.password && <p className="text-red-600 mt-1">{errors.password.message}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-3 rounded hover:bg-blue-700 transition"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      )}

      <div className="mt-6 text-center text-sm">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(false);
                reset();
              }}
              className="text-blue-600 hover:underline"
            >
              Login here
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              type="button"
              onClick={() => {
                setIsRegister(true);
                reset();
              }}
              className="text-green-600 hover:underline"
            >
              Create one
            </button>
          </>
        )}
      </div>
    </div>
  );
}
