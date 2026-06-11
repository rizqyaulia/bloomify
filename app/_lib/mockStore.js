const STORAGE_KEYS = {
  cart: "bloomifyCart",
};

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function readJSON(key, fallback) {
  if (!canUseStorage()) {
    return fallback;
  }

  try {
    const value = window.localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key, value) {
  if (canUseStorage()) {
    window.localStorage.setItem(key, JSON.stringify(value));
    if (key === STORAGE_KEYS.cart) {
      window.dispatchEvent(
        new CustomEvent("bloomifyCartUpdated", {
          detail: { key, value },
        })
      );
    }
  }
}

export function getCart() {
  return readJSON(STORAGE_KEYS.cart, []);
}

export function getCartCount() {
  return getCart().reduce((total, item) => total + Number(item.qty || 0), 0);
}

function getCartLineKey(item) {
  return [
    item.product_id || item.id || "item",
    item.bouquet_size || item.size || "Standard",
    item.wrapping_color || "Bloomify",
    JSON.stringify(item.extras || []),
    item.greeting_message || item.gift_message || item.greeting_card_message || "",
  ].join("|");
}

export async function addCartItem(payload) {
  const cart = getCart();
  const incoming = {
    id: `${payload.product_id || "item"}-${Date.now()}`,
    qty: Number(payload.qty || 1),
    ...payload,
  };
  const incomingKey = getCartLineKey(incoming);
  const existingIndex = cart.findIndex((item) => getCartLineKey(item) === incomingKey);

  if (existingIndex >= 0) {
    const updatedCart = cart.map((item, index) =>
      index === existingIndex
        ? {
            ...item,
            qty: Number(item.qty || 1) + incoming.qty,
          }
        : item
    );
    writeJSON(STORAGE_KEYS.cart, updatedCart);

    return {
      ok: true,
      message: `${incoming.product_name || "Product"} quantity has been updated.`,
      data: { cart_item: updatedCart[existingIndex], cart: updatedCart },
    };
  }

  writeJSON(STORAGE_KEYS.cart, [...cart, incoming]);

  return {
    ok: true,
    message: `${incoming.product_name || "Product"} has been added to your cart.`,
    data: { cart_item: incoming, cart: [...cart, incoming] },
  };
}

export function setCartItemQuantity(id, qty) {
  const nextQty = Number(qty);
  const updatedCart = getCart()
    .map((cartItem) =>
      cartItem.id === id
        ? {
            ...cartItem,
            qty: nextQty,
          }
        : cartItem
    )
    .filter((cartItem) => Number(cartItem.qty || 0) > 0);
  writeJSON(STORAGE_KEYS.cart, updatedCart);
  return updatedCart;
}

export function removeCartItem(id) {
  const updatedCart = getCart().filter((item) => item.id !== id);
  writeJSON(STORAGE_KEYS.cart, updatedCart);
  return updatedCart;
}

export function clearCart() {
  writeJSON(STORAGE_KEYS.cart, []);
  return [];
}
