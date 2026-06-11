"use client";

import {
  ArrowRight,
  Banknote,
  CheckCircle2,
  CreditCard,
  Edit3,
  HandCoins,
  Minus,
  PackageOpen,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
  UploadCloud,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";
import { formatCurrencyIDR } from "../_lib/currency";
import {
  clearApiCart,
  createApiOrder,
  createApiPayment,
  fetchCartItems,
  getCurrentUser,
  getItemGreetingMessage,
  removeApiCartItem,
  resolveProductImageUrl,
  updateApiCartItem,
} from "../_lib/api";
import {
  clearCart,
  getCart,
  removeCartItem,
  setCartItemQuantity,
} from "../_lib/mockStore";

const deliveryFee = 15000;
const serviceFee = 5000;

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

function getCartSubtotal(items) {
  return items.reduce(
    (total, item) =>
      total + getCartItemPrice(item) * Number(item.quantity ?? item.qty ?? 1),
    0
  );
}

function getCartItemName(item) {
  return item.product?.name || item.product_name || "Bloomify gift";
}

function getCartItemPrice(item) {
  return Number(item.product?.price ?? item.product_price ?? item.price ?? 0);
}

function getCartItemImage(item) {
  return (
    resolveProductImageUrl(item.product?.image || item.image) ||
    "/products/pink-serenity-clean.png"
  );
}

function getItemDetails(item) {
  const details = [
    getCartItemBouquetSize(item),
    getCartItemWrappingColor(item),
  ];

  return details.filter(Boolean).join(" Bouquet \u2022 ");
}

function getCartItemRecipient(item) {
  return item.recipient_name || item.recipientName || "";
}

function getCartItemBouquetSize(item) {
  return item.bouquet_size || item.size || "Standard";
}

function getCartItemWrappingColor(item) {
  return item.wrapping_color || item.color || item.product?.category || item.category || "Bloomify";
}

function getCheckoutGreetingMessage(items) {
  return items.map((item) => getItemGreetingMessage(item).trim()).find(Boolean) || "";
}

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("bank");
  const [receiptName, setReceiptName] = useState("");
  const [receiptFile, setReceiptFile] = useState(null);
  const [apiError, setApiError] = useState("");
  const [isCompleting, setIsCompleting] = useState(false);
  const fileInputRef = useRef(null);
  const deliveryFormRef = useRef(null);
  const router = useRouter();

  const subtotal = getCartSubtotal(cartItems);
  const greetingMessage = getCheckoutGreetingMessage(cartItems);
  const appliedDeliveryFee = subtotal > 0 ? deliveryFee : 0;
  const appliedServiceFee = subtotal > 0 ? serviceFee : 0;
  const totalPrice = subtotal + appliedDeliveryFee + appliedServiceFee;
  const isCartEmpty = cartItems.length === 0;
  const totals = [
    ["Subtotal", formatCurrencyIDR(subtotal)],
    ["Campus Delivery Fee", formatCurrencyIDR(appliedDeliveryFee)],
    ["Service Fee", formatCurrencyIDR(appliedServiceFee)],
  ];

  useEffect(() => {
    async function loadCart() {
      try {
        setCartItems(await fetchCartItems());
      } catch {
        setCartItems(getCart());
      }
    }

    loadCart();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files?.[0];
    if (file) {
      setReceiptName(file.name);
      setReceiptFile(file);
    }
  }

  function handleDrop(event) {
    event.preventDefault();
    const file = event.dataTransfer.files?.[0];
    if (file) {
      setReceiptName(file.name);
      setReceiptFile(file);
    }
  }

  async function handleQuantityChange(item, nextQty) {
    try {
      await updateApiCartItem(item.id, nextQty);
      setCartItems(await fetchCartItems());
    } catch {
      setCartItems(setCartItemQuantity(item.id, nextQty));
    }
  }

  async function handleRemoveItem(item) {
    try {
      await removeApiCartItem(item.id);
      setCartItems(await fetchCartItems());
    } catch {
      setCartItems(removeCartItem(item.id));
    }
  }

  async function handleCompleteOrder() {
    if (isCartEmpty || isCompleting) {
      return;
    }

    const deliveryForm = deliveryFormRef.current;
    const formData = new FormData(deliveryForm);
    const user = getCurrentUser();
    setApiError("");
    const orderPayload = {
      user_id: user?.id || null,
      customer_name: formData.get("recipient_name"),
      phone: formData.get("recipient_phone"),
      phone_number: formData.get("recipient_phone"),
      campus_address: formData.get("delivery_address"),
      delivery_address: formData.get("delivery_address"),
      delivery_date: formData.get("delivery_date") || null,
      delivery_time: formData.get("delivery_time") || null,
      delivery_fee: appliedDeliveryFee,
      service_fee: appliedServiceFee,
      notes: greetingMessage || null,
      items: cartItems.map((item) => {
        const numericProductId = item.product?.id || item.databaseId;
        const quantity = Number(item.quantity ?? item.qty ?? 1);
        const itemGreetingMessage = getItemGreetingMessage(item) || null;
        const customization = {
          recipient_name: getCartItemRecipient(item) || null,
          bouquet_size: getCartItemBouquetSize(item) || null,
          wrapping_color: getCartItemWrappingColor(item) || null,
          greeting_message: itemGreetingMessage,
        };
        return numericProductId
          ? { product_id: numericProductId, quantity, ...customization }
          : { slug: item.product?.slug || item.product_id, quantity, ...customization };
      }),
    };

    setIsCompleting(true);
    try {
      const order = await createApiOrder(orderPayload);
      await createApiPayment({
        order_id: order.id,
        payment_method: paymentMethod,
        amount: totalPrice,
        status:
          paymentMethod === "cod"
            ? "cod_pending"
            : receiptName
              ? "waiting_verification"
              : "pending",
        proof_image: paymentMethod === "bank" ? receiptFile : null,
      });
      await clearApiCart().catch(() => clearCart());
      setCartItems([]);
      setIsCompleting(false);
      router.push(`/tracking?order=${encodeURIComponent(order.order_code)}`);
    } catch (error) {
      setApiError(error.message || "We could not create this order yet.");
      setIsCompleting(false);
    }
  }

  return (
    <main className="site-shell checkout-shell">
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
          <CatalogSearchForm className="search-pill checkout-search-pill" iconSize={22} />
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      <section className="checkout-main container">
        <header className="checkout-header">
          <h1>Finalize Your Celebration</h1>
          <p>
            Review your floral arrangement and select delivery details for
            campus arrival.
          </p>
        </header>

        <div className={`checkout-layout ${isCartEmpty ? "empty" : ""}`}>
          <aside className="checkout-sidebar" aria-label="Order review">
            <section
              className={`checkout-card order-summary ${isCartEmpty ? "empty" : ""}`}
            >
              <h2>
                <ShoppingBag size={25} />
                Order Summary
              </h2>

              {isCartEmpty ? (
                <div className="empty-cart-state">
                  <PackageOpen size={48} aria-hidden="true" />
                  <h3>Your cart is empty</h3>
                  <p>
                    Choose a bouquet or gift box first, then your order summary
                    will appear here.
                  </p>
                  <Link className="button primary" href="/catalog">
                    Browse products
                  </Link>
                </div>
              ) : (
                <>
                  <div className="order-item-list">
                    {cartItems.map((item) => {
                      const quantity = Number(item.quantity ?? item.qty ?? 1);
                      const productName = getCartItemName(item);
                      const lineTotal = getCartItemPrice(item) * quantity;

                      return (
                        <article className="order-item" key={item.id}>
                          <img src={getCartItemImage(item)} alt={productName} />
                          <div>
                            <div className="order-item-heading">
                              <h3>{productName}</h3>
                              <strong>{formatCurrencyIDR(lineTotal)}</strong>
                            </div>
                            <p>{getItemDetails(item)}</p>
                            <p>
                              Recipient: {getCartItemRecipient(item) || "Not specified"}
                            </p>
                            {getItemGreetingMessage(item) ? (
                              <p>Note: {getItemGreetingMessage(item)}</p>
                            ) : null}
                            <div className="order-item-actions">
                              <div
                                className="quantity-control"
                                aria-label={`${productName} quantity`}
                              >
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item, quantity - 1)
                                  }
                                  type="button"
                                  aria-label={`Decrease ${productName} quantity`}
                                >
                                  <Minus size={14} />
                                </button>
                                <span>{quantity}</span>
                                <button
                                  onClick={() =>
                                    handleQuantityChange(item, quantity + 1)
                                  }
                                  type="button"
                                  aria-label={`Increase ${productName} quantity`}
                                >
                                  <Plus size={14} />
                                </button>
                              </div>
                              <button
                                className="remove-cart-item"
                                onClick={() => handleRemoveItem(item)}
                                type="button"
                              >
                                <Trash2 size={15} />
                                Remove
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>

                  <dl className="checkout-totals">
                    {totals.map(([label, value]) => (
                      <div key={label}>
                        <dt>{label}</dt>
                        <dd>{value}</dd>
                      </div>
                    ))}
                    <div className="checkout-total-row">
                      <dt>Total</dt>
                      <dd>{formatCurrencyIDR(totalPrice)}</dd>
                    </div>
                  </dl>
                </>
              )}
            </section>

            {!isCartEmpty ? (
              <section className="note-preview-card" aria-label="Note preview">
                <Edit3 size={52} aria-hidden="true" />
                <h2>Note Preview</h2>
                <p>{greetingMessage ? `"${greetingMessage}"` : "No greeting message added."}</p>
              </section>
            ) : null}
          </aside>

          {!isCartEmpty ? (
            <div className="checkout-form-column">
              <section className="checkout-card checkout-form-card">
                <h2>
                  <Truck size={25} />
                  Delivery Details
                </h2>

                <form className="delivery-grid" ref={deliveryFormRef}>
                  <label>
                    <span>Recipient Name</span>
                    <input
                      name="recipient_name"
                      type="text"
                      placeholder="e.g. Sarah Bloom"
                    />
                  </label>
                  <label>
                    <span>Phone Number</span>
                    <input
                      name="recipient_phone"
                      type="tel"
                      placeholder="0812-XXXX-XXXX"
                    />
                  </label>
                  <label className="wide-field">
                    <span>Campus Address / Building</span>
                    <textarea
                      name="delivery_address"
                      rows={3}
                      placeholder="Building A, Room 302, University Housing"
                    />
                  </label>
                  <label>
                    <span>Delivery Date</span>
                    <input name="delivery_date" type="date" />
                  </label>
                  <label>
                    <span>Preferred Time</span>
                    <select defaultValue="09:00 - 12:00 (Morning)" name="delivery_time">
                      <option value="09:00 - 12:00 (Morning)">09:00 - 12:00 (Morning)</option>
                      <option value="13:00 - 17:00 (Afternoon)">13:00 - 17:00 (Afternoon)</option>
                      <option value="18:00 - 20:00 (Evening)">18:00 - 20:00 (Evening)</option>
                    </select>
                  </label>
                </form>
              </section>

              <section className="checkout-card payment-card">
                <h2>
                  <CreditCard size={25} />
                  Payment Method
                </h2>

                <div className="payment-options">
                  <button
                    className={paymentMethod === "bank" ? "selected" : ""}
                    onClick={() => setPaymentMethod("bank")}
                    type="button"
                  >
                    <Banknote size={24} />
                    Transfer Bank
                    {paymentMethod === "bank" ? (
                      <CheckCircle2 size={20} />
                    ) : null}
                  </button>
                  <button
                    className={paymentMethod === "cod" ? "selected" : ""}
                    onClick={() => setPaymentMethod("cod")}
                    type="button"
                  >
                    <HandCoins size={24} />
                    COD
                    {paymentMethod === "cod" ? (
                      <CheckCircle2 size={20} />
                    ) : null}
                  </button>
                </div>

                {paymentMethod === "bank" ? (
                  <>
                    <div className="manual-payment-card">
                      <p>
                        Please transfer the total amount to the account above,
                        then upload your payment receipt.
                      </p>
                      <dl>
                        <div>
                          <dt>Bank Name</dt>
                          <dd>BCA</dd>
                        </div>
                        <div>
                          <dt>Account Number</dt>
                          <dd>1234567890</dd>
                        </div>
                        <div>
                          <dt>Account Holder</dt>
                          <dd>Bloomify Campus Gift</dd>
                        </div>
                      </dl>
                    </div>

                    <div className="upload-field">
                      <p>Upload Bukti Pembayaran</p>
                      <button
                        className="upload-zone"
                        onClick={() => fileInputRef.current?.click()}
                        onDragOver={(event) => event.preventDefault()}
                        onDrop={handleDrop}
                        type="button"
                      >
                        <UploadCloud size={42} />
                        <span>{receiptName || "Click or drag to upload receipt"}</span>
                        <small>JPG, PNG OR PDF (MAX. 2MB)</small>
                      </button>
                      <input
                        ref={fileInputRef}
                        className="sr-only"
                        type="file"
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                      />
                    </div>
                  </>
                ) : (
                  <div className="manual-payment-card cod-note">
                    <p>Payment will be made when the order is delivered.</p>
                  </div>
                )}
              </section>

              {apiError ? <p className="checkout-error">{apiError}</p> : null}

              <button
                className="complete-order-button"
                disabled={isCompleting}
                onClick={handleCompleteOrder}
                type="button"
              >
                {isCompleting
                  ? "Sending Order..."
                  : "Complete Order & Send Flowers"}
                <ArrowRight size={24} />
              </button>
            </div>
          ) : null}
        </div>
      </section>

      <footer className="footer checkout-footer">
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
