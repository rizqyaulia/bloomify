"use client";

import {
  ClipboardCheck,
  Flower2,
  PackageCheck,
  ShoppingBag,
  Sparkles,
  Truck,
} from "lucide-react";
import Link from "next/link";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps } from "../_components/footerRoutes";

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

const offers = [
  {
    icon: Flower2,
    title: "Campus Gifts",
    copy: "Flower bouquets, snack bouquets, gift boxes, graduation gifts, and birthday gifts are organized in one simple storefront.",
  },
  {
    icon: ShoppingBag,
    title: "Smooth Ordering",
    copy: "Students can browse products, add personalized gifts to cart, checkout, and submit manual payment proof online.",
  },
  {
    icon: Truck,
    title: "Order Tracking",
    copy: "Customers can follow delivery progress from payment verification through processing, delivery, and completion.",
  },
  {
    icon: ClipboardCheck,
    title: "Seller Management",
    copy: "Campus sellers can manage products, payments, orders, and delivery status from the admin panel.",
  },
];

export default function AboutUsPage() {
  return (
    <main className="site-shell about-shell">
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

        <div className="nav-actions">
          <CatalogSearchForm className="search-pill about-search-pill" iconSize={22} />
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      <section className="about-hero container">
        <div>
          <p className="eyebrow">About Bloomify</p>
          <h1>Thoughtful campus gifting, made easier.</h1>
          <p>
            Bloomify is a digital bouquet and gift ordering platform built for
            campus students. It helps students send meaningful flowers, snack
            bouquets, gift boxes, graduation gifts, and birthday gifts online
            with a simple, guided ordering flow.
          </p>
          <Link className="button primary" href="/catalog">
            Browse Gifts
          </Link>
        </div>
        <div className="about-hero-card">
          <Sparkles size={34} />
          <h2>Built for Campus Moments</h2>
          <p>
            From birthdays and graduations to small encouragements between
            classes, Bloomify keeps the buying experience clear for customers
            and manageable for sellers.
          </p>
        </div>
      </section>

      <section className="section about-mission">
        <div className="container about-split">
          <div>
            <p className="eyebrow">Our Mission</p>
            <h2>Help students celebrate without complicated ordering.</h2>
          </div>
          <p>
            Our mission is to make campus gifting more accessible, organized,
            and personal. Bloomify supports product browsing, cart, checkout,
            manual payment verification, order tracking, and admin order
            management so each order can move from idea to delivery with fewer
            manual steps.
          </p>
        </div>
      </section>

      <section className="section about-offer-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <p className="eyebrow">What We Offer</p>
              <h2>Everything needed for a complete gift flow.</h2>
            </div>
          </div>

          <div className="about-offer-grid">
            {offers.map((offer) => {
              const Icon = offer.icon;
              return (
                <article className="about-offer-card" key={offer.title}>
                  <Icon size={26} />
                  <h3>{offer.title}</h3>
                  <p>{offer.copy}</p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section about-why">
        <div className="container about-why-panel">
          <PackageCheck size={34} />
          <h2>Why Bloomify</h2>
          <p>
            Bloomify helps campus sellers manage products, incoming orders,
            manual payments, and delivery status more efficiently, while
            giving students a friendly storefront for choosing and tracking
            gifts. The result is a clearer experience for both the buyer and
            the seller.
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
