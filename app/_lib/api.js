import { formatCurrencyIDR } from "./currency";

const apiBaseUrl = (process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000/api").replace(/\/$/, "");
const apiOrigin = (() => {
  try {
    return new URL(apiBaseUrl).origin;
  } catch {
    return "";
  }
})();

function notifyAuthUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("bloomifyAuthUpdated"));
  }
}

export function getAuthToken() {
  return typeof window !== "undefined" ? window.localStorage.getItem("bloomifyToken") || "" : "";
}

async function request(path, options = {}) {
  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  const token = getAuthToken();
  const response = await fetch(`${apiBaseUrl}${path}`, {
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || "Bloomify API request failed.";
    throw new Error(message);
  }

  return payload;
}

export function formatCurrency(value) {
  return formatCurrencyIDR(value);
}

export function normalizeCategoryValue(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ");
}

export function productMatchesCategory(product, expectedCategory) {
  return normalizeCategoryValue(product?.type || product?.category) === normalizeCategoryValue(expectedCategory);
}

export function resolveProductImageUrl(image) {
  if (!image) {
    return "";
  }

  const value = String(image);
  if (/^(https?:|data:|blob:)/i.test(value)) {
    try {
      const parsed = new URL(value);
      const storagePrefix = "/storage/products/";
      if (parsed.pathname.startsWith(storagePrefix)) {
        return `${parsed.origin}/product-images/${parsed.pathname.slice(storagePrefix.length)}`;
      }
    } catch {
      return value;
    }

    return value;
  }

  if (value.startsWith("/product-images/")) {
    return `${apiOrigin}${value}`;
  }

  if (value.startsWith("product-images/")) {
    return `${apiOrigin}/${value}`;
  }

  if (value.startsWith("/storage/")) {
    const storageProductsPrefix = "/storage/products/";
    if (value.startsWith(storageProductsPrefix)) {
      return `${apiOrigin}/product-images/${value.slice(storageProductsPrefix.length)}`;
    }

    return `${apiOrigin}${value}`;
  }

  if (value.startsWith("storage/")) {
    const storageProductsPrefix = "storage/products/";
    if (value.startsWith(storageProductsPrefix)) {
      return `${apiOrigin}/product-images/${value.slice(storageProductsPrefix.length)}`;
    }

    return `${apiOrigin}/${value}`;
  }

  return value;
}

export function formatStatusLabel(value) {
  if (!value) {
    return "Unknown";
  }

  return String(value)
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatPaymentMethod(value) {
  const method = String(value || "").toLowerCase();

  if (method === "cod") {
    return "COD";
  }

  if (method === "bank") {
    return "Transfer Bank";
  }

  return value || "Payment";
}

export function getOrderProductSummary(order) {
  const firstItem = order?.items?.[0];
  if (!firstItem) {
    return "No products";
  }

  const remaining = Math.max((order.items?.length || 1) - 1, 0);
  return remaining ? `${firstItem.product_name} +${remaining}` : firstItem.product_name;
}

export function getItemGreetingMessage(item) {
  return (
    item?.greeting_message ||
    item?.gift_message ||
    item?.card_message ||
    item?.greeting_card_message ||
    ""
  );
}

export function getOrderGreetingMessage(order) {
  const itemMessage = (order?.items || [])
    .map((item) => getItemGreetingMessage(item))
    .find(Boolean);

  return itemMessage || order?.notes || "";
}

export async function fetchProducts() {
  const payload = await request("/products");
  return payload.data || [];
}

export async function fetchAdminProducts() {
  const payload = await request("/admin/products");
  return payload.data || [];
}

export async function fetchProductBySlug(slug) {
  const payload = await request(`/products/${encodeURIComponent(slug)}`);
  return payload.data || null;
}

export function normalizeProduct(product) {
  return {
    id: product.slug || product.id,
    databaseId: product.id,
    name: product.name,
    price: formatCurrency(product.price),
    priceValue: Number(product.price || 0),
    image: resolveProductImageUrl(product.image) || "/products/pink-serenity-clean.png",
    category: product.category,
    type: product.type || product.category,
    description: product.description,
    stock: product.stock,
    isActive: product.is_active,
    detailBadge: product.category,
  };
}

function getSessionId() {
  if (typeof window === "undefined") {
    return "";
  }

  const existing = window.localStorage.getItem("bloomifySessionId");
  if (existing) {
    return existing;
  }

  const next = `guest-${crypto.randomUUID?.() || Date.now()}`;
  window.localStorage.setItem("bloomifySessionId", next);
  return next;
}

function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    return JSON.parse(window.localStorage.getItem("bloomifyUser") || "null");
  } catch {
    return null;
  }
}

function getCartIdentity() {
  const user = getStoredUser();
  return user?.id ? { user_id: user.id } : { session_id: getSessionId() };
}

export function getCurrentUser() {
  return getStoredUser();
}

export function isAuthenticated() {
  return Boolean(getStoredUser()?.id && getAuthToken());
}

export function getLoginRedirectHref(targetPath) {
  const fallback =
    typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}`
      : "/checkout";
  const target = targetPath || fallback;

  return `/login?redirect=${encodeURIComponent(target)}`;
}

export async function registerCustomer(payload) {
  const response = await request("/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem("bloomifyUser", JSON.stringify(response.data.user));
    window.localStorage.setItem("bloomifyToken", response.data.token);
    window.localStorage.setItem("bloomifyRole", response.data.user.role === "admin" ? "admin" : "user");
    notifyAuthUpdated();
  }

  return response.data;
}

export async function loginCustomer(payload) {
  const response = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (typeof window !== "undefined") {
    window.localStorage.setItem("bloomifyUser", JSON.stringify(response.data.user));
    window.localStorage.setItem("bloomifyToken", response.data.token);
    window.localStorage.setItem("bloomifyRole", response.data.user.role === "admin" ? "admin" : "user");
    notifyAuthUpdated();
  }

  return response.data;
}

export async function logoutCustomer() {
  const token = typeof window !== "undefined" ? window.localStorage.getItem("bloomifyToken") : "";
  await request("/auth/logout", {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).catch(() => null);

  if (typeof window !== "undefined") {
    window.localStorage.removeItem("bloomifyUser");
    window.localStorage.removeItem("bloomifyToken");
    window.localStorage.removeItem("bloomifyRole");
    notifyAuthUpdated();
  }
}

export async function fetchCartItems() {
  const query = new URLSearchParams(getCartIdentity());
  const payload = await request(`/cart?${query}`);
  return payload.data || [];
}

export async function addApiCartItem(product, options = {}) {
  const response = await request("/cart", {
    method: "POST",
    body: JSON.stringify({
      ...getCartIdentity(),
      slug: product.id || product.slug,
      quantity: options.quantity || 1,
      recipient_name: options.recipientName || null,
      bouquet_size: options.size || "Standard",
      wrapping_color: options.color || "Bloomify",
      extras: options.extras || [],
      greeting_message: options.message || null,
    }),
  });

  window.dispatchEvent(new CustomEvent("bloomifyCartUpdated"));
  return response.data;
}

export async function updateApiCartItem(id, quantity) {
  const response = await request(`/cart/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ quantity }),
  });
  window.dispatchEvent(new CustomEvent("bloomifyCartUpdated"));
  return response.data;
}

export async function removeApiCartItem(id) {
  await request(`/cart/${id}`, { method: "DELETE" });
  window.dispatchEvent(new CustomEvent("bloomifyCartUpdated"));
}

export async function clearApiCart() {
  const query = new URLSearchParams(getCartIdentity());
  await request(`/cart?${query}`, { method: "DELETE" });
  window.dispatchEvent(new CustomEvent("bloomifyCartUpdated"));
}

export async function fetchOrders(params = {}) {
  const query = new URLSearchParams(params);
  const payload = await request(`/orders${query.size ? `?${query}` : ""}`);
  return Array.isArray(payload.data) ? payload.data : payload.data?.data || [];
}

export async function fetchOrderHistory(params = {}) {
  const query = new URLSearchParams(params);
  const payload = await request(`/orders/history${query.size ? `?${query}` : ""}`);
  return Array.isArray(payload.data) ? payload.data : payload.data?.data || [];
}

export async function fetchOrderByCode(orderCode) {
  if (!orderCode) {
    return null;
  }

  const payload = await request(`/orders/${encodeURIComponent(orderCode)}`);
  return payload.data || null;
}

export async function confirmOrderReceived(orderCode) {
  const response = await request(`/orders/${encodeURIComponent(orderCode)}/confirm-received`, {
    method: "PATCH",
  });

  return response.data;
}

export async function createApiOrder(payload) {
  const response = await request("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function createApiPayment(payload) {
  if (typeof File !== "undefined" && payload.proof_image instanceof File) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value);
      }
    });
    const response = await request("/payments", {
      method: "POST",
      body: formData,
    });

    return response.data;
  }

  const response = await request("/payments", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function updateApiOrderStatus(id, orderStatus) {
  const response = await request(`/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ order_status: orderStatus }),
  });

  return response.data;
}

export async function processApiOrder(id) {
  const response = await request(`/admin/orders/${id}/process`, {
    method: "PATCH",
  });

  return response.data;
}

export async function readyApiOrder(id) {
  const response = await request(`/admin/orders/${id}/ready-to-deliver`, {
    method: "PATCH",
  });

  return response.data;
}

export async function deliverApiOrder(id) {
  const response = await request(`/admin/orders/${id}/deliver`, {
    method: "PATCH",
  });

  return response.data;
}

export async function completeApiOrder(id) {
  const response = await request(`/admin/orders/${id}/complete`, {
    method: "PATCH",
  });

  return response.data;
}

export async function updateApiPaymentStatus(id, paymentStatus) {
  const response = await request(`/orders/${id}/payment`, {
    method: "PATCH",
    body: JSON.stringify({ payment_status: paymentStatus }),
  });

  return response.data;
}

export async function approveApiPayment(id) {
  const response = await request(`/admin/payments/${id}/approve`, {
    method: "PATCH",
  });

  return response.data;
}

export async function rejectApiPayment(id) {
  const response = await request(`/admin/payments/${id}/reject`, {
    method: "PATCH",
  });

  return response.data;
}

export async function deleteApiOrder(id) {
  const response = await request(`/admin/orders/${id}`, {
    method: "DELETE",
  });

  return response;
}

function productPayloadToFormData(payload) {
  const formData = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });
  return formData;
}

export async function createApiProduct(payload) {
  const response = await request("/admin/products", {
    method: "POST",
    body: productPayloadToFormData(payload),
  });

  return response.data;
}

export async function updateApiProduct(id, payload) {
  const formData = productPayloadToFormData({ ...payload, _method: "PATCH" });
  const response = await request(`/admin/products/${id}`, {
    method: "POST",
    body: formData,
  });

  return response.data;
}

export async function deleteApiProduct(id) {
  return request(`/admin/products/${id}`, {
    method: "DELETE",
  });
}

export async function subscribeNewsletter(email) {
  const response = await request("/newsletter-subscriptions", {
    method: "POST",
    body: JSON.stringify({ email }),
  });

  return response;
}

export async function createSupportTicket(payload) {
  const response = await request("/support-tickets", {
    method: "POST",
    body: JSON.stringify(payload),
  });

  return response.data;
}
