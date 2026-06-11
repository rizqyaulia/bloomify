"use client";

import { History, LayoutDashboard, LogOut, PackageCheck, User } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getCurrentUser, logoutCustomer } from "../_lib/api";

function getStoredRole() {
  if (typeof window === "undefined") {
    return "";
  }

  return window.localStorage.getItem("bloomifyRole") || "";
}

export default function AccountMenu({ iconSize = 19 }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    function syncAuthState() {
      setUser(getCurrentUser());
      setRole(getStoredRole());
      setIsOpen(false);
    }

    syncAuthState();
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("bloomifyAuthUpdated", syncAuthState);

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("bloomifyAuthUpdated", syncAuthState);
    };
  }, []);

  async function handleLogout() {
    await logoutCustomer();
    setUser(null);
    setRole("");
    setIsOpen(false);
    router.push("/login");
  }

  if (!user) {
    return (
      <Link className="icon-button" href="/login" aria-label="Open account">
        <User size={iconSize} />
      </Link>
    );
  }

  const isAdmin = role === "admin" || user.role === "admin";

  return (
    <div className="account-menu">
      <button
        className="icon-button"
        onClick={() => setIsOpen((open) => !open)}
        type="button"
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >
        <User size={iconSize} />
      </button>

      {isOpen ? (
        <div className="account-dropdown" role="menu">
          <div className="account-summary">
            <strong>{user.name || "Bloomify Account"}</strong>
            <span>{isAdmin ? "Administrator" : "Customer"}</span>
          </div>
          <Link href={isAdmin ? "/admin" : "/tracking"} role="menuitem">
            {isAdmin ? <LayoutDashboard size={16} /> : <PackageCheck size={16} />}
            {isAdmin ? "Admin Dashboard" : "My Orders"}
          </Link>
          {!isAdmin ? (
            <Link href="/history" role="menuitem">
              <History size={16} />
              History
            </Link>
          ) : null}
          <button onClick={handleLogout} type="button" role="menuitem">
            <LogOut size={16} />
            Logout
          </button>
        </div>
      ) : null}
    </div>
  );
}
