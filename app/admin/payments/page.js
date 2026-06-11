"use client";

import { BadgeCheck, CreditCard, ReceiptText, ShieldCheck, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import {
  approveApiPayment,
  fetchOrders,
  formatCurrency,
  formatPaymentMethod,
  formatStatusLabel,
  rejectApiPayment,
} from "../../_lib/api";
import AdminShell from "../_components/AdminShell";

export default function AdminPaymentsPage() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadPayments() {
      try {
        setOrders(await fetchOrders({ per_page: 50 }));
      } catch (error) {
        setMessage(error.message || "Unable to load payment data from the API.");
      } finally {
        setIsLoading(false);
      }
    }

    loadPayments();
  }, []);

  const pendingOrders = orders.filter((order) =>
    ["pending", "waiting_verification"].includes(order.payment_status) &&
    order.latest_payment
  );
  const reviewOrder = pendingOrders.find((order) => order.latest_payment?.proof_image) || pendingOrders[0];
  const receiptUrl = reviewOrder?.latest_payment?.proof_image_url || "";
  const receiptPath = reviewOrder?.latest_payment?.proof_image || "";
  const isImageReceipt = /\.(jpe?g|png|webp)$/i.test(receiptUrl || receiptPath);
  const isPdfReceipt = /\.pdf$/i.test(receiptUrl || receiptPath);

  async function handleApprove(order) {
    setMessage("");
    try {
      const result = await approveApiPayment(order.latest_payment.id);
      setOrders((current) => current.filter((item) => item.id !== result.order.id));
      setMessage(`${order.order_code} payment approved.`);
    } catch (error) {
      setMessage(error.message || "Unable to approve payment.");
    }
  }

  async function handleReject(order) {
    const isConfirmed = window.confirm("Are you sure you want to reject this payment?");
    if (!isConfirmed) {
      return;
    }

    setMessage("");
    try {
      const result = await rejectApiPayment(order.latest_payment.id);
      setOrders((current) => current.filter((item) => item.id !== result.order.id));
      setMessage(`${order.order_code} payment rejected.`);
    } catch (error) {
      setMessage(error.message || "Unable to reject payment.");
    }
  }

  return (
    <AdminShell>
      <section className="admin-main container">
        <header className="admin-header">
          <div>
            <p className="eyebrow">Payment Management</p>
            <h1>Verify receipts before production continues.</h1>
            <p>
              Check uploaded proof, approve valid payments, and reject payment
              files that do not match the order total.
            </p>
          </div>
        </header>

        {message ? <p className="admin-message">{message}</p> : null}

        <div className="admin-layout">
          <section className="admin-panel admin-orders">
            <div className="admin-panel-heading">
              <div>
                <h2>Payment Queue</h2>
                <p>Prioritize orders waiting for manual transfer review.</p>
              </div>
              <ReceiptText size={24} />
            </div>

            <div className="admin-payment-list">
              {isLoading ? (
                <p className="admin-empty">Loading payments from the API...</p>
              ) : pendingOrders.length ? (
                pendingOrders.map((order) => (
                  <article key={order.id}>
                    <div>
                      <strong>{order.order_code}</strong>
                      <p>{order.customer_name}</p>
                    </div>
                    <span>
                      {order.latest_payment?.payment_method
                        ? formatPaymentMethod(order.latest_payment.payment_method)
                        : "Awaiting payment"}
                    </span>
                    <b>{formatCurrency(order.total)}</b>
                    <em>{formatStatusLabel(order.payment_status)}</em>
                    <div className="admin-payment-actions">
                      <button onClick={() => handleApprove(order)} type="button">
                        <ShieldCheck size={15} />
                        Approve
                      </button>
                      <button
                        className="danger"
                        onClick={() => handleReject(order)}
                        type="button"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  </article>
                ))
              ) : (
                <p className="admin-empty">No pending payments need review.</p>
              )}
            </div>
          </section>

          <aside className="admin-aside">
            <section className="admin-panel">
              <div className="admin-panel-heading compact">
                <h2>Receipt Preview</h2>
                <CreditCard size={22} />
              </div>
              {reviewOrder ? (
                <div className="receipt-preview">
                  <BadgeCheck size={42} />
                  <strong>{reviewOrder.order_code}</strong>
                  {receiptUrl && isImageReceipt ? (
                    <img
                      className="receipt-preview-image"
                      src={receiptUrl}
                      alt={`Payment proof for ${reviewOrder.order_code}`}
                    />
                  ) : receiptUrl && isPdfReceipt ? (
                    <a
                      className="receipt-preview-link"
                      href={receiptUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open Receipt
                    </a>
                  ) : (
                    <p>Receipt image pending.</p>
                  )}
                  {receiptPath ? <p className="receipt-preview-file">Uploaded file: {receiptPath}</p> : null}
                  <div>
                    <button onClick={() => handleApprove(reviewOrder)} type="button">
                      <ShieldCheck size={17} />
                      Approve
                    </button>
                    <button onClick={() => handleReject(reviewOrder)} type="button">
                      <XCircle size={17} />
                      Reject
                    </button>
                  </div>
                </div>
              ) : (
                <p className="admin-empty">No receipts are waiting for review.</p>
              )}
            </section>
          </aside>
        </div>
      </section>
    </AdminShell>
  );
}
