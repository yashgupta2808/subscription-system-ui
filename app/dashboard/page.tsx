"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getSession, signOut } from "@/libs/auth/cognito-auth";
import { SUBSCRIPTION_PLANS } from "@/libs/utils/constants";

const initialUserState = {
  username: "",
  email: "",
  planId: "",
  subscribed: false,
  expired: false,
  thankYou: false,
  endDate: "",
};

export default function Dashboard() {
  const [user, setUser] = useState(initialUserState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchSubscription = useCallback(async () => {
    try {
      const response = await fetch(`api/subscribe?email=${user.email}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (response.ok) {
        const data = await response.json();
        setUser((userData) => ({
          ...userData,
          subscribed: data.status === "ACTIVE",
          expired: data.status === "EXPIRED",
          endDate: data.endDate || "",
        }));
      } else if (response.status === 404) {
        setUser((userData) => ({ ...userData, subscribed: false }));
      }
    } catch (error) {
      console.error("Error fetching subscription:", error);
    } finally {
      setLoading(false);
    }
  }, [user.email]);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await getSession();
        setUser((userData) => ({
          ...userData,
          username: session.getIdToken().payload["name"],
          email: session.getIdToken().payload["email"],
        }));
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
    if (user.email) {
      fetchSubscription();
    }

    history.pushState(null, "", location.href);
    window.onpopstate = () => {
      history.go(1);
    };
  }, [user.email, fetchSubscription]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, planId: user.planId }),
      });
      if (response.ok) {
        alert("Subscribed successfully!");
        setUser((prevUser) => ({ ...prevUser, thankYou: true }));
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
        <h1>Subscription System</h1>
      </header>
      <div className="content">
        <h1>Welcome {user.username}!</h1>
        {user.thankYou && <h2>Thank you for subscribing!</h2>}
        {user.subscribed ? (
          <div>
            <h2>Your subscription is active until {user.endDate}.</h2>
          </div>
        ) : (
          <div>
            {user.expired ? (
              <div>
                <h2>Your subscription has expired. Please subscribe again.</h2>
              </div>
            ) : (
              <h3>Get a Subscription</h3>
            )}
            <form onSubmit={handleSubmit}>
              <label>
                Choose Your Plan:
                <select
                  value={user.planId}
                  onChange={(e) =>
                    setUser((prevUser) => ({
                      ...prevUser,
                      planId: e.target.value,
                    }))
                  }
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
