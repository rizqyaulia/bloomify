"use client";

import {
  ArrowRight,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import ActionButton from "../_components/ActionButton";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";
import { fetchProducts, normalizeProduct, productMatchesCategory } from "../_lib/api";

const birthdayPageSize = 4;

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

function isBirthdayProduct(product) {
  return productMatchesCategory(product, "Birthday");
}

export default function BirthdaysPage() {
  const [apiProducts, setApiProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [apiFailed, setApiFailed] = useState(false);
  const [visibleBirthdayCount, setVisibleBirthdayCount] = useState(birthdayPageSize);

  useEffect(() => {
    async function loadProducts() {
      try {
        const products = await fetchProducts();
        setApiProducts(products.map(normalizeProduct));
      } catch {
        setApiFailed(true);
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const birthdayProducts = useMemo(
    () => apiProducts.filter(isBirthdayProduct),
    [apiProducts]
  );

  useEffect(() => {
    setVisibleBirthdayCount(birthdayPageSize);
  }, [birthdayProducts.length]);

  const featuredProduct = useMemo(
    () =>
      birthdayProducts.length
        ? [...birthdayProducts].sort(
            (left, right) => Number(right.priceValue || 0) - Number(left.priceValue || 0)
          )[0]
        : null,
    [birthdayProducts]
  );
  const visibleBestsellers = useMemo(
    () => birthdayProducts.filter((product) => product.id !== featuredProduct?.id).slice(0, 2),
    [birthdayProducts, featuredProduct]
  );
  const visibleBirthdayGifts = useMemo(
    () => birthdayProducts.slice(0, visibleBirthdayCount),
    [birthdayProducts, visibleBirthdayCount]
  );
  const hasMoreBirthdayGifts = visibleBirthdayGifts.length < birthdayProducts.length;

  return (
    <main className="site-shell birthdays-shell">
      <nav className="topbar" aria-label="Primary navigation">
        <div className="brand-row">
          <Link className="brand" href="/">
            Bloomify
          </Link>
          <div className="nav-links">
            <Link href="/occasions">Occasions</Link>
            <Link href="/graduation">Graduation</Link>
            <Link className="active" href="/birthdays">
              Birthdays
            </Link>
            <Link href="/catalog">Best Sellers</Link>
          </div>
        </div>
          <MobileNavMenu />

        <div className="nav-actions">
          <CatalogSearchForm />
          <CartLink iconSize={19} />
          <AccountMenu iconSize={19} />
        </div>
      </nav>

      <section className="birthdays-hero container">
        <h1>Make Their Day Special</h1>
        <p>
          Celebrate another trip around the sun with our hand-picked, vibrant
          floral arrangements and thoughtful gift boxes. Perfect for bringing
          joy to their special day.
        </p>
        <div className="birthday-chip-row" aria-label="Birthday gift categories">
          <span>For Her</span>
          <span>For Him</span>
          <span>Milestones</span>
        </div>
      </section>

      <section className="birthday-bestsellers">
        <div className="container">
          <div className="birthday-bestseller-panel">
            <h2>Birthday Bestsellers</h2>
            <div className="birthday-bestseller-grid">
              {featuredProduct ? (
                <article className="birthday-feature-card">
                  <img
                    src={featuredProduct.image}
                    alt={`${featuredProduct.name} birthday arrangement`}
                  />
                  <div className="birthday-feature-overlay">
                    <div>
                      <h3>{featuredProduct.name}</h3>
                      <p>{featuredProduct.price}</p>
                    </div>
                  </div>
                </article>
              ) : null}

              <div className="birthday-mini-list">
                {visibleBestsellers.map((product) => (
                  <article className="birthday-mini-card" key={product.id}>
                    <img src={product.image} alt={product.name} />
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.price}</p>
                      <Link className="birthday-mini-link" href={`/product-detail?product=${product.id}`}>
                        View <ArrowRight size={15} />
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="birthday-products container">
        <div className="birthday-products-heading">
          <h2>All Birthday Gifts</h2>
        </div>

        <div className="birthday-product-grid">
          {isLoadingProducts ? (
            <p className="admin-empty">Loading birthday gifts from the catalog...</p>
          ) : apiFailed ? (
            <p className="admin-empty">Unable to load birthday products from the database.</p>
          ) : visibleBirthdayGifts.length ? visibleBirthdayGifts.map((product, index) => (
            <article className="birthday-product-card" key={product.id}>
              <div className="birthday-product-image">
                <img src={product.image} alt={product.name} />
                {index === 1 ? <span>New</span> : null}
              </div>
              <div className="birthday-product-body">
                <h3>{product.name}</h3>
                <p>{product.description || "A thoughtful Bloomify birthday gift."}</p>
                <div>
                  <strong>{product.price}</strong>
                  <ActionButton
                    className={index === visibleBirthdayGifts.length - 1 ? "secondary" : ""}
                    aria-label={`Add ${product.name}`}
                    label={`Add ${product.name}`}
                    href={`/product-detail?product=${product.id}`}
                  >
                    <Plus size={17} />
                  </ActionButton>
                </div>
              </div>
            </article>
          )) : (
            <p className="admin-empty">No birthday products found.</p>
          )}
        </div>

        {hasMoreBirthdayGifts ? (
          <div className="birthday-load-more">
            <button
              onClick={() =>
                setVisibleBirthdayCount((current) => current + birthdayPageSize)
              }
              type="button"
            >
              Load More Gifts
            </button>
          </div>
        ) : null}
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
