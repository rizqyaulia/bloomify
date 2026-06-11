"use client";

import {
  BadgeCheck,
  BarChart3,
  CheckCircle2,
  Clock3,
  CreditCard,
  Flower2,
  PackageCheck,
  ShoppingCart,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  fetchOrders,
  fetchProducts,
  formatCurrency,
  formatPaymentMethod,
  formatStatusLabel,
  getOrderProductSummary,
  resolveProductImageUrl,
  updateApiPaymentStatus,
} from "../_lib/api";
import AdminShell from "./_components/AdminShell";

const statusFlow = [
  "order_created",
  "waiting_payment",
  "payment_verified",
  "processing",
  "ready_to_deliver",
  "delivering",
  "completed",
];

export default function AdminPage() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        const [orderData, productData] = await Promise.all([
          fetchOrders({ per_page: 8 }),
          fetchProducts(),
        ]);
        setOrders(orderData);
        setProducts(productData);
      } catch (error) {
        setMessage(error.message || "Unable to load admin data from the API.");
      } finally {
        setIsLoading(false);
      }
    }

    loadDashboard();
  }, []);

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total || 0), 0);
    const waiting = orders.filter((order) => order.payment_status === "waiting_verification").length;
    const processing = orders.filter((order) => order.order_status === "processing").length;
    const delivery = orders.filter((order) =>
      ["ready_to_deliver", "delivering"].includes(order.order_status)
    ).length;

    return [
      {
        label: "Orders",
        value: String(orders.length),
        detail: `${waiting} waiting for verification`,
        icon: ShoppingCart,
      },
      {
        label: "Revenue",
        value: formatCurrency(totalRevenue),
        detail: "From database orders",
        icon: BarChart3,
      },
      {
        label: "In Production",
        value: String(processing),
        detail: "Bouquets being prepared",
        icon: Flower2,
      },
      {
        label: "Ready to Deliver",
        value: String(delivery),
        detail: "Campus courier queue",
        icon: Truck,
      },
    ];
  }, [orders]);

  const reviewOrder = orders.find((order) => order.payment_status === "waiting_verification");

  async function handlePaymentStatus(order, status) {
    setMessage("");
    try {
      const updatedOrder = await updateApiPaymentStatus(order.id, status);
      setOrders((current) =>
        current.map((item) => (item.id === updatedOrder.id ? updatedOrder : item))
      );
      setMessage(`Payment for ${order.order_code} updated.`);
    } catch (error) {
      setMessage(error.message || "Unable to update payment status.");
    }
  }

  return (
    <AdminShell>
      <section className="admin-main container">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Admin Dashboard</p>
            <h1>Order, payment, and product control room.</h1>
            <p>
              Monitor bouquet requests, verify transfer receipts, update order
              statuses, and keep campus inventory ready for peak events.
            </p>
          </div>
          <Link className="button primary" href="/catalog">
            View Storefront
          </Link>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-metrics" aria-label="Business metrics">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <article className="admin-metric-card" key={metric.label}>
                <div>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </div>
                <Icon size={28} />
              </article>
            );
          })}
        </section>

        <div className="admin-layout">
          <section className="admin-panel admin-orders">
            <div className="admin-panel-heading">
              <div>
                <h2>Incoming Orders</h2>
                <p>Update processing status and payment confirmation.</p>
              </div>
              <Link className="admin-panel-action" href="/admin/orders">
                <PackageCheck size={18} />
                Manage
              </Link>
            </div>

            <div className="orders-table" role="table" aria-label="Incoming orders">
              <div className="orders-row orders-head" role="row">
                <span>Order</span>
                <span>Customer</span>
                <span>Payment</span>
                <span>Status</span>
                <span>Total</span>
              </div>
              {isLoading ? (
                <p className="admin-empty">Loading orders from the API...</p>
              ) : orders.length ? (
                orders.map((order) => (
                  <article className="orders-row" role="row" key={order.id}>
                    <span>
                      <b>{order.order_code}</b>
                      <small>{getOrderProductSummary(order)}</small>
                    </span>
                    <span>{order.customer_name}</span>
                    <span className="status-pill payment">
                      <CreditCard size={14} />
                      {formatStatusLabel(order.payment_status)}
                    </span>
                    <span className="status-pill">
                      <Clock3 size={14} />
                      {formatStatusLabel(order.order_status)}
                    </span>
                    <span>{formatCurrency(order.total)}</span>
                  </article>
                ))
              ) : (
                <p className="admin-empty">No database orders yet.</p>
              )}
            </div>
          </section>

          <aside className="admin-aside">
            <section className="admin-panel">
              <div className="admin-panel-heading compact">
                <h2>Payment Review</h2>
                <BadgeCheck size={22} />
              </div>
              {reviewOrder ? (
                <div className="payment-review">
                  <strong>{reviewOrder.order_code}</strong>
                  <p>
                    {formatPaymentMethod(reviewOrder.latest_payment?.payment_method)} is waiting
                    for manual verification.
                  </p>
                  <div>
                    <button onClick={() => handlePaymentStatus(reviewOrder, "paid")} type="button">
                      <CheckCircle2 size={17} />
                      Approve
                    </button>
                    <button onClick={() => handlePaymentStatus(reviewOrder, "rejected")} type="button">
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="admin-empty">No payments need review.</p>
              )}
            </section>

            <section className="admin-panel">
              <div className="admin-panel-heading compact">
                <h2>Status Flow</h2>
                <Truck size={22} />
              </div>
              <ol className="admin-status-list">
                {statusFlow.map((status, index) => (
                  <li className={index < 4 ? "done" : ""} key={status}>
                    {formatStatusLabel(status)}
                  </li>
                ))}
              </ol>
            </section>
          </aside>
        </div>

        <section className="admin-panel product-management">
          <div className="admin-panel-heading">
            <div>
              <h2>Product Management</h2>
              <p>Keep categories, stock, and active catalog items organized.</p>
            </div>
            <Link className="admin-panel-action" href="/admin/products">
              <Flower2 size={18} />
              Manage
            </Link>
          </div>

          <div className="product-management-grid">
            {products.slice(0, 3).map((product) => (
              <article key={product.id}>
                <img
                  src={resolveProductImageUrl(product.image) || "/products/pink-serenity-clean.png"}
                  alt=""
                />
                <div>
                  <h3>{product.name}</h3>
                  <p>{product.category}</p>
                </div>
                <span>{product.stock} stok</span>
                <b>{product.is_active ? "Aktif" : "Nonaktif"}</b>
              </article>
            ))}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}
