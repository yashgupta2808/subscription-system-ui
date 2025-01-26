"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { verifyEmail } from "@/libs/auth/cognito-auth";

const VerifyForm = () => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [verified, setVerified] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  useEffect(() => {
    if (!email) {
      router.push("/");
    }
  }, [email, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await verifyEmail(email!, code);
      setError("");
      setVerified(true);
      await new Promise((resolve) => setTimeout(resolve, 2000));
      router.push("/signin");
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="container">
      {error && <p className="error">{error}</p>}
      {verified && (
        <p className="success">
          Email verified. Redirecting to Sign In Again...
        </p>
      )}
      <form onSubmit={handleSubmit}>
        <h1>Verify Email</h1>
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Verification code"
          required
        />
        <button type="submit">Verify</button>
      </form>
    </div>
  );
};

const Verify = () => (
  <Suspense fallback={<p>Loading...</p>}>
    <VerifyForm />
  </Suspense>
);

export default Verify;
