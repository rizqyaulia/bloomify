"use client";

import {
  Check,
  Circle,
  HelpCircle,
  Pin,
  Search,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import { getFooterLinkProps, gmailSupportHref } from "../_components/footerRoutes";
import {
  confirmOrderReceived,
  fetchOrderByCode,
  fetchOrders,
  formatCurrency,
  formatStatusLabel,
  getItemGreetingMessage,
  getOrderProductSummary,
  resolveProductImageUrl,
} from "../_lib/api";

const orderFlow = [
  "order_created",
  "waiting_payment",
  "payment_verified",
  "processing",
  "ready_to_deliver",
  "delivering",
  "completed",
];

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

export default function TrackingPage() {
  const [latestOrder, setLatestOrder] = useState(null);
  const [orderHistory, setOrderHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);

  useEffect(() => {
    async function loadTracking() {
      try {
        const orderCode = new URLSearchParams(window.location.search).get("order");
        const orders = await fetchOrders({ per_page: 3 });
        setOrderHistory(orders);

        if (orderCode) {
          setOrderSearch(orderCode);
          setLatestOrder(await fetchOrderByCode(orderCode));
          return;
        }

        setLatestOrder(orders[0] || null);
      } catch (error) {
        setMessage(error.message || "Unable to load order tracking from the API.");
      }
    }

    loadTracking();
  }, []);

  async function handleTrackingSearch(event) {
    event.preventDefault();
    if (!orderSearch.trim()) {
      return;
    }

    setMessage("");
    try {
      const order = await fetchOrderByCode(orderSearch.trim());
      setLatestOrder(order);
      window.history.replaceState(null, "", `/tracking?order=${encodeURIComponent(order.order_code)}`);
    } catch {
      setLatestOrder(null);
      setMessage("We could not find an order with that code.");
    }
  }

  async function handleConfirmReceived() {
    if (!latestOrder || isConfirming) {
      return;
    }

    const isConfirmed = window.confirm("Konfirmasi bahwa pesanan sudah sampai?");
    if (!isConfirmed) {
      return;
    }

    setMessage("");
    setIsConfirming(true);
    try {
      const updatedOrder = await confirmOrderReceived(latestOrder.order_code);
      setLatestOrder(updatedOrder);
      setOrderHistory((current) => {
        const exists = current.some((order) => order.id === updatedOrder.id);
        return exists
          ? current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
          : [updatedOrder, ...current];
      });
      setMessage("Pesanan berhasil dikonfirmasi sudah sampai.");
    } catch (error) {
      setMessage(error.message || "Unable to confirm this order yet.");
    } finally {
      setIsConfirming(false);
    }
  }

  const activeItem = latestOrder?.items?.[0];
  const activeGreetingMessage = getItemGreetingMessage(activeItem) || latestOrder?.notes || "";
  const activeItemImage =
    resolveProductImageUrl(activeItem?.product?.image) ||
    "/products/pink-serenity-clean.png";
  const activeIndex = latestOrder
    ? Math.max(orderFlow.indexOf(latestOrder.order_status), 0)
    : -1;
  const trackingSteps = useMemo(
    () =>
      [...orderFlow].reverse().map((status) => {
        const index = orderFlow.indexOf(status);
        const isActive = index === activeIndex;
        return {
          title: formatStatusLabel(status),
          description: isActive
            ? "This is the latest status from the Bloomify order database."
            : index < activeIndex
              ? "This step has been completed."
              : "Awaiting the next update.",
          status: isActive ? "active" : index < activeIndex ? "done" : "future",
        };
      }),
    [activeIndex]
  );

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
          <form className="search-pill tracking-search-pill" onSubmit={handleTrackingSearch}>
            <Search size={22} aria-hidden="true" />
            <span className="sr-only">Search order code</span>
            <input
              type="search"
              placeholder="Order code..."
              value={orderSearch}
              onChange={(event) => setOrderSearch(event.target.value)}
            />
          </form>
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      <section className="tracking-main container">
        <header className="tracking-header">
          <h1>Track Your Joy</h1>
          <p>
            {latestOrder
              ? `Order #${latestOrder.order_code} \u2022 ${formatStatusLabel(latestOrder.order_status)}`
              : "Enter from checkout or admin to see live order tracking."}
          </p>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        {latestOrder ? (
          <div className="tracking-layout">
            <section className="tracking-card live-tracking-card">
              <div className="tracking-card-heading">
                <h2>Live Tracking</h2>
                <span>{formatStatusLabel(latestOrder.order_status)}</span>
              </div>

              <div className="tracking-timeline">
                {trackingSteps.map((step) => (
                  <article className={`tracking-step ${step.status}`} key={step.title}>
                    <div className="tracking-step-icon">
                      {step.status === "active" ? (
                        <Truck size={16} />
                      ) : step.status === "done" ? (
                        <Check size={15} />
                      ) : (
                        <Circle size={10} />
                      )}
                    </div>
                    <div>
                      <h3>{step.title}</h3>
                      <p className={step.status === "active" ? "strong" : ""}>
                        {step.description}
                      </p>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <aside className="tracking-aside">
              <section className="tracking-card bouquet-detail-card">
                <h2>Bouquet Details</h2>
                <div className="bouquet-summary">
                  <img
                    src={activeItemImage}
                    alt={activeItem?.product_name || "Bloomify order item"}
                  />
                  <div>
                    <h3>{activeItem?.product_name || "Bloomify Order"}</h3>
                    <p>
                      Qty: {activeItem?.quantity || 1} {"\u2022"}{" "}
                      {formatCurrency(activeItem?.product_price || latestOrder.total)}
                    </p>
                  </div>
                </div>

                <dl className="recipient-details">
                  <div>
                    <dt>Recipient</dt>
                    <dd>{activeItem?.recipient_name || latestOrder.customer_name}</dd>
                  </div>
                  <div>
                    <dt>Delivery To</dt>
                    <dd>{latestOrder.campus_address}</dd>
                  </div>
                  <div>
                    <dt>Bouquet Size</dt>
                    <dd>{activeItem?.bouquet_size || "Standard"}</dd>
                  </div>
                  <div>
                    <dt>Wrapping</dt>
                    <dd>{activeItem?.wrapping_color || "Bloomify"}</dd>
                  </div>
                </dl>

                {activeGreetingMessage ? (
                  <blockquote className="tracking-note">
                    <Pin size={18} />
                    <p>"{activeGreetingMessage}"</p>
                  </blockquote>
                ) : null}
              </section>

              <Link
                className="support-button"
                href={gmailSupportHref}
                target="_blank"
                rel="noopener noreferrer"
              >
                <HelpCircle size={22} />
                Contact Support
              </Link>
              {latestOrder.order_status === "delivering" ? (
                <button
                  className="support-button confirm-received-button"
                  onClick={handleConfirmReceived}
                  disabled={isConfirming}
                  type="button"
                >
                  <Check size={22} />
                  {isConfirming ? "Confirming..." : "Pesanan Sudah Sampai"}
                </button>
              ) : null}
              {latestOrder.order_status === "completed" ? (
                <Link className="support-button history-link-button" href="/history">
                  <Check size={22} />
                  Lihat Riwayat Pesanan
                </Link>
              ) : null}
            </aside>
          </div>
        ) : (
          <section className="tracking-card">
            <h2>No order selected</h2>
            <p>Complete checkout first, or open a tracking link with an order code.</p>
          </section>
        )}

        <section className="order-history-section">
          <h2>Order History</h2>
          <div className="history-grid">
            {orderHistory.length ? (
              orderHistory.map((order) => (
                <article className="history-card" key={order.id}>
                  <div className="history-card-top">
                    <span>{formatStatusLabel(order.order_status)}</span>
                    <strong>#{order.order_code}</strong>
                  </div>
                  <div className="history-product">
                    <img
                      src={
                        resolveProductImageUrl(order.items?.[0]?.product?.image) ||
                        "/products/pink-serenity-clean.png"
                      }
                      alt={getOrderProductSummary(order)}
                    />
                    <div>
                      <h3>{getOrderProductSummary(order)}</h3>
                      <p>To: {order.customer_name}</p>
                      <b>{formatCurrency(order.total)}</b>
                    </div>
                  </div>
                  <Link className="history-card-link" href={`/tracking?order=${order.order_code}`}>
                    View Tracking
                  </Link>
                </article>
              ))
            ) : (
              <p className="admin-empty">No order history from the database yet.</p>
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
