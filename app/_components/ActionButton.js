"use client";

import Link from "next/link";
import { useState } from "react";

export default function ActionButton({
  children,
  className,
  href,
  label,
  message = "This feature is coming soon.",
  onDone,
  type = "button",
  ...props
}) {
  const [isBusy, setIsBusy] = useState(false);
  const [status, setStatus] = useState("");

  if (href) {
    return (
      <Link className={className} href={href} aria-label={label} {...props}>
        {children}
      </Link>
    );
  }

  async function handleClick() {
    if (props.disabled) {
      return;
    }

    setIsBusy(true);
    await Promise.resolve();
    setIsBusy(false);
    setStatus(message || `${label || "Action"} is coming soon.`);
    onDone?.();
  }

  return (
    <>
      <button className={className} disabled={isBusy} onClick={handleClick} type={type} {...props}>
        {isBusy ? "Working..." : children}
      </button>
      {status ? <span className="sr-only" aria-live="polite">{status}</span> : null}
    </>
  );
}
