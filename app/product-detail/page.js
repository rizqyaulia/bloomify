"use client";

import {
  CheckCircle2,
  Edit3,
  ShoppingBag,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";
import { addApiCartItem, fetchProductBySlug, normalizeProduct } from "../_lib/api";
import { addCartItem } from "../_lib/mockStore";

const sizes = ["Small", "Medium", "Large"];
const colors = ["blush", "sage", "clay", "charcoal"];

const footerGroups = [
  {
    title: "Company",
    links: ["About Us", "Gift Guides", "Shipping Info"],
  },
  {
    title: "Support",
    links: ["Privacy Policy", "Track Order", "Help Center"],
  },
];

export default function ProductDetailPage() {
  const [product, setProduct] = useState(null);
  const [isNotFound, setIsNotFound] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [size, setSize] = useState("Small");
  const [color, setColor] = useState("blush");
  const [isAdded, setIsAdded] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let isMounted = true;
    const productId = new URLSearchParams(window.location.search).get("product");

    if (!productId) {
      setIsNotFound(true);
      return;
    }

    async function loadProduct() {
      try {
        const apiProduct = await fetchProductBySlug(productId);
        if (isMounted && apiProduct) {
          setProduct(normalizeProduct(apiProduct));
          setActiveImage(0);
          return;
        }
      } catch {
        if (isMounted) {
          setIsNotFound(true);
        }
      }
    }

    loadProduct();

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleSubmit(event) {
    event.preventDefault();
    if (!product) {
      return;
    }

    const formData = new FormData(event.currentTarget);
    setIsBusy(true);
    try {
      await addApiCartItem(product, {
        recipientName: formData.get("recipient-name"),
        size,
        color,
        message: formData.get("card-message"),
      });
    } catch {
      const result = await addCartItem({
        product_id: product.id,
        product_name: product.name,
        price: product.priceValue,
        image: product.image,
        category: product.category,
        recipient_name: formData.get("recipient-name"),
        bouquet_size: size,
        wrapping_color: color,
        greeting_message: formData.get("card-message"),
      });

      if (!result.ok) {
        setIsBusy(false);
        return;
      }
    }

    setIsBusy(false);
    setIsAdded(true);
    window.setTimeout(() => {
      router.push("/checkout");
    }, 450);
  }

  const gallery = product
    ? [
        {
          src: product.image,
          thumb: product.image,
          alt: product.name,
        },
      ]
    : [];

  return (
    <main className="site-shell product-detail-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand-row">
          <Link className="brand" href="/">
            Bloomify
          </Link>
          <div className="nav-links">
            <Link href="/occasions">Occasions</Link>
            <Link href="/graduation">Graduation</Link>
            <Link href="/birthdays">Birthdays</Link>
            <Link className="active" href="/catalog">
              Best Sellers
            </Link>
          </div>
        </div>
          <MobileNavMenu />

        <div className="nav-actions">
          <CatalogSearchForm className="search-pill product-search-pill" iconSize={22} />
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      {isNotFound ? (
        <section className="product-detail-main product-not-found container">
          <div>
            <p className="eyebrow">Product unavailable</p>
            <h1>We could not find that Bloomify gift.</h1>
            <p>
              The product may have moved or the link may be missing its product
              id. Return to the catalog to choose another arrangement.
            </p>
            <Link className="button primary" href="/catalog">
              Back to Catalog
            </Link>
          </div>
        </section>
      ) : !product ? (
        <section className="product-detail-main product-not-found container">
          <div>
            <p className="eyebrow">Loading</p>
            <h1>Preparing your product details...</h1>
          </div>
        </section>
      ) : (
      <section className="product-detail-main container">
        <div className="product-gallery">
          <div className="product-thumbnails" aria-label="Product images">
            {gallery.map((image, index) => (
              <button
                className={index === activeImage ? "active" : ""}
                key={image.alt}
                onClick={() => setActiveImage(index)}
                type="button"
                aria-label={`View image ${index + 1}`}
              >
                <img src={image.thumb || image.src} alt={image.alt} />
              </button>
            ))}
          </div>
          <div className="product-main-image">
            <img src={gallery[activeImage].src} alt={gallery[activeImage].alt} />
          </div>
        </div>

        <section className="product-detail-panel" aria-label="Product details">
          <div className="product-summary">
            <span>{product.detailBadge || product.category}</span>
            <h1>{product.name}</h1>
            <strong>{product.price}</strong>
            <p>{product.description}</p>
          </div>

          <form className="product-customizer" onSubmit={handleSubmit}>
            <div className="product-field">
              <label htmlFor="recipient-name">Recipient Name</label>
              <input id="recipient-name" name="recipient-name" type="text" placeholder="Who is this for?" />
            </div>

            <div className="product-field">
              <label>Bouquet Size</label>
              <div className="size-options">
                {sizes.map((option) => (
                  <button
                    className={size === option ? "selected" : ""}
                    key={option}
                    onClick={() => setSize(option)}
                    type="button"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className="product-field">
              <label>Wrapping Color</label>
              <div className="color-options">
                {colors.map((option) => (
                  <button
                    className={`${option} ${color === option ? "selected" : ""}`}
                    key={option}
                    onClick={() => setColor(option)}
                    type="button"
                    aria-label={`${option} wrapping color`}
                  />
                ))}
              </div>
            </div>

            <div className="product-field">
              <label htmlFor="card-message">Greeting Card Message</label>
              <div className="message-box">
                <textarea
                  id="card-message"
                  name="card-message"
                  rows={4}
                  placeholder="Write something heartfelt..."
                />
                <span>
                  <Edit3 size={17} /> Handwritten Preview
                </span>
              </div>
            </div>

            <button className="product-cart-button" disabled={isBusy} type="submit">
              {isAdded ? <CheckCircle2 size={23} /> : <ShoppingBag size={23} />}
              {isBusy ? "Adding..." : isAdded ? "Added to Cart" : `Add to Cart - ${product.price}`}
            </button>
          </form>
        </section>
      </section>
      )}

      <footer className="footer product-detail-footer">
        <div className="container footer-grid">
          <div>
            <Link className="brand footer-brand" href="/">
              Bloomify
            </Link>
            <p>
              {"\u00a9"} 2026 Bloomify. Curating joy for campus life.
              Hand-wrapped with love.
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
