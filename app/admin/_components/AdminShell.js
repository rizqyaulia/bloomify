"use client";

import { LogOut, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import NewsletterForm from "../../_components/NewsletterForm";
import { logoutCustomer } from "../../_lib/api";

const adminLinks = [
  ["Dashboard", "/admin"],
  ["Orders", "/admin/orders"],
  ["Payments", "/admin/payments"],
  ["Products", "/admin/products"],
];

export default function AdminShell({ children }) {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (window.localStorage.getItem("bloomifyRole") === "admin") {
      setIsAuthorized(true);
      return;
    }

    router.replace("/login");
  }, [router]);

  async function handleLogout() {
    await logoutCustomer();
    router.push("/login");
  }

  if (!isAuthorized) {
    return (
      <main className="login-shell">
        <section className="login-card" aria-live="polite">
          <div className="login-heading">
            <Link className="login-brand" href="/">
              Bloomify
            </Link>
            <p>Checking admin access...</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="site-shell admin-shell">
      <nav className="topbar admin-topbar" aria-label="Admin navigation">
        <div className="brand-row">
          <Link className="brand" href="/admin">
            Bloomify
          </Link>
          <div className="nav-links admin-nav-links">
            {adminLinks.map(([label, href]) => (
              <Link
                className={pathname === href ? "active" : ""}
                href={href}
                key={href}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        <div className="nav-actions">
          <label className="search-pill">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search admin records</span>
            <input type="search" placeholder="Search admin..." />
          </label>
          <button className="icon-button" onClick={handleLogout} aria-label="Log out">
            <LogOut size={19} />
          </button>
        </div>
      </nav>

      {children}

      <footer className="footer admin-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" href="/admin">
              Bloomify
            </Link>
            <p>
              {"\u00a9"} 2026 Bloomify. Structured gifting operations for campus
              sellers.
            </p>
          </div>

          <div>
            <h2>Admin</h2>
            <ul>
              <li>
                <Link href="/admin/orders">Orders</Link>
              </li>
              <li>
                <Link href="/admin/payments">Payments</Link>
              </li>
              <li>
                <Link href="/admin/products">Products</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Reports</h2>
            <ul>
              <li>
                <Link href="/admin">Revenue</Link>
              </li>
              <li>
                <Link href="/admin/orders">Transactions</Link>
              </li>
              <li>
                <Link href="/admin/products">Inventory</Link>
              </li>
            </ul>
          </div>

          <div>
            <h2>Alerts</h2>
            <p>Receive daily order summaries.</p>
            <NewsletterForm id="admin-email" />
          </div>
        </div>
      </footer>
    </main>
  );
}
