"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/libs/auth/cognito-auth";

function VerifyForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(email!, code);
      setVerified(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      {verified && <p className="success">Email verified. Redirecting to sign in page...</p>}
      <form onSubmit={handleSubmit}>
        <h1>Verify Email</h1>
        <label>
          Verification Code
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Verification code"
            required
          />
        </label>
        <button type="submit">Verify</button>
      </form>
    </div>
  );
}

export default function Verify() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <VerifyForm />
    </Suspense>
  );
}
