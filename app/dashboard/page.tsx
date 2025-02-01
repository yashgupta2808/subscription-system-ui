/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { deleteUser, getSession, signOut } from "@/libs/auth/cognito-auth";
import { formatDate, SUBSCRIPTION_PLANS } from "@/libs/utils/constants";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";

const initialUserState = {
  username: "",
  email: "",
  planId: "",
  subscribed: false,
  expired: false,
  endDate: "",
};

export default function Dashboard() {
  const [user, setUser] = useState(initialUserState);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  const fetchSubscription = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(
        `api/subscribe?email=${encodeURIComponent(user.email)}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      if (response.ok) {
        const data = await response.json();
        setUser((userData) => ({
          ...userData,
          subscribed: data.status === "ACTIVE",
          expired: data.status === "EXPIRED",
          endDate: data.endDate || "",
          planId: data.planId || "",
        }));
      } else if (response.status === 404) {
        setUser((userData) => ({ ...userData, subscribed: false }));
      } else {
        setLoading(false);
        throw new Error("An error occurred while fetching subscription.");
      }
    } catch (error) {
      setError("Something went wrong. Try Signing in again!");
      await new Promise((resolve) => setTimeout(resolve, 5000));
      router.push("/");
    } finally {
      setLoading(false);
      setError("");
    }
  }, [router, user.email]);

  const fetchSession = useCallback(async () => {
    setLoading(true);
    try {
      const session = await getSession();
      setUser((userData) => ({
        ...userData,
        username: session.getIdToken().payload["name"],
        email: session.getIdToken().payload["email"],
      }));
    } catch (error) {
      setError("An error occurred. Try signing in again!");
      setTimeout(() => {
        router.push("/signin");
      }, 3000);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

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

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUser();
      const response = await fetch("/api/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      if (!response.ok) {
        throw new Error("An error occurred while deleting account.");
      }
      alert("Account deleted successfully!");
    } catch (error) {
      setError("An error occurred while deleting account.");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } finally {
      setError("");
    }
    router.push("/");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email, planId: user.planId }),
      });
      if (response.ok) {
        alert("Subscription successful!");
        fetchSubscription();
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      setError("Something went wrong. Please try again.");
      await new Promise((resolve) => setTimeout(resolve, 3000));
    } finally {
      setError("");
    }
  };

  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: user.email }),
      });
      if (response.ok) {
        alert("Subscription cancelled successfully!");
        setUser((userData) => ({
          ...userData,
          planId: "",
          subscribed: false,
          expired: false,
          endDate: "",
        }));
      } else {
        const data = await response.json();
        alert(data.message);
      }
    } catch (error) {
      alert("An error occurred while cancelling subscription.");
    } finally {
      setLoading(false);
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
        <h1>Welcome {user.username.split(" ")[0]}!</h1>
        {user.subscribed ? (
          <div>
            <h2>
              Your subscription for {user.planId} plan is active until{" "}
              {formatDate(new Date(user.endDate))}.
            </h2>
          </div>
        ) : (
          <div>
            {user.expired ? (
              <div>
                <h2>Your subscription has expired.</h2>
                <h2>Renew your subscription now!</h2>
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
                    setUser((userData) => ({
                      ...userData,
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
              <br />
              <i>All rates listed are for a one-month subscription.</i>
            </form>
          </div>
        )}
      </div>
      {user.subscribed && (
        <button className="cancel-button" onClick={handleCancelSubscription}>
          Cancel Subscription
        </button>
      )}
      <button className="signout-button" onClick={handleSignOut}>
        Sign Out
      </button>
      <button className="delete-button" onClick={handleDeleteAccount}>
        Delete Account
      </button>
    </>
  );
}
