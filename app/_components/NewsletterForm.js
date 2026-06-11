"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { subscribeNewsletter } from "../_lib/api";

export default function NewsletterForm({ id }) {
  const [email, setEmail] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email) {
      setMessage("Please enter an email address before subscribing.");
      return;
    }

    setIsBusy(true);
    try {
      const result = await subscribeNewsletter(email);
      setMessage(result.message);
      setEmail("");
    } catch (error) {
      setMessage(error.message || "Newsletter signup is unavailable right now.");
    } finally {
      setIsBusy(false);
    }
  }

  return (
    <form className="newsletter" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor={id}>
        Email address
      </label>
      <input
        id={id}
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
      />
      <button aria-label="Subscribe to newsletter" disabled={isBusy} type="submit">
        {isBusy ? "..." : <Send size={18} />}
      </button>
      {message ? <span className="sr-only" aria-live="polite">{message}</span> : null}
    </form>
  );
}
