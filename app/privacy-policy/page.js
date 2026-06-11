"use client";

import {
  CreditCard,
  Database,
  FileText,
  LockKeyhole,
  ShieldCheck,
  Truck,
  Users,
} from "lucide-react";
import Link from "next/link";
import AccountMenu from "../_components/AccountMenu";
import CartLink from "../_components/CartLink";
import CatalogSearchForm from "../_components/CatalogSearchForm";
import { getFooterLinkProps, gmailSupportHref } from "../_components/footerRoutes";

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

const policySections = [
  {
    icon: Database,
    title: "Information We Collect",
    copy: "Bloomify collects the information needed to process bouquet and gift orders, including customer details, recipient name, phone number, campus delivery address, delivery date, and preferred delivery time.",
  },
  {
    icon: FileText,
    title: "How We Use Your Information",
    copy: "We use order information for checkout, product preparation, payment verification, delivery coordination, order tracking, and customer support. User data is not sold to third parties.",
  },
  {
    icon: CreditCard,
    title: "Payment Proof and Manual Verification",
    copy: "When manual bank transfer is selected, Bloomify may store uploaded payment proof images so admins can verify payment before processing the order.",
  },
  {
    icon: Truck,
    title: "Order and Delivery Data",
    copy: "Bloomify stores product customization data such as bouquet size, wrapping color, recipient name, and greeting message so each order can be prepared and delivered correctly.",
  },
  {
    icon: LockKeyhole,
    title: "Data Security",
    copy: "Bloomify keeps order and payment information within the application database and limits access to operational use. We recommend using strong account passwords and keeping login access private.",
  },
  {
    icon: Users,
    title: "Admin Access",
    copy: "Admins can view order, delivery, payment, and product data only for operational purposes such as preparing gifts, verifying payments, updating delivery status, and handling support needs.",
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="site-shell policy-shell">
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
          <CatalogSearchForm className="search-pill policy-search-pill" iconSize={22} />
          <CartLink iconSize={22} />
          <AccountMenu iconSize={21} />
        </div>
      </nav>

      <section className="policy-hero container">
        <p className="eyebrow">Bloomify Data Notice</p>
        <h1>Privacy Policy</h1>
        <p>
          This page explains how Bloomify collects and uses information to help
          students order campus gifts and help sellers manage products, orders,
          payments, and delivery status.
        </p>
      </section>

      <section className="section policy-content-section">
        <div className="container policy-grid">
          {policySections.map((section) => {
            const Icon = section.icon;
            return (
              <article className="policy-card" key={section.title}>
                <Icon size={25} />
                <h2>{section.title}</h2>
                <p>{section.copy}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="section policy-contact">
        <div className="container policy-contact-panel">
          <ShieldCheck size={34} />
          <h2>Contact</h2>
          <p>
            For privacy questions, order data concerns, or payment proof
            handling requests, please contact Bloomify support through the order
            tracking page. We use support requests only to help resolve your
            order or account issue.
          </p>
          <Link
            className="button primary"
            href={gmailSupportHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Contact Support
          </Link>
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
