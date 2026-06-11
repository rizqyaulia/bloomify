"use client";

import { CheckCircle2, Search } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import { getFooterLinkProps } from "../_components/footerRoutes";
import {
  fetchOrderHistory,
  formatCurrency,
  formatStatusLabel,
  getCurrentUser,
  getItemGreetingMessage,
  getOrderProductSummary,
  resolveProductImageUrl,
} from "../_lib/api";

const footerGroups = [
  {
    title: "Company",
    links: ["About Us", "Gift Guides", "Shipping Info"],
  },
  {
    title: "Support",
    links: ["Privacy Policy", "Track Order", "Contact Us"],
  },
];

function getCompletedDate(order) {
  const value = order.completed_at || order.updated_at || order.created_at;
  if (!value) {
    return "Recently completed";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function HistoryPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadHistory() {
      const user = getCurrentUser();
      try {
        setOrders(await fetchOrderHistory(user?.id ? { user_id: user.id, per_page: 50 } : { per_page: 50 }));
      } catch (error) {
        setMessage(error.message || "Unable to load completed orders.");
      } finally {
        setIsLoading(false);
      }
    }

    loadHistory();
  }, []);

  return (
    <main className="site-shell tracking-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand-row">
          <Link className="brand" href="/">
            Bloomify
          </Link>
          <div className="nav-links">
            <Link href="/occasions">Occasions</Link>
            <Link href="/graduation">Graduation</Link>
            <Link href="/birthdays">Birthdays</Link>
            <Link href="/catalog">Best Sellers</Link>
          </div>
        </div>
          <MobileNavMenu />

        <div className="nav-actions">
          <Link className="search-pill history-search-link" href="/tracking">
            <Search size={22} aria-hidden="true" />
            <span>Track order</span>
          </Link>
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      <section className="tracking-main container">
        <header className="tracking-header">
          <h1>Order History</h1>
          <p>Completed Bloomify deliveries are saved here for quick reference.</p>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="order-history-section history-page-section">
          <div className="history-grid">
            {isLoading ? (
              <p className="admin-empty">Loading completed orders...</p>
            ) : orders.length ? (
              orders.map((order) => {
                const firstItem = order.items?.[0];
                const image =
                  resolveProductImageUrl(firstItem?.product?.image) ||
                  "/products/pink-serenity-clean.png";

                return (
                  <article className="history-card" key={order.id}>
                    <div className="history-card-top">
                      <span>
                        <CheckCircle2 size={14} />
                        {formatStatusLabel(order.order_status)}
                      </span>
                      <strong>#{order.order_code}</strong>
                    </div>
                    <div className="history-product">
                      <img src={image} alt={getOrderProductSummary(order)} />
                      <div>
                        <h3>{getOrderProductSummary(order)}</h3>
                        <p>Recipient: {firstItem?.recipient_name || order.customer_name}</p>
                        <p>Size: {firstItem?.bouquet_size || "Standard"}</p>
                        <p>Wrapping: {firstItem?.wrapping_color || "Bloomify"}</p>
                        <p>Delivery: {order.campus_address}</p>
                        {getItemGreetingMessage(firstItem) ? (
                          <p>Note: {getItemGreetingMessage(firstItem)}</p>
                        ) : null}
                        <p>Completed: {getCompletedDate(order)}</p>
                        <b>{formatCurrency(order.total)}</b>
                      </div>
                    </div>
                    <Link className="history-card-link" href={`/tracking?order=${order.order_code}`}>
                      View Tracking
                    </Link>
                  </article>
                );
              })
            ) : (
              <p className="admin-empty">No completed orders yet.</p>
            )}
          </div>
        </section>
      </section>

      <footer className="footer tracking-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" href="/">
              Bloomify
            </Link>
            <p>
              {"\u00a9"} 2026 Bloomify. Curating joy for campus life.
              Hand-picked, heart-delivered.
            </p>
          </div>

          {footerGroups.map((group) => (
            <div key={group.title}>
              <h2>{group.title}</h2>
              <ul>
                {group.links.map((link) => (
                  <li key={link}>
                    <Link {...getFooterLinkProps(link)}>{link}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h2>Newsletter</h2>
            <p>Join our bloom club for campus deals.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
