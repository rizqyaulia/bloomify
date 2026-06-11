"use client";

import {
  Flower2,
  Heart,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import ActionButton from "../_components/ActionButton";
import CartLink from "../_components/CartLink";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";
import { fetchProducts, normalizeProduct, productMatchesCategory } from "../_lib/api";

const graduationPageSize = 6;

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

function isGraduationProduct(product) {
  return productMatchesCategory(product, "Graduation Gift");
}

export default function GraduationPage() {
  const [apiProducts, setApiProducts] = useState(null);
  const [apiFailed, setApiFailed] = useState(false);
  const [visibleGiftCount, setVisibleGiftCount] = useState(graduationPageSize);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await fetchProducts();
        setApiProducts(products.map(normalizeProduct));
      } catch {
        setApiFailed(true);
      }
    }

    loadProducts();
  }, []);

  const graduationProducts = useMemo(() => {
    const source = apiProducts || [];
    return source.filter(isGraduationProduct);
  }, [apiProducts]);
  const isLoadingProducts = !apiProducts && !apiFailed;

  useEffect(() => {
    setVisibleGiftCount(graduationPageSize);
  }, [graduationProducts.length]);

  const visibleGraduationProducts = useMemo(
    () => graduationProducts.slice(0, visibleGiftCount),
    [graduationProducts, visibleGiftCount]
  );
  const hasMoreGraduationProducts = visibleGraduationProducts.length < graduationProducts.length;

  return (
    <main className="site-shell graduation-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand-row">
          <Link className="brand" href="/">
            Bloomify
          </Link>
          <div className="nav-links">
            <Link href="/occasions">Occasions</Link>
            <Link className="active" href="/graduation">
              Graduation
            </Link>
            <Link href="/birthdays">Birthdays</Link>
            <Link href="/catalog">Best Sellers</Link>
          </div>
        </div>

        <div className="nav-actions">
          <CatalogSearchForm />
          <CartLink iconSize={19} />
          <AccountMenu iconSize={19} />
        </div>
      </nav>

      <section className="graduation-hero container">
        <div className="graduation-hero-copy">
          <p className="graduation-eyebrow">Class of 2024</p>
          <h1>
            Celebrate Your <span>Success</span>
          </h1>
          <p>
            Mark this momentous achievement with our curated collection of
            graduation blooms and premium gift boxes. Thoughtful presentation
            for a brilliant future.
          </p>
          <Link className="graduation-button" href="#graduation-gifts">
            Shop Collection
          </Link>
        </div>

        <div className="graduation-hero-image">
          <img
            src="/graduation/hero-cap-bouquet.png"
            alt="Graduation bouquet beside a cap with a gold tassel"
          />
        </div>
      </section>

      <section
        className="graduation-gifts container"
        id="graduation-gifts"
        aria-label="Graduation gift collection"
      >
        <div className="graduation-product-grid">
          {isLoadingProducts ? (
            <p className="admin-empty graduation-empty">
              Loading graduation gifts from the catalog...
            </p>
          ) : visibleGraduationProducts.length ? (
            visibleGraduationProducts.map((product) => (
              <article className="graduation-product-card" key={product.id}>
                <div className="graduation-product-image">
                  <img src={product.image} alt={product.name} />
                </div>
                <div className="graduation-product-body">
                  <div>
                    <h2>{product.name}</h2>
                    <strong>{product.price}</strong>
                  </div>
                  <ActionButton
                    aria-label={`Open ${product.name}`}
                    label={`Open ${product.name}`}
                    href={`/product-detail?product=${product.id}`}
                  >
                    <Heart size={21} />
                  </ActionButton>
                </div>
              </article>
            ))
          ) : (
            <p className="admin-empty graduation-empty">
              No graduation gifts found.
            </p>
          )}
        </div>

        {hasMoreGraduationProducts ? (
          <div className="graduation-load-more">
            <button
              onClick={() =>
                setVisibleGiftCount((current) => current + graduationPageSize)
              }
              type="button"
            >
              Load More Gifts
            </button>
          </div>
        ) : null}
      </section>

      <section className="graduation-note">
        <div className="container graduation-note-inner">
          <Flower2 size={32} aria-hidden="true" />
          <h2>Crafted to Commemorate</h2>
          <p>
            Every Bloomify graduation gift includes a handwritten, personalized
            note card printed on premium textured paper, ensuring your message
            matches the significance of the day.
          </p>
        </div>
      </section>

      <footer className="footer">
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
