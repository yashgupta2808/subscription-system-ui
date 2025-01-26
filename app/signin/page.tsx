"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/libs/auth/cognito-auth";
import Link from "next/link";

export default function SignIn() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signIn(formData.email, formData.password);
      router.push("/dashboard");
    } catch (error) {
      handleSignInError(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignInError = async (error) => {
    if (error.code === "UserNotConfirmedException") {
      setError(error.message + " Redirecting to verification page...");
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } else if (
      error.code === "NotAuthorizedException" ||
      error.code === "UserNotFoundException"
    ) {
      setError("Incorrect username or password");
    } else {
      setError("An error occurred. Please try again.");
    }
  };

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      <form onSubmit={handleSubmit}>
        <h1>Sign In</h1>
        <label>
          Email
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
            disabled={loading}
          />
        </label>
        <label>
          Password
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
            disabled={loading}
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </button>
      </form>
      <p>
        Don&apos;t have an account?{" "}
        <Link
          href="/signup"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Sign Up
        </Link>
      </p>
    </div>
  );
}
