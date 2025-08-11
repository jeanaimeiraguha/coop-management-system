import React from "react";
import { useForm } from "react-hook-form";
import axios from "axios";

export default function Register() {
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      await axios.post("http://localhost:3000/members/register", data);
      alert("Registration successful! Please login.");
      window.location.href = "/";
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 border rounded shadow">
      <h2 className="text-2xl mb-6 text-center font-bold">Member Registration</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input
          type="text"
          placeholder="Full Name"
          {...register("name", { required: true })}
          className="w-full p-2 border rounded"
        />
        {errors.name && <p className="text-red-500">Name is required</p>}

        <input
          type="email"
          placeholder="Email"
          {...register("email", { required: true })}
          className="w-full p-2 border rounded"
        />
        {errors.email && <p className="text-red-500">Email is required</p>}

        <input
          type="tel"
          placeholder="Phone Number"
          {...register("phone")}
          className="w-full p-2 border rounded"
        />

        <input
          type="password"
          placeholder="Password"
          {...register("password", { required: true, minLength: 6 })}
          className="w-full p-2 border rounded"
        />
        {errors.password && <p className="text-red-500">Password must be at least 6 characters</p>}

        <button
          type="submit"
          className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700"
        >
          Register
        </button>
      </form>
      <p className="mt-4 text-center">
        Already have an account?{" "}
        <a href="/" className="text-blue-600 underline">
          Login here
        </a>
      </p>
    </div>
  );
}
