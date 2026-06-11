"use client";

import { CalendarClock, CheckCircle2, Clock3, CreditCard, PackageCheck, Trash2, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  completeApiOrder,
  deleteApiOrder,
  deliverApiOrder,
  fetchOrders,
  formatCurrency,
  formatStatusLabel,
  getOrderGreetingMessage,
  getOrderProductSummary,
  processApiOrder,
  readyApiOrder,
  updateApiPaymentStatus,
} from "../../_lib/api";
import AdminShell from "../_components/AdminShell";

function formatDeliveryDate(value) {
  if (!value) {
    return "Not scheduled";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDeliveryTime(value) {
  const normalized = String(value || "").trim();
  const labels = {
    morning: "09:00 - 12:00 (Morning)",
    afternoon: "13:00 - 17:00 (Afternoon)",
    evening: "18:00 - 20:00 (Evening)",
  };

  return labels[normalized.toLowerCase()] || normalized || "Not selected";
}

function getOrderItemCustomizationLines(item) {
  return [
    item.recipient_name ? `Recipient: ${item.recipient_name}` : null,
    item.bouquet_size ? `Size: ${item.bouquet_size}` : null,
    item.wrapping_color ? `Wrapping: ${item.wrapping_color}` : null,
    getOrderGreetingMessage({ items: [item] })
      ? `Note: ${getOrderGreetingMessage({ items: [item] })}`
      : null,
  ].filter(Boolean);
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadOrders() {
      try {
        setOrders(await fetchOrders({ per_page: 50 }));
      } catch (error) {
        setMessage(error.message || "Unable to load orders from the API.");
      } finally {
        setIsLoading(false);
      }
    }

    loadOrders();
  }, []);

  const counts = useMemo(
    () => ({
      total: orders.length,
      verification: orders.filter((order) => order.payment_status === "waiting_verification").length,
      delivery: orders.filter((order) =>
        ["ready_to_deliver", "delivering"].includes(order.order_status)
      ).length,
      completed: orders.filter((order) => order.order_status === "completed").length,
    }),
    [orders]
  );

  async function refreshOrder(updatedOrder) {
    setOrders((current) =>
      current.map((order) => (order.id === updatedOrder.id ? updatedOrder : order))
    );
  }

  async function handleVerify(order) {
    setMessage("");
    try {
      refreshOrder(await updateApiPaymentStatus(order.id, "paid"));
      setMessage(`${order.order_code} payment verified.`);
    } catch (error) {
      setMessage(error.message || "Unable to update payment.");
    }
  }

  async function handleStatus(order, status) {
    setMessage("");
    const actions = {
      processing: processApiOrder,
      ready_to_deliver: readyApiOrder,
      delivering: deliverApiOrder,
      completed: completeApiOrder,
    };

    try {
      refreshOrder(await actions[status](order.id));
      setMessage(`${order.order_code} status updated.`);
    } catch (error) {
      setMessage(error.message || "Unable to update order status.");
    }
  }

  async function handleDelete(order) {
    const isConfirmed = window.confirm("Are you sure you want to delete this order?");
    if (!isConfirmed) {
      return;
    }

    setMessage("");
    try {
      await deleteApiOrder(order.id);
      setOrders((current) => current.filter((item) => item.id !== order.id));
      setMessage(`${order.order_code} deleted successfully.`);
    } catch (error) {
      setMessage(error.message || "Unable to delete order.");
    }
  }

  return (
    <AdminShell>
      <section className="admin-main container">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Order Management</p>
            <h1>Process campus bouquet orders from one queue.</h1>
            <p>
              Review new requests, confirm production status, and move each
              order toward delivery.
            </p>
          </div>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        <section className="admin-page-kpis" aria-label="Order status summary">
          <article>
            <PackageCheck size={25} />
            <strong>{counts.total}</strong>
            <span>Total Orders</span>
          </article>
          <article>
            <Clock3 size={25} />
            <strong>{counts.verification}</strong>
            <span>Need Verification</span>
          </article>
          <article>
            <Truck size={25} />
            <strong>{counts.delivery}</strong>
            <span>Delivery Queue</span>
          </article>
          <article>
            <CheckCircle2 size={25} />
            <strong>{counts.completed}</strong>
            <span>Completed</span>
          </article>
        </section>

        <section className="admin-panel">
          <div className="admin-panel-heading">
            <div>
              <h2>All Orders</h2>
              <p>Use the action buttons to move an order through the workflow.</p>
            </div>
          </div>

          <div className="orders-table admin-wide-table" role="table" aria-label="All admin orders">
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
                <article className="orders-row admin-order-row" role="row" key={order.id}>
                  <span>
                    <b>{order.order_code}</b>
                    <small>{getOrderProductSummary(order)}</small>
                    {(order.items || []).map((item) => {
                      const details = getOrderItemCustomizationLines(item);
                      return details.length ? (
                        <small className="admin-order-note" key={item.id || item.product_name}>
                          {item.product_name}: {details.join(" | ")}
                        </small>
                      ) : null;
                    })}
                  </span>
                  <span>
                    <b>{order.customer_name}</b>
                    <small>Phone: {order.phone || "Not provided"}</small>
                    <small>Address: {order.campus_address || "Not provided"}</small>
                    <small>Date: {formatDeliveryDate(order.delivery_date)}</small>
                    <small>Time: {formatDeliveryTime(order.delivery_time)}</small>
                  </span>
                  <span className="status-pill payment">
                    <CreditCard size={14} />
                    {formatStatusLabel(order.payment_status)}
                  </span>
                  <span className="status-pill">
                    <CalendarClock size={14} />
                    {formatStatusLabel(order.order_status)}
                  </span>
                  <span className="admin-order-total">
                    <b>{formatCurrency(order.total)}</b>
                    <span className="admin-row-actions">
                      <OrderWorkflowActions
                        order={order}
                        onStatusChange={handleStatus}
                        onVerify={handleVerify}
                      />
                      <button
                        className="danger"
                        onClick={() => handleDelete(order)}
                        type="button"
                      >
                        <Trash2 size={12} />
                        Delete
                      </button>
                    </span>
                  </span>
                </article>
              ))
            ) : (
              <p className="admin-empty">No database orders yet.</p>
            )}
          </div>
        </section>
      </section>
    </AdminShell>
  );
}

function OrderWorkflowActions({ order, onStatusChange, onVerify }) {
  const paymentMethod = String(order.latest_payment?.payment_method || "").toLowerCase();
  const isCod = paymentMethod === "cod" || ["cod_pending", "unpaid"].includes(order.payment_status);

  if (order.order_status === "completed") {
    return <span className="admin-completed-badge">Completed</span>;
  }

  if (order.order_status === "delivering") {
    return (
      <button onClick={() => onStatusChange(order, "completed")} type="button">
        Complete
      </button>
    );
  }

  if (order.order_status === "ready_to_deliver") {
    return (
      <button onClick={() => onStatusChange(order, "delivering")} type="button">
        Deliver
      </button>
    );
  }

  if (order.order_status === "processing") {
    return (
      <button onClick={() => onStatusChange(order, "ready_to_deliver")} type="button">
        Ready to Deliver
      </button>
    );
  }

  if (order.order_status === "payment_verified" || order.payment_status === "paid" || isCod) {
    return (
      <button onClick={() => onStatusChange(order, "processing")} type="button">
        Process
      </button>
    );
  }

  if (order.payment_status === "waiting_verification") {
    return (
      <button onClick={() => onVerify(order)} type="button">
        Verify
      </button>
    );
  }

  return <span className="admin-waiting-badge">Waiting Payment</span>;
}
