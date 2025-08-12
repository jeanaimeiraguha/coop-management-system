import React, { useState } from "react";
import { useForm } from "react-hook-form";
import api from "../services/api";

export default function AuthForm() {
  const [isRegister, setIsRegister] = useState(false);

  // Shared forms for login & register:
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  // Handle Login submit
  const onLoginSubmit = async (data) => {
    try {
      const res = await api.post("/members/login", data);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("memberName", res.data.member.name);
      localStorage.setItem("memberEmail", res.data.member.email);
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  // Handle Register submit
  const onRegisterSubmit = async (data) => {
    try {
      await api.post("/members/register", data);
      alert("Registration successful! Please login.");
      setIsRegister(false);
      reset(); // reset form fields
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow">
      <h2 className="text-2xl mb-6 text-center font-bold">
        {isRegister ? "Create Account" : "Member Login"}
      </h2>

      {isRegister ? (
        <form
          onSubmit={handleSubmit(onRegisterSubmit)}
          className="space-y-4"
          key="register"
        >
          <input
            type="text"
            placeholder="Full Name"
            {...register("name", { required: "Full name is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.name && (
            <p className="text-red-500">{errors.name.message}</p>
          )}

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
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <input
            type="text"
            placeholder="Phone Number"
            {...register("phone", { required: "Phone number is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.phone && (
            <p className="text-red-500">{errors.phone.message}</p>
          )}

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
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
          >
            Register
          </button>
        </form>
      ) : (
        <form
          onSubmit={handleSubmit(onLoginSubmit)}
          className="space-y-4"
          key="login"
        >
          <input
            type="email"
            placeholder="Email"
            {...register("email", { required: "Email is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.email && (
            <p className="text-red-500">{errors.email.message}</p>
          )}

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: "Password is required" })}
            className="w-full p-2 border rounded"
          />
          {errors.password && (
            <p className="text-red-500">{errors.password.message}</p>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
      )}

      <div className="mt-4 text-center text-sm">
        {isRegister ? (
          <>
            Already have an account?{" "}
            <button
              className="text-blue-600 hover:underline"
              onClick={() => {
                setIsRegister(false);
                reset();
              }}
            >
              Login here
            </button>
          </>
        ) : (
          <>
            Don't have an account?{" "}
            <button
              className="text-green-600 hover:underline"
              onClick={() => {
                setIsRegister(true);
                reset();
              }}
            >
              Create one
            </button>
          </>
        )}
      </div>
    </div>
  );
}
