"use client";

import {
  ChevronLeft,
  ChevronRight,
  Search,
  ShoppingBasket,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import AccountMenu from "../_components/AccountMenu";
import ActionButton from "../_components/ActionButton";
import CartLink from "../_components/CartLink";
import MobileNavMenu from "../_components/MobileNavMenu";
import { getFooterLinkProps } from "../_components/footerRoutes";
import { addCartItem } from "../_lib/mockStore";
import { addApiCartItem, fetchProducts, normalizeProduct } from "../_lib/api";
import { formatCurrencyIDR } from "../_lib/currency";

const catalogPageSize = 6;

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

export default function CatalogPage() {
  const [products, setProducts] = useState([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productError, setProductError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [recentlyAddedId, setRecentlyAddedId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [occasion, setOccasion] = useState("");
  const [maxPrice, setMaxPrice] = useState(500000);

  useEffect(() => {
    const initialParams = new URLSearchParams(window.location.search);
    const initialSearch = initialParams.get("search");
    const initialCategory = initialParams.get("category");
    if (initialSearch) {
      setSearchTerm(initialSearch);
    }
    if (initialCategory) {
      setCategories([initialCategory]);
    }

    async function loadProducts() {
      try {
        const apiProducts = await fetchProducts();
        setProducts(apiProducts.map(normalizeProduct));
        setProductError("");
      } catch (error) {
        setProducts([]);
        setProductError(error.message || "Unable to load products from the database.");
      } finally {
        setIsLoadingProducts(false);
      }
    }

    loadProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const productText = `${product.name} ${product.category} ${product.description || ""}`.toLowerCase();
    const matchesSearch = !searchTerm || productText.includes(searchTerm.toLowerCase());
    const matchesCategory = !categories.length || categories.includes(product.category);
    const matchesOccasion =
      !occasion || productText.includes(occasion.toLowerCase()) || product.category.toLowerCase().includes(occasion.toLowerCase());
    const matchesPrice = Number(product.priceValue || 0) <= maxPrice;
    return matchesSearch && matchesCategory && matchesOccasion && matchesPrice;
  });
  const totalPages = Math.max(Math.ceil(filteredProducts.length / catalogPageSize), 1);
  const visibleProducts = filteredProducts.slice(
    (currentPage - 1) * catalogPageSize,
    currentPage * catalogPageSize
  );

  function goToPage(page) {
    setCurrentPage(Math.min(Math.max(page, 1), totalPages));
  }

  async function handleAddToCart(product) {
    try {
      await addApiCartItem(product, { size: "Standard" });
      setRecentlyAddedId(product.id);
      window.setTimeout(() => setRecentlyAddedId(""), 1200);
    } catch {
      const result = await addCartItem({
        product_id: product.id,
        product_name: product.name,
        price: product.priceValue,
        image: product.image,
        category: product.category,
        qty: 1,
        size: "Standard",
        wrapping_color: "Bloomify",
        extras: [],
      });
      if (!result.ok) {
        return;
      }
      setRecentlyAddedId(product.id);
      window.setTimeout(() => setRecentlyAddedId(""), 1200);
    }
  }

  function toggleCategory(category) {
    setCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category]
    );
    setCurrentPage(1);
  }

  return (
    <main className="site-shell catalog-shell">
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
          <label className="search-pill">
            <Search size={18} aria-hidden="true" />
            <span className="sr-only">Search flowers</span>
            <input
              type="search"
              placeholder="Search flowers..."
              value={searchTerm}
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setCurrentPage(1);
              }}
            />
          </label>
          <CartLink iconSize={19} />
          <AccountMenu iconSize={19} />
        </div>
      </nav>

      <section className="catalog-main container">
        <header className="catalog-header">
          <div>
            <h1>Product Catalog</h1>
            <p>
              Find the perfect gift for your special moments with our curated
              collection.
            </p>
          </div>
          <ActionButton
            className="mobile-filter-button"
            label="Catalog filters"
            message="Catalog filters are shown below. Dynamic filtering will connect to the product database later."
          >
            <SlidersHorizontal size={18} />
            Filters
          </ActionButton>
        </header>

        <div className="catalog-layout">
          <aside className="catalog-sidebar" aria-label="Catalog filters">
            <FilterGroup title="Categories">
              {["Flower Bouquet", "Snack Bouquet", "Gift Box", "Graduation Gift", "Birthday"].map(
                (category) => (
                  <label className="check-row" key={category}>
                    <input
                      type="checkbox"
                      checked={categories.includes(category)}
                      onChange={() => toggleCategory(category)}
                    />
                    <span>{category}</span>
                  </label>
                )
              )}
            </FilterGroup>

            <FilterGroup title="Price Range">
              <input
                className="price-range"
                type="range"
                min="5"
                max="500"
                value={Math.round(maxPrice / 1000)}
                onChange={(event) => {
                  setMaxPrice(Number(event.target.value) * 1000);
                  setCurrentPage(1);
                }}
                aria-label="Maximum price"
              />
              <div className="range-labels">
                <span>{formatCurrencyIDR(5000)}</span>
                <span>{formatCurrencyIDR(500000)}+</span>
              </div>
            </FilterGroup>

            <FilterGroup title="Occasions">
              <div className="occasion-pills">
                {["Graduation", "Birthday", "Anniversary", "Condolences"].map(
                  (option) => (
                    <button
                      className={occasion === option ? "selected" : ""}
                      key={option}
                      onClick={() => {
                        setOccasion((current) => (current === option ? "" : option));
                        setCurrentPage(1);
                      }}
                      type="button"
                    >
                      {option}
                    </button>
                  )
                )}
              </div>
            </FilterGroup>
          </aside>

          <div className="catalog-content">
            <div className="product-grid">
              {isLoadingProducts ? (
                <p className="admin-empty">Loading products from the catalog...</p>
              ) : productError ? (
                <p className="admin-empty">{productError}</p>
              ) : visibleProducts.length ? visibleProducts.map((product) => (
                <article className="product-card" key={product.id}>
                  <Link
                    className="product-image-wrap"
                    href={`/product-detail?product=${product.id}`}
                  >
                    <img src={product.image} alt={product.name} />
                    {product.badge ? (
                      <span className={`product-badge ${product.badgeTone}`}>
                        {product.badge}
                      </span>
                    ) : null}
                  </Link>
                  <div className="product-body">
                    <h2>
                      <Link href={`/product-detail?product=${product.id}`}>
                        {product.name}
                      </Link>
                    </h2>
                    <p>{product.price}</p>
                    <button
                      className="product-detail-link"
                      onClick={() => handleAddToCart(product)}
                      type="button"
                    >
                      <ShoppingBasket size={18} />
                      {recentlyAddedId === product.id ? "Added" : "Add to Cart"}
                    </button>
                  </div>
                </article>
              )) : <p className="admin-empty">No products match your filters.</p>}
            </div>

            <nav className="pagination" aria-label="Catalog pagination">
              <button
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
                type="button"
              >
                <ChevronLeft size={18} />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button
                  className={currentPage === page ? "active" : ""}
                  aria-current={currentPage === page ? "page" : undefined}
                  key={page}
                  onClick={() => goToPage(page)}
                  type="button"
                >
                  {page}
                </button>
              ))}
              <button
                aria-label="Next page"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
                type="button"
              >
                <ChevronRight size={18} />
              </button>
            </nav>
          </div>
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

function FilterGroup({ title, children }) {
  return (
    <section className="filter-group">
      <h2>{title}</h2>
      {children}
    </section>
  );
}
