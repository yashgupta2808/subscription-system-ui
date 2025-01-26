"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/libs/auth/cognito-auth";
import Link from "next/link";

export default function SignUp() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [userExists, setUserExists] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signUp(formData.email, formData.password, formData.name);
      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (error) {
      if (error === "User already exists") {
        setUserExists(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const isPasswordValid = () => {
    const { password } = formData;
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /\d/.test(password) &&
      /[@$!%*?&]/.test(password)
    );
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        {userExists && (
          <p className="error">
            User already exists. Use a different email or sign in.
          </p>
        )}
        <h1>Sign Up</h1>
        <label>
          Name <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email <span style={{ color: "red" }}>*</span>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password <span style={{ color: "red" }}>*</span>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            onBlur={() => setPasswordTouched(true)}
            required
          />
        </label>
        {passwordTouched && !isPasswordValid() && (
          <p className="error">
            Password must be at least 8 characters long, contain at least one
            uppercase letter, one lowercase letter, one number, and one special
            character.
          </p>
        )}
        <button
          type="submit"
          disabled={loading || (passwordTouched && !isPasswordValid())}
        >
          {loading ? "Signing Up..." : "Sign Up"}
        </button>
      </form>
      <p>
        Already have an account?{" "}
        <Link
          href="/signin"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Sign In
        </Link>
      </p>
    </div>
  );
}
