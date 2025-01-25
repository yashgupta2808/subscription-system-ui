"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/libs/auth/cognito-auth";
import { SUBSCRIPTION_PLANS } from "@/libs/utils/constants";

export default function Dashboard() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [planId, setPlanId] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch(`api/subscribe?email=${email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        if (data.planId) {
          setPlanId(data.planId);
          setSubscribed(true);
          setEndDate(data.endDate);
        }
      } else if (response.status === 404) {
        setSubscribed(false);
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [email]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        setUsername(session.getIdToken().payload["name"]);
        setEmail(session.getIdToken().payload["email"]);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (err) {
        setError("An error occurred. Redirecting to sign in...");
        setTimeout(() => {
          router.push("/signin");
        }, 3000);
      }
    };

    fetchSession();
  }, [router]);

  useEffect(() => {
    if (email) {
      fetchSubscription();
    }

    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.go(1);
    };
  }, [email, fetchSubscription]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/signin");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, planId }),
      });
      if (response.ok) {
        alert("Subscribed successfully!");
        fetchSubscription();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      console.error("Error subscribing:", error);
      alert("An error occurred while subscribing.");
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <>
      <header className="header">
        <h1>Subscription Billing System</h1>
      </header>
      <div className="content">
        <h1>Welcome {username}!</h1>
        {subscribed ? (
          <div>
            <h2>Your subscription is active until {endDate}</h2>
          </div>
        ) : (
          <div>
            <h3>Get a Subscription</h3>
            <form onSubmit={handleSubmit}>
                  <label>
                  Choose Your Plan:
                  <select
                    value={planId}
                    onChange={(e) => setPlanId(e.target.value)}
                    required
                  >
                    <option value="" disabled>
                    Select a plan
                    </option>
                    {SUBSCRIPTION_PLANS.map((plan) => (
                    <option key={plan.value} value={plan.value}>
                      {plan.label}
                    </option>
                    ))}
                  </select>
                  </label>
              <button type="submit">Subscribe</button>
            </form>
          </div>
        )}
      </div>
      <button className="signout-button" onClick={handleSignOut}>
        Sign Out
      </button>
    </>
  );
}
