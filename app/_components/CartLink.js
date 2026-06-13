"use client";

import { ShoppingCart } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { fetchCartItems, getLoginRedirectHref, isAuthenticated } from "../_lib/api";
import { getCartCount } from "../_lib/mockStore";

export default function CartLink({ iconSize = 19 }) {
  const [count, setCount] = useState(0);
  const [checkoutHref, setCheckoutHref] = useState("/checkout");

  useEffect(() => {
    async function refreshCount() {
      setCheckoutHref(isAuthenticated() ? "/checkout" : getLoginRedirectHref("/checkout"));
      try {
        const items = await fetchCartItems();
        setCount(items.reduce((total, item) => total + Number(item.quantity || 0), 0));
      } catch {
        setCount(getCartCount());
      }
    }

    refreshCount();
    window.addEventListener("storage", refreshCount);
    window.addEventListener("bloomifyCartUpdated", refreshCount);
    window.addEventListener("bloomifyAuthUpdated", refreshCount);

    return () => {
      window.removeEventListener("storage", refreshCount);
      window.removeEventListener("bloomifyCartUpdated", refreshCount);
      window.removeEventListener("bloomifyAuthUpdated", refreshCount);
    };
  }, []);

  return (
    <Link className="icon-button cart-button" href={checkoutHref} aria-label={`Open cart${count ? `, ${count} items` : ""}`}>
      <ShoppingCart size={iconSize} />
      {count > 0 ? <span className="cart-count">{count}</span> : null}
    </Link>
  );
}
