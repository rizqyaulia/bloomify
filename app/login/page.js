"use client";

import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { loginCustomer } from "../_lib/api";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim().toLowerCase();
    const password = String(formData.get("password") || "");
    setIsBusy(true);
    setMessage("");
    try {
      const result = await loginCustomer({
        email: username === "admin" ? "admin@bloomify.local" : username,
        password,
      });
      const isAdmin = result.user?.role === "admin";
      setIsBusy(false);
      router.push(isAdmin ? "/admin" : "/");
    } catch (error) {
      setIsBusy(false);
      setMessage(error.message || "Unable to sign in.");
    }
  }

  function handleForgotPassword() {
    setMessage("Password reset is not enabled yet. Please contact Bloomify support.");
  }

  return (
    <main className="login-shell">
      <section className="login-card" aria-labelledby="login-title">
        <div className="login-heading">
          <Link className="login-brand" href="/" id="login-title">
            Bloomify
          </Link>
          <p>Welcome back. Sign in to your account.</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="username">Username or Email</label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="admin or you@example.com"
              autoComplete="username"
            />
          </div>

          <div className="field-group">
            <label htmlFor="password">Password</label>
            <div className="password-field">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                autoComplete="current-password"
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? <EyeOff size={25} /> : <Eye size={25} />}
              </button>
            </div>
          </div>

          <div className="login-options">
            <label className="remember-row" htmlFor="remember-me">
              <input id="remember-me" name="remember-me" type="checkbox" />
              <span>Remember me</span>
            </label>
            <button className="text-link-button" onClick={handleForgotPassword} type="button">
              Forgot password?
            </button>
          </div>

          {message ? <p className="checkout-error">{message}</p> : null}

          <button className="login-submit" disabled={isBusy} type="submit">
            {isBusy ? "Signing In..." : "Sign In"}
          </button>
        </form>

        <p className="register-prompt">
          Don&apos;t have an account? <Link href="/register">Register</Link>
        </p>
      </section>

      <p className="login-footer">{"\u00a9"} 2026 Bloomify Boutique. Secure Login.</p>
    </main>
  );
}
