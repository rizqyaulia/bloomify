"use client";

import { Eye, EyeOff, Flower2, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { registerCustomer } from "../_lib/api";

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function handleSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setIsBusy(true);
    setMessage("");
    try {
      await registerCustomer({
        name: formData.get("name"),
        phone: formData.get("phone"),
        email: formData.get("email"),
        campus_address: formData.get("address"),
        password: formData.get("password"),
      });
      setIsBusy(false);
      router.push("/");
    } catch (error) {
      setIsBusy(false);
      setMessage(error.message || "Unable to create account.");
    }
  }

  return (
    <main className="login-shell register-shell">
      <section className="login-card register-card" aria-labelledby="register-title">
        <div className="login-heading">
          <Link className="login-brand" href="/" id="register-title">
            Bloomify
          </Link>
          <p>Create your campus gifting account.</p>
        </div>

        <form className="login-form register-form" onSubmit={handleSubmit}>
          <div className="field-group">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              name="name"
              type="text"
              placeholder="Nama lengkap"
              autoComplete="name"
            />
          </div>

          <div className="field-group">
            <label htmlFor="phone">Phone Number</label>
            <input
              id="phone"
              name="phone"
              type="tel"
              placeholder="0812-XXXX-XXXX"
              autoComplete="tel"
            />
          </div>

          <div className="field-group wide-field">
            <label htmlFor="register-email">Email Address</label>
            <input
              id="register-email"
              name="email"
              type="email"
              placeholder="you@student.ac.id"
              autoComplete="email"
            />
          </div>

          <div className="field-group wide-field">
            <label htmlFor="address">Campus Address</label>
            <input
              id="address"
              name="address"
              type="text"
              placeholder="Gedung, fakultas, atau area kampus"
              autoComplete="street-address"
            />
          </div>

          <div className="field-group wide-field">
            <label htmlFor="register-password">Password</label>
            <div className="password-field">
              <input
                id="register-password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
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

          <label className="remember-row register-consent wide-field" htmlFor="terms">
            <input id="terms" name="terms" type="checkbox" />
            <span>I agree to secure order, payment, and delivery processing.</span>
          </label>

          {message ? <p className="checkout-error wide-field">{message}</p> : null}

          <button className="login-submit register-submit wide-field" disabled={isBusy} type="submit">
            <UserPlus size={20} />
            {isBusy ? "Creating..." : "Create Account"}
          </button>
        </form>

        <div className="register-benefits" aria-label="Registration benefits">
          <span>
            <Flower2 size={17} />
            Faster checkout
          </span>
          <span>Order history</span>
          <span>Live tracking</span>
        </div>

        <p className="register-prompt">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </section>

      <p className="login-footer">{"\u00a9"} 2026 Bloomify Boutique. Secure Registration.</p>
    </main>
  );
}
