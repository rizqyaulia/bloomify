"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const mobileLinks = [
  ["Occasions", "/occasions"],
  ["Graduation", "/graduation"],
  ["Birthdays", "/birthdays"],
  ["Best Sellers", "/catalog"],
];

export default function MobileNavMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <div className="mobile-nav-menu">
      <button
        className="mobile-menu-button"
        type="button"
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        onClick={() => setIsOpen((current) => !current)}
      >
        {isOpen ? <X size={21} /> : <Menu size={21} />}
      </button>

      {isOpen ? (
        <div className="mobile-menu-dropdown">
          {mobileLinks.map(([label, href]) => (
            <Link
              className={pathname === href ? "active" : ""}
              href={href}
              key={href}
              onClick={closeMenu}
            >
              {label}
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
