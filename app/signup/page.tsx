"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signUp } from "@/libs/auth/cognito-auth";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userExists, setUserExists] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signUp(email, password, name);
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error) {
      if (error === "User already exists") {
        setUserExists(true);
        await new Promise((resolve) => setTimeout(resolve, 10000));
        router.push("/signin");
      }
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit}>
        {userExists && (
          <p className="error">
            User already exists. Redirecting to sign in page...
          </p>
        )}
        <h1>Sign Up</h1>
        <label>
          Name <span style={{ color: "red" }}>*</span>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </label>
        <label>
          Email <span style={{ color: "red" }}>*</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <label>
          Password <span style={{ color: "red" }}>*</span>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setPasswordTouched(true)}
            required
          />
        </label>
        {passwordTouched && password && password.length < 8 && (
          <p className="error">Password must be at least 8 characters long.</p>
        )}
        {passwordTouched && password && !/[A-Z]/.test(password) && (
          <p className="error">
            Password must contain at least one uppercase letter.
          </p>
        )}
        {passwordTouched && password && !/[a-z]/.test(password) && (
          <p className="error">
            Password must contain at least one lowercase letter.
          </p>
        )}
        {passwordTouched && password && !/\d/.test(password) && (
          <p className="error">Password must contain at least one number.</p>
        )}
        {passwordTouched && password && !/[@$!%*?&]/.test(password) && (
          <p className="error">
            Password must contain at least one special character.
          </p>
        )}
        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
